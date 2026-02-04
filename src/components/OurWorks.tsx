import { cn } from "../lib/utils";
import { BlockchainIcon, EdaIcon, EngineeringIcon, DatabaseIcon } from "./icons";

interface Project {
  title: string;
  description: string;
  url?: string;
}

interface ProjectSection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  projects: Project[];
}

const SECTIONS: ProjectSection[] = [
  {
    id: "blockchain",
    title: "Blockchain & Crypto",
    subtitle: "Decentralized solutions powering the future of finance and social media",
    description:
      "Experience dating back to 2014 with Keyhotee. Specializing in Hive blockchain with custom framework handling thousands of transactions per second.",
    icon: <BlockchainIcon className="w-12 h-12" />,
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
    description:
      "Over a dozen years developing HDL compiler, simulation and advanced debugging tools for large scale System Verilog models. Development of CAD & CAE software used at design and verification processes at biggest engineering companies worldwide.",
    icon: <EdaIcon className="w-12 h-12" />,
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
    description:
      "Experienced in RDBMS and modern non-SQL databases like RocksDB and Neo4J, offering critical write throughput and efficient object traversal.",
    icon: <DatabaseIcon className="w-12 h-12" />,
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
  return (
    <section
      id="works"
      className="relative py-16 md:py-24 lg:py-32 px-4 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16">
          <span
            className="text-secondary font-medium tracking-wider uppercase text-xs md:text-sm block mb-2 md:mb-4"
          >
            Portfolio
          </span>

          <h2
            className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 md:mb-6 drop-shadow-lg"
          >
            Our{" "}
            <span className="text-secondary drop-shadow-[0_0_30px_rgba(56,189,248,0.3)]">
              Works
            </span>
          </h2>

          <p
            className="text-base md:text-lg text-base-content/70 leading-relaxed max-w-2xl mx-auto"
          >
            Explore our portfolio of cutting-edge projects across blockchain,
            EDA, engineering, and database technologies.
          </p>
        </div>

        {/* Project sections */}
        <div className="space-y-12 md:space-y-16">
          {SECTIONS.map((section) => (
            <ProjectSectionBlock
              key={section.id}
              section={section}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface ProjectSectionBlockProps {
  section: ProjectSection;
}

function ProjectSectionBlock({ section }: ProjectSectionBlockProps) {
  return (
    <div
      className={cn(
        "group/section relative p-4 md:p-6 rounded-2xl",
        "bg-base-200/30 backdrop-blur-sm",
        "border border-white/5",
        "shadow-card",
        "transition-all duration-300",
        "hover:bg-base-200/50 hover:border-secondary/20",
        "hover:shadow-card-hover"
      )}
    >
      {/* Section header */}
      <div className="flex items-start gap-5 mb-6">
        <div className="flex-shrink-0 text-secondary transition-transform duration-300 group-hover/section:scale-105">
          {section.icon}
        </div>
        <div className="pt-1">
          <h3 className={cn(
            "text-xl md:text-2xl font-bold mb-2",
            "transition-colors duration-300",
            "group-hover/section:text-secondary"
          )}>
            {section.title}
          </h3>
          <p className="text-sm text-base-content/60 mb-2">{section.subtitle}</p>
          <p className="text-sm md:text-base text-base-content/60 leading-relaxed">
            {section.description}
          </p>
        </div>
      </div>

      {/* Projects grid */}
      <div
        className={cn(
          "grid gap-4",
          section.projects.length === 3
            ? "grid-cols-1 md:grid-cols-3"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        )}
      >
        {section.projects.map((project) => (
          <ProjectCard
            key={project.title}
            {...project}
          />
        ))}
      </div>

      {/* Accent line */}
      <div
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 rounded-full",
          "bg-secondary transition-all duration-300",
          "group-hover/section:h-1/3"
        )}
      />
    </div>
  );
}

interface ProjectCardProps extends Project {}

function ProjectCard({ title, description, url }: ProjectCardProps) {
  return (
    <article
      className={cn(
        "group relative p-4 rounded-xl h-full flex flex-col",
        "bg-base-100/50 border border-white/5",
        "shadow-blue-sm",
        "transition-all duration-300",
        "hover:bg-base-100/70 hover:border-secondary/20",
        "hover:shadow-blue-md",
        "hover:-translate-y-1"
      )}
    >
      <div className="relative z-10 flex flex-col h-full">
        <h4 className="text-base font-bold mb-2 group-hover:text-secondary transition-colors">
          {title}
        </h4>

        <p className="text-sm text-base-content/60 leading-relaxed mb-3 flex-grow">
          {description}
        </p>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 text-sm font-medium",
              "text-secondary hover:text-secondary/80",
              "transition-all duration-300"
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
    </article>
  );
}
