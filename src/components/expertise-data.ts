import type { ReactNode } from "react";
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
import { createElement } from "react";

export interface ExpertiseItem {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
}

export const EXPERTISE_ITEMS: ExpertiseItem[] = [
  {
    id: "blockchain",
    title: "Blockchain",
    description:
      "Our first experience with blockchain technology dates back to 2014 when Keyhotee project started. By now the Hive blockchain related development is our main focus. Our in-house developed framework offers broad customization capabilities and impressive performance, leading to handling thousands of transactions per second, exceptionally short block generation times and various integration methods to traditional data sources.",
    icon: createElement(BlockchainIcon, { className: "w-full h-full" }),
  },
  {
    id: "eda",
    title: "EDA",
    description:
      "The most complex system we have been developing for more than a dozen years now is a set of HDL compiler, simulation and advanced debugging tools which allow design and verification of large scale System Verilog models. The system is provided to our direct customers and remains under continuous development.",
    icon: createElement(EdaIcon, { className: "w-full h-full" }),
  },
  {
    id: "engineering",
    title: "Engineering",
    description:
      "We are involved in development of CAD & CAE software, being used at design, verification and simulation processes. These enterprise-grade tools are deployed at biggest engineering and aviation companies in the world, meeting the highest industry standards.",
    icon: createElement(EngineeringIcon, { className: "w-full h-full" }),
  },
  {
    id: "databases",
    title: "Databases",
    description:
      "We are experienced in developing solutions based on both traditional RDBMS and modern high performance oriented non-SQL databases like RocksDB and Neo4J offering critical write throughput and most efficient object traversal, very useful at solving complex social network analysis problems.",
    icon: createElement(DatabaseIcon, { className: "w-full h-full" }),
  },
  {
    id: "frontend",
    title: "Modern Frontend",
    description:
      "We build production-grade web applications using Next.js, Nuxt, Vue 3, and React with TypeScript. Our teams manage large Turborepo monorepos with 15+ internal packages, deliver Playwright E2E test suites across multiple browser engines, and integrate component libraries such as Radix UI and Reka UI.",
    icon: createElement(FrontendIcon, { className: "w-full h-full" }),
  },
  {
    id: "python",
    title: "Python & Automation",
    description:
      "From CLI and TUI wallets powered by Textual and Typer to Cython bindings bridging C++ performance into Python, we deliver robust automation tooling. We use Poetry for reproducible environments, pytest for comprehensive test coverage, and integrate ML pipelines with OLLAMA for semantic search and data processing.",
    icon: createElement(PythonIcon, { className: "w-full h-full" }),
  },
  {
    id: "security",
    title: "Security & Cryptography",
    description:
      "Security is a first-class concern in everything we ship. We developed Beekeeper — a standalone key management daemon with session isolation — and built the MetaMask Snap for Hive, deriving keys via BIP44 and passing a Hacken security audit. Our libraries implement AES-256 encryption, WebWorker isolation, and hierarchical authority models.",
    icon: createElement(SecurityIcon, { className: "w-full h-full" }),
  },
  {
    id: "devops",
    title: "DevOps & Infrastructure",
    description:
      "We maintain Docker-based multi-stage build pipelines and GitLab CI/CD workflows for continuous delivery across all our projects. We compile C++ and TypeScript libraries to WebAssembly via Emscripten, enabling high-performance browser runtimes, and run automated cross-browser test matrices to guarantee reliability at every release.",
    icon: createElement(DevOpsIcon, { className: "w-full h-full" }),
  },
];

/**
 * Lookup map for fast `id` -> ExpertiseItem access.
 * Used by ContentPanel/SectionNav to render expertise badges from `expertise_ids`.
 */
export const EXPERTISE_BY_ID: Record<string, ExpertiseItem> =
  EXPERTISE_ITEMS.reduce<Record<string, ExpertiseItem>>((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
