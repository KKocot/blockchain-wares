import { createElement, type ReactNode } from "react";
import { DocsIcon, EngineeringIcon, HiveIcon, SdkIcon } from "./icons";

/** Short URL aliases for tab deep-links: `/?docs` and `/?tab=docs` both open Documentation. */
export const SECTION_SLUGS = [
  "core",
  "hive",
  "sdk",
  "ufa",
  "eos",
  "docs",
  "eda",
  "data",
] as const;

export type SectionSlug = (typeof SECTION_SLUGS)[number];

const SLUG_SET: ReadonlySet<string> = new Set(SECTION_SLUGS);

export function is_section_slug(value: string): value is SectionSlug {
  return SLUG_SET.has(value);
}

export interface Deployment {
  label?: string; // np. "Blog", "Wallet" — opcjonalnie (przy single deployment zwykle pomijane)
  url: string;
}

export interface Project {
  title: string;
  description: string;
  deployments?: Deployment[]; // 1+ live deployments
}

export interface ProjectSection {
  id: string;
  /** Deep-link alias, unique across SECTIONS — enforced by build_id_by_slug(). */
  slug: SectionSlug;
  title: string;
  subtitle: string;
  description: string;
  /**
   * Expertise areas applied in this section.
   * Maps to `id` keys from `EXPERTISE_BY_ID` (see `expertise-data.ts`).
   * Rendered as chip/pill badges at the top of each section.
   */
  expertise_ids: string[];
  /**
   * Optional custom hero icon. When provided, overrides the default icon
   * derived from the first entry in `expertise_ids`.
   */
  custom_icon?: ReactNode;
  projects: Project[];
}

