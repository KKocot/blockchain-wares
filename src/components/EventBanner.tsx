import { Fragment, useEffect, useState, type ReactElement } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "../lib/utils";
import {
  format_event_date,
  get_event_end_datetime,
  get_event_name,
  get_event_start_datetime,
  get_event_path,
  get_event_status,
  get_promoted_events,
  MARKETS_PATH,
  parse_iso_day,
  type EventDateParts,
  type EventKind,
  type TradeFairEvent,
} from "./events-data";
import { get_event_hours, STATUS_THEME } from "./event-theme";
import { EventBadges } from "./EventBadges";
import { EventHours } from "./EventHours";

const EASE: [number, number, number, number] = [0.44, 0, 0.56, 1];

const PROMOTED_LIMIT = 2;

const MOTION_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

const STATIC_VARIANTS: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};

interface BannerAccent {
  /** Text tone kept at full opacity for WCAG AA on small text */
  text: string;
  /** Strip border; the links inside drive it, the strip itself is not clickable */
  border: string;
  /** Headline tone while its own entry link is hovered or focused */
  headline: string;
}

const UPCOMING_ACCENT: BannerAccent = {
  text: "text-secondary",
  border:
    "border-secondary/25 has-[a:hover]:border-secondary/50 has-[a:focus-visible]:border-secondary/60",
  headline:
    "group-hover/entry:text-secondary group-focus-visible/entry:text-secondary",
};

const ONGOING_ACCENT: BannerAccent = {
  text: "text-success",
  border:
    "border-success/35 has-[a:hover]:border-success/60 has-[a:focus-visible]:border-success/60",
  headline:
    "group-hover/entry:text-success group-focus-visible/entry:text-success",
};

/** Attendance for events we visit, hosting for our own workshops */
function get_banner_headline(
  label: string,
  kind: EventKind | undefined,
  is_ongoing: boolean,
): string {
  if (kind === "workshop") {
    return is_ongoing
      ? `Our ${label} is running right now`
      : `We are hosting our ${label}`;
  }

  return is_ongoing
    ? `We are at ${label} right now`
    : `We are going to ${label}`;
}

interface EventBannerProps {
  /** Events to promote from; the page fetches them, the banner never does */
  events: TradeFairEvent[];
  /** Build-time local day (`YYYY-MM-DD`), corrected to the visitor's day after mount */
  todayIso: string;
}

/**
 * Narrow announcement strip promoting the closest events we are at or heading to
 * — as many as `get_promoted_events()` returns, at most two.
 * Every entry links to its own event page, the closing call to action to the listing.
 * Renders nothing when nothing is worth promoting — an empty list included.
 */
export function EventBanner({ events, todayIso }: EventBannerProps) {
  const prefers_reduced_motion = useReducedMotion();
  const [now, set_now] = useState(() => parse_iso_day(todayIso));
  // useReducedMotion() is null on the server, so the preference may only be applied after mount
  const [is_hydrated, set_is_hydrated] = useState(false);

  useEffect(() => {
    set_now(new Date());
    set_is_hydrated(true);
  }, []);

  const promoted = get_promoted_events(now, PROMOTED_LIMIT, events);

  if (promoted.length === 0) {
    return null;
  }

  const variants =
    is_hydrated && prefers_reduced_motion ? STATIC_VARIANTS : MOTION_VARIANTS;
  const has_ongoing = promoted.some(
    (event) => get_event_status(event, now) === "ongoing",
  );
  const accent = has_ongoing ? ONGOING_ACCENT : UPCOMING_ACCENT;
  const is_single = promoted.length === 1;

  return (
    <motion.aside
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      aria-label="Where to meet us"
      className="relative px-4 py-8 md:py-12"
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-6xl flex-col gap-4",
          "rounded-[28px] px-5 py-5",
          "md:flex-row md:items-center md:justify-between md:gap-8 md:px-8",
          // One entry keeps the original pill; two need the height of a rounded card
          is_single ? "md:rounded-full md:py-4" : "md:rounded-[32px] md:py-5",
          "bg-base-200/30 backdrop-blur-sm",
          "border",
          accent.border,
          "shadow-card",
          "transition-[border-color,box-shadow] duration-200 ease-out",
          "has-[a:hover]:shadow-card-hover",
        )}
      >
        <span className="flex min-w-0 flex-col gap-4 md:flex-1 md:flex-row md:items-center md:gap-6">
          {promoted.map((event, index) => (
            <BannerEntry
              key={event.id}
              event={event}
              is_ongoing={get_event_status(event, now) === "ongoing"}
              is_single={is_single}
              is_first={index === 0}
            />
          ))}
        </span>

        {/* Mobile indent keeps the CTA aligned with the text column: icon + gap */}
        <a
          href={MARKETS_PATH}
          className={cn(
            // self-start keeps the mobile target on the text; desktop returns to the centred row
            "group flex shrink-0 items-center gap-2 self-start rounded-full md:self-auto",
            // Lifts the 44px touch target out of the flow instead of padding the strip
            "py-2 -my-2 pl-[calc(0.875rem+0.75rem)] md:pl-0",
            "text-sm font-semibold underline-offset-4 md:text-base",
            "transition-colors duration-150 hover:underline",
            accent.text,
          )}
        >
          See markets
          <ArrowRightIcon />
        </a>
      </div>
    </motion.aside>
  );
}

