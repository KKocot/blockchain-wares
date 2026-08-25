import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT_DIR,
  DEFAULT_SORT_FIELD,
  MAX_PAGE_SIZE,
  SORT_FIELDS,
  type LogQuery,
  type SortDir,
  type SortField,
} from "./types";

const ISO_DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})?)?$/;

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const END_OF_DAY = "T23:59:59.999Z";

const INTEGER_PATTERN = /^[+-]?\d+$/;
const STATUS_CODE_PATTERN = /^[1-5]\d{2}$/;
const STATUS_CLASS_PATTERN = /^[1-5]xx$/;
const TRUTHY_FLAGS = new Set(["1", "true", "yes", "on"]);

function read_text(params: URLSearchParams, key: string): string | null {
  const raw = params.get(key);
  if (raw === null) {
    return null;
  }
  const trimmed = raw.trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * Sama data bez godziny opisuje caly dzien, a repozytorium filtruje inkluzywnie:
 * `dateTo=2026-08-20` bez rozwiniecia do konca dnia gubilby caly ten dzien. Jawnie
 * podany instant zostaje uzyty doslownie — UI wysyla koniec dnia sam z siebie.
 */
function read_date(
  params: URLSearchParams,
  key: string,
  edge: "start" | "end",
): string | null {
  const raw = read_text(params, key);
  if (raw === null || !ISO_DATE_PATTERN.test(raw)) {
    return null;
  }
  const value =
    edge === "end" && DATE_ONLY_PATTERN.test(raw) ? `${raw}${END_OF_DAY}` : raw;
  const millis = Date.parse(value);
  return Number.isNaN(millis) ? null : new Date(millis).toISOString();
}

function read_integer(params: URLSearchParams, key: string): number | null {
  const raw = read_text(params, key);
  if (raw === null || !INTEGER_PATTERN.test(raw)) {
    return null;
  }
  const value = Number.parseInt(raw, 10);
  return Number.isSafeInteger(value) ? value : null;
}

/** Panel wysyla albo dokladny kod (`404`), albo klase (`4xx`); reszta to smiec z URL-a. */
function read_status(params: URLSearchParams): string | null {
  const raw = read_text(params, "status");
  if (raw === null) {
    return null;
  }
  const normalized = raw.toLowerCase();
  return STATUS_CODE_PATTERN.test(normalized) ||
    STATUS_CLASS_PATTERN.test(normalized)
    ? normalized
    : null;
}

function read_flag(params: URLSearchParams, key: string): boolean {
  const raw = read_text(params, key);
  return raw !== null && TRUTHY_FLAGS.has(raw.toLowerCase());
}

function is_sort_field(value: string): value is SortField {
  return (SORT_FIELDS as readonly string[]).includes(value);
}

function is_sort_dir(value: string): value is SortDir {
  return value === "asc" || value === "desc";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function parse_log_query(params: URLSearchParams): LogQuery {
  const sort = read_text(params, "sort");
  const dir = read_text(params, "dir");
  const page = read_integer(params, "page");
  const pageSize = read_integer(params, "pageSize");

  return {
    path: read_text(params, "path"),
    status: read_status(params),
    dateFrom: read_date(params, "dateFrom", "start"),
    dateTo: read_date(params, "dateTo", "end"),
    search: read_text(params, "search"),
    includeInternal: read_flag(params, "includeInternal"),
    sort: sort !== null && is_sort_field(sort) ? sort : DEFAULT_SORT_FIELD,
    dir: dir !== null && is_sort_dir(dir) ? dir : DEFAULT_SORT_DIR,
    page: page === null ? 1 : Math.max(page, 1),
    pageSize:
      pageSize === null ? DEFAULT_PAGE_SIZE : clamp(pageSize, 1, MAX_PAGE_SIZE),
  };
}

export function serialize_log_query(query: LogQuery): URLSearchParams {
  const params = new URLSearchParams();

  if (query.path !== null) {
    params.set("path", query.path);
  }
  if (query.status !== null) {
    params.set("status", query.status);
  }
  if (query.search !== null) {
    params.set("search", query.search);
  }
  if (query.includeInternal) {
    params.set("includeInternal", "1");
  }
  if (query.dateFrom !== null) {
    params.set("dateFrom", query.dateFrom);
  }
  if (query.dateTo !== null) {
    params.set("dateTo", query.dateTo);
  }
  if (query.sort !== DEFAULT_SORT_FIELD) {
    params.set("sort", query.sort);
  }
  if (query.dir !== DEFAULT_SORT_DIR) {
    params.set("dir", query.dir);
  }
  if (query.page !== 1) {
    params.set("page", String(query.page));
  }
  if (query.pageSize !== DEFAULT_PAGE_SIZE) {
    params.set("pageSize", String(query.pageSize));
  }

  return params;
}
