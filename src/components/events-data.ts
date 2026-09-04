/** Conferences we attend, workshops we host ourselves — drives the wording of the labels */
export type EventKind = "conference" | "workshop";

/** `HH:MM` in 24h — the template shape makes a typo a compile error, not a bad `dateTime` */
export type ClockTime = `${number}:${number}`;

/** Signed UTC offset, e.g. "+02:00" */
export type UtcOffset = `${"+" | "-"}${number}:${number}`;

/** Clock times of a single-day event, kept apart from the date-only `startDate`/`endDate` */
export interface EventSchedule {
  /** Local start */
  startTime: ClockTime;
  /** Local end */
  endTime: ClockTime;
  /** UTC offset of both times — machine-readable half, goes into `dateTime` and JSON-LD */
  utcOffset: UtcOffset;
  /** Zone name shown to readers next to the times, e.g. "CEST" */
  timeZoneLabel: string;
}

export interface EventVenue {
  name: string;
  /** Street and number as written locally, e.g. "Carrer de Cristóbal de Moura, 49" */
  streetAddress?: string;
  postalCode?: string;
}

/** What it takes to get in — drives the card pill and the JSON-LD `Offer` */
export interface EventAdmission {
  /** Decimal string, schema.org style; "0" reads as free entry */
  price: string;
  /** ISO 4217 code, e.g. "EUR" */
  priceCurrency: string;
  requiresRegistration: boolean;
  /** First day the offer holds, ISO `YYYY-MM-DD` — the day we announced it */
  validFrom: string;
}

export interface TradeFairEvent {
  /** Stable key + anchor id */
  id: string;
  name: string;
  /** Compact label for tight layouts, e.g. "EBC 2026" — falls back to `name` */
  shortName?: string;
  /** Short edition marker, e.g. "EBC12" */
  edition?: string;
  /** Defaults to `"conference"` */
  kind?: EventKind;
  /**
   * UTC offset the event's calendar days open and close in, e.g. "+02:00".
   * `schedule` states it already and wins; spell it out for events without clock times,
   * otherwise their days fall back to the zone of whoever renders the page.
   */
  utcOffset?: UtcOffset;
  city: string;
  country: string;
  /** ISO 3166-1 alpha-2 code, used by the JSON-LD Event schema */
  countryCode: string;
  /** First day, ISO `YYYY-MM-DD` */
  startDate: string;
  /** Last day, ISO `YYYY-MM-DD` — equals `startDate` for one-day events */
  endDate: string;
  schedule?: EventSchedule;
  venue?: EventVenue;
  /** Ticketing terms — absent for events we only attend, they are not ours to describe */
  admission?: EventAdmission;
  /** Event website — absent for events that have no public page of their own */
  url?: string;
  /** Site-relative or absolute image for the JSON-LD Event schema */
  image: string;
  organizer: {
    name: string;
    url: string;
  };
  description: string;
  topics: string[];
}

export type EventStatus = "ongoing" | "upcoming" | "past";

export interface EventDateParts {
  /** Day of the month the event starts on, e.g. "16" */
  start_day: string;
  /** Day of the month the event ends on, e.g. "17" */
  end_day: string;
  /** Short month or month range, e.g. "Sep" or "Sep–Oct" */
  month: string;
  /** Year or year range, e.g. "2026" or "2026–2027" */
  year: string;
}

/**
 * Trade fairs and conferences BlockchainWares attends, plus the workshops we run ourselves.
 * Single source of truth for the /markets page, the homepage event banner
 * and the JSON-LD Event schema. Display dates are derived from the ISO dates.
 */
export const EVENTS: TradeFairEvent[] = [
  {
    id: "ebc-2026-barcelona",
    name: "European Blockchain Convention 2026",
    shortName: "EBC 2026",
    edition: "EBC12",
    city: "Barcelona",
    country: "Spain",
    countryCode: "ES",
    startDate: "2026-09-16",
    endDate: "2026-09-17",
    // Barcelona keeps CEST through September — without it the days would be counted in UTC
    utcOffset: "+02:00",
    url: "https://eblockchainconvention.com/",
    image: "/assets/img/og-image.png",
    organizer: {
      name: "European Blockchain Convention",
      url: "https://eblockchainconvention.com/",
    },
    description:
      "We are going to Barcelona. The 12th European Blockchain Convention gathers thousands of builders, founders and institutions from across the continent. Our engineers will be on the floor talking blockchain infrastructure, event-driven architecture and high-load database systems — say hello if you are attending.",
    topics: [
      "Blockchain infrastructure",
      "Event-driven architecture",
      "Enterprise integrations",
    ],
  },
  {
    id: "bw-workshop-2026-barcelona",
    name: "BlockchainWares Workshop in Barcelona",
    shortName: "Barcelona workshop",
    kind: "workshop",
    city: "Barcelona",
    country: "Spain",
    countryCode: "ES",
    startDate: "2026-09-19",
    endDate: "2026-09-19",
    schedule: {
      startTime: "10:00",
      endTime: "14:00",
      utcOffset: "+02:00",
      timeZoneLabel: "CEST",
    },
    venue: {
      name: "The Social Hub Coworking Barcelona Poblenou",
      // Street from the Barcelona city venue registry (guia.barcelona.cat)
      streetAddress: "Carrer de Cristóbal de Moura, 49",
      postalCode: "08019",
    },
    admission: {
      price: "0",
      priceCurrency: "EUR",
      requiresRegistration: false,
      validFrom: "2026-09-03",
    },
    image: "/assets/img/og-image.png",
    organizer: {
      name: "BlockchainWares",
      url: "https://blockchainwares.com.pl",
    },
    description:
      "Four hours in a rented room in Poblenou, Barcelona, on what BlockchainWares does and what we can build for a client. We go through our scope of work — Hive blockchain, event-driven architecture, engineering and database systems — and demo projects we have already delivered: what the client needed, what we built for them, how it runs in production.",
    topics: ["Our scope of work", "Project demos", "Delivered solutions"],
  },
];

