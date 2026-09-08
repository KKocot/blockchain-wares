import type {
  ClockTime,
  EventAdmission,
  EventFact,
  EventKind,
  EventLink,
  EventSchedule,
  EventVenue,
  IconKey,
  TradeFairEvent,
  UtcOffset,
} from "../../components/events-data";
import {
  ICON_KEYS,
  MAX_EVENT_BADGES,
  MAX_EVENT_FACTS,
  MAX_EVENT_LINKS,
} from "../../components/event-types";
import type { EventDraft } from "./mutations";
import { parse_event } from "./parse_event";
import type { FormReader, Slot } from "./form_parsers";
import {
  ABSENT,
  CHECKBOX_ON,
  CLEAR,
  CLOCK_TIME,
  COUNTRY_CODE,
  CURRENCY_CODE,
  EVENT_ID,
  HTTP_URL,
  IMAGE_SRC,
  INVALID,
  ISO_DAY,
  PRICE,
  TOPIC_SEPARATOR,
  absolute_url,
  checkbox,
  offset,
  read_kind,
  read_topics,
  text,
} from "./form_parsers";

/**
 * Nazwa inputu w formularzu panelu — jednoczesnie sciezka w `TradeFairEvent`
 * i przedrostek kodu bledu, ktory wraca w `?error=` przy 303. Lista bierze sie
 * z `form_values()`, wiec formularz i odczyt nie moga rozjechac sie na nazwach.
 */
export type EventFormField = keyof ReturnType<typeof form_values>;

/**
 * Pola grup powtarzalnych (`badges.<i>`, `facts.<i>.icon|label`, `links.<i>.label|url`)
 * i `venue.note` — celowo poza `EventFormField`, ktorego katalog w `event_form_fields.ts`
 * sprawdza wyczerpujaco (`UndeclaredEventFormField`). Adresy sa nadal odczytywalne przez
 * `text()`/`absolute_url()` i zglaszalne w bledach — tylko bez wpisu w zamknietym katalogu.
 */
export type SlotFormField =
  | "venue.note"
  | `badges.${number}`
  | `facts.${number}.icon`
  | `facts.${number}.label`
  | `links.${number}.label`
  | `links.${number}.url`;

/** Blad calego rekordu, nie pojedynczego inputu. */
export const FORM_SCOPE = "form";

export type EventFormErrorField =
  | EventFormField
  | SlotFormField
  | typeof FORM_SCOPE;

/** Zadne pole nie jest obowiazkowe: `required` zostalo dla pustego formularza (`FORM_SCOPE`). */
export type EventFormErrorCode = "required" | "invalid";

export interface EventFormError {
  field: EventFormErrorField;
  code: EventFormErrorCode;
}

/**
 * Trzy stany pola: klucz nieobecny = bez zmian, `null` = kasowanie (`$unset` po stronie
 * API), wartosc = ustawienie. Zadne pole nie jest obowiazkowe — wlasciciel zapisuje szkic
 * i uzupelnia go pozniej. `id` jest jedynym bez wariantu `null`: rekord bez niego nie ma
 * adresu, wiec puste pole znaczy „nie przysylaj" (backend zlozy slug), nigdy „skasuj".
 */
export interface EventFormPatch {
  id?: string;
  name?: string | null;
  shortName?: string | null;
  edition?: string | null;
  kind?: EventKind | null;
  utcOffset?: UtcOffset | null;
  city?: string | null;
  country?: string | null;
  countryCode?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  schedule?: EventSchedule | null;
  venue?: EventVenue | null;
  admission?: EventAdmission | null;
  url?: string | null;
  image?: string | null;
  organizer?: TradeFairEvent["organizer"] | null;
  description?: string | null;
  topics?: string[] | null;
  badges?: string[] | null;
  facts?: EventFact[] | null;
  links?: EventLink[] | null;
}

export type EventFormResult =
  | { ok: true; event: EventDraft }
  | { ok: false; errors: EventFormError[] };

export type EventPatchResult =
  | { ok: true; patch: EventFormPatch }
  | { ok: false; errors: EventFormError[] };

