import { cn } from "../lib/utils";
import { format_venue_address, type TradeFairEvent } from "./events-data";
import {
  get_venue_name,
  has_venue_details,
  SR_NEW_TAB,
  type StatusTheme,
} from "./event-theme";

/** Small print under the building's name: the room inside it and the postal address */
const DETAIL_LINE_CLASS = "block text-xs font-normal text-base-content/70";

const VENUE_LINK_CLASS =
  "block w-fit underline-offset-4 transition-colors duration-150 hover:underline";

/**
 * Venue of one event, as the card and the event page both write it: the building, the
 * room inside it, the address on the envelope. Every part stands alone — a workshop is
 * announced with a room long before the building is named, and a venue known only by its
 * page says so with the address itself.
 * Renders nothing when the event names no venue at all — callers keep their own headings.
 */
export function VenuePlace({
  event,
  theme,
}: {
  event: TradeFairEvent;
  theme: StatusTheme;
}) {
  if (!has_venue_details(event)) {
    return null;
  }

  const name = get_venue_name(event);
  const room = event.venue?.room;
  const address = format_venue_address(event);
  /** Sala bez budynku nad sobą jest całą wiedzą o miejscu, więc staje w jego linii */
  const room_class = name === undefined ? undefined : DETAIL_LINE_CLASS;

  return (
    <>
      {name === undefined ? null : name.href === undefined ? (
        <span className="block">{name.label}</span>
      ) : (
        <a
          href={name.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(VENUE_LINK_CLASS, theme.link)}
        >
          {name.label}
          <span className="sr-only"> {SR_NEW_TAB}</span>
        </a>
      )}

      {room === undefined ? null : (
        <span className={cn("block", room_class)}>{room}</span>
      )}

      {address === undefined ? null : (
        <span className={DETAIL_LINE_CLASS}>{address}</span>
      )}
    </>
  );
}