/**
 * Prerendering the events pages evaluates this module, so a duplicated id fails the
 * build instead of silently letting the first event of that id win.
 */
function build_event_by_id(
  events: readonly TradeFairEvent[],
): ReadonlyMap<string, TradeFairEvent> {
  const by_id = new Map<string, TradeFairEvent>();

  for (const event of events) {
    if (by_id.has(event.id)) {
      throw new Error(`Duplicate event id "${event.id}"`);
    }

    by_id.set(event.id, event);
  }

  return by_id;
}

const EVENT_BY_ID = build_event_by_id(EVENTS);

/** Event behind a `/markets/<id>` route — `undefined` for an id we do not publish */
export function get_event_by_id(
  id: string,
  events: readonly TradeFairEvent[] = EVENTS,
): TradeFairEvent | undefined {
  const by_id = events === EVENTS ? EVENT_BY_ID : build_event_by_id(events);

  return by_id.get(id);
}

/**
 * Canonical path of the events listing — it lives here because `event-schema.ts`
 * imports this module, so reusing its private copy would close an import cycle.
 */
export const MARKETS_PATH = "/markets";

/** Own page of a single event, e.g. "/markets/ebc-2026-barcelona" */
export function get_event_path(event: TradeFairEvent): string {
  return `${MARKETS_PATH}/${event.id}`;
}

const EN_DASH = "–";

// en-US, not en-GB: ICU 72+ renders September as "Sept" for en-GB, which overflows the date block
const MONTH_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});

interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

function parse_iso_parts(iso: string): CalendarDate {
  const [year, month, day] = iso.split("-").map(Number);
  return { year, month, day };
}

/**
 * Local `Date` at midnight of the given `YYYY-MM-DD`.
 * Keeps the build-time day and the first client render identical.
 */
export function parse_iso_day(iso: string): Date {
  const { year, month, day } = parse_iso_parts(iso);
  return new Date(year, month - 1, day);
}

/**
 * Local calendar day as `YYYY-MM-DD`.
 * Comparing these strings avoids the UTC-midnight off-by-one of `new Date(iso)`.
 */
