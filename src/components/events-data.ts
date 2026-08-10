export interface TradeFairEvent {
  /** Stable key + anchor id */
  id: string;
  name: string;
  /** Compact label for tight layouts, e.g. "EBC 2026" — falls back to `name` */
  shortName?: string;
  /** Short edition marker, e.g. "EBC12" */
  edition?: string;
  city: string;
  country: string;
  /** ISO 3166-1 alpha-2 code, used by the JSON-LD Event schema */
  countryCode: string;
  /** First day, ISO `YYYY-MM-DD` */
  startDate: string;
  /** Last day, ISO `YYYY-MM-DD` — equals `startDate` for one-day events */
  endDate: string;
  url: string;
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
 * Trade fairs and conferences BlockchainWares attends.
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
];

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

/** An event runs until the end of its `endDate`, so whole calendar days are compared */
export function get_event_status(
  event: TradeFairEvent,
  now: Date,
): EventStatus {
  const today = to_iso_day(now);

  if (today < event.startDate) {
    return "upcoming";
  }

  if (today > event.endDate) {
    return "past";
  }

  return "ongoing";
}

/** Events split by status — upcoming soonest first, past most recent first */
export function group_events_by_status(
  now: Date,
): Record<EventStatus, TradeFairEvent[]> {
  const groups: Record<EventStatus, TradeFairEvent[]> = {
    ongoing: [],
    upcoming: [],
    past: [],
  };

  for (const event of EVENTS) {
    groups[get_event_status(event, now)].push(event);
  }

  groups.ongoing.sort((a, b) => a.endDate.localeCompare(b.endDate));
  groups.upcoming.sort((a, b) => a.startDate.localeCompare(b.startDate));
  groups.past.sort((a, b) => b.endDate.localeCompare(a.endDate));

  return groups;
}

/**
 * Event to promote — one that runs right now, otherwise the closest upcoming one.
 * Returns `undefined` when nothing is scheduled.
 */
export function get_next_event(now: Date): TradeFairEvent | undefined {
  const groups = group_events_by_status(now);

  return groups.ongoing.at(0) ?? groups.upcoming.at(0);
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
