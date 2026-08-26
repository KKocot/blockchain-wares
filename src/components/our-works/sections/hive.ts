import { createElement } from "react";
import { HiveIcon } from "../../icons";
import type { ProjectSection } from "../../our-works-data";

export const HIVE_ECOSYSTEM_DEV_SECTION: ProjectSection = {
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
};
