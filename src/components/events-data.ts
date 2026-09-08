/**
 * Pure helpers over the event model — no data and no declarations of its own.
 * The shapes live in `./event-types`, which is the contract the backend mirrors;
 * they are re-exported here so every existing `from "./events-data"` import still resolves.
 */
import type {
  EventDateParts,
  EventDays,
  EventStatus,
  TradeFairEvent,
  UtcOffset,
} from "./event-types";

export type {
  ClockTime,
  EventAdmission,
  EventDateParts,
  EventDays,
  EventFact,
  EventKind,
  EventLink,
  EventOrganizer,
  EventSchedule,
  EventStatus,
  EventVenue,
  IconKey,
  TradeFairEvent,
  UtcOffset,
} from "./event-types";

/**
 * A duplicated id would silently let the first record of that slug win, so the whole
 * lookup refuses it instead — uniqueness itself is enforced when events are written.
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

/** Event behind a `/markets/<id>` route — `undefined` for an id we do not publish */
export function get_event_by_id(
  id: string,
  events: readonly TradeFairEvent[],
): TradeFairEvent | undefined {
  return build_event_by_id(events).get(id);
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

/** Stands in for a draft that has no name yet — one string, so nothing invents its own */
export const UNTITLED_EVENT_NAME = "Untitled event";

/** Name to render — never empty, so a nameless draft is still listed and linkable */
export function get_event_name(event: TradeFairEvent): string {
  return event.name ?? UNTITLED_EVENT_NAME;
}

/**
 * `null` while the event has no day at all. A draft that states only one of the two
 * dates reads as a one-day event rather than dropping off the calendar entirely.
 */
export function get_event_days(event: TradeFairEvent): EventDays | null {
  const start = event.startDate ?? event.endDate;
  const end = event.endDate ?? event.startDate;

  return start !== undefined && end !== undefined ? { start, end } : null;
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
  const closing = get_event_end_datetime(event);

  if (event.schedule?.endTime === undefined || closing === undefined) {
    return false;
  }

  return now.getTime() >= new Date(closing).getTime();
}

/**
 * Opening moment has passed. Same midnight invariant as `has_ended()`:
 * the start day begins as `upcoming` on the server and on the first client render alike.
 */
function has_started(event: TradeFairEvent, now: Date): boolean {
  const opening = get_event_start_datetime(event);

  if (event.schedule?.startTime === undefined || opening === undefined) {
    return true;
  }

  return now.getTime() >= new Date(opening).getTime();
}

/**
 * Whole calendar days of the event's own zone are compared; an event with a `schedule`
 * also opens at its start time and ends at its closing time, so neither 03:00 nor
 * 23:30 on the day of the event reads as happening now.
 *
 * A dateless draft answers `"undated"` without reading the clock at all — the one status
 * that cannot flip between the server render and the hydrated one.
 */
export function get_event_status(
  event: TradeFairEvent,
  now: Date,
): EventStatus {
  const days = get_event_days(event);

  if (days === null) {
    return "undated";
  }

  const today = get_event_day(event, now);

  if (today < days.start) {
    return "upcoming";
  }

  if (today > days.end) {
    return "past";
  }

  if (today === days.start && !has_started(event, now)) {
    return "upcoming";
  }

  if (today === days.end && has_ended(event, now)) {
    return "past";
  }

  return "ongoing";
}

/** Sort key of a dated group — everything in one has days, `get_event_status()` saw to it */
function day_key(event: TradeFairEvent, edge: keyof EventDays): string {
  return get_event_days(event)?.[edge] ?? "";
}

/**
 * Order for events with no date to sort by. Name before id, and the raw name rather than
 * `get_event_name()` — the placeholder would collapse every nameless draft onto one key.
 */
function undated_key(event: TradeFairEvent): string {
  return event.name ?? event.id;
}

/**
 * Events split by status — upcoming soonest first, past most recent first, undated
 * drafts last of all: they belong after the archive because they are not on the calendar
 * yet, and they sort by name so the listing does not reshuffle between renders.
 */
export function group_events_by_status(
  now: Date,
  events: TradeFairEvent[],
): Record<EventStatus, TradeFairEvent[]> {
  const groups: Record<EventStatus, TradeFairEvent[]> = {
    ongoing: [],
    upcoming: [],
    past: [],
    undated: [],
  };

  for (const event of events) {
    groups[get_event_status(event, now)].push(event);
  }

  groups.ongoing.sort((a, b) =>
    day_key(a, "end").localeCompare(day_key(b, "end")),
  );
  groups.upcoming.sort((a, b) =>
    day_key(a, "start").localeCompare(day_key(b, "start")),
  );
  groups.past.sort((a, b) =>
    day_key(b, "end").localeCompare(day_key(a, "end")),
  );
  groups.undated.sort((a, b) => undated_key(a).localeCompare(undated_key(b)));

  return groups;
}

/**
 * Events worth promoting above the fold — the ones running right now first,
 * then the closest upcoming ones, at most `limit` of them.
 * Empty when nothing is scheduled; an undated draft is never promoted, because the
 * banner answers "where can you meet us next" and a draft has no answer to it.
 */
export function get_promoted_events(
  now: Date,
  limit = 2,
  events: TradeFairEvent[],
): TradeFairEvent[] {
  const groups = group_events_by_status(now, events);

  return [...groups.ongoing, ...groups.upcoming].slice(0, limit);
}

/** Postal line shown under the venue name — `undefined` until we know the street */
export function format_venue_address(
  event: TradeFairEvent,
): string | undefined {
  const venue = event.venue;

  if (!venue?.streetAddress) {
    return undefined;
  }

  const locality = [venue.postalCode, event.city]
    .filter((part): part is string => part !== undefined)
    .join(" ");

  return locality === ""
    ? venue.streetAddress
    : `${venue.streetAddress}, ${locality}`;
}

/** Maps URLs API — a `/maps/place/` link carries viewport and layer state that Google may retire */
const MAPS_SEARCH_URL = "https://www.google.com/maps/search/?api=1&query=";

/**
 * Directions to the venue, searched by postal address rather than by name —
 * a hotel of the same name stands next door and wins the name search.
 *
 * Both halves of the address are needed: a street with no city is searched worldwide
 * and lands in the wrong town, and a link pointing elsewhere is worse than no link.
 * The room stays out of the query for the same reason — Maps searches streets, not floors.
 */
export function get_venue_map_url(event: TradeFairEvent): string | undefined {
  const address = format_venue_address(event);

  if (!address || !event.city) {
    return undefined;
  }

  return `${MAPS_SEARCH_URL}${encodeURIComponent(address)}`;
}

/**
 * `datetime` attribute value — full local datetime with offset when the event has clock
 * times, `undefined` while it has no date at all; a `<time>` without one states nothing.
 */
export function get_event_start_datetime(
  event: TradeFairEvent,
): string | undefined {
  return build_datetime(event, get_event_days(event)?.start, "startTime");
}

/** Counterpart of `get_event_start_datetime()` for the closing moment */
export function get_event_end_datetime(
  event: TradeFairEvent,
): string | undefined {
  return build_datetime(event, get_event_days(event)?.end, "endTime");
}

/**
 * The day alone until that end of the day is on the clock. The zone comes from
 * `get_event_utc_offset()`, so a schedule that states an hour but no offset is still
 * read in the event's own zone rather than drifting away from its calendar days;
 * with no offset anywhere the time floats in the renderer's zone, exactly as the days do.
 */
function build_datetime(
  event: TradeFairEvent,
  day: string | undefined,
  edge: "startTime" | "endTime",
): string | undefined {
  const time = event.schedule?.[edge];

  if (day === undefined) {
    return undefined;
  }

  return time === undefined
    ? day
    : `${day}T${time}:00${get_event_utc_offset(event) ?? ""}`;
}

/**
 * Display strings derived from the ISO dates — no hand-written duplicates.
 * `null` for a draft with no date: there is nothing to put in a date block, and the same
 * event reports `"undated"` from `get_event_status()`.
 */
export function format_event_date(
  event: TradeFairEvent,
): EventDateParts | null {
  const days = get_event_days(event);

  if (days === null) {
    return null;
  }

  const start = parse_iso_parts(days.start);
  const end = parse_iso_parts(days.end);
  const start_month = MONTH_FORMAT.format(new Date(`${days.start}T00:00:00Z`));
  const end_month = MONTH_FORMAT.format(new Date(`${days.end}T00:00:00Z`));

  const same_year = start.year === end.year;
  const same_month = same_year && start.month === end.month;

  return {
    start_day: String(start.day),
    end_day: String(end.day),
    month: same_month ? start_month : `${start_month}${EN_DASH}${end_month}`,
    year: same_year ? String(start.year) : `${start.year}${EN_DASH}${end.year}`,
    is_range: days.start !== days.end,
  };
}
