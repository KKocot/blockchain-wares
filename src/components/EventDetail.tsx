import { cn } from "../lib/utils";
import {
  format_admission,
  format_event_date,
  format_venue_address,
  get_event_end_datetime,
  get_event_path,
  get_event_start_datetime,
  get_venue_map_url,
  MARKETS_PATH,
  type EventStatus,
  type TradeFairEvent,
} from "./events-data";
import {
  ADMISSION_PILL_CLASS,
  get_event_link,
  get_status_badge_label,
  STATUS_BADGE_CLASS,
  STATUS_THEME,
  TOPIC_PILL_CLASS,
  type StatusTheme,
} from "./event-theme";

export interface RelatedEvent {
  event: TradeFairEvent;
  status: EventStatus;
}

interface EventDetailProps {
  event: TradeFairEvent;
  /** Resolved per request by the route — this component never reads the clock */
  status: EventStatus;
  related: RelatedEvent[];
}

const CONTACT_PATH = "/#contact";
const SR_NEW_TAB = "— opens in a new tab";

/** Filled button per status; the text-only variants live in `STATUS_THEME.link` */
const CTA_PRIMARY_CLASS: Record<EventStatus, string> = {
  ongoing: "bg-success text-success-content hover:bg-success/90",
  upcoming: "bg-secondary text-secondary-content hover:bg-secondary/90",
  past: "bg-info text-info-content hover:bg-info/90",
};

const CTA_BASE =
  "group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-base font-semibold shadow-md transition-[background-color,box-shadow] duration-150 hover:shadow-lg";

const LABEL_CLASS = "text-[11px] font-semibold uppercase tracking-wider";
const VALUE_CLASS = "text-sm font-medium text-base-content md:text-base";
const BACK_LINK_CLASS =
  "inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-secondary transition-colors duration-150 hover:text-secondary/80";

/**
 * Single event page — facts panel and one dominant call to action.
 * Server-rendered only: no hydration, so the entrance runs on CSS keyframes
 * and the whole page stays readable with JavaScript disabled.
 */
export function EventDetail({ event, status, related }: EventDetailProps) {
  const theme = STATUS_THEME[status];
  const date = format_event_date(event);
  const is_range = event.startDate !== event.endDate;
  const days = is_range ? `${date.start_day}–${date.end_day}` : date.start_day;
  const kind_label = event.kind === "workshop" ? "Workshop" : "Conference";

  return (
    <main className="relative min-h-screen px-4 pt-28 pb-20 md:pt-36 md:pb-28">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-10 animate-fade-in-up md:mb-14">
          <a href={MARKETS_PATH} className={cn(BACK_LINK_CLASS, "-my-2 py-2")}>
            <span aria-hidden="true">←</span>
            Markets
          </a>

          <span
            className={cn(
              "mt-6 block text-xs font-medium uppercase tracking-wider md:mt-8 md:text-sm",
              theme.accent,
            )}
          >
            {kind_label}
          </span>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className={cn(STATUS_BADGE_CLASS, theme.badge)}>
              <span
                className={cn("h-1.5 w-1.5 rounded-full", theme.dot)}
                aria-hidden="true"
              />
              {get_status_badge_label(event, status)}
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
              <span className={cn(ADMISSION_PILL_CLASS, theme.topic)}>
                {format_admission(event.admission)}
              </span>
            ) : null}
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-balance drop-shadow-lg md:text-4xl lg:text-5xl">
            {event.name}
          </h1>

          <p
            className={cn(
              "mt-3 text-base font-semibold md:text-lg",
              theme.accent,
            )}
          >
            {date.month} {days}, {date.year} · {event.city}, {event.country}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
          <aside
            aria-labelledby="event-details-heading"
            className="animate-fade-in-up lg:col-start-2 lg:row-start-1"
            style={{ animationDelay: "0.48s" }}
          >
            <FactsPanel event={event} status={status} theme={theme} />
          </aside>

          <div
            className="animate-fade-in-up lg:col-start-1 lg:row-start-1"
            style={{ animationDelay: "0.56s" }}
          >
            <section aria-labelledby="event-about-heading">
              <h2
                id="event-about-heading"
                className="text-xl font-bold md:text-2xl"
              >
                What it is <span className={theme.accent}>about</span>
              </h2>
              <p className="mt-4 text-base leading-relaxed text-base-content/80 md:text-lg">
                {event.description}
              </p>
            </section>

            <section
              aria-labelledby="event-topics-heading"
              className="mt-10 md:mt-12"
            >
              <h2
                id="event-topics-heading"
                className="text-xl font-bold md:text-2xl"
              >
                <span className={theme.accent}>Topics</span> covered
              </h2>
              <ul
                role="list"
                className="mt-4 flex flex-wrap gap-2 list-none p-0 m-0"
              >
                {event.topics.map((topic) => (
                  <li key={topic} className={cn(TOPIC_PILL_CLASS, theme.topic)}>
                    {topic}
                  </li>
                ))}
              </ul>
            </section>

            {related.length > 0 ? <RelatedEvents related={related} /> : null}

            <p className="mt-10 text-sm text-base-content/80 md:mt-12 md:text-base">
              Want to talk before the doors open?{" "}
              <a
                href={CONTACT_PATH}
                className="rounded-sm font-semibold text-secondary underline-offset-4 transition-colors duration-150 hover:text-secondary/80 hover:underline"
              >
                Get in touch
              </a>{" "}
              and we will save you a slot.
            </p>

            <a href={MARKETS_PATH} className={cn(BACK_LINK_CLASS, "mt-8 py-2")}>
              <span aria-hidden="true">←</span>
              All markets &amp; events
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

