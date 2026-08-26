import { createElement } from "react";
import { EngineeringIcon } from "../../icons";
import type { ProjectSection } from "../../our-works-data";

export const EOS_ECOSYSTEM_SECTION: ProjectSection = {
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
};
