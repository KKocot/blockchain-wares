import { cn } from "../lib/utils";
import {
  format_event_date,
  get_event_name,
  get_event_path,
  type EventStatus,
  type TradeFairEvent,
} from "./events-data";
import {
  format_event_days,
  format_event_location,
  STATUS_THEME,
} from "./event-theme";

export interface RelatedEvent {
  event: TradeFairEvent;
  status: EventStatus;
}

/** The rest of the calendar, compact — date, name, place */
export function RelatedEvents({ related }: { related: RelatedEvent[] }) {
  return (
    <section aria-labelledby="other-events-heading" className="mt-10 md:mt-12">
      <h2 id="other-events-heading" className="text-xl font-bold md:text-2xl">
        Other <span className="text-secondary">events</span>
      </h2>

      <ul role="list" className="mt-4 flex flex-col gap-3 list-none p-0 m-0">
        {related.map(({ event, status }) => {
          const date = format_event_date(event);
          const location = format_event_location(event);

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
                  {/* A draft has no day to show, so its status stands in for one */}
                  {date === null
                    ? STATUS_THEME[status].label
                    : `${date.month} ${format_event_days(date)}, ${date.year}`}
                </span>
                <span className="min-w-0 text-sm font-semibold text-base-content md:text-base">
                  {event.shortName ?? get_event_name(event)}
                  {location === undefined ? null : (
                    <span className="block text-xs font-normal text-base-content/70">
                      {location}
                    </span>
                  )}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
