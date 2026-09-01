/**
 * Wartości, których oczekują testy panelu, i renderer syntetycznego logu nginx:
 * `$remote_addr - $remote_user [$time_local] "$request" $status $bytes "$referer" "$user_agent" "$xff" "$accept_language"`.
 *
 * Testy nie mogą uderzać w prawdziwe źródło logów, więc cały zbiór jest w
 * `log_entries.ts`, a wszystkie liczniki liczą się z niego tutaj — żadna
 * oczekiwana liczba nie jest wpisana ręcznie.
 */

import type { ExclusionFlag } from "../../src/lib/logs/types";
import {
  ENTRIES,
  GEO_SOURCES,
  HOSTILE_PATH,
  INTERNAL_IP,
  type LogEntry,
} from "./log_entries";
import { CATEGORY_BY_UA, type TrafficCategory } from "./user_agents";

export {
  BOT_PATH,
  GEO_IPV4,
  GEO_IPV6,
  HOSTILE_MARKER,
  HOSTILE_REFERRER,
  INTERNAL_IP,
  INTERNAL_PATH,
  NO_UA_PATH,
  SPOOFED_XFF_HEADER_IP,
  SPOOFED_XFF_PATH,
  SPOOFED_XFF_REMOTE_ADDR,
  type GeoSource,
  type LogEntry,
} from "./log_entries";

export {
  BOT_BROWSER,
  HOSTILE_BROWSER,
  HOSTILE_UA,
  INTERNAL_BROWSER,
  UNKNOWN_BROWSER,
} from "./user_agents";

const GEO_COUNTRY_CODES = [
  ...new Set(GEO_SOURCES.map((source) => source.country)),
].sort();

/** Skrajne kody po sortowaniu kolumny „Kraj”; wpisy bez kraju lądują na końcu w obu kierunkach. */
export const LOWEST_COUNTRY = GEO_COUNTRY_CODES[0];
export const HIGHEST_COUNTRY = GEO_COUNTRY_CODES[GEO_COUNTRY_CODES.length - 1];

/** Karta krajów ma pokazywać pełne nazwy, więc żaden z tych kodów nie może być nagłówkiem wiersza. */
export const BARE_COUNTRY_CODE = new RegExp(
  `\\b(?:${GEO_COUNTRY_CODES.join("|")})\\b`,
);

const PUBLIC_ENTRIES = ENTRIES.filter((entry) => entry.ip !== INTERNAL_IP);

/** Panel domyślnie odfiltrowuje loopback, więc to jest „Żądania łącznie” na czystym `/admin`. */
export const PUBLIC_TOTAL = PUBLIC_ENTRIES.length;
export const INTERNAL_TOTAL = ENTRIES.length - PUBLIC_TOTAL;
export const PUBLIC_UNIQUE_IPS = new Set(PUBLIC_ENTRIES.map((e) => e.ip)).size;
export const NOT_FOUND_TOTAL = PUBLIC_ENTRIES.filter(
  (entry) => entry.status === 404,
).length;

function category_of(entry: LogEntry): TrafficCategory | null {
  return CATEGORY_BY_UA.get(entry.ua) ?? null;
}

function public_count(category: TrafficCategory): number {
  return PUBLIC_ENTRIES.filter((entry) => category_of(entry) === category)
    .length;
}

function public_ips(category: TrafficCategory): readonly string[] {
  return [
    ...new Set(
      PUBLIC_ENTRIES.filter((entry) => category_of(entry) === category).map(
        (entry) => entry.ip,
      ),
    ),
  ].sort();
}

/** Ile wpisów spoza loopbacku chowa każda z sześciu flag — po jednej kategorii na flagę. */
export const EXCLUSION_TOTALS: Readonly<Record<ExclusionFlag, number>> = {
  excludeCrawlers: public_count("crawler"),
  excludeSeoTools: public_count("seo"),
  excludeScripts: public_count("script"),
  excludeHeadless: public_count("headless"),
  excludeUnknownUa: public_count("unknownUa"),
  excludeNoUa: public_count("noUa"),
};

