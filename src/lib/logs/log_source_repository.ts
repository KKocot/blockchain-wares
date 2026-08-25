import { load_log_records } from "./source";
import type {
  LogDayBucket,
  LogPage,
  LogQuery,
  LogRepository,
  LogStatBucket,
  LogStats,
  RequestLog,
  SortDir,
  SortField,
} from "./types";

const TOP_LIMIT = 10;
const DAY_MILLIS = 86_400_000;
const MAX_SERIES_DAYS = 366;
const DIRECT_LABEL = "(direct)";
const UNKNOWN_LABEL = "(unknown)";
const STATUS_CLASS_SUFFIX = "xx";

/** Health-checki z loopbacku ida co ~30 s i zaglusza kazda statystyke. */
const LOOPBACK_PREFIXES = ["127.", "::ffff:127."];
const LOOPBACK_ADDRESSES = new Set(["::1", "0:0:0:0:0:0:0:1"]);

function timestamp_value(timestamp: string): number {
  const at = Date.parse(timestamp);
  return Number.isNaN(at) ? Number.NEGATIVE_INFINITY : at;
}

function day_key(timestamp: string): string | null {
  const at = timestamp_value(timestamp);
  return Number.isFinite(at) ? new Date(at).toISOString().slice(0, 10) : null;
}

function is_internal(log: RequestLog): boolean {
  if (log.ip === null) {
    return false;
  }
  const ip = log.ip.toLowerCase();
  return (
    LOOPBACK_ADDRESSES.has(ip) ||
    LOOPBACK_PREFIXES.some((prefix) => ip.startsWith(prefix))
  );
}

function matches_range(log: RequestLog, query: LogQuery): boolean {
  if (query.dateFrom === null && query.dateTo === null) {
    return true;
  }
  const at = timestamp_value(log.timestamp);
  if (!Number.isFinite(at)) {
    return false;
  }
  if (query.dateFrom !== null && at < timestamp_value(query.dateFrom)) {
    return false;
  }
  if (query.dateTo !== null && at > timestamp_value(query.dateTo)) {
    return false;
  }
  return true;
}

/** `404` dopasowuje dokladny kod, `4xx` cala klase. */
function matches_status(log: RequestLog, filter: string): boolean {
  if (filter.endsWith(STATUS_CLASS_SUFFIX)) {
    return Math.floor(log.status / 100) === Number(filter[0]);
  }
  return log.status === Number(filter);
}

function matches_search(log: RequestLog, needle: string): boolean {
  const haystack = [log.path, log.ip, log.ua, log.referrer];
  return haystack.some(
    (field) => field !== null && field.toLowerCase().includes(needle),
  );
}

function matches(log: RequestLog, query: LogQuery): boolean {
  if (!query.includeInternal && is_internal(log)) {
    return false;
  }
  if (
    query.path !== null &&
    !log.path.toLowerCase().includes(query.path.toLowerCase())
  ) {
    return false;
  }
  if (query.status !== null && !matches_status(log, query.status)) {
    return false;
  }
  if (
    query.search !== null &&
    !matches_search(log, query.search.toLowerCase())
  ) {
    return false;
  }
  return matches_range(log, query);
}

function sort_key(log: RequestLog, field: SortField): string | number | null {
  switch (field) {
    case "timestamp":
      return timestamp_value(log.timestamp);
    case "status":
      return log.status;
    case "method":
      return log.method;
    case "path":
      return log.path;
    case "ip":
      return log.ip;
    case "country":
      return log.country;
    case "lang":
      return log.lang;
    case "referrer":
      return log.referrer;
    case "ua":
      return log.ua;
  }
}

function compare_text(left: string, right: string): number {
  const lower_left = left.toLowerCase();
  const lower_right = right.toLowerCase();
  if (lower_left !== lower_right) {
    return lower_left < lower_right ? -1 : 1;
  }
  if (left === right) {
    return 0;
  }
  return left < right ? -1 : 1;
}

function make_comparator(
  field: SortField,
  dir: SortDir,
): (left: RequestLog, right: RequestLog) => number {
  const direction = dir === "asc" ? 1 : -1;

  return (left, right) => {
    const left_key = sort_key(left, field);
    const right_key = sort_key(right, field);

    if (left_key === null || right_key === null) {
      // Nulls always land at the end, in both directions.
      if (left_key !== right_key) {
        return left_key === null ? 1 : -1;
      }
    } else if (typeof left_key === "number" && typeof right_key === "number") {
      const diff = left_key - right_key;
      if (diff !== 0) {
        return diff < 0 ? -direction : direction;
      }
    } else {
      const diff = compare_text(String(left_key), String(right_key));
      if (diff !== 0) {
        return diff * direction;
      }
    }

    return compare_text(left.id, right.id);
  };
}

