import { memo } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import type { Project } from "../our-works-data";

interface ProjectCardProps extends Project {
  index: number;
}

const EASE: [number, number, number, number] = [0.44, 0, 0.56, 1];

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: EASE,
      delay: index * 0.05,
    },
  }),
};

export const ProjectCard = memo(function ProjectCard({ title, description, url, index }: ProjectCardProps) {
  return (
    <motion.article
      custom={index}
      variants={CARD_VARIANTS}
      initial="hidden"
      animate="visible"
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
    </motion.article>
  );
});
