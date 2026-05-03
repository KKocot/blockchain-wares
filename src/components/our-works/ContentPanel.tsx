import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import type { ProjectSection } from "../our-works-data";
import { ProjectCard } from "./ProjectCard";

interface ContentPanelProps {
  sections: ProjectSection[];
  active_id: string;
}

/**
 * Returns responsive grid classes based on project count
 */
function get_grid_classes(count: number): string {
  if (count === 3) return "grid-cols-1 md:grid-cols-3";
  if (count <= 4) return "grid-cols-1 md:grid-cols-2";
  return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
}

/**
 * Inner content for a single section — memoized to avoid re-renders
 */
const SectionContent = memo(function SectionContent({
  section,
}: {
  section: ProjectSection;
}) {
  return (
    <>
      {/* Section title */}
      <h3 className="text-2xl md:text-3xl font-bold text-secondary mb-3">
        {section.title}
      </h3>

      {/* Full description */}
      <p className="text-sm md:text-base text-base-content/60 leading-relaxed mb-6">
        {section.description}
      </p>

      {/* Projects grid */}
      <div className={cn("grid gap-4", get_grid_classes(section.projects.length))}>
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
      className="grid md:min-h-[32rem]"
    >
      {sections.map((section) => {
        const is_active = section.id === active_id;
        return (
          <motion.div
            key={section.id}
            className={cn(
              "col-start-1 row-start-1",
              !is_active && ""
            )}
            animate={{ opacity: is_active ? 1 : 0 }}
            transition={{ duration: 0.35, ease: [0.44, 0, 0.56, 1] }}
            aria-hidden={!is_active}
            style={{ pointerEvents: is_active ? "auto" : "none" }}
          >
            <SectionContent section={section} />
          </motion.div>
        );
      })}
    </div>
  );
});
