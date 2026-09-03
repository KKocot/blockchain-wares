import { cn } from "../lib/utils";
import {
  format_admission,
  format_event_date,
  format_venue_address,
  get_event_end_datetime,
  get_event_start_datetime,
  get_venue_map_url,
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

/** Workshops are ours, so the badge states hosting instead of attendance */
const WORKSHOP_LABEL: Record<EventStatus, string> = {
  ongoing: "Happening now",
  upcoming: "We are hosting",
  past: "We hosted",
};

interface EventLink {
  href: string;
  label: string;
  sr_label: string;
}

/**
 * Own website when the event has one, otherwise directions to the venue we booked.
 * Directions are dropped once the event is over — nobody needs to get there any more.
 */
function get_event_link(
  event: TradeFairEvent,
  status: EventStatus,
): EventLink | null {
  if (event.url) {
    return {
      href: event.url,
      label: "Event website",
      sr_label: `${event.name} — opens in a new tab`,
    };
  }

  const map_url = get_venue_map_url(event);

  if (map_url && event.venue && status !== "past") {
    return {
      href: map_url,
      label: "Venue & directions",
      sr_label: `${event.venue.name} on the map — opens in a new tab`,
    };
  }

  return null;
}

interface EventCardProps {
  event: TradeFairEvent;
  status: EventStatus;
}

/**
 * Single event card — date block, details and a link to the event website
 * or, for events of our own, to the venue we booked
 */
export function EventCard({ event, status }: EventCardProps) {
  const theme = STATUS_THEME[status];
  const badge_label =
    event.kind === "workshop" ? WORKSHOP_LABEL[status] : theme.label;
  const link = get_event_link(event, status);
  const venue_address = format_venue_address(event);

  return (
    <article
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
            {badge_label}
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

          {event.admission ? (
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold",
                theme.topic,
              )}
            >
              {format_admission(event.admission)}
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

          {event.schedule ? (
            <p
              className={cn(
                "mt-1 flex items-center gap-2 text-sm font-medium",
                theme.accent,
              )}
            >
              <ClockIcon />
              <span>
                <time dateTime={get_event_start_datetime(event)}>
                  {event.schedule.startTime}
                </time>
                –
                <time dateTime={get_event_end_datetime(event)}>
                  {event.schedule.endTime}
                </time>{" "}
                {event.schedule.timeZoneLabel}
              </span>
            </p>
          ) : null}

          {event.venue ? (
            <p
              className={cn(
                "mt-1 flex items-start gap-2 text-sm font-medium",
                theme.accent,
              )}
            >
              <VenueIcon />
              <span className="min-w-0">
                {event.venue.name}
                {venue_address ? (
                  <span className="block text-xs font-normal text-base-content/70">
                    {venue_address}
                  </span>
                ) : null}
              </span>
            </p>
          ) : null}
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

        {link ? (
          <a
            href={link.href}
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
            {link.label}
            <ArrowUpRightIcon />
            <span className="sr-only">{link.sr_label}</span>
          </a>
        ) : null}
      </div>
    </article>
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
        <time dateTime={get_event_start_datetime(event)}>{date.start_day}</time>
        {is_range ? (
          <>
            –
            <time dateTime={get_event_end_datetime(event)}>{date.end_day}</time>
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

function ClockIcon() {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function VenueIcon() {
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
      className="mt-0.5 shrink-0"
    >
      <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M16 10h3a2 2 0 0 1 2 2v9" />
      <path d="M9 7h3M9 11h3M9 15h3" />
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