/** Slug zastepczy na czas sprawdzenia ksztaltu szkicu, ktory `id` zostawil backendowi. */
const PLACEHOLDER_ID = "draft";

/**
 * Wydarzenie z formularza tworzenia: puste pole to brak wartosci, nie blad — pusty
 * formularz zapisuje szkic. Bez `id` wynik nie niesie tego pola i slug sklada backend
 * z nazwy wydarzenia.
 */
export function read_event_form(fields: URLSearchParams): EventFormResult {
  const { patch, errors } = build_patch(fields);
  if (errors.length > 0) return { ok: false, errors };

  const candidate: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(patch)) {
    if (value !== null) candidate[key] = value;
  }

  // Ostatnia bramka to ta sama funkcja, ktora czyta rekordy z API: regul ksztaltu
  // nie ma tu drugiej kopii, ta warstwa dokłada im tylko wskazanie pola. `id` jest tam
  // wymagane, wiec szkic bez niego przechodzi przez slug zastepczy i oddaje go zaraz potem.
  const supplied = typeof candidate.id === "string";
  const event = parse_event(
    supplied ? candidate : { ...candidate, id: PLACEHOLDER_ID },
  );
  if (event === null) {
    return { ok: false, errors: [{ field: FORM_SCOPE, code: "invalid" }] };
  }
  if (supplied) return { ok: true, event };

  const draft: EventDraft = { ...event };
  delete draft.id;
  return { ok: true, event: draft };
}

/**
 * Zmiana czesciowa: pole nieobecne = bez zmian, obecne i puste = kasowanie. Puste
 * `venue.*` znaczy „skasuj venue" — bez tego panel nie umie niczego wyczyscic.
 */
