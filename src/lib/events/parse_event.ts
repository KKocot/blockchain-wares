import type {
  ClockTime,
  EventAdmission,
  EventKind,
  EventSchedule,
  EventVenue,
  TradeFairEvent,
  UtcOffset,
} from "../../components/events-data";

/** Odbicie wzorcow z backend-api `src/projects/blockchain-wares/constants.ts`. */
const EVENT_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;
const CLOCK_TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const UTC_OFFSET = /^[+-](?:[01]\d|2[0-3]):[0-5]\d$/;
const COUNTRY_CODE = /^[A-Z]{2}$/;
const CURRENCY_CODE = /^[A-Z]{3}$/;
const PRICE = /^\d+(?:\.\d{1,2})?$/;
const HTTP_URL = /^https?:\/\/\S+$/;

/**
 * `null` = rekord nie nadaje sie do renderu. Pole opcjonalne obecne, ale w zlym
 * ksztalcie tez wywala caly rekord: skoro nie rozumiemy tego, co przyszlo,
 * zgadywanie polowy wydarzenia jest gorsze niz jego brak.
 *
 * Adresy przechodza przez wzorzec `https?://`, bo trafiaja wprost do `href`
 * i do JSON-LD — `javascript:` z bazy bylby wtedy linkiem do kliknięcia.
 */
export function parse_event(value: unknown): TradeFairEvent | null {
  const source = as_record(value);
  if (source === null) return null;

  const id = matched(source.id, EVENT_ID);
  const name = text(source.name);
  const city = text(source.city);
  const country = text(source.country);
  const countryCode = matched(source.countryCode, COUNTRY_CODE);
  const startDate = matched(source.startDate, ISO_DAY);
  const endDate = matched(source.endDate, ISO_DAY);
  const image = text(source.image);
  const description = text(source.description);
  const organizer = read_organizer(source.organizer);
  const topics = read_topics(source.topics);

  if (
    id === null ||
    name === null ||
    city === null ||
    country === null ||
    countryCode === null ||
    startDate === null ||
    endDate === null ||
    image === null ||
    description === null ||
    organizer === null ||
    topics === null
  ) {
    return null;
  }

  const shortName = optional(source.shortName, text);
  const edition = optional(source.edition, text);
  const kind = optional(source.kind, read_kind);
  const utcOffset = optional(
    source.utcOffset,
    (raw) => matched(raw, UTC_OFFSET) as UtcOffset | null,
  );
  const schedule = optional(source.schedule, read_schedule);
  const venue = optional(source.venue, read_venue);
  const admission = optional(source.admission, read_admission);
  const url = optional(source.url, (raw) => matched(raw, HTTP_URL));

  if (
    shortName === null ||
    edition === null ||
    kind === null ||
    utcOffset === null ||
    schedule === null ||
    venue === null ||
    admission === null ||
    url === null
  ) {
    return null;
  }

  return {
    id,
    name,
    shortName,
    edition,
    kind,
    utcOffset,
    city,
    country,
    countryCode,
    startDate,
    endDate,
    schedule,
    venue,
    admission,
    url,
    image,
    organizer,
    description,
    topics,
  };
}

function as_record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** Niepusty string; wartosc wraca nietknieta, przycinany jest tylko test na pustke. */
function text(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function matched(value: unknown, pattern: RegExp): string | null {
  const raw = text(value);
  return raw !== null && pattern.test(raw) ? raw : null;
}

/**
 * Pusty string liczy sie jak brak wartosci, tak samo jak `drop_nullish` po stronie
 * backendu: API takiego pola nie przepusci, ale reczna edycja w Mongo juz tak,
 * a `shortName: ""` nie jest powodem, zeby zdjac cale wydarzenie ze strony.
 */
function is_blank(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim().length === 0)
  );
}

/** `undefined` = pola nie bylo, `null` = bylo, ale nie da sie go odczytac. */
function optional<T>(
  value: unknown,
  read: (raw: unknown) => T | null,
): T | null | undefined {
  return is_blank(value) ? undefined : read(value);
}

function read_kind(value: unknown): EventKind | null {
  return value === "conference" || value === "workshop" ? value : null;
}

function read_topics(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;

  const topics: string[] = [];
  for (const entry of value) {
    const topic = text(entry);
    if (topic === null) return null;
    topics.push(topic);
  }

  return topics;
}

function read_organizer(value: unknown): TradeFairEvent["organizer"] | null {
  const source = as_record(value);
  if (source === null) return null;

  const name = text(source.name);
  const url = matched(source.url, HTTP_URL);

  return name !== null && url !== null ? { name, url } : null;
}

function read_schedule(value: unknown): EventSchedule | null {
  const source = as_record(value);
  if (source === null) return null;

  const startTime = matched(source.startTime, CLOCK_TIME);
  const endTime = matched(source.endTime, CLOCK_TIME);
  const utcOffset = matched(source.utcOffset, UTC_OFFSET);
  const timeZoneLabel = text(source.timeZoneLabel);

  if (
    startTime === null ||
    endTime === null ||
    utcOffset === null ||
    timeZoneLabel === null
  ) {
    return null;
  }

  return {
    startTime: startTime as ClockTime,
    endTime: endTime as ClockTime,
    utcOffset: utcOffset as UtcOffset,
    timeZoneLabel,
  };
}

function read_venue(value: unknown): EventVenue | null {
  const source = as_record(value);
  if (source === null) return null;

  const name = text(source.name);
  const streetAddress = optional(source.streetAddress, text);
  const postalCode = optional(source.postalCode, text);

  if (name === null || streetAddress === null || postalCode === null) {
    return null;
  }

  return { name, streetAddress, postalCode };
}

function read_admission(value: unknown): EventAdmission | null {
  const source = as_record(value);
  if (source === null) return null;

  const price = matched(source.price, PRICE);
  const priceCurrency = matched(source.priceCurrency, CURRENCY_CODE);
  const validFrom = matched(source.validFrom, ISO_DAY);
  const requiresRegistration = source.requiresRegistration;

  if (
    price === null ||
    priceCurrency === null ||
    validFrom === null ||
    typeof requiresRegistration !== "boolean"
  ) {
    return null;
  }

  return { price, priceCurrency, requiresRegistration, validFrom };
}
