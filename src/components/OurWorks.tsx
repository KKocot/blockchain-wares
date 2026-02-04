import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "../lib/utils";
import type { Transition } from "framer-motion";

interface Project {
  title: string;
  description: string;
  url?: string;
}

interface ProjectSection {
  id: string;
  title: string;
  subtitle: string;
  projects: Project[];
}

const SECTIONS: ProjectSection[] = [
  {
    id: "blockchain",
    title: "Blockchain & Crypto",
    subtitle: "Decentralized solutions powering the future of finance and social media",
    projects: [
      {
        title: "Hive Blockchain",
        description:
          "Hive has redefined social media by building a living, breathing, and growing social economy - a community where users are rewarded for sharing their voice. It's a new kind of attention economy.",
        url: "https://hive.blog",
      },
      {
        title: "BlockTrades",
        description:
          "BlockTrades enables users to rapidly and safely purchase cryptocurrencies without the hassles typically associated with purchasing through a centralized cryptocurrency exchange.",
      },
      {
        title: "BEOS Blockchain",
        description:
          "This project implemented unique and unheard of ideas in the blockchain world. Location-dependent rules of operation, automatically adjusted to current requirements.",
      },
      {
        title: "Peerplays",
        description:
          "The first decentralized global betting platform, using Graphene technology and Delegated Proof of Stake (DPoS) to provide the fastest, most decentralized blockchain consensus model.",
        url: "https://www.peerplays.com/",
      },
    ],
  },
  {
    id: "eda-engineering",
    title: "EDA & Engineering",
    subtitle: "Electronic design automation tools and simulation software",
    projects: [
      {
        title: "SynaptiCAD - Verilogger",
        description:
          "SynaptiCAD Verilogger Extreme bundle consists of a HDL GUI debugger (BugHunter Pro) and a command-line based Verilog compiler (simx).",
        url: "http://www.syncad.com/vlg_verilog_compiler_simulator.htm",
      },
      {
        title: "SynaptiCAD - BugHunter Pro",
        description:
          "Graphical Debugging for Verilog, VHDL, and C++ simulators.",
        url: "http://www.syncad.com/vhdl_verilog_debugger.htm",
      },
      {
        title: "SynaptiCAD - Test Bench Generators",
        description:
          "TestBencher Pro is a graphical test bench generator that dramatically reduces the time required to create and maintain test benches for VHDL and Verilog.",
        url: "http://www.syncad.com/testbencher_verilog_vhdl_testbench_generator.htm",
      },
      {
        title: "ModelCenter Integrate",
        description:
          "ModelCenter Integrate increases productivity by enabling users to execute significantly more simulations with less time and resources.",
      },
    ],
  },
  {
    id: "data-systems",
    title: "Data Systems",
    subtitle: "Database solutions and data center infrastructure management",
    projects: [
      {
        title: "RDBMS - WSMS",
        description:
          "Data access and business logic layers being foundations of Workstation Management System (WSMS) owned by Prointegra company.",
        url: "http://www.prointegra.com.pl/system-wsms/",
      },
      {
        title: "NonSQL DB Engine",
        description:
          "Unique engine allowing to model extensible user defined entities. Used in MetaModel Base and Uptime-DC products.",
        url: "http://www.prointegra.com.pl/714-2/",
      },
      {
        title: "Uptime-DC",
        description:
          "Comprehensive data center infrastructure management system for monitoring and controlling critical facilities.",
        url: "http://uptime-dc.com/",
      },
    ],
  },
];

/**
 * Our Works section component
 * Displays projects grouped into 3 distinct sections
 * Features:
 * - Section-based grouping (no tabs)
 * - Responsive grid layout
 * - Scroll-triggered animations per section
 * - Staggered card animations
 * - Hover effects on project cards
 */
export function OurWorks() {
  const section_ref = useRef<HTMLDivElement>(null);
  const is_in_view = useInView(section_ref, { once: true, amount: 0.05 });

  const transition: Transition = {
    duration: 0.5,
    ease: [0.6, -0.05, 0.01, 0.99] as [number, number, number, number],
  };

  return (
    <section
      id="works"
      ref={section_ref}
      className="py-20 px-4 md:py-32 bg-base-100"
    >
      <div className="max-w-7xl mx-auto">
        {/* Main heading */}
        <motion.div
          className="text-center mb-16 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={is_in_view ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={transition}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Works</h2>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Explore our portfolio of cutting-edge projects across blockchain,
            EDA, engineering, and database technologies
          </p>
        </motion.div>

        {/* Project sections */}
        <div className="space-y-20 md:space-y-28">
          {SECTIONS.map((section, section_index) => (
            <ProjectSectionBlock
              key={section.id}
              section={section}
              delay={section_index * 0.15}
              transition={transition}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface ProjectSectionBlockProps {
  section: ProjectSection;
  delay: number;
  transition: Transition;
}

function ProjectSectionBlock({ section, delay, transition }: ProjectSectionBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const is_in_view = useInView(ref, { once: true, amount: 0.2 });

  const container_variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: delay,
      },
    },
  };

  const card_variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition,
    },
  };

  return (
    <div ref={ref}>
      {/* Section header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={is_in_view ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        transition={{ ...transition, delay }}
      >
        <h3 className="text-2xl md:text-3xl font-bold mb-2">{section.title}</h3>
        <p className="text-base-content/60">{section.subtitle}</p>
      </motion.div>

      {/* Projects grid */}
      <motion.div
        className={cn(
          "grid gap-6",
          section.projects.length === 3
            ? "grid-cols-1 md:grid-cols-3"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        )}
        variants={container_variants}
        initial="hidden"
        animate={is_in_view ? "visible" : "hidden"}
      >
        {section.projects.map((project) => (
          <ProjectCard key={project.title} {...project} variants={card_variants} />
        ))}
      </motion.div>
    </div>
  );
}

interface ProjectCardProps extends Project {
  variants: {
    hidden: { opacity: number; y: number };
    visible: {
      opacity: number;
      y: number;
      transition: Transition;
    };
  };
}

function ProjectCard({ title, description, url, variants }: ProjectCardProps) {
  return (
    <motion.article
      className={cn(
        "group relative p-6 rounded-2xl h-full flex flex-col",
        "bg-base-300 border border-base-300",
        "transition-all duration-300",
        "hover:shadow-xl hover:shadow-secondary/20",
        "hover:border-secondary/50"
      )}
      variants={variants}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative z-10 flex flex-col h-full">
        <h4 className="text-lg font-bold mb-3 group-hover:text-secondary transition-colors">
          {title}
        </h4>

        <p className="text-sm text-base-content/70 leading-relaxed mb-4 flex-grow">
          {description}
        </p>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 text-sm font-medium",
              "text-secondary hover:text-secondary/90",
              "transition-all duration-300",
              "group-hover:gap-3"
            )}
            aria-label={`Learn more about ${title}`}
          >
            Learn more
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        )}
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
    </motion.article>
  );
}
