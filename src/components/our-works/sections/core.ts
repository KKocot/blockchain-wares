import type { ProjectSection } from "../../our-works-data";

export const BLOCKCHAIN_CORE_SECTION: ProjectSection = {
  id: "blockchain-core",
  slug: "core",
  title: "Blockchain Core & Infrastructure",
  subtitle: "High-performance blockchain nodes and indexing infrastructure",
  description:
    "Experience dating back to 2013 with Keyhotee. Core contributors to Hive blockchain with over 31,000 commits. Specializing in C++ node development (hived), HAF PostgreSQL-backed indexing handling thousands of TPS, DPoS platforms — Graphene-based Peerplays with 3-second blocks and EOSIO-based BEOS with 0.5s block confirmation — and exchange infrastructure (BlockTrades).",
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
};
