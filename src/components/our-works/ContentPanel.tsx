import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import type { ProjectSection } from "../our-works-data";
import { ProjectCard } from "./ProjectCard";

interface ContentPanelProps {
  section: ProjectSection;
}

const EASE: [number, number, number, number] = [0.44, 0, 0.56, 1];

const PANEL_VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.25, ease: EASE },
  },
} as const;

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
 * when AnimatePresence keeps it mounted during exit animation
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
 * Right-side content panel for Our Works section
 * Displays the active section's description and project cards
 * with crossfade/slide animations on section change
 */
export const ContentPanel = memo(function ContentPanel({
  section,
}: ContentPanelProps) {
  return (
    <div
      role="tabpanel"
      id={`tabpanel-${section.id}`}
      aria-labelledby={`tab-${section.id}`}
      className="min-h-[24rem]"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={section.id}
          variants={PANEL_VARIANTS}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <SectionContent section={section} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
});