export function read_event_patch(fields: URLSearchParams): EventPatchResult {
  const { patch, errors } = build_patch(fields);

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
  for (const [field, value] of Object.entries(slot_form_values(event))) {
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
    "venue.room": event.venue?.room ?? "",
    "venue.streetAddress": event.venue?.streetAddress ?? "",
    "venue.postalCode": event.venue?.postalCode ?? "",
    "venue.url": event.venue?.url ?? "",
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
 * Prefill slotow grup powtarzalnych i `venue.note` — poza `form_values()`, bo ich liczba
 * zalezy od dlugosci tablicy (indeksowana do MAX_EVENT_*), nie jest stalym ksztaltem jak
 * reszta `TradeFairEvent`. Emituje kazdy slot az do limitu, takze pusty — tak samo jak
 * `form_values()`, zeby round-trip mogl wyczyscic dowolny z nich.
 */
function slot_form_values(event: TradeFairEvent): Record<string, string> {
  const fields: Record<string, string> = {
    "venue.note": event.venue?.note ?? "",
  };

  for (let index = 0; index < MAX_EVENT_BADGES; index += 1) {
    fields[`badges.${index}`] = event.badges?.[index] ?? "";
  }
  for (let index = 0; index < MAX_EVENT_FACTS; index += 1) {
    fields[`facts.${index}.icon`] = event.facts?.[index]?.icon ?? "";
    fields[`facts.${index}.label`] = event.facts?.[index]?.label ?? "";
  }
  for (let index = 0; index < MAX_EVENT_LINKS; index += 1) {
    fields[`links.${index}.label`] = event.links?.[index]?.label ?? "";
    fields[`links.${index}.url`] = event.links?.[index]?.url ?? "";
  }

  return fields;
}

/** Jedno czytanie dla obu kierunkow — tworzenie to patch z kompletem pol. */
function build_patch(fields: URLSearchParams): {
  patch: EventFormPatch;
  errors: EventFormError[];
} {
  const reader: FormReader = { fields, errors: [] };

  const patch: EventFormPatch = {
    ...id_entry(text(reader, "id", EVENT_ID)),
    ...optional_entry("name", text(reader, "name")),
    ...optional_entry("shortName", text(reader, "shortName")),
    ...optional_entry("edition", text(reader, "edition")),
    ...optional_entry("kind", read_kind(reader)),
    ...optional_entry("utcOffset", offset(reader, "utcOffset")),
    ...optional_entry("city", text(reader, "city")),
    ...optional_entry("country", text(reader, "country")),
    ...optional_entry("countryCode", text(reader, "countryCode", COUNTRY_CODE)),
    ...optional_entry("startDate", text(reader, "startDate", ISO_DAY)),
    ...optional_entry("endDate", text(reader, "endDate", ISO_DAY)),
    ...optional_entry("schedule", read_schedule(reader)),
    ...optional_entry("venue", read_venue(reader)),
    ...optional_entry("admission", read_admission(reader)),
    ...optional_entry("url", text(reader, "url", HTTP_URL)),
    ...optional_entry("image", text(reader, "image", IMAGE_SRC)),
    ...optional_entry("organizer", read_organizer(reader)),
    ...optional_entry("description", text(reader, "description")),
    ...optional_entry("topics", read_topics(reader)),
    ...optional_entry("badges", read_badges(reader)),
    ...optional_entry("facts", read_facts(reader)),
    ...optional_entry("links", read_links(reader)),
  };

  return { patch, errors: reader.errors };
}

function read_venue(reader: FormReader): Slot<EventVenue> {
  const name = text(reader, "venue.name");
  const room = text(reader, "venue.room");
  const street = text(reader, "venue.streetAddress");
  const postal = text(reader, "venue.postalCode");
  const url = absolute_url(reader, "venue.url");
  const note = text(reader, "venue.note");

  return group([name, room, street, postal, url, note], () => ({
    name: value_of(name),
    room: value_of(room),
    streetAddress: value_of(street),
    postalCode: value_of(postal),
    url: value_of(url),
    note: value_of(note),
  }));
}

function read_schedule(reader: FormReader): Slot<EventSchedule> {
  const start = text(reader, "schedule.startTime", CLOCK_TIME);
  const end = text(reader, "schedule.endTime", CLOCK_TIME);
  const zone = offset(reader, "schedule.utcOffset");
  const label = text(reader, "schedule.timeZoneLabel");

  return group([start, end, zone, label], () => ({
    startTime: value_of(start) as ClockTime | undefined,
    endTime: value_of(end) as ClockTime | undefined,
    utcOffset: value_of(zone),
    timeZoneLabel: value_of(label),
  }));
}

function read_admission(reader: FormReader): Slot<EventAdmission> {
  const price = text(reader, "admission.price", PRICE);
  const currency = text(reader, "admission.priceCurrency", CURRENCY_CODE);
  const validFrom = text(reader, "admission.validFrom", ISO_DAY);

  return group([price, currency, validFrom], () => ({
    price: value_of(price),
    priceCurrency: value_of(currency),
    requiresRegistration: checkbox(reader, "admission.requiresRegistration"),
    validFrom: value_of(validFrom),
  }));
}

function read_organizer(reader: FormReader): Slot<TradeFairEvent["organizer"]> {
  const name = text(reader, "organizer.name");
  const url = text(reader, "organizer.url", HTTP_URL);

  return group([name, url], () => ({
    name: value_of(name),
    url: value_of(url),
  }));
}

function read_badges(reader: FormReader): Slot<string[]> {
  return read_repeated(MAX_EVENT_BADGES, (index) =>
    text(reader, `badges.${index}`),
  );
}

function read_facts(reader: FormReader): Slot<EventFact[]> {
  return read_repeated(MAX_EVENT_FACTS, (index) => fact_slot(reader, index));
}

/**
 * Ikona i tresc sa nierozerwalna para. Ikona spoza `ICON_KEYS` (select podmieniony poza
 * formularzem) jest bledem tego pola, nie powodem do zdjecia wpisanej tresci.
 */
function fact_slot(reader: FormReader, index: number): Slot<EventFact> {
  const icon_field: SlotFormField = `facts.${index}.icon`;
  const pair = slot_pair(reader, [icon_field, `facts.${index}.label`]);
  if (pair.state !== "value") return pair;

  const [icon, label] = pair.value;
  if (is_icon_key(icon)) return { state: "value", value: { icon, label } };

  reader.errors.push({ field: icon_field, code: "invalid" });
  return INVALID;
}

function is_icon_key(value: string): value is IconKey {
  return (ICON_KEYS as readonly string[]).includes(value);
}

function read_links(reader: FormReader): Slot<EventLink[]> {
  return read_repeated(MAX_EVENT_LINKS, (index) => link_slot(reader, index));
}

/** Etykieta i adres to jeden odnosnik: bez etykiety nie ma czego kliknac, bez adresu — dokad. */
function link_slot(reader: FormReader, index: number): Slot<EventLink> {
  const pair = slot_pair(
    reader,
    [`links.${index}.label`, `links.${index}.url`],
    absolute_url,
  );
  if (pair.state !== "value") return pair;

  const [label, url] = pair.value;
  return { state: "value", value: { label, url } };
}

type SlotRead = (reader: FormReader, field: SlotFormField) => Slot<string>;

/**
 * Nierozerwalna para pol jednego wiersza. Wiersz pusty w calosci znika bez slowa (szkic
 * w trakcie pisania), ale polowa wypelniona bez drugiej wraca bledem przy brakujacym polu:
 * ciche pominiecie konczylo sie zapisem „udanym", z ktorego wpisana wartosc znikala.
 */
function slot_pair(
  reader: FormReader,
  fields: readonly [SlotFormField, SlotFormField],
  read_second: SlotRead = text,
): Slot<[string, string]> {
  const first = text(reader, fields[0]);
  const second = read_second(reader, fields[1]);

  if (first.state === "invalid" || second.state === "invalid") return INVALID;
  if (first.state === "absent" && second.state === "absent") return ABSENT;
  if (first.state !== "value" && second.state !== "value") return CLEAR;

  if (first.state !== "value" || second.state !== "value") {
    reader.errors.push({
      field: first.state === "value" ? fields[1] : fields[0],
      code: "required",
    });

    return INVALID;
  }

  return { state: "value", value: [first.value, second.value] };
}

/**
 * Kombinuje N niezaleznych slotow indeksowanych w jedna liste, w kolejnosci i bez dziur.
 * Zaden slot obecny = bez zmian; cokolwiek obecne (nawet niekompletne) = grupa byla
 * dotknieta — pusta reszta koncowo kasuje pole (`optional_entry` zmienia [] na `null`).
 */
function read_repeated<T>(
  max: number,
  slot_at: (index: number) => Slot<T>,
): Slot<T[]> {
  const items: T[] = [];
  let touched = false;

  for (let index = 0; index < max; index += 1) {
    const slot = slot_at(index);
    if (slot.state === "absent") continue;
    touched = true;
    if (slot.state === "value") items.push(slot.value);
  }

  if (!touched) return ABSENT;
  return items.length === 0 ? CLEAR : { state: "value", value: items };
}

/**
 * Grupa zagniezdzona: kazde pole niezalezne, bo backend przyjmuje kazde z osobna.
 * Zle wypelnione pole wywala grupe, komplet nieobecnych znaczy „bez zmian", a grupa
 * bez ani jednej wartosci — „skasuj", zamiast obiektu z pustymi stringami.
 */
function group<T>(slots: readonly Slot<unknown>[], build: () => T): Slot<T> {
  if (slots.some((slot) => slot.state === "invalid")) return INVALID;
  if (slots.every((slot) => slot.state === "absent")) return ABSENT;
  if (slots.every((slot) => slot.state !== "value")) return CLEAR;

  return { state: "value", value: build() };
}

function value_of<T>(slot: Slot<T>): T | undefined {
  return slot.state === "value" ? slot.value : undefined;
}

/**
 * `id` bez wariantu „skasuj": puste pole znaczy „nie przysylaj" — przy tworzeniu slug
 * sklada backend, a przy edycji rekord zostaje pod dotychczasowym adresem.
 */
function id_entry(slot: Slot<string>): { id?: string } {
  return slot.state === "value" ? { id: slot.value } : {};
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
