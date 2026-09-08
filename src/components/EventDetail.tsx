import { cn } from "../lib/utils";
import {
  format_event_date,
  get_event_end_datetime,
  get_event_name,
  get_event_path,
  get_event_start_datetime,
  get_venue_map_url,
  MARKETS_PATH,
  type EventDateParts,
  type EventStatus,
  type TradeFairEvent,
} from "./events-data";
import {
  ADMISSION_PILL_CLASS,
  ADMISSION_SEPARATOR,
  DETAILS_PENDING_LONG,
  format_admission,
  format_event_days,
  format_event_location,
  get_event_hours,
  get_event_link,
  get_status_badge_label,
  get_venue_note,
  has_venue_details,
  SR_NEW_TAB,
  STATUS_BADGE_CLASS,
  STATUS_THEME,
  TOPIC_PILL_CLASS,
  VENUE_NOTE_CLASS,
  type StatusTheme,
} from "./event-theme";
import { EventBadges } from "./EventBadges";
import { EventFacts } from "./EventFacts";
import { EventHours } from "./EventHours";
import { EventLinks } from "./EventLinks";
import { RelatedEvents, type RelatedEvent } from "./RelatedEvents";
import { VenuePlace } from "./VenuePlace";

export type { RelatedEvent };

interface EventDetailProps {
  event: TradeFairEvent;
  /** Resolved per request by the route — this component never reads the clock */
  status: EventStatus;
  related: RelatedEvent[];
  /** `div` for the admin preview — the panel page already owns the page's `<main>` */
  container?: "main" | "div";
}

const CONTACT_PATH = "/#contact";

/** Filled button per status; the text-only variants live in `STATUS_THEME.link` */
const CTA_PRIMARY_CLASS: Record<EventStatus, string> = {
  ongoing: "bg-success text-success-content hover:bg-success/90",
  upcoming: "bg-secondary text-secondary-content hover:bg-secondary/90",
  past: "bg-info text-info-content hover:bg-info/90",
  undated: "bg-warning text-warning-content hover:bg-warning/90",
};

const CTA_BASE =
  "group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-6 text-base font-semibold shadow-md transition-[background-color,box-shadow] duration-150 hover:shadow-lg";

const LABEL_CLASS = "text-[11px] font-semibold uppercase tracking-wider";
const VALUE_CLASS = "text-sm font-medium text-base-content md:text-base";
/** Draft placeholder: the panel shape of the listing's empty state, page width */
const PENDING_NOTE_CLASS =
  "rounded-[32px] border border-white/5 bg-base-200/30 px-6 py-8 text-base leading-relaxed text-base-content/80 shadow-card backdrop-blur-sm md:rounded-[40px] md:px-8 md:py-10 md:text-lg";
const BACK_LINK_CLASS =
  "inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-secondary transition-colors duration-150 hover:text-secondary/80";

/**
 * Single event page — facts panel and one dominant call to action.
 * Server-rendered only: no hydration, so the entrance runs on CSS keyframes
 * and the whole page stays readable with JavaScript disabled.
 */
