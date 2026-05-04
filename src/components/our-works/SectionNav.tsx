import { memo } from "react";
import { cn } from "../../lib/utils";
import type { ProjectSection } from "../our-works-data";

const AUTO_ROTATE_INTERVAL = 5000;

interface SectionNavProps {
  sections: ProjectSection[];
  active_id: string;
  on_select: (id: string) => void;
  is_auto_playing: boolean;
  progress_key: number;
}

interface SectionNavItemProps {
  section: ProjectSection;
  is_active: boolean;
  on_select: (id: string) => void;
  is_auto_playing: boolean;
  progress_key: number;
}

/**
 * Individual navigation item in the sidebar
 */
const SectionNavItem = memo(function SectionNavItem({
  section,
  is_active,
  on_select,
  is_auto_playing,
  progress_key,
}: SectionNavItemProps) {
  return (
    <button
      type="button"
      role="tab"
      id={`tab-${section.id}`}
      aria-selected={is_active}
      aria-controls={`tabpanel-${section.id}`}
      onClick={() => on_select(section.id)}
      className={cn(
        "w-full text-left px-4 py-3 rounded-lg relative overflow-hidden",
        "transition-all duration-300 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100",
        is_active
          ? "bg-secondary/10 border-l-2 border-secondary"
          : "border-l-2 border-transparent hover:bg-base-200/50 hover:border-secondary/30"
      )}
    >
      <h3
        className={cn(
          "text-sm md:text-base font-bold transition-colors duration-300 leading-snug",
          is_active ? "text-secondary" : "text-base-content/70 group-hover:text-base-content/80"
        )}
      >
        {section.title}
      </h3>
      <p
        className={cn(
          "text-xs md:text-sm leading-snug mt-0.5 transition-colors duration-300",
          is_active ? "text-base-content/80" : "text-base-content/60"
        )}
      >
        {section.subtitle}
      </p>

      {/* Progress bar — only on active tab while auto-playing */}
      {is_active && is_auto_playing && (
        <span
          key={progress_key}
          aria-hidden="true"
          className={cn(
            "absolute bottom-0 left-0 h-0.5 w-full origin-left bg-secondary",
            is_auto_playing
              ? "animate-[progress-fill_linear_forwards]"
              : "animate-[progress-fill_linear_forwards_paused]"
          )}
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
});

/**
 * Left sidebar navigation for Our Works section (desktop)
 * Shows all 7 sections with active state highlighting and progress bar
 */
export const SectionNav = memo(function SectionNav({
  sections,
  active_id,
  on_select,
  is_auto_playing,
  progress_key,
}: SectionNavProps) {
  return (
    <nav
      role="tablist"
      aria-label="Project categories"
      className="flex flex-col gap-1"
    >
      {sections.map((section) => (
        <SectionNavItem
          key={section.id}
          section={section}
          is_active={active_id === section.id}
          on_select={on_select}
          is_auto_playing={is_auto_playing}
          progress_key={progress_key}
        />
      ))}
    </nav>
  );
});
