import type {
  ClockTime,
  EventAdmission,
  EventFact,
  EventKind,
  EventLink,
  EventSchedule,
  EventVenue,
  TradeFairEvent,
  UtcOffset,
} from "../../components/events-data";
import {
  ICON_KEYS,
  MAX_EVENT_BADGES,
  MAX_EVENT_FACTS,
  MAX_EVENT_LINKS,
} from "../../components/event-types";

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
 * Same pattern the events module validates writes with: an absolute `http(s)` address or
 * a root-relative path. Protocol-relative `//host/a.png` is out — it resolves to someone
 * else's origin in the JSON-LD, and every event we hold states a path of our own.
 */
const IMAGE_SRC = /^(?:https?:\/\/\S+|\/[^/\s]\S*)$/;

/** Base for the shape check only — the real one comes from `Astro.site` at render time */
const RESOLUTION_BASE = "https://resolution.invalid";

/**
 * `null` = rekord nie nadaje sie do renderu, czyli dzis wylacznie brak `id`: tylko ono
 * jest wymagane, bo napedza trase `/markets/<id>`. Kazde inne pole moze byc puste —
 * wlasciciel zapisuje szkic i uzupelnia go pozniej.
 *
 * Pole **obecne, ale w zlym ksztalcie** dalej wywala caly rekord: brak wartosci to
 * zgoda na szkic, wartosc ktorej nie rozumiemy to uszkodzone dane, a zgadywanie polowy
 * wydarzenia jest gorsze niz jego brak. Wyjatki to `image` i `venue.url` — patrz
 * `read_image()` i `read_venue_url()`.
 *
 * Adresy przechodza przez wzorzec `https?://`, bo trafiaja wprost do `href`
 * i do JSON-LD — `javascript:` z bazy bylby wtedy linkiem do kliknięcia.
 */
export function parse_event(value: unknown): TradeFairEvent | null {
  const source = as_record(value);
  if (source === null) return null;

  const id = matched(source.id, EVENT_ID);
  if (id === null) return null;

  const image = read_image(source.image);
  const name = optional(source.name, text);
  const city = optional(source.city, text);
  const country = optional(source.country, text);
  const countryCode = optional(source.countryCode, (raw) =>
    matched(raw, COUNTRY_CODE),
  );
  const startDate = optional(source.startDate, (raw) => matched(raw, ISO_DAY));
  const endDate = optional(source.endDate, (raw) => matched(raw, ISO_DAY));
  const description = optional(source.description, text);
  const organizer = optional(source.organizer, read_organizer);
  const topics = optional(source.topics, read_topics);
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
  const badges = read_badges(source.badges);
  const facts = read_facts(source.facts);
  const links = read_links(source.links);

  if (
    name === null ||
    city === null ||
    country === null ||
    countryCode === null ||
    startDate === null ||
    endDate === null ||
    description === null ||
    organizer === null ||
    topics === null ||
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
    badges,
    facts,
    links,
  };
}

/**
 * Image of an event, a path of ours or an absolute address. `http://[` clears the pattern
 * yet still throws in `new URL()` when the JSON-LD is built, and the events module accepts
 * it on write, so a record like that does reach us.
 *
 * A shape we cannot resolve costs the field, not the record: the picture is decoration for
 * the JSON-LD, while dropping the event hides it from the admin listing too — leaving no
 * way to fix or delete it short of the database.
 */
function read_image(value: unknown): string | undefined {
  const raw = matched(value, IMAGE_SRC);
  if (raw === null) return undefined;

  try {
    new URL(raw, RESOLUTION_BASE);
    return raw;
  } catch {
    return undefined;
  }
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
  read: (raw: unknown) => T | null | undefined,
): T | null | undefined {
  return is_blank(value) ? undefined : read(value);
}

/**
 * Grupa zagniezdzona bez ani jednej wartosci znaczy tyle, co jej brak: pusty obiekt
 * przeszedlby dalej i kazal widokom rysowac wiersz, w ktorym nic nie ma.
 */
function present<T extends object>(group: T): T | undefined {
  return Object.values(group).some((value) => value !== undefined)
    ? group
    : undefined;
}

function read_kind(value: unknown): EventKind | null {
  return value === "conference" || value === "workshop" ? value : null;
}

/** Pusta lista znaczy „bez tematow", nie „rekord do wyrzucenia" — jak brak pola. */
function read_topics(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  if (value.length === 0) return [];

  const topics: string[] = [];
  for (const entry of value) {
    const topic = text(entry);
    if (topic === null) return null;
    topics.push(topic);
  }

  return topics;
}

/**
 * Grupy zagniezdzone czyta sie polami niezaleznie: `organizer.name` bez adresu,
 * sala bez ulicy czy sama godzina otwarcia to dane niepelne, nie uszkodzone —
 * backend przyjmuje kazde z osobna, wiec front tez musi je pokazac. Wartosc
 * **obecna w zlym formacie** dalej zdejmuje caly rekord, jak wszedzie indziej.
 */
function read_organizer(
  value: unknown,
): TradeFairEvent["organizer"] | null | undefined {
  const source = as_record(value);
  if (source === null) return null;

  const name = optional(source.name, text);
  const url = optional(source.url, (raw) => matched(raw, HTTP_URL));

  if (name === null || url === null) return null;

  return present({ name, url });
}