export function EventDetail({
  event,
  status,
  related,
  container: Container = "main",
}: EventDetailProps) {
  const theme = STATUS_THEME[status];
  const date = format_event_date(event);
  const kind_label = event.kind === "workshop" ? "Workshop" : "Conference";
  const admission = format_admission(event.admission);
  const topics = event.topics ?? [];
  // Both halves are optional, so the separator is written by the join, never by hand
  const headline_meta = [
    date === null
      ? undefined
      : `${date.month} ${format_event_days(date)}, ${date.year}`,
    format_event_location(event),
  ]
    .filter((part): part is string => part !== undefined)
    .join(" · ");
  /** Nothing to read yet: the page says so rather than opening empty sections */
  const is_sparse = !event.description && topics.length === 0;

  return (
    <Container className="relative min-h-screen px-4 pt-28 pb-20 md:pt-36 md:pb-28">
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

            <EventBadges badges={event.badges} theme={theme} />

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

            {admission ? (
              <span className={cn(ADMISSION_PILL_CLASS, theme.topic)}>
                {admission}
              </span>
            ) : null}
          </div>

          <h1 className="mt-4 text-3xl font-bold leading-tight text-balance drop-shadow-lg md:text-4xl lg:text-5xl">
            {get_event_name(event)}
          </h1>

          {headline_meta === "" ? null : (
            <p
              className={cn(
                "mt-3 text-base font-semibold md:text-lg",
                theme.accent,
              )}
            >
              {headline_meta}
            </p>
          )}
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
            {event.description ? (
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
            ) : null}

            {is_sparse ? <PendingNote /> : null}

            {topics.length === 0 ? null : (
              <section
                aria-labelledby="event-topics-heading"
                className={event.description ? "mt-10 md:mt-12" : undefined}
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
                  {topics.map((topic) => (
                    <li
                      key={topic}
                      className={cn(TOPIC_PILL_CLASS, theme.topic)}
                    >
                      {topic}
                    </li>
                  ))}
                </ul>
              </section>
            )}

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
    </Container>
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
  const date = format_event_date(event);
  const location = format_event_location(event);
  const admission = format_admission(event.admission);
  const organizer_url = event.organizer?.url;
  /** A link with no name of its own says where it goes with the address itself */
  const organizer_label = event.organizer?.name ?? organizer_url;
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
  const hours = get_event_hours(event);
  const has_when = date !== null || hours !== null;
  const has_venue = has_venue_details(event);
  const has_where = has_venue || location !== undefined;
  const venue_note = get_venue_note(event);
  const has_own_facts = (event.facts ?? []).some(
    (fact) => fact.label.trim() !== "",
  );
  const has_own_links = (event.links ?? []).some(
    (link) => link.label.trim() !== "",
  );
  /** A draft can know none of them — then the panel is the call to action alone */
  const has_key_details =
    has_when ||
    has_where ||
    admission !== undefined ||
    organizer_label !== undefined ||
    has_own_facts ||
    has_own_links;

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

      {has_key_details ? (
        <dl className="flex flex-col gap-5">
          {has_when ? (
            <div>
              <dt className={cn(LABEL_CLASS, theme.accent)}>When</dt>
              <dd className="mt-2">
                {date === null ? null : (
                  <DateBlock date={date} event={event} theme={theme} />
                )}
                {hours === null ? null : (
                  <span className={cn("mt-2 block", VALUE_CLASS)}>
                    <EventHours event={event} />
                  </span>
                )}
              </dd>
            </div>
          ) : null}

          {has_where ? (
            <div>
              <dt className={cn(LABEL_CLASS, theme.accent)}>Where</dt>
              <dd className={cn("mt-1", VALUE_CLASS)}>
                <VenuePlace event={event} theme={theme} />
                {has_venue && venue_note ? (
                  <span className={VENUE_NOTE_CLASS}>{venue_note}</span>
                ) : null}
                {location === undefined ? null : (
                  <span className="block">{location}</span>
                )}
              </dd>
            </div>
          ) : null}

          {admission ? (
            <div>
              <dt className={cn(LABEL_CLASS, theme.accent)}>Admission</dt>
              <dd className={cn("mt-1", VALUE_CLASS)}>
                {/* Split of the one-line pill copy — the separator is the helper's own */}
                {admission.split(ADMISSION_SEPARATOR).map((line) => (
                  <span key={line} className="block first-letter:uppercase">
                    {line}
                  </span>
                ))}
              </dd>
            </div>
          ) : null}

          {organizer_label ? (
            <div>
              <dt className={cn(LABEL_CLASS, theme.accent)}>Organizer</dt>
              <dd className={cn("mt-1", VALUE_CLASS)}>
                {organizer_url ? (
                  <a
                    href={organizer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "font-semibold underline-offset-4 transition-colors duration-150 hover:underline",
                      theme.link,
                    )}
                  >
                    {organizer_label}
                    <span className="sr-only"> {SR_NEW_TAB}</span>
                  </a>
                ) : (
                  organizer_label
                )}
              </dd>
            </div>
          ) : null}

          {has_own_facts ? (
            <div>
              <dt className={cn(LABEL_CLASS, theme.accent)}>Good to know</dt>
              <dd className="mt-2">
                <EventFacts facts={event.facts} theme={theme} />
              </dd>
            </div>
          ) : null}

          {has_own_links ? (
            <div>
              <dt className={cn(LABEL_CLASS, theme.accent)}>Links</dt>
              <dd className="mt-2">
                <EventLinks links={event.links} theme={theme} />
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      <div
        className={
          has_key_details ? "mt-6 border-t border-white/10 pt-5" : undefined
        }
      >
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

/**
 * Stands in for the body of a draft — a panel, so the page keeps its shape instead of
 * ending under the headline with nothing but the calls to action.
 */
function PendingNote() {
  return <p className={PENDING_NOTE_CLASS}>{DETAILS_PENDING_LONG}</p>;
}

/** Date block of `EventCard`, stretched across the panel */
function DateBlock({
  date,
  event,
  theme,
}: {
  date: EventDateParts;
  event: TradeFairEvent;
  theme: StatusTheme;
}) {
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
        {date.is_range ? (
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
