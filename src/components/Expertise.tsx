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
    icon: <BlockchainIcon className="w-full h-full" />,
  },
  {
    title: "EDA",
    description:
      "The most complex system we have been developing for more than a dozen years now is a set of HDL compiler, simulation and advanced debugging tools which allow design and verification of large scale System Verilog models. The system is provided to our direct customers and remains under continuous development.",
    icon: <EdaIcon className="w-full h-full" />,
  },
  {
    title: "Engineering",
    description:
      "We are involved in development of CAD & CAE software, being used at design, verification and simulation processes. These enterprise-grade tools are deployed at biggest engineering and aviation companies in the world, meeting the highest industry standards.",
    icon: <EngineeringIcon className="w-full h-full" />,
  },
  {
    title: "Databases",
    description:
      "We are experienced in developing solutions based on both traditional RDBMS and modern high performance oriented non-SQL databases like RocksDB and Neo4J offering critical write throughput and most efficient object traversal, very useful at solving complex social network analysis problems.",
    icon: <DatabaseIcon className="w-full h-full" />,
  },
  {
    title: "Modern Frontend",
    description:
      "We build production-grade web applications using Next.js, Nuxt, Vue 3, and React with TypeScript. Our teams manage large Turborepo monorepos with 15+ internal packages, deliver Playwright E2E test suites across multiple browser engines, and integrate component libraries such as Radix UI and Reka UI.",
    icon: <FrontendIcon className="w-full h-full" />,
  },
  {
    title: "Python & Automation",
    description:
      "From CLI and TUI wallets powered by Textual and Typer to Cython bindings bridging C++ performance into Python, we deliver robust automation tooling. We use Poetry for reproducible environments, pytest for comprehensive test coverage, and integrate ML pipelines with OLLAMA for semantic search and data processing.",
    icon: <PythonIcon className="w-full h-full" />,
  },
  {
    title: "Security & Cryptography",
    description:
      "Security is a first-class concern in everything we ship. We developed Beekeeper — a standalone key management daemon with session isolation — and built the MetaMask Snap for Hive, deriving keys via BIP44 and passing a Hacken security audit. Our libraries implement AES-256 encryption, WebWorker isolation, and hierarchical authority models.",
    icon: <SecurityIcon className="w-full h-full" />,
  },
  {
    title: "DevOps & Infrastructure",
    description:
      "We maintain Docker-based multi-stage build pipelines and GitLab CI/CD workflows for continuous delivery across all our projects. We compile C++ and TypeScript libraries to WebAssembly via Emscripten, enabling high-performance browser runtimes, and run automated cross-browser test matrices to guarantee reliability at every release.",
    icon: <DevOpsIcon className="w-full h-full" />,
  },
];

export function Expertise() {
  const { ref, is_visible } = useScrollAnimation<HTMLElement>();

  return (
    <section
      ref={ref}
      id="expertise"
      className="relative py-16 md:py-24 lg:py-32 px-4"
    >
      <div className="w-full">
      <div className="relative z-10 max-w-7xl mx-auto w-full">
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
              "text-base md:text-lg text-base-content/80 leading-relaxed max-w-2xl mx-auto",
              "fade-up stagger-2",
              is_visible && "is-visible"
            )}
          >
            Delivering cutting-edge solutions across multiple technology domains
            with deep knowledge and years of hands-on experience.
          </p>
        </div>

        {/* Grid — 1 column mobile, 2 columns md, 3 columns lg+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXPERTISE_ITEMS.map((item, index) => (
            <ExpertiseCard
              key={item.title}
              {...item}
              index={index}
              is_visible={is_visible}
            />
          ))}
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
        "relative p-5 md:p-6",
        "fade-up",
        stagger_class,
        is_visible && "is-visible"
      )}
    >
      <div
        className="absolute inset-0 -m-6 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 60% at 25% 35%, rgba(255,255,255,0.05) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 70% 70%, rgba(78,180,255,0.03) 0%, transparent 60%)" }}
      />
      <div className="relative">
        <div className="float-right ml-4 mb-2 w-32 h-32 md:w-36 md:h-36 text-secondary [filter:drop-shadow(0_0_12px_oklch(72%_0.17_220/0.25))]">
          {icon}
        </div>
        <h3 className="text-lg md:text-xl font-bold mb-2 text-secondary">
          {title}
        </h3>
        <p className="text-sm text-base-content/90 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
