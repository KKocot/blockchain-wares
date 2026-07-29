import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "../lib/utils";
import { get_next_event } from "./events-data";

const EASE: [number, number, number, number] = [0.44, 0, 0.56, 1];

const MOTION_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

const STATIC_VARIANTS: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Narrow announcement strip promoting the closest upcoming event.
 * Whole strip is a single link to /markets.
 * Renders nothing when no event is scheduled.
 */
export function EventBanner() {
  const prefers_reduced_motion = useReducedMotion();
  const event = get_next_event();

  if (!event) {
    return null;
  }

  const variants = prefers_reduced_motion ? STATIC_VARIANTS : MOTION_VARIANTS;
  const event_label = event.shortName ?? event.name;

  return (
    <motion.aside
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      aria-label="Upcoming event"
      className="relative px-4 py-8 md:py-12"
    >
      <a
        href="/markets"
        className={cn(
          "group mx-auto flex w-full max-w-6xl flex-col gap-4",
          "rounded-[28px] px-5 py-5",
          "md:flex-row md:items-center md:justify-between md:gap-8 md:rounded-full md:px-8 md:py-4",
          "bg-base-200/30 backdrop-blur-sm",
          "border border-secondary/25",
          "shadow-card",
          "transition-[border-color,box-shadow] duration-200 ease-out",
          "hover:border-secondary/50 hover:shadow-card-hover",
          // Focus ring itself comes from the global *:focus-visible outline
          "focus-visible:border-secondary/60",
        )}
      >
        <span className="flex min-w-0 items-start gap-3 md:items-center md:gap-4">
          <DiamondIcon />

          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="flex flex-wrap items-center gap-x-2 text-xs font-semibold uppercase tracking-wider text-secondary md:text-sm">
              <time dateTime={event.startDate}>
                {event.month} {event.days}, {event.year}
              </time>
              <span aria-hidden="true" className="text-secondary/40">
                ·
              </span>
              <span className="text-secondary/80">{event.city}</span>
            </span>

            <span className="text-base font-bold text-base-content md:text-lg">
              We are going to {event_label}
            </span>
          </span>
        </span>

        {/* Mobile indent keeps the CTA aligned with the text column: icon + gap */}
        <span className="flex shrink-0 items-center gap-2 pl-[calc(0.875rem+0.75rem)] text-sm font-semibold text-secondary md:pl-0 md:text-base">
          See markets
          <ArrowRightIcon />
        </span>
      </a>
    </motion.aside>
  );
}

/**
 * Accent marker echoing the logo cube silhouette
 */
function DiamondIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className="mt-1 shrink-0 text-secondary md:mt-0"
    >
      <path d="M6 0.5 11.5 6 6 11.5 0.5 6Z" fill="currentColor" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className="shrink-0 transition-transform duration-150 ease-out group-hover:translate-x-1"
    >
      <path
        d="M1.5 6H10M10 6 6.75 2.75M10 6 6.75 9.25"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
