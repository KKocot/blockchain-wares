import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "../lib/utils";
import type { Transition } from "framer-motion";
import { BlockchainIcon, DatabaseIcon, EdaIcon, EngineeringIcon } from "./icons";

interface ExpertiseItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const EXPERTISE_ITEMS: ExpertiseItem[] = [
  {
    title: "Blockchain",
    description:
      "Our first experience with blockchain technology dates back to 2014 when Keyhotee project started. By now the Hive blockchain related development is our main focus. Our in-house developed framework offers broad customization capabilities and impressive performance, leading to handling thousands of transactions per second, exceptionally short block generation times and various integration methods to traditional data sources.",
    icon: <BlockchainIcon className="w-48 h-48 md:w-60 md:h-60" />,
  },
  {
    title: "EDA",
    description:
      "The most complex system we have been developing for more than a dozen years now is a set of HDL compiler, simulation and advanced debugging tools which allow design and verification of large scale System Verilog models. The system is provided to our direct customers and remains under continuous development.",
    icon: <EdaIcon className="w-48 h-48 md:w-60 md:h-60" />,
  },
  {
    title: "Engineering",
    description:
      "We are involved in development of CAD & CAE software, being used at design, verification and simulation processes. These enterprise-grade tools are deployed at biggest engineering and aviation companies in the world, meeting the highest industry standards.",
    icon: <EngineeringIcon className="w-48 h-48 md:w-60 md:h-60" />,
  },
  {
    title: "Databases",
    description:
      "We are experienced in developing solutions based on both traditional RDBMS and modern high performance oriented non-SQL databases like RocksDB and Neo4J offering critical write throughput and most efficient object traversal, very useful at solving complex social network analysis problems.",
    icon: <DatabaseIcon className="w-48 h-48 md:w-60 md:h-60" />,
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
            className="text-base md:text-lg text-base-content/70 leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={is_in_view ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ ...transition, delay: 0.2 }}
          >
            Delivering cutting-edge solutions across multiple technology domains
            with deep knowledge and years of hands-on experience.
          </motion.p>
        </div>

        {/* Lista */}
        <div className="space-y-6 md:space-y-8">
          {EXPERTISE_ITEMS.map((item, index) => (
            <ExpertiseCard
              key={item.title}
              {...item}
              index={index}
              is_in_view={is_in_view}
              transition={transition}
            />
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          className="mt-12 md:mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={is_in_view ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ ...transition, delay: 0.6 }}
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
    </section>
  );
}

interface ExpertiseCardProps extends ExpertiseItem {
  index: number;
  is_in_view: boolean;
  transition: Transition;
}

function ExpertiseCard({
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
        "group relative p-4 md:p-6 rounded-2xl",
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
      {/* Header: Icon + Title/Description */}
      <div className="flex items-start gap-5">
        <div className="flex-shrink-0 text-secondary transition-transform duration-300 group-hover:scale-105">
          {icon}
        </div>
        <div className="pt-2">
          <h3
            className={cn(
              "text-xl md:text-2xl font-bold mb-3",
              "transition-colors duration-300",
              "group-hover:text-secondary"
            )}
          >
            {title}
          </h3>
          <p className="text-sm md:text-base text-base-content/60 leading-relaxed">
            {description}
          </p>
        </div>
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
