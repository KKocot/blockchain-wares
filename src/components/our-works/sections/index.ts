import type { ProjectSection } from "../../our-works-data";
import { BLOCKCHAIN_CORE_SECTION } from "./core";
import { HIVE_ECOSYSTEM_DEV_SECTION } from "./hive";
import { DEVELOPER_SDKS_SECTION } from "./sdk";
import { USER_APPLICATIONS_SECTION } from "./ufa";
import { EOS_ECOSYSTEM_SECTION } from "./eos";
import { DOCUMENTATION_SECTION } from "./docs";
import { EDA_ENGINEERING_SECTION } from "./eda";
import { DATA_SYSTEMS_SECTION } from "./data";

/** Render order of the "What We Do" tabs. */
export const SECTIONS: ProjectSection[] = [
  BLOCKCHAIN_CORE_SECTION,
  HIVE_ECOSYSTEM_DEV_SECTION,
  DEVELOPER_SDKS_SECTION,
  USER_APPLICATIONS_SECTION,
  EOS_ECOSYSTEM_SECTION,
  DOCUMENTATION_SECTION,
  EDA_ENGINEERING_SECTION,
  DATA_SYSTEMS_SECTION,
];
