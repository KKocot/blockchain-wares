import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "../lib/utils";
import {
  format_event_date,
  get_event_end_datetime,
  get_event_start_datetime,
  get_event_path,
  get_event_status,
  get_promoted_events,
  MARKETS_PATH,
  parse_iso_day,
  type EventKind,
  type TradeFairEvent,
} from "./events-data";

const EASE: [number, number, number, number] = [0.44, 0, 0.56, 1];

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
  /** Build-time local day (`YYYY-MM-DD`), corrected to the visitor's day after mount */
  todayIso: string;
}

/**
 * Narrow announcement strip promoting the closest events we are at or heading to
 * — as many as `get_promoted_events()` returns, at most two.
 * Every entry links to its own event page, the closing call to action to the listing.
 * Renders nothing when no event is scheduled.
 */
export function EventBanner({ todayIso }: EventBannerProps) {
  const prefers_reduced_motion = useReducedMotion();
  const [now, set_now] = useState(() => parse_iso_day(todayIso));
  // useReducedMotion() is null on the server, so the preference may only be applied after mount
  const [is_hydrated, set_is_hydrated] = useState(false);

  useEffect(() => {
    set_now(new Date());
    set_is_hydrated(true);
  }, []);

  const events = get_promoted_events(now);

  if (events.length === 0) {
    return null;
  }

  const variants =
    is_hydrated && prefers_reduced_motion ? STATIC_VARIANTS : MOTION_VARIANTS;
  const has_ongoing = events.some(
    (event) => get_event_status(event, now) === "ongoing",
  );
  const accent = has_ongoing ? ONGOING_ACCENT : UPCOMING_ACCENT;
  const is_single = events.length === 1;

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
          {events.map((event, index) => (
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
  const date = format_event_date(event);
  const is_range = event.startDate !== event.endDate;
  const event_label = event.shortName ?? event.name;

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

        <span className="flex min-w-0 flex-col gap-0.5">
          <span
            className={cn(
              "flex flex-wrap items-center gap-x-2 text-xs font-semibold uppercase tracking-wider",
              is_single && "md:text-sm",
              accent.text,
            )}
          >
            <span>
              {date.month}{" "}
              <time dateTime={get_event_start_datetime(event)}>
                {date.start_day}
              </time>
              {is_range ? (
                <>
                  –
                  <time dateTime={get_event_end_datetime(event)}>
                    {date.end_day}
                  </time>
                </>
              ) : null}
              {`, ${date.year}`}
            </span>
            {event.schedule ? (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {event.schedule.startTime}–{event.schedule.endTime}{" "}
                  {event.schedule.timeZoneLabel}
                </span>
              </>
            ) : null}
            <span aria-hidden="true">·</span>
            <span>{event.city}</span>
          </span>

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
        </span>
      </a>
    </span>
  );
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
