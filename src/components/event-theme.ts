import {
  get_event_name,
  get_venue_map_url,
  type EventDateParts,
  type EventStatus,
  type TradeFairEvent,
} from "./events-data";

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

/**
 * Directions to the venue, but only from an address that names its city: a street and
 * number alone are searched worldwide and land in the wrong town. A map link pointing
 * somewhere else is worse than no map link.
 */
export function get_venue_directions_url(
  event: TradeFairEvent,
): string | undefined {
  return event.city ? get_venue_map_url(event) : undefined;
}

/** Day or day range as the card, the banner and the detail page all write it: "19", "16–17" */
export function format_event_days(date: EventDateParts): string {
  return date.is_range ? `${date.start_day}–${date.end_day}` : date.start_day;
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
      sr_label: `${get_event_name(event)} — opens in a new tab`,
    };
  }

  const map_url = get_venue_directions_url(event);

  if (map_url && event.venue && status !== "past") {
    return {
      href: map_url,
      label: "Venue & directions",
      sr_label: `${event.venue.name} on the map — opens in a new tab`,
    };
  }

  return null;
}
