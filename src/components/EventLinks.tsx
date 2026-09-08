import { cn } from "../lib/utils";
import { EventIcon } from "./event-icons";
import { SR_NEW_TAB, type StatusTheme } from "./event-theme";
import { MAX_EVENT_LINKS, type EventLink } from "./event-types";

interface EventLinksProps {
  links: EventLink[] | undefined;
  theme: StatusTheme;
  className?: string;
}

const SAFE_URL_SCHEMES = new Set(["http:", "https:"]);

/**
 * `undefined` for anything that would not render as a safe outbound link: a scheme other
 * than http/https (`javascript:`, `data:`, ...) or a value `URL` cannot construct at all,
 * relative paths included. The backend already validates on write, but a renderer never
 * trusts that as its only guard.
 */
function to_safe_href(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    return SAFE_URL_SCHEMES.has(parsed.protocol) ? url : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Named links, at most `MAX_EVENT_LINKS`. Separate from the single "Event website" /
 * "Venue & directions" link `get_event_link()` derives — this list states whatever the
 * event names on top of that, e.g. an agenda or a livestream page.
 * Renders nothing when there are no safe links at all — callers keep their own layout.
 */
export function EventLinks({ links, theme, className }: EventLinksProps) {
  const items = (links ?? [])
    .map((link) => ({ label: link.label.trim(), href: to_safe_href(link.url) }))
    .filter(
      (link): link is { label: string; href: string } =>
        link.label !== "" && link.href !== undefined,
    )
    .slice(0, MAX_EVENT_LINKS);

  if (items.length === 0) {
    return null;
  }

  return (
    <ul
      role="list"
      className={cn(
        "m-0 flex list-none flex-wrap gap-x-4 gap-y-2 p-0",
        className,
      )}
    >
      {items.map((link, index) => (
        <li key={`${link.label}-${index}`}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex w-fit items-center gap-1.5 rounded-sm text-sm font-medium",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2",
              theme.link,
            )}
          >
            {link.label}
            <EventIcon icon="external-link" />
            <span className="sr-only"> {SR_NEW_TAB}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
