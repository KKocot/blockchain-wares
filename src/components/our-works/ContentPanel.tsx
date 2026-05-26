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
              "drop-shadow-[0_0_24px_rgba(34,211,238,0.18)]"
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
      <div className="flex flex-col divide-y divide-white/5 md:max-h-[30rem] md:overflow-y-auto scrollbar-thin pr-2">
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
 * Container height = tallest section naturally — no layout shift when switching tabs.
 * Active section crossfades in, inactive sections are hidden with opacity 0.
 */
export const ContentPanel = memo(function ContentPanel({
  sections,
  active_id,
}: ContentPanelProps) {
  return (
    <div
      role="tabpanel"
      aria-labelledby={`tab-${active_id}`}
      className="grid"
    >
      {sections.map((section) => {
        const is_active = section.id === active_id;
        return (
          <div
            key={section.id}
            className={cn(
              "col-start-1 row-start-1",
              "transition-opacity duration-350 ease-[cubic-bezier(0.44,0,0.56,1)]",
              is_active ? "opacity-100" : "hidden md:block md:opacity-0 md:pointer-events-none"
            )}
            aria-hidden={!is_active}
            style={{ pointerEvents: is_active ? "auto" : "none" }}
          >
            <SectionContent section={section} />
          </div>
        );
      })}
    </div>
  );
});
