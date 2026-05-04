import { memo } from "react";
import { motion } from "framer-motion";
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

export const ProjectCard = memo(function ProjectCard({
  title,
  description,
  url,
  index,
}: ProjectCardProps) {
  return (
    <motion.article
      custom={index}
      variants={CARD_VARIANTS}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-1 md:flex-row md:gap-6 py-4"
    >
      <h4 className="text-base font-bold shrink-0 md:w-56">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-secondary transition-colors duration-200"
            aria-label={`Visit ${title}`}
          >
            {title.includes(" ") ? (
              <>
                {title.slice(0, title.lastIndexOf(" "))}{" "}
                <span className="whitespace-nowrap">
                  {title.slice(title.lastIndexOf(" ") + 1)}
                  <svg
                    className="w-3.5 h-3.5 inline-block ml-1.5 align-baseline text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 17L17 7M17 7H7M17 7v10"
                    />
                  </svg>
                </span>
              </>
            ) : (
              <span className="whitespace-nowrap">
                {title}
                <svg
                  className="w-3.5 h-3.5 inline-block ml-1.5 align-baseline text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 17L17 7M17 7H7M17 7v10"
                  />
                </svg>
              </span>
            )}
          </a>
        ) : (
          title
        )}
      </h4>

      <p className="text-sm text-base-content/60 leading-relaxed">
        {description}
      </p>
    </motion.article>
  );
});
