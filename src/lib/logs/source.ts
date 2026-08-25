import { get_log_source_ttl_millis, get_log_source_url } from "../env";
import { parse_nginx_log } from "./nginx_parser";
import type { RequestLog } from "./types";

const FETCH_TIMEOUT_MS = 10_000;
/** Log rosnie bez rotacji — panel i tak pokazuje najnowszy ruch. */
const MAX_RECORDS = 20_000;

export interface LogSourceStatus {
  /** ISO ostatniego UDANEGO pobrania; null gdy cache jest pusty. */
  fetchedAt: string | null;
  ageMillis: number | null;
  /** Dane przeterminowane wzgledem TTL — widac po nieudanym odswiezeniu. */
  stale: boolean;
  /** Komunikat ostatniej nieudanej proby; dane w snapshocie sa wtedy z cache. */
  error: string | null;
  records: number;
  parsedLines: number;
  skippedLines: number;
}

export interface LogSnapshot {
  records: RequestLog[];
  status: LogSourceStatus;
}

interface CacheEntry {
  records: RequestLog[];
  fetchedAt: number;
  parsedLines: number;
  skippedLines: number;
}

let cache: CacheEntry | null = null;
let last_error: string | null = null;
/** Kilka rownoleglych zadan panelu ma dzielic jedno pobranie, nie zalewac zrodla. */
let inflight: Promise<CacheEntry> | null = null;

function describe_network_error(error: unknown): string {
  if (
    error instanceof Error &&
    (error.name === "TimeoutError" || error.name === "AbortError")
  ) {
    return `Log source did not respond within ${FETCH_TIMEOUT_MS / 1000}s.`;
  }
  return "Log source is unreachable.";
}

/**
 * Komunikaty sa budowane tutaj, a nie przepisywane z bledu fetcha: URL zrodla ma
 * token w sciezce i nie moze wyciec do odpowiedzi API ani do logow aplikacji.
 */
async function fetch_entry(): Promise<CacheEntry> {
  const url = get_log_source_url();

  let response: Response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { accept: "text/plain" },
      redirect: "follow",
    });
  } catch (error) {
    throw new Error(describe_network_error(error));
  }

  if (!response.ok) {
    throw new Error(`Log source responded with HTTP ${response.status}.`);
  }

  let text: string;
  try {
    text = await response.text();
  } catch (error) {
    throw new Error(describe_network_error(error));
  }

  const parsed = parse_nginx_log(text, MAX_RECORDS);
  return {
    records: parsed.records,
    fetchedAt: Date.now(),
    parsedLines: parsed.parsedLines,
    skippedLines: parsed.skippedLines,
  };
}

function refresh(): Promise<CacheEntry> {
  inflight ??= fetch_entry()
    .then((entry) => {
      cache = entry;
      last_error = null;
      return entry;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

function describe(entry: CacheEntry | null, ttl: number): LogSourceStatus {
  if (entry === null) {
    return {
      fetchedAt: null,
      ageMillis: null,
      stale: true,
      error: last_error,
      records: 0,
      parsedLines: 0,
      skippedLines: 0,
    };
  }
  const age = Date.now() - entry.fetchedAt;
  return {
    fetchedAt: new Date(entry.fetchedAt).toISOString(),
    ageMillis: age,
    stale: age > ttl,
    error: last_error,
    records: entry.records.length,
    parsedLines: entry.parsedLines,
    skippedLines: entry.skippedLines,
  };
}

export interface LoadOptions {
  /** Pomija TTL — przycisk odswiezenia w panelu. */
  force?: boolean;
}

/**
 * Zdalne zrodlo moze paść w dowolnej chwili, a panel ma wtedy pokazac ostatnie
 * znane dane z adnotacja o bledzie i wieku. Wyjatek leci dopiero, gdy cache jest
 * pusty — wtedy nie ma czego pokazac.
 */
export async function load_log_records(
  options: LoadOptions = {},
): Promise<LogSnapshot> {
  const ttl = get_log_source_ttl_millis();
  const cached = cache;

  if (
    cached !== null &&
    options.force !== true &&
    Date.now() - cached.fetchedAt < ttl
  ) {
    return { records: cached.records, status: describe(cached, ttl) };
  }

  try {
    const entry = await refresh();
    return { records: entry.records, status: describe(entry, ttl) };
  } catch (error) {
    last_error = error instanceof Error ? error.message : String(error);
    if (cached === null) {
      throw new Error(last_error);
    }
    return { records: cached.records, status: describe(cached, ttl) };
  }
}

/** Stan cache bez ruszania sieci — do naglowka panelu. */
export function get_log_source_status(): LogSourceStatus {
  return describe(cache, get_log_source_ttl_millis());
}
