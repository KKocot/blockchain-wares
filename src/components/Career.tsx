import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "../lib/utils";
import { Button } from "./ui";
import type { Transition } from "framer-motion";

interface JobPosition {
  title: string;
  description: string;
}

const JOB_POSITIONS: JobPosition[] = [
  {
    title: "Frontend Developers",
    description:
      "Experienced in JavaScript programming, Angular framework and NodeJS platform.",
  },
  {
    title: "C++ Developers",
    description:
      "Who want to work on cutting edge technologies at solving interesting and non-trite problems, giving a lot of satisfaction for each good engineer.",
  },
  {
    title: "Any Good Engineer",
    description:
      "Having an opened mind and good motivation, which would like to join us.",
  },
];

/**
 * Career section component
 * Displays job openings with scroll-triggered animations
 */
export function Career() {
  const section_ref = useRef<HTMLDivElement>(null);
  const is_in_view = useInView(section_ref, { once: true, amount: 0.2 });

  const transition: Transition = {
    duration: 0.5,
    ease: [0.6, -0.05, 0.01, 0.99] as [number, number, number, number],
  };

  const container_variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const card_variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition,
    },
  };

  return (
    <section
      id="career"
      ref={section_ref}
      className="relative py-16 md:py-24 lg:py-32 px-4 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.span
            className="text-secondary font-medium tracking-wider uppercase text-xs md:text-sm block mb-2 md:mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={is_in_view ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
            transition={transition}
          >
            We're Hiring
          </motion.span>

          <motion.h2
            className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 md:mb-6 drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={is_in_view ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ ...transition, delay: 0.1 }}
          >
            Join Our{" "}
            <span className="text-secondary drop-shadow-[0_0_30px_rgba(56,189,248,0.3)]">
              Team
            </span>
          </motion.h2>

          <motion.p
            className="text-base md:text-lg text-base-content/70 leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={is_in_view ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ ...transition, delay: 0.2 }}
          >
            We're constantly looking for ambitious developers willing to take on
            tough cases in productive environment. At the moment we have opened
            positions for:
          </motion.p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={container_variants}
          initial="hidden"
          animate={is_in_view ? "visible" : "hidden"}
        >
          {JOB_POSITIONS.map((position) => (
            <JobPositionCard key={position.title} {...position} variants={card_variants} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

interface JobPositionCardProps extends JobPosition {
  variants: {
    hidden: { opacity: number; y: number };
    visible: {
      opacity: number;
      y: number;
      transition: Transition;
    };
  };
}

/**
 * Individual job position card with hover effects
 */
function JobPositionCard({
  title,
  description,
  variants,
}: JobPositionCardProps) {
  const handle_apply = () => {
    const contact_section = document.getElementById("contact");
    if (contact_section) {
      contact_section.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "mailto:contact@blockchainwares.pl";
    }
  };

  return (
    <motion.div
      className={cn(
        "group relative flex flex-col p-6 md:p-8 rounded-2xl",
        "bg-base-200/30 backdrop-blur-sm",
        "border border-white/5",
        "shadow-lg shadow-black/20",
        "transition-all duration-300",
        "hover:bg-base-200/50 hover:border-secondary/20",
        "hover:shadow-xl hover:shadow-secondary/10",
        "hover:-translate-y-1"
      )}
      variants={variants}
    >
      <div className="relative z-10 flex-1">
        <h3 className={cn(
          "text-xl md:text-2xl font-bold mb-3",
          "transition-colors duration-300",
          "group-hover:text-secondary"
        )}>
          {title}
        </h3>

        <p className="text-sm md:text-base text-base-content/60 leading-relaxed mb-6">
          {description}
        </p>
      </div>

      <div className="relative z-10 mt-auto">
        <Button
          variant="outline"
          size="md"
          className="w-full"
          onClick={handle_apply}
        >
          Apply Now
        </Button>
      </div>

      {/* Accent line */}
      <div
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 rounded-full",
          "bg-secondary transition-all duration-300",
          "group-hover:h-1/3"
        )}
      />
    </motion.div>
  );
}