/** Date, place, admission and organizer, closed by the page's single primary CTA */
function FactsPanel({
  event,
  status,
  theme,
}: {
  event: TradeFairEvent;
  status: EventStatus;
  theme: StatusTheme;
}) {
  const venue_address = format_venue_address(event);
  const map_url = get_venue_map_url(event);
  const event_link = get_event_link(event, status);
  const primary = event_link
    ? { ...event_link, external: true }
    : {
        href: CONTACT_PATH,
        label: "Get in touch",
        sr_label: "",
        external: false,
      };
  const show_map_link =
    map_url !== undefined && status !== "past" && primary.href !== map_url;

  return (
    <div
      className={cn(
        "rounded-[32px] border bg-base-200/30 p-6 shadow-card backdrop-blur-sm",
        "md:rounded-[40px] md:p-7 lg:sticky lg:top-28",
        theme.card,
      )}
    >
      <h2 id="event-details-heading" className="sr-only">
        Key details
      </h2>

      <dl className="flex flex-col gap-5">
        <div>
          <dt className={cn(LABEL_CLASS, theme.accent)}>When</dt>
          <dd className="mt-2">
            <DateBlock event={event} theme={theme} />
            {event.schedule ? (
              <span className={cn("mt-2 block", VALUE_CLASS)}>
                <time dateTime={get_event_start_datetime(event)}>
                  {event.schedule.startTime}
                </time>
                –
                <time dateTime={get_event_end_datetime(event)}>
                  {event.schedule.endTime}
                </time>{" "}
                {event.schedule.timeZoneLabel}
              </span>
            ) : null}
          </dd>
        </div>

        <div>
          <dt className={cn(LABEL_CLASS, theme.accent)}>Where</dt>
          <dd className={cn("mt-1", VALUE_CLASS)}>
            {event.venue ? <span>{event.venue.name}</span> : null}
            {venue_address ? (
              <span className="block text-xs font-normal text-base-content/70">
                {venue_address}
              </span>
            ) : null}
            <span className="block">
              {event.city}, {event.country}
            </span>
          </dd>
        </div>

        {event.admission ? (
          <div>
            <dt className={cn(LABEL_CLASS, theme.accent)}>Admission</dt>
            <dd className={cn("mt-1", VALUE_CLASS)}>
              {/* Split of the one-line pill copy — the separator is the helper's own */}
              {format_admission(event.admission)
                .split(" · ")
                .map((line) => (
                  <span key={line} className="block first-letter:uppercase">
                    {line}
                  </span>
                ))}
            </dd>
          </div>
        ) : null}

        <div>
          <dt className={cn(LABEL_CLASS, theme.accent)}>Organizer</dt>
          <dd className={cn("mt-1", VALUE_CLASS)}>
            <a
              href={event.organizer.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "font-semibold underline-offset-4 transition-colors duration-150 hover:underline",
                theme.link,
              )}
            >
              {event.organizer.name}
              <span className="sr-only"> {SR_NEW_TAB}</span>
            </a>
          </dd>
        </div>
      </dl>

      <div className="mt-6 border-t border-white/10 pt-5">
        <a
          href={primary.href}
          className={cn(CTA_BASE, CTA_PRIMARY_CLASS[status])}
          {...(primary.external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {primary.label}
          <span
            className="transition-transform duration-150 ease-out group-hover:translate-x-1"
            aria-hidden="true"
          >
            →
          </span>
          {primary.external ? (
            <span className="sr-only">{primary.sr_label}</span>
          ) : null}
        </a>

        {show_map_link ? (
          <a
            href={map_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "mt-4 inline-flex w-fit items-center gap-2 rounded-sm text-sm font-semibold",
              "transition-[color,transform] duration-150 hover:translate-x-0.5",
              theme.link,
            )}
          >
            Venue &amp; directions
            <span className="sr-only">{SR_NEW_TAB}</span>
          </a>
        ) : null}
      </div>
    </div>
  );
}

/** Date block of `EventCard`, stretched across the panel */
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
    <span
      className={cn(
        "flex items-baseline gap-3 rounded-3xl border px-5 py-4",
        theme.date_block,
        theme.accent,
      )}
    >
      <span className="text-4xl font-bold leading-none md:text-5xl">
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
    </span>
  );
}

/** The rest of the calendar, compact — date, name, place */
function RelatedEvents({ related }: { related: RelatedEvent[] }) {
  return (
    <section aria-labelledby="other-events-heading" className="mt-10 md:mt-12">
      <h2 id="other-events-heading" className="text-xl font-bold md:text-2xl">
        Other <span className="text-secondary">events</span>
      </h2>

      <ul role="list" className="mt-4 flex flex-col gap-3 list-none p-0 m-0">
        {related.map(({ event, status }) => {
          const date = format_event_date(event);
          const days =
            event.startDate === event.endDate
              ? date.start_day
              : `${date.start_day}–${date.end_day}`;

          return (
            <li key={event.id}>
              <a
                href={get_event_path(event)}
                className="flex flex-col gap-1 rounded-2xl border border-white/5 bg-base-200/30 px-5 py-4 transition-shadow duration-300 hover:shadow-card-hover md:flex-row md:items-baseline md:gap-4"
              >
                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wider md:w-40 md:shrink-0",
                    STATUS_THEME[status].accent,
                  )}
                >
                  {date.month} {days}, {date.year}
                </span>
                <span className="min-w-0 text-sm font-semibold text-base-content md:text-base">
                  {event.shortName ?? event.name}
                  <span className="block text-xs font-normal text-base-content/70">
                    {event.city}, {event.country}
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
