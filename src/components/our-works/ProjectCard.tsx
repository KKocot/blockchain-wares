import { memo, type ReactNode } from "react";
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

function getPrettyUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function getLinkIcon(label: string): ReactNode {
  const lower = label.toLowerCase();

  if (lower === "docs") {
    return (
      <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
        <path
          d="M3.5 2.2h6.3l3 3v8.6H3.5z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 2.5v3h3M5.7 8.5h4.6M5.7 11h3.2"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (lower === "source") {
    return (
      <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
        <path
          d="M5.5 5L2.5 8l3 3M10.5 5l3 3-3 3M9.3 3.5L6.7 12.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (lower === "npm") {
    return (
      <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
        <rect
          x="1.5"
          y="3.5"
          width="13"
          height="9"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path
          d="M4.5 12.5V6.5M7.5 12.5V6.5M7.5 9.5h2.5V6.5M10.5 12.5V6.5"
          stroke="currentColor"
          strokeWidth="1.3"
        />
      </svg>
    );
  }

  // "Site", "Wax", and any other label → globe icon
  return (
    <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
      <circle cx="8" cy="8" r="6.3" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M1.7 8h12.6M8 1.7c1.8 2 1.8 10.6 0 12.6M8 1.7c-1.8 2-1.8 10.6 0 12.6"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
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
