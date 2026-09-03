import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { EventCard } from "./EventCard";
import {
  group_events_by_status,
  parse_iso_day,
  type EventStatus,
  type TradeFairEvent,
} from "./events-data";

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

const SECTION_ORDER: EventStatus[] = ["ongoing", "upcoming", "past"];

const SECTION_HEADINGS: Record<
  EventStatus,
  { lead: string; accent: string; accent_class: string }
> = {
  ongoing: { lead: "Happening", accent: "now", accent_class: "text-success" },
  upcoming: {
    lead: "Upcoming",
    accent: "events",
    accent_class: "text-secondary",
  },
  past: { lead: "Past", accent: "events", accent_class: "text-info" },
};

interface EventSection {
  status: EventStatus;
  events: TradeFairEvent[];
  /** Stagger position of the section heading in the page-wide entrance sequence */
  motion_index: number;
}

interface MarketsProps {
  /** Build-time local day (`YYYY-MM-DD`), corrected to the visitor's day after mount */
  todayIso: string;
}

/**
 * Markets page content — trade fairs and conferences we attend
 * plus the workshops we host ourselves.
 * Splits events into ongoing / upcoming / past against the current day.
 */
export function Markets({ todayIso }: MarketsProps) {
  const prefers_reduced_motion = useReducedMotion();
  const [now, set_now] = useState(() => parse_iso_day(todayIso));
  // useReducedMotion() is null on the server, so the preference may only be applied after mount
  const [is_hydrated, set_is_hydrated] = useState(false);

  useEffect(() => {
    set_now(new Date());
    set_is_hydrated(true);
  }, []);

  const variants =
    is_hydrated && prefers_reduced_motion ? STATIC_VARIANTS : MOTION_VARIANTS;

  const sections = useMemo(() => build_sections(now), [now]);
  const outro_index = sections.reduce(
    (total, section) => total + section.events.length + 1,
    1,
  );
  const outro =
    sections.length === 0
      ? {
          lead: "Nothing is on our calendar right now. ",
          tail: " and we will let you know where to find us next.",
        }
      : {
          lead: "Want to book a meeting before the doors open? ",
          tail: " and we will save you a slot.",
        };

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
            We travel across Europe for industry trade fairs and conferences,
            and we run workshops of our own along the way. Catch us on site to
            discuss blockchain infrastructure, engineering tooling or a project
            of your own.
          </p>
        </motion.header>

        {sections.map((section) => (
          <section
            key={section.status}
            aria-labelledby={`${section.status}-events-heading`}
            className="mb-12 last:mb-0 md:mb-16"
          >
            <motion.h2
              custom={section.motion_index}
              variants={variants}
              initial="hidden"
              animate="visible"
              id={`${section.status}-events-heading`}
              className="mb-6 text-xl font-bold md:mb-8 md:text-2xl"
            >
              {SECTION_HEADINGS[section.status].lead}{" "}
              <span className={SECTION_HEADINGS[section.status].accent_class}>
                {SECTION_HEADINGS[section.status].accent}
              </span>
            </motion.h2>

            <ul role="list" className="flex flex-col gap-6 list-none p-0 m-0">
              {section.events.map((event, index) => (
                <motion.li
                  key={event.id}
                  custom={section.motion_index + index + 1}
                  variants={variants}
                  initial="hidden"
                  animate="visible"
                >
                  <EventCard event={event} status={section.status} />
                </motion.li>
              ))}
            </ul>
          </section>
        ))}

        <motion.p
          custom={outro_index}
          variants={variants}
          initial="hidden"
          animate="visible"
          className="mt-12 text-sm text-base-content/80 md:mt-16 md:text-base"
        >
          {outro.lead}
          <a
            href="/#contact"
            className="font-semibold text-secondary underline-offset-4 transition-colors duration-150 hover:text-secondary/80 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded-sm"
          >
            Get in touch
          </a>
          {outro.tail}
        </motion.p>
      </div>
    </main>
  );
}

/** Non-empty status sections in display order, each with its stagger offset */
function build_sections(now: Date): EventSection[] {
  const groups = group_events_by_status(now);
  const sections: EventSection[] = [];
  let motion_index = 1;

  for (const status of SECTION_ORDER) {
    const events = groups[status];

    if (events.length === 0) {
      continue;
    }

    sections.push({ status, events, motion_index });
    motion_index += events.length + 1;
  }

  return sections;
}
