import { cn } from "../lib/utils";
import { EventIcon } from "./event-icons";
import { type StatusTheme } from "./event-theme";
import { MAX_EVENT_FACTS, type EventFact } from "./event-types";

interface EventFactsProps {
  facts: EventFact[] | undefined;
  theme: StatusTheme;
  className?: string;
}

/**
 * Fact strip: an icon from the preset and whatever it states, at most `MAX_EVENT_FACTS`
 * lines. Colour comes from `theme.accent`, the same tone the card's location and hours
 * lines already use, so the strip reads as one more line of that block, not a new one.
 * Renders nothing when there are no facts at all — callers keep their own layout.
 */
export function EventFacts({ facts, theme, className }: EventFactsProps) {
  const items = (facts ?? [])
    .map((fact) => ({ ...fact, label: fact.label.trim() }))
    .filter((fact) => fact.label !== "")
    .slice(0, MAX_EVENT_FACTS);

  if (items.length === 0) {
    return null;
  }

  return (
    <ul
      role="list"
      className={cn("m-0 flex list-none flex-col gap-1.5 p-0", className)}
    >
      {items.map((fact, index) => (
        <li
          key={`${fact.icon}-${index}`}
          className={cn(
            "flex items-start gap-2 text-sm font-medium",
            theme.accent,
          )}
        >
          <EventIcon icon={fact.icon} className="mt-0.5" />
          <span className="min-w-0">{fact.label}</span>
        </li>
      ))}
    </ul>
  );
}
