import type { BotCategory } from "./user_agent";

export type { BotCategory };

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

/** Flagi ukrywajace poszczegolne rodzaje ruchu nie-ludzkiego; kolejnosc = kolejnosc w UI. */
export const EXCLUSION_FLAGS = [
  "excludeCrawlers",
  "excludeSeoTools",
  "excludeScripts",
  "excludeHeadless",
  "excludeUnknownUa",
  "excludeNoUa",
] as const;

export type ExclusionFlag = (typeof EXCLUSION_FLAGS)[number];

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
  /** `null` = zadania przyszly bez naglowka User-Agent (`-` w logu nginx). */
  ua: string | null;
  /** Wyliczana z `ua` przy parsowaniu, zeby statystyki nie parsowaly UA przy kazdym odczycie. */
  browser: string;
  /** Jak `browser` — z tego samego przebiegu `parse_user_agent`, bez ponownego parsowania. */
  is_bot: boolean;
  /** Rodzina bota; `null` dla ludzi oraz dla UA, ktorego zadna regula nie lapie. */
  botCategory: BotCategory | null;
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
  /** Googlebot, Bingbot, YandexBot, DuckDuckBot, Baiduspider. */
  excludeCrawlers: boolean;
  /** Crawlery narzedzi i podgladow: AhrefsBot, SemrushBot, facebookexternalhit. */
  excludeSeoTools: boolean;
  /** Klienci skryptowe: python-requests, curl, Wget. */
  excludeScripts: boolean;
  /** UA zawiera "headless" (HeadlessChrome, HeadlessFirefox); sam string "Puppeteer" nie łapie się. */
  excludeHeadless: boolean;
  /** UA jest, ale nie pasuje do zadnej reguly (`browser === "Unknown"`). */
  excludeUnknownUa: boolean;
  /** Zadania bez naglowka User-Agent. */
  excludeNoUa: boolean;
  /** Czysto prezentacyjna: rozwija liste IP pod krajami, nie zmienia zbioru danych. */
  showCountryIps: boolean;
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

export interface CountryIpBucket {
  /** `null` = GeoIP nie rozpoznal adresu. */
  country: string | null;
  /** Trafienia kraju, jak w `topCountries`; wpisy bez IP licza sie tu, ale nie w `ips`. */
  total: number;
  ips: { ip: string; count: number }[];
  hiddenIps: number;
  hiddenHits: number;
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
  /**
   * Te same kraje i kolejnosc co `topCountries`; bucket `country: null` stoi tam, gdzie
   * wypadl w rankingu, a dopisywany na koncu jest tylko wtedy, gdy nie wszedl do top 10.
   */
  countryIps: CountryIpBucket[];
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
