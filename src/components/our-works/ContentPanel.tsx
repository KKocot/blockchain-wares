import { memo } from "react";
import { cn } from "../../lib/utils";
import type { ProjectSection } from "../our-works-data";
import { EXPERTISE_BY_ID } from "../expertise-data";
import { ProjectCard } from "./ProjectCard";

interface ContentPanelProps {
  sections: ProjectSection[];
  active_id: string;
}

/**
 * Inner content for a single section — memoized to avoid re-renders
 */
const SectionContent = memo(function SectionContent({
  section,
}: {
  section: ProjectSection;
}) {
  // BIG hero icon — custom_icon (if provided) overrides default expertise icon.
  const primary_expertise =
    section.expertise_ids.length > 0
      ? EXPERTISE_BY_ID[section.expertise_ids[0]]
      : undefined;
  const hero_icon = section.custom_icon ?? primary_expertise?.icon;

  return (
    <>
      {/* Section header — BIG icon + title/subtitle */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-6">
        {hero_icon ? (
          <div
            className={cn(
              "shrink-0 text-secondary",
              "w-20 h-20 md:w-28 md:h-28",
              "drop-shadow-[0_0_24px_rgba(34,211,238,0.18)]",
            )}
            aria-hidden="true"
          >
            {hero_icon}
          </div>
        ) : null}
        <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-secondary">
          {section.title}
        </h3>
      </div>

      {/* Full description */}
      <p className="text-sm md:text-base text-base-content/80 leading-relaxed mb-6">
        {section.description}
      </p>

      {/* Projects list */}
      <div
        role="group"
        aria-label={`${section.title} projects`}
        tabIndex={0}
        className={cn(
          "flex flex-col divide-y divide-white/5 pr-2 rounded-sm",
          "md:max-h-[45rem] md:overflow-y-auto scrollbar-thin",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
        )}
      >
        {section.projects.map((project, index) => (
          <ProjectCard key={project.title} {...project} index={index} />
        ))}
      </div>
    </>
  );
});

/**
 * Content panel for Our Works section
 *
 * All sections are rendered simultaneously in the same grid cell (CSS grid overlay).
 * Container height = tallest section, so the per-list `md:max-h` is what keeps the
 * cell from jumping ~1.2k px between a 2-card and an 8-card tab on every auto-rotate tick.
 * Active section crossfades in, inactive sections are hidden with opacity 0.
 * Each section owns a `tabpanel-{id}` panel so every tab's `aria-controls` resolves.
 */
export const ContentPanel = memo(function ContentPanel({
  sections,
  active_id,
}: ContentPanelProps) {
  return (
    <div className="grid">
      {sections.map((section) => {
        const is_active = section.id === active_id;
        return (
          <div
            key={section.id}
            id={`tabpanel-${section.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${section.id}`}
            className={cn(
              "col-start-1 row-start-1",
              "transition-opacity duration-350 ease-[cubic-bezier(0.44,0,0.56,1)]",
              is_active
                ? "opacity-100"
                : "hidden md:block md:opacity-0 md:pointer-events-none",
            )}
            aria-hidden={!is_active}
            inert={!is_active}
          >
            <SectionContent section={section} />
          </div>
        );
      })}
    </div>
  );
});
