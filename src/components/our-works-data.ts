export interface Project {
  title: string;
  description: string;
  url?: string;
}

export interface ProjectSection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  projects: Project[];
}

export const SECTIONS: ProjectSection[] = [
  {
    id: "blockchain-core",
    title: "Blockchain Core & Infrastructure",
    subtitle: "High-performance blockchain nodes and indexing infrastructure",
    description:
      "Experience dating back to 2014 with Keyhotee. Core contributors to Hive blockchain with over 31,000 commits. Specializing in C++ node development, DPoS consensus, and the HAF PostgreSQL-backed indexing framework handling thousands of transactions per second.",
    projects: [
      {
        title: "Hive Blockchain",
        description:
          "Hive has redefined social media by building a living, breathing, and growing social economy — a community where users are rewarded for sharing their voice. Core node implementation with 3-second blocks, DPoS consensus, free transactions via Resource Credits, and thousands of TPS.",
        url: "https://hive.blog",
      },
      {
        title: "HAF — Hive Application Framework",
        description:
          "PostgreSQL-based push-model indexing layer for the Hive blockchain. Multiple HAF apps share a single server with automatic fork handling and efficient data access via sql_serializer plugin and hive_fork_manager extension.",
        url: "https://gitlab.syncad.com/hive/haf",
      },
      {
        title: "HAfAH — Account History API",
        description:
          "HAF-based REST API providing account operation history, block and transaction lookup, without requiring blockchain replay. Over 5,353 commits and 68 contributors.",
        url: "https://gitlab.syncad.com/hive/HAfAH",
      },
      {
        title: "HAF Block Explorer API",
        description:
          "Comprehensive blockchain REST API built on HAF integrating balance tracking, reputation tracking, and account history. OpenAPI/Swagger docs with Docker Compose deployment.",
        url: "https://gitlab.syncad.com/hive/haf_block_explorer",
      },
      {
        title: "BlockTrades",
        description:
          "BlockTrades enables users to rapidly and safely purchase cryptocurrencies without the hassles typically associated with purchasing through a centralized cryptocurrency exchange. Unlike a traditional exchange, you don't need to maintain a balance on the site.",
        url: "https://blocktrades.us",
      },
      {
        title: "BEOS Blockchain Platform",
        description:
          "Business-oriented EOSIO fork implementing unique and unheard of ideas in the blockchain world. Location-dependent rules of operation, automatically adjusted to current requirements. 0.5s block confirmation with BFT consensus.",
        url: "https://beos.world",
      },
      {
        title: "Peerplays",
        description:
          "The first decentralized global betting platform, using Graphene technology and Delegated Proof of Stake (DPoS) to provide the fastest, most decentralized blockchain consensus model available today.",
        url: "https://www.peerplays.com/",
      },
    ],
  },
  {
    id: "developer-sdks",
    title: "Developer SDKs & Libraries",
    subtitle: "Open-source tooling for the Hive developer ecosystem",
    description:
      "A complete developer platform built for Hive: multi-language API bindings, secure key management, automation frameworks, and browser authorization libraries — enabling third-party developers to build on Hive with confidence.",
    projects: [
      {
        title: "Wax — Multi-Language API",
        description:
          "Extension module bridging Hive's C++ core to Python (Cython) and TypeScript (WASM/Emscripten). Transaction building, signing, asset manipulation, and Protobuf integration. Security-audited by Hacken (May 2025).",
        url: "https://gitlab.syncad.com/hive/wax",
      },
      {
        title: "Beekeeper — Wallet Daemon",
        description:
          "Standalone key management daemon with HTTP/WebSocket API, session management, auto-lock timeout, and WASM bindings for browser environments. Published as @hiveio/beekeeper.",
        url: "https://gitlab.syncad.com/hive/beekeeper",
      },
      {
        title: "WorkerBee — Automation Framework",
        description:
          "Event-based observer pattern library for building Hive bots and automation. 25+ filters, data providers, real-time and historical data, combined filter logic (AND/OR). 181 kB bundle.",
        url: "https://gitlab.syncad.com/hive/workerbee",
      },
      {
        title: "hb-auth — Web Authorization",
        description:
          "Browser authorization library using WebWorker isolation and IndexedDB for secure key storage. Dual client modes without exposing private keys. Published as @hiveio/hb-auth.",
        url: "https://gitlab.syncad.com/hive/hb-auth",
      },
      {
        title: "MetaMask Snap for Hive",
        description:
          "MetaMask extension deriving Hive keys from MetaMask seed via BIP44, enabling transaction signing within the MetaMask security model. Passed Hacken security audit (May 2025). Published as @hiveio/metamask-snap.",
        url: "https://gitlab.syncad.com/hive/metamask-snap",
      },
      {
        title: "HealthChecker Component",
        description:
          "Reusable React component for monitoring Hive API endpoint health with automatic provider switching and dark mode support. Published as @hiveio/healthchecker-component.",
        url: "https://gitlab.syncad.com/hive/healthchecker-component",
      },
    ],
  },
  {
    id: "user-applications",
    title: "User-Facing Applications",
    subtitle: "End-user blockchain experiences and decentralized applications",
    description:
      "Rich end-user products across the Hive ecosystem — from a full blockchain explorer and decentralized social media platform to CLI wallets, transaction analysis tools, and AI-powered semantic search.",
    projects: [
      {
        title: "Block Explorer UI",
        description:
          "Full-featured blockchain explorer with block and transaction search, account info, witness tracking, market data, and balance history visualization. Playwright E2E tests across 3 browser engines.",
        url: "https://gitlab.syncad.com/hive/haf_block_explorer",
      },
      {
        title: "Denser — Social Media dApp",
        description:
          "Decentralized blogging and social media platform (successor to hive.blog/condenser). Turborepo monorepo with 15+ internal packages, blog app, wallet app, and HAF API stack integration.",
        url: "https://gitlab.syncad.com/hive/denser",
      },
      {
        title: "Wallet dApp",
        description:
          "Modern multi-auth wallet supporting MetaMask Snap, Keychain, PeakVault, and Google Wallet/Drive integration with dark mode.",
        url: "https://gitlab.syncad.com/hive/wallet-dapp",
      },
      {
        title: "TX Inspector",
        description:
          "Transaction analysis tool with multi-format input (hash/JSON/binary/file), authority graph visualization, hex viewer, and delegated authority detection up to 2 levels.",
        url: "https://gitlab.syncad.com/hive/tx-inspector",
      },
      {
        title: "Clive — CLI/TUI Wallet",
        description:
          "Dual-mode command-line and terminal UI wallet with mouse support, Beekeeper integration, and profile system. Entry points: clive (TUI) and clive-dev (debug mode). Over 8,899 commits.",
        url: "https://gitlab.syncad.com/hive/clive",
      },
      {
        title: "HiveSense — AI Semantic Search",
        description:
          "HAF-based semantic search over blockchain posts using OLLAMA ML embeddings, pgvector similarity, parallel LLM processing, and thematic contributor identification.",
        url: "https://gitlab.syncad.com/hive/hivesense",
      },
      {
        title: "Balance Tracker",
        description:
          "HAF application for graphing account balances (HIVE/HBD) over time. Dual backend support (PostgREST/Python) with React web UI and JMeter performance testing.",
        url: "https://gitlab.syncad.com/hive/balance_tracker",
      },
      {
        title: "Keyhotee",
        description:
          "Pioneering decentralized identity and encrypted messaging desktop application with wallet integration, address book with identity verification, and crash reporting. Built on the BitShares ecosystem in 2013–2014.",
      },
    ],
  },
  {
    id: "eos-ecosystem",
    title: "EOS Ecosystem",
    subtitle: "Governance tools and smart contracts for the EOS blockchain",
    description:
      "Delivered during the 2017–2019 EOS/BEOS era in collaboration with TerraDacs: a cross-platform desktop wallet for block producer voting, and two on-chain governance smart contracts for proxy registration and producer metadata.",
    projects: [
      {
        title: "EOS Voter",
        description:
          "Cross-platform Electron desktop wallet and block producer voting tool for the EOS blockchain. AES-256 encrypted local key storage, CPU/bandwidth staking, and token transfers with multi-language support (English, Korean, Chinese, Japanese, Russian).",
      },
      {
        title: "EOS Proxy Info",
        description:
          "On-chain EOSIO smart contract for proxy account information registration and management. Allows proxy accounts to register metadata (name, website, philosophy, social media) for downstream voting portals.",
      },
      {
        title: "Producer JSON",
        description:
          "Smart contract enabling EOS block producers to store and manage their JSON metadata on-chain. Validates producer eligibility and uses multi-index tables for efficient storage.",
      },
    ],
  },
  {
    id: "documentation",
    title: "Documentation",
    subtitle: "Developer documentation and interactive code examples",
    description:
      "Comprehensive documentation sites for the Hive developer platform — featuring multi-language code tabs, 71+ executable TypeScript snippets, Swagger API docs, and branch-specific preview deployments.",
    projects: [
      {
        title: "Wax Documentation",
        description:
          "Comprehensive documentation with multi-language code tabs and 71+ executable snippets. Deployed via GitLab Pages with branch-specific URLs for developer convenience.",
        url: "https://gitlab.syncad.com/hive/wax-doc",
      },
      {
        title: "WorkerBee Documentation",
        description:
          "Interactive documentation with Swagger API docs and branch preview deployments covering the full WorkerBee automation framework.",
        url: "https://gitlab.syncad.com/hive/workerbee-doc-snippets",
      },
      {
        title: "Wax & WorkerBee Code Snippets",
        description:
          "Executable documentation examples: 71+ TypeScript snippets organized by category with built-in test runners, covering Beekeeper, filters, providers, and custom integration patterns.",
        url: "https://gitlab.syncad.com/hive/wax-doc-snippets",
      },
    ],
  },
  {
    id: "eda-engineering",
    title: "EDA & Engineering",
    subtitle: "Electronic design automation tools and simulation software",
    description:
      "Over a dozen years developing HDL compiler, simulation and advanced debugging tools for large scale System Verilog models. Development of CAD & CAE software used at design and verification processes at biggest engineering companies worldwide.",
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
