import {
  format_venue_address,
  get_event_name,
  get_venue_map_url,
  type ClockTime,
  type EventAdmission,
  type EventDateParts,
  type EventStatus,
  type TradeFairEvent,
} from "./events-data";

const EN_DASH = "–";

/**
 * Wording every view falls back to while an event is still a draft: the card states it
 * in one line, the event page in full. Nothing is silently left blank instead.
 */
export const DETAILS_PENDING_SHORT = "Details are still being arranged.";
export const DETAILS_PENDING_LONG =
  "Details are still being arranged. Dates, venue and the full description land here as soon as they are confirmed.";

/** Place of an event from whichever half we know — `undefined` while we know neither */
export function format_event_location(
  event: TradeFairEvent,
): string | undefined {
  const place = [event.city, event.country].filter(
    (part): part is string => part !== undefined && part.trim() !== "",
  );

  return place.length === 0 ? undefined : place.join(", ");
}

/** Day or day range as the card, the banner and the detail page all write it: "19", "16–17" */
export function format_event_days(date: EventDateParts): string {
  return date.is_range
    ? `${date.start_day}${EN_DASH}${date.end_day}`
    : date.start_day;
}

export interface StatusTheme {
  /** Badge copy stating our presence at the event */
  label: string;
  card: string;
  badge: string;
  dot: string;
  date_block: string;
  /** Text tone shared by every accented label — kept at full opacity for WCAG AA */
  accent: string;
  topic: string;
  link: string;
  /** Heading link: rests on the inherited heading colour, accents on interaction */
  heading_link: string;
}

/**
 * Status is carried by hue, not by transparency — green reads as live, cyan as
 * brand-default, the deeper blue as archived and amber as still being arranged.
 */
export const STATUS_THEME: Record<EventStatus, StatusTheme> = {
  ongoing: {
    label: "Happening now",
    card: "border-success/40",
    badge: "border-success/40 bg-success/10 text-success",
    dot: "bg-success motion-safe:animate-pulse",
    date_block: "border-success/40 bg-success/10",
    accent: "text-success",
    topic: "border-success/25 bg-success/5 text-success",
    link: "text-success hover:text-success/80 focus-visible:ring-success",
    heading_link: "hover:text-success focus-visible:text-success",
  },
  upcoming: {
    label: "We will be there",
    card: "border-white/5",
    badge: "border-secondary/30 bg-secondary/10 text-secondary",
    dot: "bg-secondary",
    date_block: "border-secondary/30 bg-secondary/10",
    accent: "text-secondary",
    topic: "border-secondary/20 bg-secondary/5 text-secondary",
    link: "text-secondary hover:text-secondary/80 focus-visible:ring-secondary",
    heading_link: "hover:text-secondary focus-visible:text-secondary",
  },
  past: {
    label: "We were there",
    card: "border-white/5",
    badge: "border-info/30 bg-info/10 text-info",
    dot: "bg-info",
    date_block: "border-info/30 bg-info/10",
    accent: "text-info",
    topic: "border-info/20 bg-info/5 text-info",
    // Brightens instead of fading — info/80 would drop to 3.7:1
    link: "text-info hover:text-info-content focus-visible:ring-info",
    heading_link: "hover:text-info focus-visible:text-info",
  },
  undated: {
    label: "Date to be announced",
    card: "border-white/5",
    badge: "border-warning/30 bg-warning/10 text-warning",
    dot: "bg-warning",
    date_block: "border-warning/30 bg-warning/10",
    accent: "text-warning",
    topic: "border-warning/20 bg-warning/5 text-warning",
    link: "text-warning hover:text-warning/80 focus-visible:ring-warning",
    heading_link: "hover:text-warning focus-visible:text-warning",
  },
};

/**
 * Workshops are ours, so the badge states hosting instead of attendance — except with no
 * date, where the missing day is the only thing worth saying about the event yet.
 */
export const WORKSHOP_LABEL: Record<EventStatus, string> = {
  ongoing: "Happening now",
  upcoming: "We are hosting",
  past: "We hosted",
  undated: "Date to be announced",
};

/** Shape of the status badge — colour comes from `StatusTheme.badge`, the dot from `.dot` */
export const STATUS_BADGE_CLASS =
  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider";

/** Shape of a topic pill — colour comes from `StatusTheme.topic` */
export const TOPIC_PILL_CLASS =
  "rounded-full border px-3 py-1 text-xs font-medium";

/** Admission pill: a topic pill carrying a fact, so it sits one weight heavier */
export const ADMISSION_PILL_CLASS =
  "rounded-full border px-3 py-1 text-xs font-semibold";

/** Badge copy for the event: hosting for our own workshops, attendance otherwise */
export function get_status_badge_label(
  event: TradeFairEvent,
  status: EventStatus,
): string {
  return event.kind === "workshop"
    ? WORKSHOP_LABEL[status]
    : STATUS_THEME[status].label;
}

export interface EventLink {
  href: string;
  label: string;
  sr_label: string;
}

/** Announced by screen readers on every link that leaves the site */
export const SR_NEW_TAB = "— opens in a new tab";

export interface VenueName {
  /** What to print: the venue's name, or the address of its page when it has none */
  label: string;
  /** Page of the building — absent for a venue we can name but not link */
  href?: string;
}

