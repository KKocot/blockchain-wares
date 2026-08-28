export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 500;

export const SORT_FIELDS = [
  "timestamp",
  "method",
  "path",
  "status",
  "ip",
  "country",
  "lang",
  "referrer",
  "ua",
] as const;

export type SortField = (typeof SORT_FIELDS)[number];
export type SortDir = "asc" | "desc";

export const DEFAULT_SORT_FIELD: SortField = "timestamp";
export const DEFAULT_SORT_DIR: SortDir = "desc";

export interface RequestLog {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  query: string | null;
  status: number;
  bytes: number;
  ip: string | null;
  /** ISO 3166-1 alpha-2; `null` gdy adresu nie da sie zmapowac. Jak `browser` — liczone przy parsowaniu. */
  country: string | null;
  lang: string | null;
  referrer: string | null;
  ua: string | null;
  /** Wyliczana z `ua` przy parsowaniu, zeby statystyki nie parsowaly UA przy kazdym odczycie. */
  browser: string;
  /** Jak `browser` — z tego samego przebiegu `parse_user_agent`, bez ponownego parsowania. */
  is_bot: boolean;
}

export interface LogQuery {
  path: string | null;
  /** Dokladny kod (`404`) albo cala klasa (`4xx`). */
  status: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  search: string | null;
  /** Ruch z loopbacku (health-checki) jest szumem — domyslnie odfiltrowany. */
  includeInternal: boolean;
  /** Boty, skanery i ruch z nierozpoznanym UA sa domyslnie widoczne; flaga je ukrywa. */
  excludeBots: boolean;
  sort: SortField;
  dir: SortDir;
  page: number;
  pageSize: number;
}

export interface LogPage {
  items: RequestLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LogStatBucket {
  label: string;
  count: number;
}

export interface LogDayBucket {
  date: string;
  count: number;
}

export interface LogStats {
  totalRequests: number;
  uniqueIps: number;
  avgPerDay: number;
  topPaths: LogStatBucket[];
  topStatuses: LogStatBucket[];
  topReferrers: LogStatBucket[];
  topLangs: LogStatBucket[];
  topBrowsers: LogStatBucket[];
  topCountries: LogStatBucket[];
  byDay: LogDayBucket[];
}

/**
 * Read-only: dane pochodza z logu nginx, aplikacja niczego nie dopisuje. Dawne
 * `insert` (i typ `RequestLogInput`) zniknely razem z warstwa in-memory.
 */
export interface LogRepository {
  list(query: LogQuery): Promise<LogPage>;
  /** Aggregates over the same filters as list, ignoring page/pageSize. */
  stats(query: LogQuery): Promise<LogStats>;
}
