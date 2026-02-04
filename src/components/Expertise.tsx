import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "../lib/utils";
import type { Transition } from "framer-motion";
import { BlockchainIcon, DatabaseIcon, EdaIcon, EngineeringIcon } from "./icons";
import { BlockchainBackground } from "./BlockchainBackground";

interface ExpertiseCard {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const EXPERTISE_CARDS: ExpertiseCard[] = [
  {
    title: "Blockchain",
    description:
      "Experience dating back to 2014 with Keyhotee. Specializing in Hive blockchain with custom framework handling thousands of transactions per second.",
    icon: <BlockchainIcon className="w-full h-32" />,
  },
  {
    title: "EDA",
    description:
      "Over a dozen years developing HDL compiler, simulation and advanced debugging tools for large scale System Verilog models.",
    icon: <EdaIcon className="w-full h-32" />,
  },
  {
    title: "Engineering",
    description:
      "Development of CAD & CAE software used at design and verification processes at biggest engineering companies worldwide.",
    icon: <EngineeringIcon className="w-full h-32" />,
  },
  {
    title: "Databases",
    description:
      "Experienced in RDBMS and modern non-SQL databases like RocksDB and Neo4J, offering critical write throughput and efficient object traversal.",
    icon: <DatabaseIcon className="w-full h-32" />,
  },
];

export function Expertise() {
  const section_ref = useRef<HTMLDivElement>(null);
  const is_in_view = useInView(section_ref, { once: true, amount: 0.2 });

  const transition: Transition = {
    duration: 0.6,
    ease: [0.6, -0.05, 0.01, 0.99] as [number, number, number, number],
  };

  return (
    <section
      id="expertise"
      ref={section_ref}
      className="relative min-h-screen flex items-center py-12 md:py-24 lg:py-32 px-4 overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, oklch(71% 0.143 215.221) 1px, transparent 1px),
              linear-gradient(to bottom, oklch(71% 0.143 215.221) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Blockchain network animation */}
        <BlockchainBackground id="expertise" />
        {/* Gradient orbs */}
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-secondary/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-32 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-start">
          {/* Left column - Text content */}
          <div className="lg:sticky lg:top-32">
            <motion.span
              className="text-secondary font-medium tracking-wider uppercase text-xs md:text-sm block mb-2 md:mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={is_in_view ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={transition}
            >
              What We Do
            </motion.span>

            <motion.h2
              className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 md:mb-6 drop-shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={is_in_view ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ ...transition, delay: 0.1 }}
            >
              Our{" "}
              <span className="text-secondary drop-shadow-[0_0_30px_rgba(56,189,248,0.3)]">
                Expertise
              </span>
            </motion.h2>

            <motion.p
              className="text-base md:text-lg text-base-content/70 leading-relaxed mb-4 md:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={is_in_view ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ ...transition, delay: 0.2 }}
            >
              Delivering cutting-edge solutions across multiple technology domains
              with deep knowledge and years of hands-on experience.
            </motion.p>

            <motion.p
              className="text-sm md:text-base text-base-content/60 leading-relaxed mb-6 md:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={is_in_view ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ ...transition, delay: 0.3 }}
            >
              From blockchain infrastructure to EDA tools, we tackle the most
              demanding engineering challenges with precision and expertise.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={is_in_view ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ ...transition, delay: 0.4 }}
            >
              <a
                href="#works"
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-3 rounded-full",
                  "bg-secondary text-secondary-content font-medium",
                  "shadow-lg shadow-secondary/30",
                  "transition-all duration-300",
                  "hover:bg-secondary/90 hover:gap-3 hover:shadow-xl hover:shadow-secondary/40",
                  "focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-base-100"
                )}
              >
                See Our Work
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                  />
                </svg>
              </a>
            </motion.div>
          </div>

          {/* Right column - Cards in 2x2 grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            {EXPERTISE_CARDS.map((card, index) => (
              <ExpertiseCardComponent
                key={card.title}
                {...card}
                index={index}
                is_in_view={is_in_view}
                transition={transition}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface ExpertiseCardProps extends ExpertiseCard {
  index: number;
  is_in_view: boolean;
  transition: Transition;
}

function ExpertiseCardComponent({
  title,
  description,
  icon,
  index,
  is_in_view,
  transition,
}: ExpertiseCardProps) {
  return (
    <motion.div
      className={cn(
        "group relative flex flex-col p-5 md:p-6 rounded-xl md:rounded-2xl",
        "bg-base-200/30 backdrop-blur-sm",
        "border border-white/5",
        "shadow-lg shadow-black/20",
        "transition-all duration-300",
        "hover:bg-base-200/50 hover:border-secondary/20",
        "hover:shadow-xl hover:shadow-secondary/10",
        "hover:-translate-y-1"
      )}
      initial={{ opacity: 0, y: 30 }}
      animate={is_in_view ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ ...transition, delay: 0.2 + index * 0.1 }}
    >
      {icon && (
        <div className="mb-4 text-secondary transition-transform duration-300 group-hover:scale-105">
          {icon}
        </div>
      )}

      <h3
        className={cn(
          "text-lg md:text-xl font-bold mb-2",
          "transition-colors duration-300",
          "group-hover:text-secondary"
        )}
      >
        {title}
      </h3>

      <p className="text-sm text-base-content/60 leading-relaxed">
        {description}
      </p>

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
