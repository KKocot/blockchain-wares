import type {
  ClockTime,
  EventAdmission,
  EventKind,
  EventSchedule,
  EventVenue,
  TradeFairEvent,
  UtcOffset,
} from "../../components/events-data";
import { parse_event } from "./parse_event";

/**
 * Nazwa inputu w formularzu panelu — jednoczesnie sciezka w `TradeFairEvent`
 * i przedrostek kodu bledu, ktory wraca w `?error=` przy 303. Lista bierze sie
 * z `form_values()`, wiec formularz i odczyt nie moga rozjechac sie na nazwach.
 */
export type EventFormField = keyof ReturnType<typeof form_values>;

/** Blad calego rekordu, nie pojedynczego inputu. */
export const FORM_SCOPE = "form";

export type EventFormErrorField = EventFormField | typeof FORM_SCOPE;

export type EventFormErrorCode = "required" | "invalid";

export interface EventFormError {
  field: EventFormErrorField;
  code: EventFormErrorCode;
}

/**
 * Trzy stany pola opcjonalnego: klucz nieobecny = bez zmian, `null` = kasowanie
 * (`$unset` po stronie API), wartosc = ustawienie. Pole wymagane nie ma wariantu
 * `null` — puste w formularzu jest bledem, nie zgoda na rekord bez nazwy.
 */
export interface EventFormPatch {
  id?: string;
  name?: string;
  shortName?: string | null;
  edition?: string | null;
  kind?: EventKind | null;
  utcOffset?: UtcOffset | null;
  city?: string;
  country?: string;
  countryCode?: string;
  startDate?: string;
  endDate?: string;
  schedule?: EventSchedule | null;
  venue?: EventVenue | null;
  admission?: EventAdmission | null;
  url?: string | null;
  image?: string;
  organizer?: TradeFairEvent["organizer"];
  description?: string;
  topics?: string[];
}

export type EventFormResult =
  | { ok: true; event: TradeFairEvent }
  | { ok: false; errors: EventFormError[] };

export type EventPatchResult =
  | { ok: true; patch: EventFormPatch }
  | { ok: false; errors: EventFormError[] };

/** Odbicie wzorcow z `parse_event.ts` — tam jest bramka ksztaltu, tu wskazanie pola. */
const EVENT_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const CLOCK_TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const UTC_OFFSET = /^[+-](?:[01]\d|2[0-3]):[0-5]\d$/;
const COUNTRY_CODE = /^[A-Z]{2}$/;
const CURRENCY_CODE = /^[A-Z]{3}$/;
const PRICE = /^\d+(?:\.\d{1,2})?$/;
const HTTP_URL = /^https?:\/\/\S+$/;

/** U+FFFD swiadczy o rozjechanym kodowaniu — wartosc jest juz wtedy uszkodzona. */
const FORBIDDEN_CHARS = /[\u0000-\u001F\u007F\uFFFD]/;
/** To samo z przepustka dla znaku nowej linii — opis jest jedynym polem textarea. */
const FORBIDDEN_MULTILINE_CHARS = /[\u0000-\u0009\u000B-\u001F\u007F\uFFFD]/;
const MULTILINE_FIELD = "description";

/** Bez JS-a nie da sie dolozyc inputu, wiec tematy jada jedna lista po przecinku.
 *  Przecinek w samym temacie jest przez to nie do zapisania. */
const TOPIC_SEPARATOR = ",";

/** Wartosc zaznaczonego checkboxa bez atrybutu `value`. */
const CHECKBOX_ON = "on";

/** Klucz obiektu -> input do podswietlenia. Grupa wskazuje swoje pierwsze pole. */
const REQUIRED_KEYS = {
  id: "id",
  name: "name",
  city: "city",
  country: "country",
  countryCode: "countryCode",
  startDate: "startDate",
  endDate: "endDate",
  image: "image",
  organizer: "organizer.name",
  description: "description",
  topics: "topics",
} as const satisfies Record<string, EventFormField>;

type RequiredKey = keyof typeof REQUIRED_KEYS;

