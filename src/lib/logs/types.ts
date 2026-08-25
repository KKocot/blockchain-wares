export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 500;

export const SORT_FIELDS = [
  "timestamp",
  "method",
  "path",
  "status",
  "ip",
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
  lang: string | null;
  referrer: string | null;
  ua: string | null;
  /** Wyliczana z `ua` przy parsowaniu, zeby statystyki nie parsowaly UA przy kazdym odczycie. */
  browser: string;
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
