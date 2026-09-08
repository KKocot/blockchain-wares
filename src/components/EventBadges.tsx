import { cn } from "../lib/utils";
import { TOPIC_PILL_CLASS, type StatusTheme } from "./event-theme";
import { MAX_EVENT_BADGES } from "./event-types";

interface EventBadgesProps {
  badges: string[] | undefined;
  theme: StatusTheme;
  className?: string;
}

/**
 * Editorial labels above the title, at most `MAX_EVENT_BADGES`. They sit next to the
 * status badge and borrow its colour via `theme`, but never take its shape — the status
 * badge alone carries the dot and the uppercase weight.
 * Renders nothing when there are no badges at all — callers keep their own layout.
 */
export function EventBadges({ badges, theme, className }: EventBadgesProps) {
  const items = (badges ?? [])
    .map((badge) => badge.trim())
    .filter((badge) => badge !== "")
    .slice(0, MAX_EVENT_BADGES);

  if (items.length === 0) {
    return null;
  }

  return (
    <ul
      role="list"
      className={cn(
        "m-0 flex list-none flex-wrap items-center gap-2 p-0",
        className,
      )}
    >
      {items.map((badge, index) => (
        <li
          key={`${badge}-${index}`}
          className={cn(TOPIC_PILL_CLASS, theme.topic)}
        >
          {badge}
        </li>
      ))}
    </ul>
  );
}