/** Pelne wydarzenie z formularza tworzenia: puste pole opcjonalne to brak wartosci. */
export function read_event_form(fields: URLSearchParams): EventFormResult {
  const { patch, errors } = build_patch(fields, "create");
  if (errors.length > 0) return { ok: false, errors };

  const candidate: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(patch)) {
    if (value !== null) candidate[key] = value;
  }

  // Ostatnia bramka to ta sama funkcja, ktora czyta rekordy z API: regul ksztaltu
  // nie ma tu drugiej kopii, ta warstwa dokłada im tylko wskazanie pola.
  const event = parse_event(candidate);
  return event === null
    ? { ok: false, errors: [{ field: FORM_SCOPE, code: "invalid" }] }
    : { ok: true, event };
}

/**
 * Zmiana czesciowa: pole nieobecne = bez zmian, obecne i puste = kasowanie. Puste
 * `venue.*` znaczy „skasuj venue" — bez tego panel nie umie niczego wyczyscic.
 */
export function read_event_patch(fields: URLSearchParams): EventPatchResult {
  const { patch, errors } = build_patch(fields, "update");

  // Zadanie bez ani jednego pola to blad zadania, nie zapis pustej zmiany.
  if (errors.length === 0 && Object.keys(patch).length === 0) {
    errors.push({ field: FORM_SCOPE, code: "required" });
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true, patch };
}

/** Wypelnienie formularza edycji istniejacym wydarzeniem. */
export function to_event_form_fields(event: TradeFairEvent): URLSearchParams {
  const fields = new URLSearchParams();
  for (const [field, value] of Object.entries(form_values(event))) {
    fields.set(field, value);
  }

  return fields;
}

/** `venue.name` + `required` -> `venue.name.required`. Kropka jest URL-safe. */
export function format_event_form_error(error: EventFormError): string {
  return `${error.field}.${error.code}`;
}

/** Czy kod z `?error=` dotyczy tego inputu — formularz nie musi go rozbierac sam. */
export function is_field_error(
  code: string | null,
  field: EventFormErrorField,
): boolean {
  return code !== null && code.startsWith(`${field}.`);
}

/**
 * Zrodlo listy pol. Emituje KAZDE z nich — brak wartosci jako pusty string — zeby
 * round-trip `event -> pola -> event` oddal ten sam obiekt, a puste inputy dalo
 * sie wypelnic albo zostawic puste w znaczeniu „skasuj".
 */
function form_values(event: TradeFairEvent) {
  return {
    id: event.id,
    name: event.name ?? "",
    shortName: event.shortName ?? "",
    edition: event.edition ?? "",
    kind: event.kind ?? "",
    utcOffset: event.utcOffset ?? "",
    city: event.city ?? "",
    country: event.country ?? "",
    countryCode: event.countryCode ?? "",
    startDate: event.startDate ?? "",
    endDate: event.endDate ?? "",
    "schedule.startTime": event.schedule?.startTime ?? "",
    "schedule.endTime": event.schedule?.endTime ?? "",
    "schedule.utcOffset": event.schedule?.utcOffset ?? "",
    "schedule.timeZoneLabel": event.schedule?.timeZoneLabel ?? "",
    "venue.name": event.venue?.name ?? "",
    "venue.streetAddress": event.venue?.streetAddress ?? "",
    "venue.postalCode": event.venue?.postalCode ?? "",
    "admission.price": event.admission?.price ?? "",
    "admission.priceCurrency": event.admission?.priceCurrency ?? "",
    "admission.requiresRegistration":
      event.admission?.requiresRegistration === true ? CHECKBOX_ON : "",
    "admission.validFrom": event.admission?.validFrom ?? "",
    url: event.url ?? "",
    image: event.image ?? "",
    "organizer.name": event.organizer?.name ?? "",
    "organizer.url": event.organizer?.url ?? "",
    description: event.description ?? "",
    topics: event.topics?.join(`${TOPIC_SEPARATOR} `) ?? "",
  };
}

/**
 * `absent` = pola nie bylo w formularzu, `clear` = bylo puste, `invalid` = odrzucone
 * i juz zaraportowane. Rozroznienie dwoch pierwszych jest cala sola tego modulu.
 */
type Slot<T> =
  | { state: "absent" }
  | { state: "clear" }
  | { state: "invalid" }
  | { state: "value"; value: T };