/**
 * How the venue announces itself on a card and on the event page. A building known only
 * by its page says so with the address itself, exactly as an unnamed organizer does.
 * `undefined` while we know neither the name nor the page — the room and the postal
 * address are lines of their own and neither one names a building.
 */
export function get_venue_name(event: TradeFairEvent): VenueName | undefined {
  const { name, url } = event.venue ?? {};
  const label = name ?? url;

  if (label === undefined) {
    return undefined;
  }

  return url === undefined ? { label } : { label, href: url };
}

/** Anything at all about the building — the card and the panel key their block on it */
export function has_venue_details(event: TradeFairEvent): boolean {
  return (
    get_venue_name(event) !== undefined ||
    event.venue?.room !== undefined ||
    format_venue_address(event) !== undefined
  );
}

/**
 * Footnote under the venue, e.g. "entrance from the courtyard" — the card and the panel
 * render it only alongside the venue block it annotates, never on its own.
 * Blank or whitespace-only text says nothing, so it is dropped like every other field here.
 */
export function get_venue_note(event: TradeFairEvent): string | undefined {
  const note = event.venue?.note?.trim();

  return note === "" ? undefined : note;
}

/** Shape of the venue footnote — muted small print, matching `VenuePlace`'s own detail line */
export const VENUE_NOTE_CLASS =
  "block text-xs font-normal text-base-content/70";

/**
 * Own website when the event has one, otherwise directions to the venue we booked.
 * Directions are dropped once the event is over — nobody needs to get there any more.
 */
export function get_event_link(
  event: TradeFairEvent,
  status: EventStatus,
): EventLink | null {
  if (event.url) {
    return {
      href: event.url,
      label: "Event website",
      sr_label: `${get_event_name(event)} ${SR_NEW_TAB}`,
    };
  }

  const map_url = get_venue_map_url(event);

  if (map_url && status !== "past") {
    // The address behind the link names a city, so the fallback is never empty
    const place =
      event.venue?.name ??
      format_event_location(event) ??
      get_event_name(event);

    return {
      href: map_url,
      label: "Venue & directions",
      sr_label: `${place} on the map ${SR_NEW_TAB}`,
    };
  }

  return null;
}

/** Separator between the two halves of the admission copy — the pill and the panel share it */
export const ADMISSION_SEPARATOR = " · ";

/**
 * Card copy: what it costs, then whether anyone has to sign up. Either half may be
 * missing, and so may both — then there is nothing to put on the pill.
 * A price with no currency states no sum, so it is dropped rather than shown bare;
 * a free entry needs no currency to be free.
 */
export function format_admission(
  admission: EventAdmission | undefined,
): string | undefined {
  if (admission === undefined) {
    return undefined;
  }

  const parts = [
    format_price(admission),
    format_registration(admission),
  ].filter((part): part is string => part !== undefined);

  return parts.length === 0 ? undefined : parts.join(ADMISSION_SEPARATOR);
}

function format_price(admission: EventAdmission): string | undefined {
  if (admission.price === undefined) {
    return undefined;
  }

  if (Number(admission.price) === 0) {
    return "Free entry";
  }

  return admission.priceCurrency === undefined
    ? undefined
    : `${admission.price} ${admission.priceCurrency}`;
}

function format_registration(admission: EventAdmission): string | undefined {
  if (admission.requiresRegistration === undefined) {
    return undefined;
  }

  return admission.requiresRegistration
    ? "registration required"
    : "no registration";
}

/** Wording of a day known at one end only — the other hour is not announced yet */
const HOURS_FROM = "from";
const HOURS_UNTIL = "until";

export interface EventHoursParts {
  /** Introduces a half-known day, e.g. "from"; absent once both hours are known */
  prefix?: string;
  startTime?: ClockTime;
  endTime?: ClockTime;
  /** Zone the hours are stated in, e.g. "CEST" */
  timeZoneLabel?: string;
}

/**
 * Clock times the event states, `null` when it states none — a zone label with no hour
 * to attach it to says nothing, so it never reaches a page on its own.
 */
export function get_event_hours(event: TradeFairEvent): EventHoursParts | null {
  const { startTime, endTime, timeZoneLabel } = event.schedule ?? {};

  if (startTime === undefined && endTime === undefined) {
    return null;
  }

  return {
    prefix: get_hours_prefix(startTime, endTime),
    startTime,
    endTime,
    timeZoneLabel,
  };
}

function get_hours_prefix(
  startTime: ClockTime | undefined,
  endTime: ClockTime | undefined,
): string | undefined {
  if (startTime === undefined) return HOURS_UNTIL;
  if (endTime === undefined) return HOURS_FROM;

  return undefined;
}

/** One-line form of `get_event_hours()` for the places that write text, not markup */
export function format_event_hours(event: TradeFairEvent): string | undefined {
  const hours = get_event_hours(event);

  if (hours === null) {
    return undefined;
  }

  const range = [hours.startTime, hours.endTime]
    .filter((time): time is ClockTime => time !== undefined)
    .join(EN_DASH);

  return [hours.prefix, range, hours.timeZoneLabel]
    .filter((part): part is string => part !== undefined)
    .join(" ");
}
