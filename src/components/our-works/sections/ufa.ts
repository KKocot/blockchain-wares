import type { ProjectSection } from "../../our-works-data";

export const USER_APPLICATIONS_SECTION: ProjectSection = {
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
};
