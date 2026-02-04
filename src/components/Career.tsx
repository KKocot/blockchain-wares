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
      className="py-20 px-4 md:py-32 bg-base-100"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={is_in_view ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={transition}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Join Our Team
          </h2>
          <p className="text-lg text-base-content/70 max-w-3xl mx-auto leading-relaxed">
            We're constantly looking for ambitious developers willing to take on
            tough cases in productive environment. At the moment we have opened
            positions for:
          </p>
        </motion.div>

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
        "group relative flex flex-col p-8 rounded-2xl",
        "bg-base-300 border border-base-300",
        "transition-all duration-300",
        "hover:scale-[1.03] hover:shadow-xl hover:shadow-secondary/20",
        "hover:border-secondary/50"
      )}
      variants={variants}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative z-10 flex-1">
        <h3 className="text-2xl font-bold mb-4">{title}</h3>

        <p className="text-base-content/70 leading-relaxed mb-6">
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

      <div
        className={cn(
          "absolute inset-0 rounded-2xl opacity-0",
          "bg-gradient-to-br from-secondary/5 to-transparent",
          "transition-opacity duration-300",
          "group-hover:opacity-100",
          "pointer-events-none"
        )}
      />
    </motion.div>
  );
}
