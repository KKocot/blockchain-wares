import type { ProjectSection } from "../../our-works-data";

export const DATA_SYSTEMS_SECTION: ProjectSection = {
  id: "data-systems",
  slug: "data",
  title: "Data Systems",
  subtitle: "Database solutions and data center infrastructure management",
  description:
    "Experienced in RDBMS and modern non-SQL databases like RocksDB and Neo4j, offering critical write throughput and efficient object traversal.",
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
};
