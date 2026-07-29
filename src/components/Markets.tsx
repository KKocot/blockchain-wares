import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "../lib/utils";
import { EVENTS, type TradeFairEvent } from "./events-data";

const EASE: [number, number, number, number] = [0.44, 0, 0.56, 1];

const MOTION_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE, delay: index * 0.08 },
  }),
};

const STATIC_VARIANTS: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Markets page content — company presence at trade fairs and conferences.
 * Renders a data-driven list of upcoming events.
 */
export function Markets() {
  const prefers_reduced_motion = useReducedMotion();
  const variants = prefers_reduced_motion ? STATIC_VARIANTS : MOTION_VARIANTS;

  return (
    <main className="relative min-h-screen px-4 pt-28 pb-20 md:pt-36 md:pb-28">
      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <motion.header
          custom={0}
          variants={variants}
          initial="hidden"
          animate="visible"
          className="mb-12 md:mb-16"
        >
          <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-secondary md:mb-4 md:text-sm">
            Markets
          </span>

          <h1 className="mb-4 text-3xl font-bold leading-tight drop-shadow-lg md:mb-6 md:text-5xl lg:text-6xl">
            Where you can <span className="text-secondary">meet us</span>
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-base-content/80 md:text-lg">
            We attend industry trade fairs and conferences across Europe to meet
            the people we build for. Catch us on site to discuss blockchain
            infrastructure, engineering tooling or a project of your own.
          </p>
        </motion.header>

        <section aria-labelledby="upcoming-events-heading">
          <motion.h2
            custom={1}
            variants={variants}
            initial="hidden"
            animate="visible"
            id="upcoming-events-heading"
            className="mb-6 text-xl font-bold md:mb-8 md:text-2xl"
          >
            Upcoming <span className="text-secondary">events</span>
          </motion.h2>

          <ul className="flex flex-col gap-6 list-none p-0 m-0">
            {EVENTS.map((event, index) => (
              <motion.li
                key={event.id}
                custom={index + 2}
                variants={variants}
                initial="hidden"
                animate="visible"
              >
                <EventCard event={event} />
              </motion.li>
            ))}
          </ul>
        </section>

        <motion.p
          custom={EVENTS.length + 2}
          variants={variants}
          initial="hidden"
          animate="visible"
          className="mt-12 text-sm text-base-content/80 md:mt-16 md:text-base"
        >
          Want to book a meeting before the doors open?{" "}
          <a
            href="/#contact"
            className="font-semibold text-secondary underline-offset-4 transition-colors duration-150 hover:text-secondary/80 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded-sm"
          >
            Get in touch
          </a>{" "}
          and we will save you a slot.
        </motion.p>
      </div>
    </main>
  );
}

/**
 * Single event card — date block, details and a link to the event website
 */
function EventCard({ event }: { event: TradeFairEvent }) {
  return (
    <article
      className={cn(
        "group relative flex flex-col gap-6 p-6 md:flex-row md:gap-8 md:p-8",
        "rounded-[32px] md:rounded-[40px]",
        "bg-base-200/30 backdrop-blur-sm",
        "border border-white/5",
        "shadow-card transition-shadow duration-300",
        "hover:shadow-card-hover",
      )}
    >
      <DateBlock event={event} />

      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-secondary">
            <span
              className="h-1.5 w-1.5 rounded-full bg-secondary"
              aria-hidden="true"
            />
            We will be there
          </span>

          {event.edition ? (
            <span className="text-xs font-semibold uppercase tracking-wider text-accent/80">
              {event.edition}
            </span>
          ) : null}
        </div>

        <div>
          <h3 className="text-xl font-bold md:text-2xl">{event.name}</h3>

          <p className="mt-2 flex items-center gap-2 text-sm font-medium text-secondary/90">
            <PinIcon />
            {event.city}, {event.country}
          </p>
        </div>

        <p className="text-sm leading-relaxed text-base-content/80 md:text-base">
          {event.description}
        </p>

        <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
          {event.topics.map((topic) => (
            <li
              key={topic}
              className="rounded-full border border-secondary/20 bg-secondary/5 px-3 py-1 text-xs font-medium text-secondary/90"
            >
              {topic}
            </li>
          ))}
        </ul>

        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex w-fit items-center gap-2 rounded-full px-1 py-1 text-sm font-semibold text-secondary",
            "transition-[color,transform] duration-150",
            "hover:text-secondary/80 hover:translate-x-0.5",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary",
          )}
        >
          Event website
          <ArrowUpRightIcon />
          <span className="sr-only">{event.name} — opens in a new tab</span>
        </a>
      </div>
    </article>
  );
}

/**
 * Highlighted date block (days / month / year)
 */
function DateBlock({ event }: { event: TradeFairEvent }) {
  return (
    <time
      dateTime={event.startDate}
      className={cn(
        "flex shrink-0 items-baseline gap-3 self-start",
        "rounded-3xl border border-secondary/30 bg-secondary/10 px-5 py-4",
        "md:w-32 md:flex-col md:items-center md:gap-1 md:text-center",
      )}
    >
      <span className="text-2xl font-bold leading-none text-secondary md:text-3xl">
        {event.days}
      </span>
      <span className="text-sm font-semibold uppercase tracking-wider text-secondary/90">
        {event.month}
      </span>
      <span className="text-xs font-medium text-accent/70">{event.year}</span>
    </time>
  );
}

function PinIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M2 8L8 2M8 2H3.5M8 2V6.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
