import { memo, useRef, useEffect } from "react";
import { cn } from "../../lib/utils";
import type { ProjectSection } from "../our-works-data";

const AUTO_ROTATE_INTERVAL = 5000;

interface MobileTabsProps {
  sections: ProjectSection[];
  active_id: string;
  on_select: (id: string) => void;
  is_auto_playing: boolean;
  progress_key: number;
}

/**
 * Horizontal scrollable tabs for mobile view
 * Auto-scrolls active tab into view, with progress bar on active pill
 */
export const MobileTabs = memo(function MobileTabs({
  sections,
  active_id,
  on_select,
  is_auto_playing,
  progress_key,
}: MobileTabsProps) {
  const scroll_ref = useRef<HTMLDivElement>(null);
  const active_tab_ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (active_tab_ref.current && scroll_ref.current) {
      const container = scroll_ref.current;
      const tab = active_tab_ref.current;
      const scroll_left = tab.offsetLeft - container.offsetWidth / 2 + tab.offsetWidth / 2;
      container.scrollTo({ left: scroll_left, behavior: "smooth" });
    }
  }, [active_id]);

  return (
    <div
      ref={scroll_ref}
      role="tablist"
      aria-label="Project categories"
      className={cn(
        "flex gap-2 overflow-x-auto pb-2 -mx-4 px-4",
        "scrollbar-none [&::-webkit-scrollbar]:hidden"
      )}
    >
      {sections.map((section) => {
        const is_active = active_id === section.id;
        return (
          <button
            key={section.id}
            ref={is_active ? active_tab_ref : undefined}
            type="button"
            role="tab"
            id={`tab-mobile-${section.id}`}
            aria-selected={is_active}
            aria-controls={`tabpanel-${section.id}`}
            onClick={() => on_select(section.id)}
            className={cn(
              "shrink-0 px-4 py-2 rounded-full text-xs font-semibold relative overflow-hidden",
              "transition-all duration-300 cursor-pointer whitespace-nowrap",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
              is_active
                ? "bg-secondary text-secondary-content"
                : "bg-base-200/50 text-base-content/50 hover:text-base-content/80 hover:bg-base-200"
            )}
          >
            {section.title}

            {/* Progress bar — thin line at bottom of active pill */}
            {is_active && (
              <span
                key={progress_key}
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-secondary-content/40"
                style={{
                  animationDuration: `${AUTO_ROTATE_INTERVAL}ms`,
                  animationPlayState: is_auto_playing ? "running" : "paused",
                  animationName: "progress-fill",
                  animationTimingFunction: "linear",
                  animationFillMode: "forwards",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
});
