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

function getSourceDisplay(source: string): string {
  try {
    const parsed = new URL(source);
    return parsed.hostname;
  } catch {
    return source;
  }
}

function getDeploymentDisplay(deployment: Deployment): string {
  if (deployment.label) return deployment.label;
  try {
    return new URL(deployment.url).hostname;
  } catch {
    return deployment.url;
  }
}

/**
 * Renders the title text with an external-link arrow glued to the last word
 * (whitespace-nowrap prevents the arrow from orphaning on a new line).
 */
function TitleWithArrow({ title }: { title: string }) {
  const has_space = title.includes(" ");
  const head = has_space ? title.slice(0, title.lastIndexOf(" ")) : "";
  const tail = has_space ? title.slice(title.lastIndexOf(" ") + 1) : title;

  return (
    <>
      {has_space ? <>{head} </> : null}
      <span className="whitespace-nowrap">
        {tail}
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
  );
}

export const ProjectCard = memo(function ProjectCard({
  title,
  description,
  deployments,
  source,
  index,
}: ProjectCardProps) {
  const deployment_count = deployments?.length ?? 0;
  const single_deployment =
    deployment_count === 1 ? (deployments?.[0] ?? null) : null;
  // Title links directly only when there is exactly ONE deployment.
  // Multiple deployments => title stays as plain text and we render chips below.
  const title_link_url = single_deployment?.url;
  const show_chip_list =
    deployment_count >= 2 ||
    (deployment_count === 1 && Boolean(single_deployment?.label));

  return (
    <motion.article
      custom={index}
      variants={CARD_VARIANTS}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-1 md:flex-row md:gap-6 py-4"
    >
      <div className="shrink-0 md:w-56">
        <h4 className="text-base font-bold">
          {title_link_url ? (
            <a
              href={title_link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-secondary transition-colors duration-200"
              aria-label={`Visit ${title}`}
            >
              <TitleWithArrow title={title} />
            </a>
          ) : (
            title
          )}
        </h4>

        {show_chip_list && deployments ? (
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
        {source ? (
          <p className="text-xs text-base-content/60">
            Source:{" "}
            <a
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View source repository for ${title}`}
              className="hover:text-secondary underline-offset-2 hover:underline"
            >
              {getSourceDisplay(source)}
            </a>
          </p>
        ) : null}
      </div>
    </motion.article>
  );
});
