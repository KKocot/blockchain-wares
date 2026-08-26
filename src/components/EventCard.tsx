import { cn } from "../lib/utils";
import {
  format_event_date,
  type EventStatus,
  type TradeFairEvent,
} from "./events-data";

interface StatusTheme {
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
}

/**
 * Status is carried by hue, not by transparency — green reads as live,
 * cyan as brand-default and the deeper blue as archived.
 */
const STATUS_THEME: Record<EventStatus, StatusTheme> = {
  ongoing: {
    label: "Happening now",
    card: "border-success/40",
    badge: "border-success/40 bg-success/10 text-success",
    dot: "bg-success motion-safe:animate-pulse",
    date_block: "border-success/40 bg-success/10",
    accent: "text-success",
    topic: "border-success/25 bg-success/5 text-success",
    link: "text-success hover:text-success/80 focus-visible:ring-success",
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
  },
};

interface EventCardProps {
  event: TradeFairEvent;
  status: EventStatus;
}

/**
 * Single event card — date block, details and a link to the event website
 */
export function EventCard({ event, status }: EventCardProps) {
  const theme = STATUS_THEME[status];

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-6 p-6 md:flex-row md:gap-8 md:p-8",
        "rounded-[32px] md:rounded-[40px]",
        "bg-base-200/30 backdrop-blur-sm",
        "border",
        theme.card,
        "shadow-card transition-shadow duration-300",
        "hover:shadow-card-hover",
      )}
    >
      <DateBlock event={event} theme={theme} />

      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1",
              "text-[11px] font-semibold uppercase tracking-wider",
              theme.badge,
            )}
          >
            <span
              className={cn("h-1.5 w-1.5 rounded-full", theme.dot)}
              aria-hidden="true"
            />
            {theme.label}
          </span>

          {event.edition ? (
            <span
              className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                theme.accent,
              )}
            >
              {event.edition}
            </span>
          ) : null}
        </div>

        <div>
          <h3 className="text-xl font-bold md:text-2xl">{event.name}</h3>

          <p
            className={cn(
              "mt-2 flex items-center gap-2 text-sm font-medium",
              theme.accent,
            )}
          >
            <PinIcon />
            {event.city}, {event.country}
          </p>
        </div>

        <p className="text-sm leading-relaxed text-base-content/80 md:text-base">
          {event.description}
        </p>

        <ul role="list" className="flex flex-wrap gap-2 list-none p-0 m-0">
          {event.topics.map((topic) => (
            <li
              key={topic}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                theme.topic,
              )}
            >
              {topic}
            </li>
          ))}
        </ul>

        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex w-fit items-center gap-2 rounded-full px-1 py-1 text-sm font-semibold",
            "transition-[color,transform] duration-150",
            "hover:translate-x-0.5",
            "focus-visible:outline-none focus-visible:ring-2",
            theme.link,
          )}
        >
          Event website
          <ArrowUpRightIcon />
          <span className="sr-only">{event.name} — opens in a new tab</span>
        </a>
      </div>
    </div>
  );
}

/**
 * Highlighted date block (days / month / year)
 */
function DateBlock({
  event,
  theme,
}: {
  event: TradeFairEvent;
  theme: StatusTheme;
}) {
  const date = format_event_date(event);
  const is_range = event.startDate !== event.endDate;

  return (
    <div
      className={cn(
        "flex shrink-0 items-baseline gap-3 self-start",
        "rounded-3xl border px-5 py-4",
        theme.date_block,
        theme.accent,
        "md:w-32 md:flex-col md:items-center md:gap-1 md:text-center",
      )}
    >
      <span className="text-2xl font-bold leading-none md:text-3xl">
        <time dateTime={event.startDate}>{date.start_day}</time>
        {is_range ? (
          <>
            –<time dateTime={event.endDate}>{date.end_day}</time>
          </>
        ) : null}
      </span>
      <span className="text-sm font-semibold uppercase tracking-wider">
        {date.month}
      </span>
      <span className="text-xs font-medium">{date.year}</span>
    </div>
  );
}

function PinIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M2 8L8 2M8 2H3.5M8 2V6.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