function top_buckets(counts: Map<string, number>): LogStatBucket[] {
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) =>
      right.count !== left.count
        ? right.count - left.count
        : compare_text(left.label, right.label),
    )
    .slice(0, TOP_LIMIT);
}

function bump(counts: Map<string, number>, label: string): void {
  counts.set(label, (counts.get(label) ?? 0) + 1);
}

function range_day(bound: string | null): string | undefined {
  return bound === null ? undefined : (day_key(bound) ?? undefined);
}

/**
 * Os czasu idzie po zakresie z zapytania, a dni bez trafien sa zerami. Rozpiecie jej
 * od pierwszego do ostatniego dnia Z DANYMI zawyzaloby avgPerDay: filtr na 30 dni
 * z ruchem tylko w 5 ostatnich dzielilby sume przez 5.
 */
function build_day_series(
  counts: Map<string, number>,
  query: LogQuery,
): LogDayBucket[] {
  const keys = [...counts.keys()].sort();
  const first = range_day(query.dateFrom) ?? keys[0];
  const last = range_day(query.dateTo) ?? keys[keys.length - 1];
  if (first === undefined || last === undefined) {
    return [];
  }

  const end = Date.parse(`${last}T00:00:00.000Z`);
  // dateFrom jest wejsciem uzytkownika: bez limitu zakres "od 1970" dalby tysiace
  // kubelkow w odpowiedzi i na wykresie.
  const start = Math.max(
    Date.parse(`${first}T00:00:00.000Z`),
    end - (MAX_SERIES_DAYS - 1) * DAY_MILLIS,
  );

  const series: LogDayBucket[] = [];
  for (let cursor = start; cursor <= end; cursor += DAY_MILLIS) {
    const date = new Date(cursor).toISOString().slice(0, 10);
    series.push({ date, count: counts.get(date) ?? 0 });
  }
  return series;
}

/** Read-only widok na log nginx pobierany przez `source.ts`. */
export class LogSourceRepository implements LogRepository {
  async list(query: LogQuery): Promise<LogPage> {
    const filtered = await this.filter(query);
    filtered.sort(make_comparator(query.sort, query.dir));

    const total = filtered.length;
    const start = (query.page - 1) * query.pageSize;

    return {
      items: filtered.slice(start, start + query.pageSize),
      total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.ceil(total / query.pageSize),
    };
  }

  async stats(query: LogQuery): Promise<LogStats> {
    const filtered = await this.filter(query);
    const ips = new Set<string>();
    const paths = new Map<string, number>();
    const statuses = new Map<string, number>();
    const referrers = new Map<string, number>();
    const langs = new Map<string, number>();
    const browsers = new Map<string, number>();
    const countries = new Map<string, number>();
    const days = new Map<string, number>();

    for (const log of filtered) {
      if (log.ip !== null) {
        ips.add(log.ip);
      }
      bump(paths, log.path);
      bump(statuses, String(log.status));
      bump(referrers, log.referrer ?? DIRECT_LABEL);
      bump(langs, log.lang ?? UNKNOWN_LABEL);
      bump(browsers, log.browser);
      bump(countries, log.country ?? UNKNOWN_LABEL);

      const day = day_key(log.timestamp);
      if (day !== null) {
        bump(days, day);
      }
    }

    const byDay = build_day_series(days, query);
    const avgPerDay =
      byDay.length === 0
        ? 0
        : Math.round((filtered.length / byDay.length) * 100) / 100;

    return {
      totalRequests: filtered.length,
      uniqueIps: ips.size,
      avgPerDay,
      topPaths: top_buckets(paths),
      topStatuses: top_buckets(statuses),
      topReferrers: top_buckets(referrers),
      topLangs: top_buckets(langs),
      topBrowsers: top_buckets(browsers),
      topCountries: top_buckets(countries),
      byDay,
    };
  }

  private async filter(query: LogQuery): Promise<RequestLog[]> {
    const { records } = await load_log_records();
    return records.filter((log) => matches(log, query));
  }
}
