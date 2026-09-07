import {
  format_event_date,
  get_promoted_events,
  type TradeFairEvent,
} from "./events-data";

/**
 * Meta description of the events listing, derived from the events the page renders
 * anyway. Events live in the API now, so a hand-written tag naming a fair would start
 * lying the day that fair ends — and a deploy is exactly what the move to the API
 * removed from the loop.
 */

/** Cap, not a trim: every variant is written to fit, the last resort is the fallback */
const MAX_LENGTH = 160;

/** Same count the banner promotes, so the tag names what the page opens with */
const PROMOTED_LIMIT = 2;

/**
 * Nothing to name: an empty calendar, or an events API that never answered on a cold
 * cache. The page still states what it is about instead of emitting an empty tag.
 */
const FALLBACK =
  "Conferences we attend and workshops we host: meet the BlockchainWares team in person and talk blockchain, EDA, distributed systems and database engineering.";

/** Dropped as soon as naming the events fills the tag on its own */
const TAIL = "Blockchain, EDA and database engineering.";

const EN_DASH = "–";

/** "Sep 19", "Sep 16–17", "Sep 30–Oct 1" — `format_event_date()` owns the month names */
function format_days(event: TradeFairEvent): string {
  const { start_day, end_day, month } = format_event_date(event);

  if (event.startDate === event.endDate) {
    return `${month} ${start_day}`;
  }

  const [start_month, end_month] = month.split(EN_DASH);

  return end_month === undefined
    ? `${month} ${start_day}${EN_DASH}${end_day}`
    : `${start_month} ${start_day}${EN_DASH}${end_month} ${end_day}`;
}

/** Year only when it is not the current one — "EBC 2026" in 2026 would state it twice */
function format_when(event: TradeFairEvent, now: Date): string {
  const days = format_days(event);
  const year = event.startDate.slice(0, 4);

  return year === String(now.getFullYear()) ? days : `${days}, ${year}`;
}

/**
 * One event named the same way whether we exhibit at it or host it — "our workshop in
 * Gdansk" next to a name that already ends in the city reads twice as long and worse.
 */
function format_entry(
  event: TradeFairEvent,
  now: Date,
  compact: boolean,
): string {
  const label = compact ? (event.shortName ?? event.name) : event.name;

  return `${label} (${event.city}, ${format_when(event, now)})`;
}

function build_sentence(
  events: readonly TradeFairEvent[],
  now: Date,
  compact: boolean,
): string {
  const entries = events.map((event) => format_entry(event, now, compact));

  return `Meet BlockchainWares at ${entries.join(" and ")}.`;
}

/**
 * Ordered by what we would rather publish: both events over one, full names over the
 * compact ones, either over the generic tail. The first one within the cap wins.
 */
function build_variants(
  promoted: readonly TradeFairEvent[],
  now: Date,
): string[] {
  const subsets =
    promoted.length > 1 ? [promoted, promoted.slice(0, 1)] : [promoted];

  return subsets.flatMap((subset) =>
    [false, true].flatMap((compact) => {
      const sentence = build_sentence(subset, now, compact);

      return [`${sentence} ${TAIL}`, sentence];
    }),
  );
}

/** Description of `/markets`: the events running or coming next, never an empty string */
export function build_markets_description(
  events: readonly TradeFairEvent[],
  now: Date,
): string {
  const promoted = get_promoted_events(now, PROMOTED_LIMIT, [...events]);

  if (promoted.length === 0) {
    return FALLBACK;
  }

  return (
    build_variants(promoted, now).find(
      (variant) => variant.length <= MAX_LENGTH,
    ) ?? FALLBACK
  );
}