const ABSENT = { state: "absent" } as const;
const CLEAR = { state: "clear" } as const;
const INVALID = { state: "invalid" } as const;

/** `mode` to jedyna roznica trybow: przy `create` brak pola wymaganego jest bledem. */
interface FormReader {
  fields: URLSearchParams;
  errors: EventFormError[];
  mode: "create" | "update";
}

/** Jedno czytanie dla obu kierunkow — tworzenie to patch z kompletem pol. */
function build_patch(
  fields: URLSearchParams,
  mode: FormReader["mode"],
): { patch: EventFormPatch; errors: EventFormError[] } {
  const reader: FormReader = { fields, errors: [], mode };

  const patch: EventFormPatch = {
    ...required_entry("id", text(reader, "id", EVENT_ID), reader),
    ...required_entry("name", text(reader, "name"), reader),
    ...optional_entry("shortName", text(reader, "shortName")),
    ...optional_entry("edition", text(reader, "edition")),
    ...optional_entry("kind", read_kind(reader)),
    ...optional_entry("utcOffset", offset(reader, "utcOffset")),
    ...required_entry("city", text(reader, "city"), reader),
    ...required_entry("country", text(reader, "country"), reader),
    ...required_entry(
      "countryCode",
      text(reader, "countryCode", COUNTRY_CODE),
      reader,
    ),
    ...required_entry("startDate", text(reader, "startDate", ISO_DAY), reader),
    ...required_entry("endDate", text(reader, "endDate", ISO_DAY), reader),
    ...optional_entry("schedule", read_schedule(reader)),
    ...optional_entry("venue", read_venue(reader)),
    ...optional_entry("admission", read_admission(reader)),
    ...optional_entry("url", text(reader, "url", HTTP_URL)),
    ...required_entry("image", text(reader, "image"), reader),
    ...required_entry("organizer", read_organizer(reader), reader),
    ...required_entry("description", text(reader, "description"), reader),
    ...required_entry("topics", read_topics(reader), reader),
  };

  return { patch, errors: reader.errors };
}

