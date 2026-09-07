import {
  get_event_end_datetime,
  get_event_start_datetime,
  type TradeFairEvent,
} from "./events-data";
import { get_event_hours } from "./event-theme";

/**
 * Clock times of one event, as the card, the banner and the event page all write them.
 * Each hour stands alone: an event announced with an opening time and no closing one
 * reads "from 10:00 CEST" instead of inventing the other end of the day.
 * Renders nothing when no hour is known — callers decide what stands in its place.
 */
export function EventHours({ event }: { event: TradeFairEvent }) {
  const hours = get_event_hours(event);

  if (hours === null) {
    return null;
  }

  return (
    <span>
      {hours.prefix ? `${hours.prefix} ` : null}
      {hours.startTime ? (
        <time dateTime={get_event_start_datetime(event)}>
          {hours.startTime}
        </time>
      ) : null}
      {hours.startTime && hours.endTime ? "–" : null}
      {hours.endTime ? (
        <time dateTime={get_event_end_datetime(event)}>{hours.endTime}</time>
      ) : null}
      {hours.timeZoneLabel ? ` ${hours.timeZoneLabel}` : null}
    </span>
  );
}
