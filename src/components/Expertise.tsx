import { cn } from "../lib/utils";
import {
  BlockchainIcon,
  DatabaseIcon,
  DevOpsIcon,
  EdaIcon,
  EngineeringIcon,
  FrontendIcon,
  PythonIcon,
  SecurityIcon,
} from "./icons";
import { CometEffect } from "./ui";
import { useScrollAnimation } from "../hooks";

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
  {
    title: "Modern Frontend",
    description:
      "We build production-grade web applications using Next.js, Nuxt, Vue 3, and React with TypeScript. Our teams manage large Turborepo monorepos with 15+ internal packages, deliver Playwright E2E test suites across multiple browser engines, and integrate component libraries such as Radix UI and Reka UI.",
    icon: <FrontendIcon className="w-48 h-48 md:w-60 md:h-60" />,
  },
  {
    title: "Python & Automation",
    description:
      "From CLI and TUI wallets powered by Textual and Typer to Cython bindings bridging C++ performance into Python, we deliver robust automation tooling. We use Poetry for reproducible environments, pytest for comprehensive test coverage, and integrate ML pipelines with OLLAMA for semantic search and data processing.",
    icon: <PythonIcon className="w-48 h-48 md:w-60 md:h-60" />,
  },
  {
    title: "Security & Cryptography",
    description:
      "Security is a first-class concern in everything we ship. We developed Beekeeper — a standalone key management daemon with session isolation — and built the MetaMask Snap for Hive, deriving keys via BIP44 and passing a Hacken security audit. Our libraries implement AES-256 encryption, WebWorker isolation, and hierarchical authority models.",
    icon: <SecurityIcon className="w-48 h-48 md:w-60 md:h-60" />,
  },
  {
    title: "DevOps & Infrastructure",
    description:
      "We maintain Docker-based multi-stage build pipelines and GitLab CI/CD workflows for continuous delivery across all our projects. We compile C++ and TypeScript libraries to WebAssembly via Emscripten, enabling high-performance browser runtimes, and run automated cross-browser test matrices to guarantee reliability at every release.",
    icon: <DevOpsIcon className="w-48 h-48 md:w-60 md:h-60" />,
  },
];

export function Expertise() {
  const { ref, is_visible } = useScrollAnimation<HTMLElement>();

  return (
    <section
      ref={ref}
      id="expertise"
      className="relative min-h-screen flex items-center py-16 md:py-24 lg:py-32 px-4"
    >
      <div className="w-full">
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16">
          <span
            className={cn(
              "text-secondary font-medium tracking-wider uppercase text-xs md:text-sm block mb-2 md:mb-4",
              "fade-up",
              is_visible && "is-visible"
            )}
          >
            What We Do
          </span>

          <h2
            className={cn(
              "text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 md:mb-6 drop-shadow-lg",
              "fade-up stagger-1",
              is_visible && "is-visible"
            )}
          >
            Our{" "}
            <span className="text-secondary">
              Expertise
            </span>
          </h2>

          <p
            className={cn(
              "text-base md:text-lg text-base-content/70 leading-relaxed max-w-2xl mx-auto",
              "fade-up stagger-2",
              is_visible && "is-visible"
            )}
          >
            Delivering cutting-edge solutions across multiple technology domains
            with deep knowledge and years of hands-on experience.
          </p>
        </div>

        {/* Grid — 1 column mobile, 2 columns md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {EXPERTISE_ITEMS.map((item, index) => (
            <ExpertiseCard
              key={item.title}
              {...item}
              index={index}
              is_visible={is_visible}
            />
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-12 md:mt-16 text-center">
          <a
            href="#works"
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-full",
              "bg-secondary text-secondary-content font-medium",
              "shadow-lg",
              "transition-all duration-300",
              "hover:bg-secondary/90 hover:gap-3 hover:shadow-xl",
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
        </div>
      </div>
      </div>
    </section>
  );
}

interface ExpertiseCardProps extends ExpertiseItem {
  index: number;
  is_visible: boolean;
}

function ExpertiseCard({
  title,
  description,
  icon,
  index,
  is_visible,
}: ExpertiseCardProps) {
  // Stagger classes cycle through stagger-3..stagger-6 to stay within CSS-defined range
  const stagger_class = `stagger-${((index % 4) + 3) as 3 | 4 | 5 | 6}`;

  return (
    <div
      className={cn(
        "relative p-4 md:p-6 rounded-2xl",
        "bg-base-200/30 backdrop-blur-sm",
        "border border-white/5",
        "shadow-card",
        "transition-shadow duration-300",
        "hover:shadow-card-hover",
        "fade-up",
        stagger_class,
        is_visible && "is-visible"
      )}
    >
      <CometEffect />

      {/* Header: Icon + Title/Description */}
      <div className="flex items-start gap-5 relative z-10">
        <div className="flex-shrink-0 text-secondary">
          {icon}
        </div>
        <div className="pt-2">
          <h3 className="text-xl md:text-2xl font-bold mb-3">
            {title}
          </h3>
          <p className="text-sm md:text-base text-base-content/60 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
