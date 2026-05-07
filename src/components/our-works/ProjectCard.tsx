import { memo } from "react";
import { motion } from "framer-motion";
import type { Deployment, Project } from "../our-works-data";

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

function getDeploymentDisplay(deployment: Deployment): string {
  if (deployment.label) return deployment.label;
  try {
    return new URL(deployment.url).hostname;
  } catch {
    return deployment.url;
  }
}

export const ProjectCard = memo(function ProjectCard({
  title,
  description,
  deployments,
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
      <div className="shrink-0 md:w-56">
        <h4 className="text-base font-bold">{title}</h4>

        {deployments && deployments.length > 0 ? (
          <span className="inline-flex flex-wrap gap-2 mt-1">
            {deployments.map((deployment) => (
              <a
                key={deployment.url}
                href={deployment.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${title} — ${deployment.label ?? getDeploymentDisplay(deployment)}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-base-200 text-xs hover:text-secondary transition-colors"
              >
                {getDeploymentDisplay(deployment)}
                <svg
                  className="w-3 h-3"
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
              </a>
            ))}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-base-content/80 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.article>
  );
});