interface BannerEntryProps {
  event: TradeFairEvent;
  is_ongoing: boolean;
  /** Lone entry keeps the original pill: full-round strip and its larger type */
  is_single: boolean;
  /** Later entries get the divider rule before them */
  is_first: boolean;
}

/** One promoted event: dates, place and what we are doing there */
function BannerEntry({
  event,
  is_ongoing,
  is_single,
  is_first,
}: BannerEntryProps) {
  const accent = is_ongoing ? ONGOING_ACCENT : UPCOMING_ACCENT;
  // Same tokens the card and the detail page badge on — the banner has no `StatusTheme`
  // of its own, only `ongoing`/`upcoming` ever reach a promoted entry
  const badge_theme = STATUS_THEME[is_ongoing ? "ongoing" : "upcoming"];
  const date = format_event_date(event);
  // Unreachable: `get_promoted_events()` never hands over an event with no dates
  const event_label = event.shortName ?? get_event_name(event);

  if (date === null) {
    return null;
  }

  return (
    <span
      className={cn(
        "flex min-w-0 flex-1",
        !is_first &&
          "border-t border-white/10 pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-6",
      )}
    >
      {/* Divider stays on the wrapper so the focus ring can round the link itself */}
      <a
        href={get_event_path(event)}
        className="group/entry flex min-w-0 flex-1 items-start gap-3 rounded-2xl md:items-center"
      >
        <DiamondIcon className={accent.text} />

        <div className="flex min-w-0 flex-col gap-0.5">
          <span
            className={cn(
              "flex flex-wrap items-center gap-x-2 text-xs font-semibold uppercase tracking-wider",
              is_single && "md:text-sm",
              accent.text,
            )}
          >
            {build_meta(event, date).map((part, index) => (
              <Fragment key={part.key}>
                {index === 0 ? null : <span aria-hidden="true">·</span>}
                {part}
              </Fragment>
            ))}
          </span>

          <EventBadges
            badges={event.badges}
            theme={badge_theme}
            className="mt-1"
          />

          <span className="sr-only">: </span>

          <span
            className={cn(
              "text-base font-bold text-base-content",
              "underline-offset-4 transition-colors duration-150",
              "group-hover/entry:underline group-focus-visible/entry:underline",
              accent.headline,
              is_single && "md:text-lg",
            )}
          >
            {get_banner_headline(event_label, event.kind, is_ongoing)}
          </span>
        </div>
      </a>
    </span>
  );
}

/**
 * Meta line of one entry — day, hours, place. Only the parts we know are built, so the
 * `·` between them is never left leading, trailing or doubled on a half-filled event.
 */
function build_meta(
  event: TradeFairEvent,
  date: EventDateParts,
): ReactElement[] {
  // The city alone in a strip this narrow; the country stands in when it is all we have
  const place = event.city ?? event.country;

  const parts: (ReactElement | null)[] = [
    <span key="date">
      {date.month}{" "}
      <time dateTime={get_event_start_datetime(event)}>{date.start_day}</time>
      {date.is_range ? (
        <>
          –<time dateTime={get_event_end_datetime(event)}>{date.end_day}</time>
        </>
      ) : null}
      {`, ${date.year}`}
    </span>,
    get_event_hours(event) === null ? null : (
      <EventHours key="hours" event={event} />
    ),
    place ? <span key="place">{place}</span> : null,
  ];

  return parts.filter((part): part is ReactElement => part !== null);
}

/**
 * Accent marker echoing the logo cube silhouette
 */
function DiamondIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className={cn("mt-1 shrink-0 md:mt-0", className)}
    >
      <path d="M6 0.5 11.5 6 6 11.5 0.5 6Z" fill="currentColor" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className="shrink-0 transition-transform duration-150 ease-out group-hover:translate-x-1"
    >
      <path
        d="M1.5 6H10M10 6 6.75 2.75M10 6 6.75 9.25"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
