import { MAX_EVENT_TOPICS } from "../../components/event-types";
import type { EventKind, UtcOffset } from "../../components/events-data";
import type {
  EventFormError,
  EventFormErrorField,
  EventFormField,
  SlotFormField,
} from "./form_mapping";

/** Odbicie wzorcow z `parse_event.ts` — tam jest bramka ksztaltu, tu wskazanie pola. */
export const EVENT_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
export const CLOCK_TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const UTC_OFFSET = /^[+-](?:[01]\d|2[0-3]):[0-5]\d$/;
export const COUNTRY_CODE = /^[A-Z]{2}$/;
export const CURRENCY_CODE = /^[A-Z]{3}$/;
export const PRICE = /^\d+(?:\.\d{1,2})?$/;
export const HTTP_URL = /^https?:\/\/\S+$/;
/** Sciezka od korzenia albo pelny adres — `parse_event` cicho zdejmuje reszte, a wpisany
 *  z bledem obraz ma wrocic do poprawki, nie zniknac po zapisie. */
export const IMAGE_SRC = /^(?:https?:\/\/\S+|\/[^/\s]\S*)$/;

/** U+FFFD swiadczy o rozjechanym kodowaniu — wartosc jest juz wtedy uszkodzona. */
const FORBIDDEN_CHARS = /[\u0000-\u001F\u007F\uFFFD]/;
/** To samo z przepustka dla znaku nowej linii — opis jest jedynym polem textarea. */
const FORBIDDEN_MULTILINE_CHARS = /[\u0000-\u0009\u000B-\u001F\u007F\uFFFD]/;
const MULTILINE_FIELD = "description";

/** Bez JS-a nie da sie dolozyc inputu, wiec tematy jada jedna lista po przecinku.
 *  Przecinek w samym temacie jest przez to nie do zapisania. */
export const TOPIC_SEPARATOR = ",";

/** Wartosc zaznaczonego checkboxa bez atrybutu `value`. */
export const CHECKBOX_ON = "on";

/**
 * `absent` = pola nie bylo w formularzu, `clear` = bylo puste, `invalid` = odrzucone
 * i juz zaraportowane. Rozroznienie dwoch pierwszych jest cala sola tego modulu.
 */
export type Slot<T> =
  | { state: "absent" }
  | { state: "clear" }
  | { state: "invalid" }
  | { state: "value"; value: T };

export const ABSENT = { state: "absent" } as const;
export const CLEAR = { state: "clear" } as const;
export const INVALID = { state: "invalid" } as const;

/** Kontekst jednego odczytu formularza: zrodlowe pola i zbiorczy dziennik bledow. */
export interface FormReader {
  fields: URLSearchParams;
  errors: EventFormError[];
}

function fail(reader: FormReader, field: EventFormErrorField): Slot<never> {
  reader.errors.push({ field, code: "invalid" });
  return INVALID;
}

export function text(
  reader: FormReader,
  field: EventFormField | SlotFormField,
  pattern?: RegExp,
): Slot<string> {
  const raw = reader.fields.get(field);
  if (raw === null) return ABSENT;

  const value = clean_text(raw, field === MULTILINE_FIELD);
  if (value === null) return fail(reader, field);
  if (value === "") return CLEAR;

  return pattern === undefined || pattern.test(value)
    ? { state: "value", value }
    : fail(reader, field);
}

/** `null` = tresc odrzucona. CRLF z pola wieloliniowego normalizujemy przed testem. */
function clean_text(raw: string, multiline: boolean): string | null {
  const value = multiline ? raw.replace(/\r\n?/g, "\n") : raw;
  const forbidden = multiline ? FORBIDDEN_MULTILINE_CHARS : FORBIDDEN_CHARS;

  return forbidden.test(value) ? null : value.trim();
}

/**
 * Adres, ktory da sie zbudowac, nie tylko dopasowac: wzorzec przepuszcza `http://[`,
 * a `parse_event` cicho zdejmuje takie pole przy odczycie — prefill edycji pokazalby
 * puste, a kolejny zapis skasowalby wartosc na dobre. Ta sama luka zostaje przy
 * `image`, `url` i `organizer.url`; tu zamyka ja tylko pole obiektu.
 */
export function absolute_url(
  reader: FormReader,
  field: EventFormField | SlotFormField,
): Slot<string> {
  const slot = text(reader, field, HTTP_URL);
  if (slot.state !== "value") return slot;

  try {
    new URL(slot.value);
    return slot;
  } catch {
    return fail(reader, field);
  }
}

/** Wzorzec jest juz sprawdzony, wiec zawezenie do typu szablonowego jest bezpieczne. */
export function offset(
  reader: FormReader,
  field: EventFormField,
): Slot<UtcOffset> {
  const slot = text(reader, field, UTC_OFFSET);

  return slot.state === "value"
    ? { state: "value", value: slot.value as UtcOffset }
    : slot;
}

export function read_kind(reader: FormReader): Slot<EventKind> {
  const slot = text(reader, "kind");
  if (slot.state !== "value") return slot;

  return slot.value === "conference" || slot.value === "workshop"
    ? { state: "value", value: slot.value }
    : fail(reader, "kind");
}

/**
 * Niezaznaczony checkbox nie wysyla pola w ogole, wiec o istnieniu grupy decyduja
 * pola tekstowe — sam checkbox nigdy nie powoluje `admission` do zycia.
 */
export function checkbox(reader: FormReader, field: EventFormField): boolean {
  return reader.fields.getAll(field).some((raw) => raw.trim().length > 0);
}

export function read_topics(reader: FormReader): Slot<string[]> {
  const raw = reader.fields.getAll("topics");
  if (raw.length === 0) return ABSENT;

  const topics: string[] = [];
  for (const entry of raw) {
    const value = clean_text(entry, false);
    if (value === null) return fail(reader, "topics");

    for (const topic of value.split(TOPIC_SEPARATOR)) {
      const trimmed = topic.trim();
      if (trimmed.length > 0) topics.push(trimmed);
    }
  }

  if (topics.length === 0) return CLEAR;

  // `TradeFairEvent.topics` nie ma pulapu — obcinanie tu po cichu skasowaloby nadmiar
  // przy zapisie. Formularz woli odbic zapis z bledem, zeby autor sam zdecydowal, ktore
  // tematy zostawic, niz zgubic je bez ostrzezenia.
  return topics.length > MAX_EVENT_TOPICS
    ? fail(reader, "topics")
    : { state: "value", value: topics };
}