/** Adresy wyłączne dla kategorii — po nich test poznaje, czy zniknęła dokładnie ona. */
export const EXCLUSION_IPS: Readonly<Record<ExclusionFlag, readonly string[]>> =
  {
    excludeCrawlers: public_ips("crawler"),
    excludeSeoTools: public_ips("seo"),
    excludeScripts: public_ips("script"),
    excludeHeadless: public_ips("headless"),
    excludeUnknownUa: public_ips("unknownUa"),
    excludeNoUa: public_ips("noUa"),
  };

/** „Żądania łącznie” przy wszystkich sześciu flagach włączonych (i bez loopbacku). */
export const PUBLIC_HUMAN_TOTAL = PUBLIC_ENTRIES.filter(
  (entry) => category_of(entry) === null,
).length;

/** To samo dla całego zbioru — health-checki loopbacku też są kategorią `script`. */
export const NON_HUMAN_TOTAL = ENTRIES.filter(
  (entry) => category_of(entry) !== null,
).length;

/** Pule dokumentacyjne RFC 5737: DB-IP nie mapuje ich na kraj, więc kubełek wychodzi `null`. */
const DOCUMENTATION_PREFIXES = ["192.0.2.", "198.51.100.", "203.0.113."];

const UNRESOLVED_IPS = [
  ...new Set(
    PUBLIC_ENTRIES.filter((entry) =>
      DOCUMENTATION_PREFIXES.some((prefix) => entry.ip.startsWith(prefix)),
    ).map((entry) => entry.ip),
  ),
];

/** `COUNTRY_IP_LIMIT` z `src/lib/logs/log_source_repository.ts` — stała prywatna, powtórzona świadomie. */
export const COUNTRY_IP_LIMIT = 8;

/** Ile adresów kubełka „Nieprzypisane” nie mieści się w limicie — wiersz „+N więcej IP”. */
export const UNRESOLVED_HIDDEN_IPS = Math.max(
  0,
  UNRESOLVED_IPS.length - COUNTRY_IP_LIMIT,
);

/** Skrajne ścieżki po posortowaniu kolumny „Ścieżka” (bez ruchu wewnętrznego). */
export const LOWEST_PATH = "/";
export const HIGHEST_PATH = HOSTILE_PATH;
/** Najniższa ścieżka wśród samych 404 — pierwszy wiersz przy `?status=404&sort=path&dir=asc`. */
export const LOWEST_NOT_FOUND_PATH = "/old-oferta";
/** Ten sam, jedyny wpis: adres z puli dokumentacyjnej, więc kraj wychodzi `null`. */
export const UNMAPPED_COUNTRY_PATH = LOWEST_NOT_FOUND_PATH;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const MINUTE_MILLIS = 60_000;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** strftime nginx-a: `25/Aug/2026:10:14:04 +0000`. */
function format_time(at: Date): string {
  const date = `${pad(at.getUTCDate())}/${MONTHS[at.getUTCMonth()]}/${at.getUTCFullYear()}`;
  const clock = `${pad(at.getUTCHours())}:${pad(at.getUTCMinutes())}:${pad(at.getUTCSeconds())}`;
  return `${date}:${clock} +0000`;
}

function format_line(entry: LogEntry, now: Date): string {
  const at = new Date(now.getTime() - entry.minutes_ago * MINUTE_MILLIS);
  const request = `${entry.method} ${entry.target} HTTP/1.1`;
  return (
    `${entry.ip} - - [${format_time(at)}] "${request}" ${entry.status} ${entry.bytes} ` +
    `"${entry.referrer}" "${entry.ua}" "${entry.xff}" "${entry.lang}"`
  );
}

/** Najstarsze linie na górze — plik rośnie jak prawdziwy log, bez rotacji. */
export function render_access_log(now: Date): string {
  const lines = [...ENTRIES]
    .sort((left, right) => right.minutes_ago - left.minutes_ago)
    .map((entry) => format_line(entry, now));
  return `${lines.join("\n")}\n`;
}
