import { createElement } from "react";
import { SdkIcon } from "../../icons";
import type { ProjectSection } from "../../our-works-data";

export const DEVELOPER_SDKS_SECTION: ProjectSection = {
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
};