function read_schedule(value: unknown): EventSchedule | null | undefined {
  const source = as_record(value);
  if (source === null) return null;

  const startTime = optional(
    source.startTime,
    (raw) => matched(raw, CLOCK_TIME) as ClockTime | null,
  );
  const endTime = optional(
    source.endTime,
    (raw) => matched(raw, CLOCK_TIME) as ClockTime | null,
  );
  const utcOffset = optional(
    source.utcOffset,
    (raw) => matched(raw, UTC_OFFSET) as UtcOffset | null,
  );
  const timeZoneLabel = optional(source.timeZoneLabel, text);

  if (
    startTime === null ||
    endTime === null ||
    utcOffset === null ||
    timeZoneLabel === null
  ) {
    return null;
  }

  return present({ startTime, endTime, utcOffset, timeZoneLabel });
}

function read_venue(value: unknown): EventVenue | null | undefined {
  const source = as_record(value);
  if (source === null) return null;

  const name = optional(source.name, text);
  const room = optional(source.room, text);
  const streetAddress = optional(source.streetAddress, text);
  const postalCode = optional(source.postalCode, text);
  const url = read_venue_url(source.url);
  const note = read_venue_note(source.note);

  if (
    name === null ||
    room === null ||
    streetAddress === null ||
    postalCode === null
  ) {
    return null;
  }

  return present({ name, room, streetAddress, postalCode, url, note });
}

/** Cosmetic like `url` above: a bad shape drops just this field, not the venue group. */
function read_venue_note(value: unknown): string | undefined {
  return text(value) ?? undefined;
}

/**
 * Page of the building. Forgiving like `read_image()` and for the same reason: the events
 * module validates writes with the pattern alone, so `http://[` reaches us and throws in
 * `new URL()`. A link we cannot build costs the field, not the whole event — dropping the
 * record would hide it from the admin listing too, leaving no way to fix the address.
 */
function read_venue_url(value: unknown): string | undefined {
  const raw = matched(value, HTTP_URL);
  if (raw === null) return undefined;

  try {
    new URL(raw);
    return raw;
  } catch {
    return undefined;
  }
}

function read_admission(value: unknown): EventAdmission | null | undefined {
  const source = as_record(value);
  if (source === null) return null;

  const price = optional(source.price, (raw) => matched(raw, PRICE));
  const priceCurrency = optional(source.priceCurrency, (raw) =>
    matched(raw, CURRENCY_CODE),
  );
  const validFrom = optional(source.validFrom, (raw) => matched(raw, ISO_DAY));
  const requiresRegistration = optional(source.requiresRegistration, read_flag);

  if (
    price === null ||
    priceCurrency === null ||
    validFrom === null ||
    requiresRegistration === null
  ) {
    return null;
  }

  return present({ price, priceCurrency, requiresRegistration, validFrom });
}

function read_flag(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

/**
 * Editorial labels, cosmetic like the three lists below: a bad element drops itself,
 * not the record. Truncates to `MAX_EVENT_BADGES` valid entries rather than rejecting
 * the whole list.
 */
function read_badges(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const badges: string[] = [];
  for (const entry of value) {
    const badge = text(entry);
    if (badge === null) continue;
    badges.push(badge);
    if (badges.length >= MAX_EVENT_BADGES) break;
  }

  return badges.length > 0 ? badges : undefined;
}

function read_facts(value: unknown): EventFact[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const facts: EventFact[] = [];
  for (const entry of value) {
    const fact = read_fact(entry);
    if (fact === null) continue;
    facts.push(fact);
    if (facts.length >= MAX_EVENT_FACTS) break;
  }

  return facts.length > 0 ? facts : undefined;
}

function read_fact(value: unknown): EventFact | null {
  const source = as_record(value);
  if (source === null) return null;

  const icon = source.icon;
  if (
    typeof icon !== "string" ||
    !(ICON_KEYS as readonly string[]).includes(icon)
  ) {
    return null;
  }

  const label = text(source.label);
  if (label === null) return null;

  return { icon: icon as EventFact["icon"], label };
}

function read_links(value: unknown): EventLink[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const links: EventLink[] = [];
  for (const entry of value) {
    const link = read_link(entry);
    if (link === null) continue;
    links.push(link);
    if (links.length >= MAX_EVENT_LINKS) break;
  }

  return links.length > 0 ? links : undefined;
}

/**
 * Unlike `read_image()`/`read_venue_url()`, a bad `url` drops the whole link, not just
 * the field — a link with no address is not a link. `matched()` already rejects
 * non-`http(s)` schemes like `javascript:`/`data:`; `new URL()` catches shapes the
 * backend's pattern lets through, e.g. `http://[`.
 */
function read_link(value: unknown): EventLink | null {
  const source = as_record(value);
  if (source === null) return null;

  const label = text(source.label);
  if (label === null) return null;

  const url = matched(source.url, HTTP_URL);
  if (url === null) return null;

  try {
    new URL(url);
  } catch {
    return null;
  }

  return { label, url };
}
