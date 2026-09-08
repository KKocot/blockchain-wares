/**
 * Shape of an event, shared verbatim with the `blockchain-wares` module in the
 * `backend-api` repo — that module stores and validates exactly these fields.
 * Any change here is a two-repo change: a field added on one side only is dropped by
 * the other side's parser, which reads as silent data loss to whoever typed it in.
 */

/** Conferences we attend, workshops we host ourselves — drives the wording of the labels */
export type EventKind = "conference" | "workshop";

/** `HH:MM` in 24h — the template shape makes a typo a compile error, not a bad `dateTime` */
export type ClockTime = `${number}:${number}`;

/** Signed UTC offset, e.g. "+02:00" */
export type UtcOffset = `${"+" | "-"}${number}:${number}`;

/**
 * Closed preset of fact icons. A key is data, not a component name: the key → icon
 * mapping lives in the renderer, so changing icon library never touches stored events
 * nor the backend validator. Keys are append-only — renaming one blanks live records.
 */
export const ICON_KEYS = [
  "calendar",
  "clock",
  "location",
  "building",
  "ticket",
  "speaker",
  "attendees",
  "catering",
  "parking",
  "wifi",
  "info",
  "external-link",
] as const;

export type IconKey = (typeof ICON_KEYS)[number];

/** One line of the fact strip — an icon from the preset and whatever it states */
export interface EventFact {
  icon: IconKey;
  label: string;
}

/** Named link, e.g. "Agenda" → the agenda page */
export interface EventLink {
  label: string;
  url: string;
}

/**
 * Count ceilings for the three list fields, mirrored by the backend validator.
 * They are layout limits, not storage ones: the badge row, the fact strip and the link
 * list are designed for this many and start wrapping into noise past it.
 */
export const MAX_EVENT_BADGES = 4;
export const MAX_EVENT_FACTS = 6;
export const MAX_EVENT_LINKS = 6;

/**
 * Limit UI, nie kontraktu — `TradeFairEvent.topics` nie ma pulapu ponizej. Tyle chipsow
 * miesci sie na karcie/stronie bez zawijania w trzeci wiersz (decyzja potwierdzona przez
 * wlasciciela, patrz design brief §5.4).
 */
export const MAX_EVENT_TOPICS = 8;

/**
 * Clock times of a single-day event, kept apart from the date-only `startDate`/`endDate`.
 * Every part stands on its own: an event may be announced with an opening hour long
 * before anyone knows when it closes.
 */
export interface EventSchedule {
  /** Local start */
  startTime?: ClockTime;
  /** Local end */
  endTime?: ClockTime;
  /** UTC offset of both times — machine-readable half, goes into `dateTime` and JSON-LD */
  utcOffset?: UtcOffset;
  /** Zone name shown to readers next to the times, e.g. "CEST" */
  timeZoneLabel?: string;
}

export interface EventVenue {
  name?: string;
  /**
   * Room or floor inside the building, e.g. "Meeting Room 0.5+0.6, ground floor".
   * Presentational only — it never reaches the JSON-LD `Place`, which describes the
   * building, and it never reaches the map query, which searches the street.
   */
  room?: string;
  /**
   * Footnote under the location, e.g. "entrance from the courtyard".
   * Presentational only, and narrower than `room`, which names a place in the building:
   * it stays out of the JSON-LD `Place` and out of the map query (`get_venue_map_url()`),
   * so a hint meant for a reader can never steer the directions link.
   */
  note?: string;
  /** Street and number as written locally, e.g. "Carrer de Cristóbal de Moura, 49" */
  streetAddress?: string;
  postalCode?: string;
  /** Page of the building itself — the event's own page is `TradeFairEvent.url` */
  url?: string;
}

/** What it takes to get in — drives the card pill and the JSON-LD `Offer` */
export interface EventAdmission {
  /** Decimal string, schema.org style; "0" reads as free entry */
  price?: string;
  /** ISO 4217 code, e.g. "EUR" */
  priceCurrency?: string;
  requiresRegistration?: boolean;
  /** First day the offer holds, ISO `YYYY-MM-DD` — the day we announced it */
  validFrom?: string;
}

/** A name we can print, an address we can link, or either one on its own */
export interface EventOrganizer {
  name?: string;
  url?: string;
}

/**
 * Nothing but `id` is required: a draft is saved the moment it has anything at all and
 * filled in later. `id` stays required because it drives `/markets/<id>` and
 * `get_event_by_id()` — the events module derives one from the name when a write omits it.
 */
export interface TradeFairEvent {
  /** Stable key + anchor id */
  id: string;
  /** Absent on a draft — read it through `get_event_name()`, never raw */
  name?: string;
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
  city?: string;
  country?: string;
  /** ISO 3166-1 alpha-2 code, used by the JSON-LD Event schema */
  countryCode?: string;
  /** First day, ISO `YYYY-MM-DD` */
  startDate?: string;
  /** Last day, ISO `YYYY-MM-DD` — equals `startDate` for one-day events */
  endDate?: string;
  schedule?: EventSchedule;
  venue?: EventVenue;
  /** Ticketing terms — absent for events we only attend, they are not ours to describe */
  admission?: EventAdmission;
  /** Event website — absent for events that have no public page of their own */
  url?: string;
  /**
   * Site-relative or absolute image for the JSON-LD Event schema. Optional because the
   * parser drops a shape it cannot resolve instead of the whole record — schema.org calls
   * the field recommended, and an event with no picture still has to be reachable.
   */
  image?: string;
  organizer?: EventOrganizer;
  description?: string;
  topics?: string[];
  /**
   * Editorial labels above the title, at most `MAX_EVENT_BADGES`. They sit next to the
   * status but never replace it: `get_event_status()` keeps deriving that from the dates.
   */
  badges?: string[];
  /** Fact strip, at most `MAX_EVENT_FACTS` entries */
  facts?: EventFact[];
  /**
   * Named links, at most `MAX_EVENT_LINKS`. Separate from `url`, `venue.url` and
   * `organizer.url`, each of which names one specific page and stays where it is.
   */
  links?: EventLink[];
}

/*
 * Derived below this line — computed from the fields above, never stored or sent.
 */

/** `undated` is a draft with no day yet — it sits outside the timeline, not on its edges */
export type EventStatus = "ongoing" | "upcoming" | "past" | "undated";

export interface EventDateParts {
  /** Day of the month the event starts on, e.g. "16" */
  start_day: string;
  /** Day of the month the event ends on, e.g. "17" */
  end_day: string;
  /** Short month or month range, e.g. "Sep" or "Sep–Oct" */
  month: string;
  /** Year or year range, e.g. "2026" or "2026–2027" */
  year: string;
  /** Spans more than one day — true source for the `start–end` dash */
  is_range: boolean;
}

/** Days an event actually runs on, both ends resolved */
export interface EventDays {
  /** ISO `YYYY-MM-DD` */
  start: string;
  /** ISO `YYYY-MM-DD` */
  end: string;
}