function text(
  reader: FormReader,
  field: EventFormField,
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

function fail(
  reader: FormReader,
  field: EventFormErrorField,
  code: EventFormErrorCode = "invalid",
): Slot<never> {
  reader.errors.push({ field, code });
  return INVALID;
}

/** Wzorzec jest juz sprawdzony, wiec zawezenie do typu szablonowego jest bezpieczne. */
function offset(reader: FormReader, field: EventFormField): Slot<UtcOffset> {
  const slot = text(reader, field, UTC_OFFSET);

  return slot.state === "value"
    ? { state: "value", value: slot.value as UtcOffset }
    : slot;
}

function read_kind(reader: FormReader): Slot<EventKind> {
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
function checkbox(reader: FormReader, field: EventFormField): boolean {
  return reader.fields.getAll(field).some((raw) => raw.trim().length > 0);
}

function read_topics(reader: FormReader): Slot<string[]> {
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

  return topics.length === 0 ? CLEAR : { state: "value", value: topics };
}

function read_venue(reader: FormReader): Slot<EventVenue> {
  const name = text(reader, "venue.name");
  const street = text(reader, "venue.streetAddress");
  const postal = text(reader, "venue.postalCode");

  const group = group_state<EventVenue>([name, street, postal]);
  if (group !== null) return group;
  if (name.state !== "value") return fail(reader, "venue.name", "required");

  return {
    state: "value",
    value: {
      name: name.value,
      streetAddress: value_of(street),
      postalCode: value_of(postal),
    },
  };
}

function read_schedule(reader: FormReader): Slot<EventSchedule> {
  const start = text(reader, "schedule.startTime", CLOCK_TIME);
  const end = text(reader, "schedule.endTime", CLOCK_TIME);
  const zone = offset(reader, "schedule.utcOffset");
  const label = text(reader, "schedule.timeZoneLabel");

  const group = group_state<EventSchedule>([start, end, zone, label]);
  if (group !== null) return group;

  if (
    start.state !== "value" ||
    end.state !== "value" ||
    zone.state !== "value" ||
    label.state !== "value"
  ) {
    report_missing(reader, [
      ["schedule.startTime", start],
      ["schedule.endTime", end],
      ["schedule.utcOffset", zone],
      ["schedule.timeZoneLabel", label],
    ]);
    return INVALID;
  }

  return {
    state: "value",
    value: {
      startTime: start.value as ClockTime,
      endTime: end.value as ClockTime,
      utcOffset: zone.value,
      timeZoneLabel: label.value,
    },
  };
}

function read_admission(reader: FormReader): Slot<EventAdmission> {
  const price = text(reader, "admission.price", PRICE);
  const currency = text(reader, "admission.priceCurrency", CURRENCY_CODE);
  const validFrom = text(reader, "admission.validFrom", ISO_DAY);

  const group = group_state<EventAdmission>([price, currency, validFrom]);
  if (group !== null) return group;

  if (
    price.state !== "value" ||
    currency.state !== "value" ||
    validFrom.state !== "value"
  ) {
    report_missing(reader, [
      ["admission.price", price],
      ["admission.priceCurrency", currency],
      ["admission.validFrom", validFrom],
    ]);
    return INVALID;
  }

  return {
    state: "value",
    value: {
      price: price.value,
      priceCurrency: currency.value,
      requiresRegistration: checkbox(reader, "admission.requiresRegistration"),
      validFrom: validFrom.value,
    },
  };
}

/** Organizator jest wymagany, wiec pusta grupa to blad, a nie kasowanie. */
function read_organizer(reader: FormReader): Slot<TradeFairEvent["organizer"]> {
  const name = text(reader, "organizer.name");
  const url = text(reader, "organizer.url", HTTP_URL);

  const group = group_state<TradeFairEvent["organizer"]>([name, url]);
  if (group !== null && group.state !== "clear") return group;

  if (name.state !== "value" || url.state !== "value") {
    report_missing(reader, [
      ["organizer.name", name],
      ["organizer.url", url],
    ]);
    return INVALID;
  }

  return { state: "value", value: { name: name.value, url: url.value } };
}

/**
 * Stan grupy przed zajrzeniem w pojedyncze pola; `null` znaczy „sa dane, skladaj".
 * Grupa pusta w calosci daje `clear`, a nie obiekt z pustymi stringami.
 */
function group_state<T>(slots: readonly Slot<unknown>[]): Slot<T> | null {
  if (slots.some((slot) => slot.state === "invalid")) return INVALID;
  if (slots.every((slot) => slot.state === "absent")) return ABSENT;
  if (slots.every((slot) => slot.state !== "value")) return CLEAR;

  return null;
}

/** Grupa czesciowo wypelniona: brakujace pola dostaja `required`, zle maja `invalid`. */
function report_missing(
  reader: FormReader,
  parts: readonly (readonly [EventFormField, Slot<string>])[],
): void {
  for (const [field, slot] of parts) {
    if (slot.state === "absent" || slot.state === "clear") {
      reader.errors.push({ field, code: "required" });
    }
  }
}

function value_of<T>(slot: Slot<T>): T | undefined {
  return slot.state === "value" ? slot.value : undefined;
}

/** Jedyne miejsce zglaszajace brak pola wymaganego — drugie dawaloby ten sam kod dwa razy. */
function required_entry<K extends RequiredKey, T>(
  key: K,
  slot: Slot<T>,
  reader: FormReader,
): Partial<Record<K, T>> {
  if (slot.state === "value") {
    return { [key]: slot.value } as Partial<Record<K, T>>;
  }
  // `invalid` ma juz swoj blad na tym samym inpucie.
  if (
    slot.state !== "invalid" &&
    (slot.state === "clear" || reader.mode === "create")
  ) {
    reader.errors.push({ field: REQUIRED_KEYS[key], code: "required" });
  }

  return {};
}

function optional_entry<K extends string, T>(
  key: K,
  slot: Slot<T>,
): Partial<Record<K, T | null>> {
  if (slot.state === "value") {
    return { [key]: slot.value } as Partial<Record<K, T | null>>;
  }

  return slot.state === "clear"
    ? ({ [key]: null } as Partial<Record<K, T | null>>)
    : {};
}