export function to_iso_day(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function to_offset_minutes(offset: UtcOffset): number {
  const [hours, minutes] = offset.slice(1).split(":").map(Number);
  const magnitude = hours * 60 + minutes;

  return offset.startsWith("-") ? -magnitude : magnitude;
}

/**
 * Zone the event's calendar days are counted in, `undefined` for events we never pinned
 * to one. The schedule carries the offset already, so no event states it twice.
 */
function get_event_utc_offset(event: TradeFairEvent): UtcOffset | undefined {
  return event.schedule?.utcOffset ?? event.utcOffset;
}

/**
 * Calendar day `now` falls on for this event. An event's day opens and closes in its own
 * zone, so the listing (built once, then the visitor's clock) and the server-rendered
 * detail page answer alike instead of drifting by the renderer's offset.
 */
function get_event_day(event: TradeFairEvent, now: Date): string {
  const offset = get_event_utc_offset(event);

  if (!offset) {
    return to_iso_day(now);
  }

  return new Date(now.getTime() + to_offset_minutes(offset) * 60_000)
    .toISOString()
    .slice(0, 10);
}

/**
 * Closing moment has passed. `now` is midnight on the prerendered and on the first
 * client render alike, so the hour precision can only change the answer after mount.
 */
function has_ended(event: TradeFairEvent, now: Date): boolean {
  if (!event.schedule) {
    return false;
  }

  return now.getTime() >= new Date(get_event_end_datetime(event)).getTime();
}

/**
 * Opening moment has passed. Same midnight invariant as `has_ended()`:
 * the start day begins as `upcoming` on the server and on the first client render alike.
 */
function has_started(event: TradeFairEvent, now: Date): boolean {
  if (!event.schedule) {
    return true;
  }

  return now.getTime() >= new Date(get_event_start_datetime(event)).getTime();
}

/**
 * Whole calendar days of the event's own zone are compared; an event with a `schedule`
 * also opens at its start time and ends at its closing time, so neither 03:00 nor
 * 23:30 on the day of the event reads as happening now.
 */
export function get_event_status(
  event: TradeFairEvent,
  now: Date,
): EventStatus {
  const today = get_event_day(event, now);

  if (today < event.startDate) {
    return "upcoming";
  }

  if (today > event.endDate) {
    return "past";
  }

  if (today === event.startDate && !has_started(event, now)) {
    return "upcoming";
  }

  if (today === event.endDate && has_ended(event, now)) {
    return "past";
  }

  return "ongoing";
}

/** Events split by status — upcoming soonest first, past most recent first */
export function group_events_by_status(
  now: Date,
  events: TradeFairEvent[] = EVENTS,
): Record<EventStatus, TradeFairEvent[]> {
  const groups: Record<EventStatus, TradeFairEvent[]> = {
    ongoing: [],
    upcoming: [],
    past: [],
  };

  for (const event of events) {
    groups[get_event_status(event, now)].push(event);
  }

  groups.ongoing.sort((a, b) => a.endDate.localeCompare(b.endDate));
  groups.upcoming.sort((a, b) => a.startDate.localeCompare(b.startDate));
  groups.past.sort((a, b) => b.endDate.localeCompare(a.endDate));

  return groups;
}

/**
 * Events worth promoting above the fold — the ones running right now first,
 * then the closest upcoming ones, at most `limit` of them.
 * Empty when nothing is scheduled.
 */
export function get_promoted_events(
  now: Date,
  limit = 2,
  events: TradeFairEvent[] = EVENTS,
): TradeFairEvent[] {
  const groups = group_events_by_status(now, events);

  return [...groups.ongoing, ...groups.upcoming].slice(0, limit);
}

/** Card copy: what it costs, then whether anyone has to sign up */
export function format_admission(admission: EventAdmission): string {
  const price =
    Number(admission.price) === 0
      ? "Free entry"
      : `${admission.price} ${admission.priceCurrency}`;
  const registration = admission.requiresRegistration
    ? "registration required"
    : "no registration";

  return `${price} · ${registration}`;
}

/** Postal line shown under the venue name — `undefined` until we know the street */
export function format_venue_address(
  event: TradeFairEvent,
): string | undefined {
  const venue = event.venue;

  if (!venue?.streetAddress) {
    return undefined;
  }

  const locality = venue.postalCode
    ? `${venue.postalCode} ${event.city}`
    : event.city;

  return `${venue.streetAddress}, ${locality}`;
}

/** Maps URLs API — a `/maps/place/` link carries viewport and layer state that Google may retire */
const MAPS_SEARCH_URL = "https://www.google.com/maps/search/?api=1&query=";

/**
 * Directions to the venue, searched by postal address rather than by name —
 * a hotel of the same name stands next door and wins the name search.
 */
export function get_venue_map_url(event: TradeFairEvent): string | undefined {
  const address = format_venue_address(event);

  if (!address) {
    return undefined;
  }

  return `${MAPS_SEARCH_URL}${encodeURIComponent(address)}`;
}

/** `datetime` attribute value — full local datetime with offset when the event has clock times */
export function get_event_start_datetime(event: TradeFairEvent): string {
  if (!event.schedule) {
    return event.startDate;
  }

  const { startTime, utcOffset } = event.schedule;

  return `${event.startDate}T${startTime}:00${utcOffset}`;
}

/** Counterpart of `get_event_start_datetime()` for the closing moment */
export function get_event_end_datetime(event: TradeFairEvent): string {
  if (!event.schedule) {
    return event.endDate;
  }

  const { endTime, utcOffset } = event.schedule;

  return `${event.endDate}T${endTime}:00${utcOffset}`;
}

/** Display strings derived from the ISO dates — no hand-written duplicates */
export function format_event_date(event: TradeFairEvent): EventDateParts {
  const start = parse_iso_parts(event.startDate);
  const end = parse_iso_parts(event.endDate);
  const start_month = MONTH_FORMAT.format(
    new Date(`${event.startDate}T00:00:00Z`),
  );
  const end_month = MONTH_FORMAT.format(new Date(`${event.endDate}T00:00:00Z`));

  const same_year = start.year === end.year;
  const same_month = same_year && start.month === end.month;

  return {
    start_day: String(start.day),
    end_day: String(end.day),
    month: same_month ? start_month : `${start_month}${EN_DASH}${end_month}`,
    year: same_year ? String(start.year) : `${start.year}${EN_DASH}${end.year}`,
  };
}
