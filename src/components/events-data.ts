export interface TradeFairEvent {
  /** Stable key + anchor id */
  id: string;
  name: string;
  /** Compact label for tight layouts, e.g. "EBC 2026" — falls back to `name` */
  shortName?: string;
  /** Short edition marker, e.g. "EBC12" */
  edition?: string;
  city: string;
  country: string;
  /** Day range as displayed, e.g. "16–17" */
  days: string;
  /** Short month label, e.g. "Sep" */
  month: string;
  year: string;
  /** ISO start date for <time datetime> */
  startDate: string;
  url: string;
  description: string;
  topics: string[];
}

/**
 * Trade fairs and conferences BlockchainWares attends.
 * Single source of truth for the /markets page and the homepage event banner.
 * Keep entries in chronological order — the first one is promoted on the homepage.
 */
export const EVENTS: TradeFairEvent[] = [
  {
    id: "ebc-2026-barcelona",
    name: "European Blockchain Convention 2026",
    shortName: "EBC 2026",
    edition: "EBC12",
    city: "Barcelona",
    country: "Spain",
    days: "16–17",
    month: "Sep",
    year: "2026",
    startDate: "2026-09-16",
    url: "https://eblockchainconvention.com/",
    description:
      "We are going to Barcelona. The 12th European Blockchain Convention gathers thousands of builders, founders and institutions from across the continent. Our engineers will be on the floor talking blockchain infrastructure, event-driven architecture and high-load database systems — say hello if you are attending.",
    topics: [
      "Blockchain infrastructure",
      "Event-driven architecture",
      "Enterprise integrations",
    ],
  },
];

/**
 * Closest upcoming event — the first entry of {@link EVENTS}.
 * Returns `undefined` when no events are scheduled.
 */
export function get_next_event(): TradeFairEvent | undefined {
  return EVENTS[0];
}
