import { memo } from "react";
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
  return (
    <div
      role="tablist"
      aria-label="Project categories"
      className="flex flex-wrap gap-2 pb-2"
    >
      {sections.map((section) => {
        const is_active = active_id === section.id;
        return (
          <button
            key={section.id}
            type="button"
            role="tab"
            id={`tab-mobile-${section.id}`}
            aria-selected={is_active}
            aria-controls={`tabpanel-${section.id}`}
            onClick={() => on_select(section.id)}
            className={cn(
              "px-3 py-2.5 rounded-full text-xs font-semibold relative overflow-hidden",
              "transition-all duration-300 cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
              is_active
                ? "bg-secondary text-secondary-content"
                : "bg-base-200/50 text-base-content/50 hover:text-base-content/80 hover:bg-base-200"
            )}
          >
            {section.title}

            {/* Progress bar — thin line at bottom of active pill */}
            {is_active && is_auto_playing && (
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