export const SECTIONS: ProjectSection[] = [
  {
    id: "blockchain-core",
    slug: "core",
    title: "Blockchain Core & Infrastructure",
    subtitle: "High-performance blockchain nodes and indexing infrastructure",
    description:
      "Experience dating back to 2014 with Keyhotee. Core contributors to Hive blockchain with over 31,000 commits. Specializing in C++ node development (hived), HAF PostgreSQL-backed indexing handling thousands of TPS, DPoS/Graphene-based platforms (BEOS, Peerplays) with 3-second blocks, and exchange infrastructure (BlockTrades).",
    expertise_ids: ["blockchain", "engineering", "devops"],
    projects: [
      {
        title: "Hive Blockchain",
        description:
          "Hive has redefined social media by building a living, breathing, and growing social economy — a community where users are rewarded for sharing their voice. We are core contributors to hived, the C++ node behind it: 3-second blocks, Delegated Proof of Stake consensus, and free transactions paid for with Resource Credits instead of gas fees. Posts, votes and transfers are written directly to the chain, so the node has to sustain thousands of transactions per second while keeping a complete, replayable history. Our work spans consensus code, node plugins and the serialization layer that feeds HAF — over 31,000 commits across the Hive codebase.",
        deployments: [{ label: "Site", url: "https://hive.io" }],
      },
      {
        title: "HAF — Hive Application Framework",
        description:
          "PostgreSQL-based push-model indexing layer for the Hive blockchain. The sql_serializer plugin streams blocks straight from hived into Postgres and the hive_fork_manager extension rewinds micro-forks on behalf of every app on the server, so application code never has to reason about reversible blocks. Multiple HAF apps share a single database instance and query chain state with plain SQL instead of polling a node API, which means an app can be written in any language with a Postgres driver. It is the foundation the rest of our Hive backend stack — HAfAH, Block Explorer, Balance Tracker, HiveSense — is built on.",
        deployments: [
          { label: "Site", url: "https://tools.openhive.network/haf" },
          { label: "Source", url: "https://gitlab.syncad.com/hive/haf" },
        ],
      },
      {
        title: "BlockTrades",
        description:
          "BlockTrades enables users to rapidly and safely purchase cryptocurrencies without the hassles typically associated with purchasing through a centralized cryptocurrency exchange. Unlike a traditional exchange, you don't need to maintain a balance on the site — every trade is a one-off conversion between two chains, which removes the custody risk that comes with leaving funds on an exchange account. We work on the infrastructure behind it, and BlockTrades is one of our long-standing clients.",
      },
      {
        title: "BEOS Blockchain Platform",
        description:
          "Business-oriented EOSIO fork implementing unique and unheard of ideas in the blockchain world. Rules of operation are location-dependent and automatically adjusted to current requirements, so a transaction can be settled under the regulations of the jurisdiction it is executed in — a property aimed at businesses that cannot simply ignore where their users are. Runs 0.5s block confirmation with BFT consensus. We worked on the platform during the 2017–2019 EOS/BEOS period, alongside the EOS governance tooling listed under EOS Ecosystem.",
      },
      {
        title: "Peerplays",
        description:
          "The first decentralized global betting platform, using Graphene technology and Delegated Proof of Stake (DPoS) to provide the fastest, most decentralized blockchain consensus model available today. Tournaments, betting markets and payouts are settled by consensus rather than by an operator, which moves the correctness burden into the C++ node itself. Peerplays shares its Graphene lineage with BitShares, so the node internals, witness operation and chain-state work carry over directly from our other DPoS projects. Peerplays is also one of our clients.",
        deployments: [{ label: "Site", url: "https://www.peerplays.com/" }],
      },
    ],
  },
  {
    id: "hive-ecosystem-dev",
    slug: "hive",
    title: "Hive Ecosystem Development",
    subtitle:
      "Backend services exposing Hive blockchain data via REST and JSON-RPC",
    description:
      "Production-grade backend services built on top of HAF — REST APIs and JSON-RPC endpoints with OpenAPI/Swagger specifications, enabling third-party developers to query Hive blockchain data without running their own full node.",
    expertise_ids: ["blockchain", "databases", "engineering"],
    custom_icon: createElement(HiveIcon, { className: "w-full h-full" }),
    projects: [
      {
        title: "HAfAH — Account History API",
        description:
          "HAF-based REST API providing account operation history, block and transaction lookup, without requiring blockchain replay. It answers the same account history queries that would otherwise hit a full node's history plugin, which moves the heaviest read traffic off consensus nodes and onto a Postgres instance that can be scaled on its own. Both REST and JSON-RPC interfaces are exposed and described by an OpenAPI specification, so an integrator can generate a client instead of hand-writing one. Over 5,353 commits and 68 contributors.",
        deployments: [
          { label: "Site", url: "https://tools.openhive.network/hafah" },
          { label: "Source", url: "https://gitlab.syncad.com/hive/HAfAH" },
        ],
      },
      {
        title: "HAF Block Explorer API",
        description:
          "Comprehensive blockchain REST API built on HAF, integrating balance tracking, reputation tracking and account history behind a single set of endpoints. It is the backend of the Block Explorer UI: account pages, witness lists, block and transaction views are all served from precomputed HAF tables instead of live node calls, so a page that aggregates years of history still answers in one query. Ships with OpenAPI/Swagger documentation and a Docker Compose deployment, so an operator can bring up hived, HAF and the API together rather than assembling the stack by hand.",
        deployments: [
          { label: "Site", url: "https://tools.openhive.network/hafbe" },
          {
            label: "Source",
            url: "https://gitlab.syncad.com/hive/haf_block_explorer",
          },
        ],
      },
    ],
  },
  {
    id: "developer-sdks",
    slug: "sdk",
    title: "Developer SDKs & Libraries",
    subtitle: "Open-source tooling for the Hive developer ecosystem",
    description:
      "A complete developer platform built for Hive: multi-language API bindings, secure key management, automation frameworks, and browser authorization libraries — enabling third-party developers to build on Hive with confidence.",
    expertise_ids: ["blockchain", "python", "frontend"],
    custom_icon: createElement(SdkIcon, { className: "w-full h-full" }),
    projects: [
      {
        title: "Wax — Multi-Language API",
        description:
          "Extension module bridging Hive's C++ core to Python (Cython) and TypeScript (WASM/Emscripten). Both bindings are generated from the same C++ protocol sources, so transaction serialization, signing and asset arithmetic behave identically in a browser, in Node.js and in a Python script — nobody has to maintain a second implementation of the chain's binary format. Covers transaction building, signing, asset manipulation and Protobuf integration for structured operations. Security-audited by Hacken (May 2025).",
        deployments: [
          { label: "Site", url: "https://tools.openhive.network/wax" },
          { label: "Source", url: "https://gitlab.syncad.com/hive/wax" },
          {
            label: "Docs",
            url: "https://doc.openhive.network/wax/develop/manual/",
          },
          { label: "NPM", url: "https://www.npmjs.com/package/@hiveio/wax" },
        ],
      },
      {
        title: "Beekeeper — Wallet Daemon",
        description:
          "Standalone key management daemon with an HTTP/WebSocket API. Private keys stay inside Beekeeper: an application asks it to sign and never touches the key material itself, which keeps keys out of application code, out of its logs and out of its crash dumps. Session management and an auto-lock timeout bound how long an unlocked wallet remains usable, and WASM bindings run the same implementation inside the browser. Published as @hiveio/beekeeper; our Clive wallet is built on it.",
        deployments: [
          { label: "Site", url: "https://tools.openhive.network/beekeeper" },
          { label: "Source", url: "https://gitlab.syncad.com/hive/beekeeper" },
          {
            label: "NPM",
            url: "https://www.npmjs.com/package/@hiveio/beekeeper",
          },
        ],
      },
      {
        title: "WorkerBee — Automation Framework",
        description:
          "Event-based observer pattern library for building Hive bots and automation. Instead of polling a node, an application declares what it cares about — an account, an operation type, a balance change — and WorkerBee delivers matching blocks as they are produced. 25+ filters combine with AND/OR logic, and the same subscription runs against historical data, so a bot can be replayed over past blocks before it is trusted with live ones. Built on Wax, published as @hiveio/workerbee, 181 kB bundle.",
        deployments: [
          { label: "Site", url: "https://tools.openhive.network/workerbee" },
          { label: "Source", url: "https://gitlab.syncad.com/hive/workerbee" },
          {
            label: "Docs",
            url: "https://doc.openhive.network/workerbee/develop/",
          },
          {
            label: "NPM",
            url: "https://www.npmjs.com/package/@hiveio/workerbee",
          },
        ],
      },
      {
        title: "hb-auth — Web Authorization",
        description:
          "Browser authorization library using WebWorker isolation and IndexedDB for secure key storage. Key material lives in a worker, separate from page scripts: the application posts a transaction in and gets a signature back, so a compromised script on the page cannot read the key. Two client modes cover applications that keep an unlocked session and applications that authorize a single operation, and neither one hands a private key to page code. Published as @hiveio/hb-auth.",
        deployments: [
          { label: "Site", url: "https://tools.openhive.network/hb-auth" },
          { label: "Source", url: "https://gitlab.syncad.com/hive/hb-auth" },
          {
            label: "NPM",
            url: "https://www.npmjs.com/package/@hiveio/hb-auth",
          },
        ],
      },
      {
        title: "MetaMask Snap for Hive",
        description:
          "MetaMask extension deriving Hive keys from the MetaMask seed via BIP44, so a user who already backed up a MetaMask recovery phrase does not need a separate Hive key backup. Signing happens inside the Snap sandbox behind a MetaMask confirmation prompt, which keeps the key out of the dApp and inside a security model users already know. Passed a Hacken security audit (May 2025). Published as @hiveio/metamask-snap and used by the Hive Bridge dApp.",
        deployments: [
          {
            label: "Site",
            url: "https://tools.openhive.network/metamask-snap",
          },
          {
            label: "Source",
            url: "https://gitlab.syncad.com/hive/metamask-snap",
          },
          {
            label: "NPM",
            url: "https://www.npmjs.com/package/@hiveio/metamask-snap",
          },
        ],
      },
      {
        title: "HealthChecker Component",
        description:
          "Reusable React component for monitoring Hive API endpoint health. Public Hive nodes are run by independent operators and fall behind or go offline at different times, so the component probes a configured list, reports what it finds and switches the host application to a healthy provider automatically. It drops into any React application, carries its own dark mode styling, and turns endpoint selection into a solved problem rather than something every Hive frontend re-implements. Published as @hiveio/healthchecker-component.",
        deployments: [
          {
            label: "Source",
            url: "https://gitlab.syncad.com/hive/healthchecker-component",
          },
          {
            label: "NPM",
            url: "https://www.npmjs.com/package/@hiveio/healthchecker-component",
          },
        ],
      },
    ],
  },
  {
    id: "user-applications",
    slug: "ufa",
    title: "User-Facing Applications",
    subtitle: "End-user blockchain experiences and decentralized applications",
    description:
      "Rich end-user products across the Hive ecosystem — from a full blockchain explorer and decentralized social media platform to CLI wallets, transaction analysis tools, and AI-powered semantic search. Each project links both to the live deployment and to its open-source repository.",
    expertise_ids: ["frontend", "blockchain", "security"],
    projects: [
      {
        title: "Block Explorer UI",
        description:
          "Full-featured blockchain explorer covering block and transaction search, account information, witness tracking, market data and balance history visualization. It is the user-facing half of the HAF Block Explorer API — every view resolves to a query against HAF tables, so pages that aggregate years of account history stay responsive. Operation views can be narrowed by type, which makes the explorer a debugging tool for developers inspecting their own transactions and not only a browsing surface. Covered by Playwright E2E tests across 3 browser engines.",
        deployments: [
          { label: "Site", url: "https://explore.openhive.network/" },
          {
            label: "Source",
            url: "https://gitlab.syncad.com/hive/haf_block_explorer",
          },
        ],
      },
      {
        title: "Denser - decentralized blogging application (dApp)",
        description:
          "Decentralized blogging and social media platform, successor to hive.blog/condenser. Posts, comments, votes and follows are read from and written to the Hive chain directly, so accounts and content belong to their authors rather than to whoever operates the site. Split into a blog app and a wallet app inside a Turborepo monorepo with 15+ internal packages, both backed by the HAF API stack and sharing the same UI and data-access libraries.",
        deployments: [
          { label: "Blog", url: "https://blog.openhive.network/" },
          { label: "Wallet", url: "https://wallet.openhive.network/" },
          { label: "Source", url: "https://gitlab.syncad.com/hive/denser" },
        ],
      },
      {
        title: "Hive Bridge dApp",
        description:
          "Modern multi-auth wallet that lets a user reach their Hive account through whichever key custody they already have: MetaMask Snap, the Keychain browser extension, PeakVault, or Google Wallet/Drive. Rather than asking for a private key, the app delegates signing to the selected provider and only receives the signed transaction back, so onboarding does not start with a paste-your-key form. Ships with a dark mode UI and doubles as the reference integration for our MetaMask Snap.",
        deployments: [
          { label: "Site", url: "https://auth.openhive.network" },
          {
            label: "Source",
            url: "https://gitlab.syncad.com/hive/wallet-dapp",
          },
        ],
      },
      {
        title: "TX Inspector",
        description:
          "Transaction analysis tool that accepts a transaction in whatever form you happen to have it — hash, JSON, raw binary or an uploaded file — and decodes it into readable operations. It resolves which authorities the transaction requires and draws them as a graph, following delegated authority up to 2 levels, which is what makes multisig and account-recovery setups inspectable at all. A hex viewer shows the serialized form alongside the decoded one, for the cases where a signature is rejected and the difference is in the bytes rather than in the JSON.",
        deployments: [
          { label: "Site", url: "https://tools.openhive.network/tx-inspector" },
          {
            label: "Source",
            url: "https://gitlab.syncad.com/hive/tx-inspector",
          },
        ],
      },
      {
        title: "Clive — CLI/TUI Wallet",
        description:
          "Dual-mode command-line and terminal UI wallet for Hive, with mouse support inside the terminal. The TUI is built with Textual and the CLI with Typer, so the same account operations are available to a person working interactively and to a script running unattended. Key handling is delegated to Beekeeper instead of living in the wallet, and a profile system keeps several accounts side by side. Entry points: clive (TUI) and clive-dev (debug mode). Over 8,899 commits.",
        deployments: [
          { label: "Site", url: "https://tools.openhive.network/clive" },
          { label: "Source", url: "https://gitlab.syncad.com/hive/clive" },
        ],
      },
      {
        title: "HiveSense — AI Semantic Search",
        description:
          "HAF application that makes Hive posts searchable by meaning rather than by keyword. Content is embedded with OLLAMA models as it arrives and stored as vectors in pgvector, so a query returns related posts from the whole chain history instead of exact string matches. Embedding runs in parallel to keep pace with block production, and the same vectors are reused to identify contributors who write consistently about a given topic.",
        deployments: [
          { label: "Site", url: "https://tools.openhive.network/hivesense" },
          { label: "Source", url: "https://gitlab.syncad.com/hive/hivesense" },
        ],
      },
      {
        title: "Balance Tracker",
        description:
          "HAF application for graphing account balances (HIVE/HBD) over time. Balance history is reconstructed from the account's operations rather than stored as periodic snapshots, so any point in the past can be queried without replaying a node. Two interchangeable backends — PostgREST and a Python service — sit behind the same React web UI, and JMeter suites verify that the query paths hold up under load before a release.",
        deployments: [
          {
            label: "Site",
            url: "https://tools.openhive.network/balance-tracker",
          },
          {
            label: "Source",
            url: "https://gitlab.syncad.com/hive/balance_tracker",
          },
        ],
      },
      {
        title: "Keyhotee",
        description:
          "Pioneering decentralized identity and encrypted messaging desktop application, built on the BitShares ecosystem in 2013–2014. Identities were registered on chain and messages encrypted between them, with an address book that verified a contact against the identity actually recorded on the chain instead of trusting a display name. Included wallet integration and crash reporting. This is where our blockchain work started — the C++ and consensus experience from it carried straight into the Graphene and Hive projects listed above.",
      },
    ],
  },
  {
    id: "eos-ecosystem",
    slug: "eos",
    title: "EOS Ecosystem",
    subtitle: "Governance tools and smart contracts for the EOS blockchain",
    description:
      "Delivered during the 2017–2019 EOS/BEOS era in collaboration with TerraDacs: a cross-platform desktop wallet for block producer voting, and two on-chain governance smart contracts for proxy registration and producer metadata.",
    expertise_ids: ["blockchain", "engineering"],
    custom_icon: createElement(EngineeringIcon, { className: "w-full h-full" }),
    projects: [
      {
        title: "EOS Voter",
        description:
          "Cross-platform Electron desktop wallet and block producer voting tool for the EOS blockchain. Voting on EOS requires staked tokens, so the wallet brings CPU/bandwidth staking, token transfers and producer selection into one place, with keys held locally under AES-256 encryption rather than on a server. Multi-language support — English, Korean, Chinese, Japanese and Russian — reflects how geographically split the EOS voter base was. Delivered with TerraDacs during the 2017–2019 EOS/BEOS period.",
      },
      {
        title: "EOS Proxy Info",
        description:
          "On-chain EOSIO smart contract for proxy account information registration and management. EOS token holders can delegate their vote to a proxy, but the chain itself had nowhere for a proxy to state who they are, so the contract gives every proxy account a record for its name, website, voting philosophy and social media links. Downstream voting portals read those records straight from the chain instead of each maintaining its own proxy list, which keeps one authoritative version of the information.",
      },
      {
        title: "Producer JSON",
        description:
          "Smart contract enabling EOS block producers to store and manage their JSON metadata on-chain. The prevailing convention had producers publishing that metadata on their own websites, which meant every consumer depended on someone else's domain staying up and unmodified; moving it on chain removes that dependency. The contract validates that the caller is an eligible producer before accepting a write and uses multi-index tables for efficient storage and lookup.",
      },
    ],
  },
  {
    id: "documentation",
    slug: "docs",
    title: "Documentation",
    subtitle: "Developer documentation and interactive code examples",
    description:
      "Comprehensive documentation sites for the Hive developer platform — featuring multi-language code tabs, 71+ executable TypeScript snippets, Swagger API docs, and branch-specific preview deployments.",
    expertise_ids: ["engineering"],
    custom_icon: createElement(DocsIcon, { className: "w-full h-full" }),
    projects: [
      {
        title: "Wax Documentation",
        description:
          "Documentation site for the Wax API, with multi-language code tabs showing the same task in TypeScript and in Python side by side. The 71+ examples are executable rather than illustrative: they live in a companion repository and run as tests, so an API change that breaks an example is caught in CI instead of shipping as stale documentation. Deployed via GitLab Pages with branch-specific URLs, which lets a documentation change be reviewed at a live address before it is merged.",
        deployments: [
          { label: "Source", url: "https://gitlab.syncad.com/hive/wax-doc" },
          {
            label: "Docs",
            url: "https://doc.openhive.network/wax/develop/manual/",
          },
        ],
      },
      {
        title: "WorkerBee Documentation",
        description:
          "Documentation for the WorkerBee automation framework, covering the observer API, the filter catalogue and the data providers a bot subscribes to. Swagger API docs are generated next to the prose so the reference stays in step with the code, and branch preview deployments give every merge request its own reviewable URL. Examples are pulled from the shared snippet repository, which makes the same code both the documentation and its test.",
        deployments: [
          {
            label: "Source",
            url: "https://gitlab.syncad.com/hive/workerbee-doc-snippets",
          },
        ],
      },
      {
        title: "Wax & WorkerBee Code Snippets",
        description:
          "Executable documentation examples: 71+ TypeScript snippets organized by category with built-in test runners, covering Beekeeper, filters, providers and custom integration patterns. Each snippet is a runnable program rather than a fragment, so it can be copied into a project and executed as is, and the runners double as regression tests for the libraries they document. Both the Wax and the WorkerBee documentation sites source their examples from here, so there is exactly one canonical version of every example.",
        deployments: [
          {
            label: "Source (Wax)",
            url: "https://gitlab.syncad.com/hive/wax-doc-snippets",
          },
          {
            label: "Source (WorkerBee)",
            url: "https://gitlab.syncad.com/hive/workerbee-doc-snippets/",
          },
        ],
      },
    ],
  },
  {
    id: "eda-engineering",
    slug: "eda",
    title: "EDA & Engineering",
    subtitle: "Electronic design automation tools and simulation software",
    description:
      "Over a dozen years developing HDL compiler, simulation and advanced debugging tools for large scale System Verilog models. Development of CAD & CAE software used at design and verification processes at biggest engineering companies worldwide.",
    expertise_ids: ["eda", "engineering"],
    projects: [
      {
        title: "SynaptiCAD - Verilogger",
        description:
          "SynaptiCAD Verilogger Extreme bundle consists of a HDL GUI debugger (BugHunter Pro) and a command-line based Verilog compiler (simx). We have been developing the compiler and its simulation engine for over a dozen years, targeting large-scale Verilog and SystemVerilog models where elaboration time and memory footprint decide whether a design can be simulated at all. The bundle is licensed to engineering companies for day-to-day design and verification work and remains under continuous development.",
        deployments: [
          {
            label: "Site",
            url: "http://www.syncad.com/vlg_verilog_compiler_simulator.htm",
          },
        ],
      },
      {
        title: "SynaptiCAD - BugHunter Pro",
        description:
          "Graphical debugging environment for Verilog, VHDL and C++ simulators. It drives a simulation from the source side — breakpoints, single-stepping and variable inspection in HDL code — while the waveform view stays synchronized with the same run, so a wrong signal can be traced back to the line that drove it. It works with the bundled simx compiler and with third-party simulators, which lets a team keep its existing simulation flow and change only the debugger.",
        deployments: [
          {
            label: "Site",
            url: "http://www.syncad.com/vhdl_verilog_debugger.htm",
          },
        ],
      },
      {
        title: "SynaptiCAD - Test Bench Generators",
        description:
          "TestBencher Pro is a graphical test bench generator that dramatically reduces the time required to create and maintain test benches for VHDL and Verilog. Timing diagrams drawn against a component's interface are compiled into test bench code, so a change in the specification is regenerated instead of hand-edited across thousands of lines. The generated benches drive the simulator and check the responses, which keeps the diagram — the artefact engineers actually review — as the source of truth.",
        deployments: [
          {
            label: "Site",
            url: "http://www.syncad.com/testbencher_verilog_vhdl_testbench_generator.htm",
          },
        ],
      },
      {
        title: "ModelCenter Integrate",
        description:
          "ModelCenter Integrate increases productivity by enabling users to execute significantly more simulations with less time and resources. It wraps existing engineering tools — CAD packages, analysis codes, spreadsheets, scripts — into a single automated workflow, so a parametric or trade study runs end to end instead of being driven by hand from one application to the next. Runs can be spread across available compute resources, which is what turns a handful of manual design iterations into a systematic exploration of the design space. Built for Phoenix Integration, a long-standing client now part of ANSYS.",
      },
    ],
  },
  {
    id: "data-systems",
    slug: "data",
    title: "Data Systems",
    subtitle: "Database solutions and data center infrastructure management",
    description:
      "Experienced in RDBMS and modern non-SQL databases like RocksDB and Neo4J, offering critical write throughput and efficient object traversal.",
    expertise_ids: ["databases", "engineering"],
    projects: [
      {
        title: "RDBMS - WSMS",
        description:
          "Data access and business logic layers being foundations of Workstation Management System (WSMS) owned by Prointegra company. We own the relational persistence layer and the domain rules built on top of it — the layer every other part of the product is written against, and the one that decides how the system behaves as the managed estate grows. Prointegra is one of our long-standing clients.",
        deployments: [
          { label: "Site", url: "http://www.prointegra.com.pl/system-wsms/" },
        ],
      },
      {
        title: "NonSQL DB Engine",
        description:
          "Unique engine allowing to model extensible user defined entities. Entity types and their attributes are data rather than fixed schema, so a deployment can introduce a new kind of object without a database migration — which is what lets a single product installation fit customers whose inventories look nothing alike. Used in the MetaModel Base and Uptime-DC products.",
        deployments: [
          { label: "Site", url: "http://www.prointegra.com.pl/714-2/" },
        ],
      },
      {
        title: "Uptime-DC",
        description:
          "Comprehensive data center infrastructure management system for monitoring and controlling critical facilities. The facility and its equipment are modelled on top of our non-SQL engine, so an operator describes their own site rather than fitting it into a fixed schema. Because the model and the monitoring data live in the same system, it can answer questions about capacity and dependencies instead of only reporting current sensor readings.",
        deployments: [{ label: "Site", url: "http://uptime-dc.com/" }],
      },
    ],
  },
];

/**
 * Prerendering `/` evaluates this module, so a duplicated alias fails the build
 * instead of silently letting the first section win.
 */
function build_id_by_slug(): ReadonlyMap<SectionSlug, string> {
  const by_slug = new Map<SectionSlug, string>();
  for (const section of SECTIONS) {
    const taken = by_slug.get(section.slug);
    if (taken !== undefined) {
      throw new Error(
        `Duplicate section slug "${section.slug}": "${taken}" and "${section.id}"`,
      );
    }
    by_slug.set(section.slug, section.id);
  }
  return by_slug;
}

const ID_BY_SLUG = build_id_by_slug();

export function section_id_from_slug(value: string): string | null {
  if (!is_section_slug(value)) return null;
  return ID_BY_SLUG.get(value) ?? null;
}

export function section_slug_from_id(id: string): SectionSlug | null {
  return SECTIONS.find((section) => section.id === id)?.slug ?? null;
}
