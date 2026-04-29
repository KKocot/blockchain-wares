import { cn } from "../lib/utils";
import { CometEffect } from "./ui";
import { useScrollAnimation } from "../hooks";
import { SECTIONS } from "./our-works-data";
import type { Project, ProjectSection } from "./our-works-data";

/**
 * Our Works section component
 * Displays projects grouped into 7 distinct sections
 * Features:
 * - Section-based grouping
 * - Responsive grid layout
 * - Scroll-triggered animations per section
 * - Staggered card animations
 * - Hover effects on project cards
 */
export function OurWorks() {
  const { ref, is_visible } = useScrollAnimation<HTMLElement>();

  return (
    <section
      ref={ref}
      id="works"
      className="relative py-16 md:py-24 lg:py-32 px-4"
    >
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16">
          <span
            className={cn(
              "text-secondary font-medium tracking-wider uppercase text-xs md:text-sm block mb-2 md:mb-4",
              "fade-up",
              is_visible && "is-visible"
            )}
          >
            Portfolio
          </span>

          <h2
            className={cn(
              "text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 md:mb-6 drop-shadow-lg",
              "fade-up stagger-1",
              is_visible && "is-visible"
            )}
          >
            Our{" "}
            <span className="text-secondary">
              Works
            </span>
          </h2>

          <p
            className={cn(
              "text-base md:text-lg text-base-content/70 leading-relaxed max-w-2xl mx-auto",
              "fade-up stagger-2",
              is_visible && "is-visible"
            )}
          >
            Explore our portfolio of cutting-edge projects across blockchain,
            EDA, engineering, and database technologies.
          </p>
        </div>

        {/* Project sections */}
        <div className="space-y-12 md:space-y-16">
          {SECTIONS.map((section) => (
            <ProjectSectionBlock
              key={section.id}
              section={section}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface ProjectSectionBlockProps {
  section: ProjectSection;
}

function ProjectSectionBlock({ section }: ProjectSectionBlockProps) {
  return (
    <div
      className={cn(
        "group/section relative p-4 md:p-6 rounded-2xl",
        "bg-base-200/30 backdrop-blur-sm",
        "border border-white/5",
        "shadow-card",
        "transition-all duration-300",
        "hover:bg-base-200/50 hover:border-secondary/20",
        "hover:shadow-card-hover"
      )}
    >
      <CometEffect />

      {/* Section header */}
      <div className="mb-6 relative z-10">
        <div>
          <h3 className={cn(
            "text-xl md:text-2xl font-bold mb-2",
            "transition-colors duration-300",
            "group-hover/section:text-secondary"
          )}>
            {section.title}
          </h3>
          <p className="text-sm text-base-content/60 mb-2">{section.subtitle}</p>
          <p className="text-sm md:text-base text-base-content/60 leading-relaxed">
            {section.description}
          </p>
        </div>
      </div>

      {/* Projects grid */}
      <div
        className={cn(
          "grid gap-4 relative z-10",
          section.projects.length === 3
            ? "grid-cols-1 md:grid-cols-3"
            : section.projects.length <= 4
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        )}
      >
        {section.projects.map((project) => (
          <ProjectCard
            key={project.title}
            {...project}
          />
        ))}
      </div>

      {/* Accent line */}
      <div
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 rounded-full",
          "bg-secondary transition-all duration-300",
          "group-hover/section:h-1/3"
        )}
      />
    </div>
  );
}

interface ProjectCardProps extends Project {}

function ProjectCard({ title, description, url }: ProjectCardProps) {
  return (
    <article
      className={cn(
        "group relative p-4 rounded-xl h-full flex flex-col",
        "bg-base-100/50 border border-white/5",
        "shadow-sm",
        "transition-all duration-300",
        "hover:bg-base-100/70 hover:border-secondary/20",
        "hover:shadow-md",
        "hover:-translate-y-1"
      )}
    >
      <CometEffect />
      <div className="relative z-10 flex flex-col h-full">
        <h4 className="text-base font-bold mb-2 group-hover:text-secondary transition-colors">
          {title}
        </h4>

        <p className="text-sm text-base-content/60 leading-relaxed mb-3 flex-grow">
          {description}
        </p>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 text-sm font-medium",
              "text-secondary hover:text-secondary/80",
              "transition-all duration-300"
            )}
            aria-label={`Learn more about ${title}`}
          >
            Learn more
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        )}
      </div>
    </article>
  );
}
