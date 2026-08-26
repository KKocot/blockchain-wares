import { createElement } from "react";
import { DocsIcon } from "../../icons";
import type { ProjectSection } from "../../our-works-data";

export const DOCUMENTATION_SECTION: ProjectSection = {
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
};
