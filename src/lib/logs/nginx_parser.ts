import { lookup_country } from "../geo";
import type { RequestLog } from "./types";
import { parse_user_agent } from "./user_agent";

/**
 * nginx `combined` + dwa dodatkowe pola cytowane:
 * `$remote_addr - $remote_user [$time_local] "$request" $status $bytes "$referer" "$user_agent" "$xff" "$accept_language"`.
 * Dwa ostatnie sa opcjonalne — linie sprzed zmiany log_format tez maja sie parsowac.
 */
const LINE_PATTERN =
  /^(\S+) \S+ (\S+) \[([^\]]+)\] "((?:[^"\\]|\\.)*)" (\d{3}) (\d+|-) "((?:[^"\\]|\\.)*)" "((?:[^"\\]|\\.)*)"(?: "(?:[^"\\]|\\.)*")?(?: "((?:[^"\\]|\\.)*)")?\s*$/;

const TIME_PATTERN =
  /^(\d{1,2})\/([A-Za-z]{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2}) ([+-])(\d{2})(\d{2})$/;

const METHOD_PATTERN = /^[A-Z]{3,10}$/;
const PROTOCOL_PATTERN = /^HTTP\/\d(?:\.\d)?$/;
const ESCAPE_PATTERN = /\\x([0-9A-Fa-f]{2})|\\(.)/g;

const MONTHS: Readonly<Record<string, number>> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

const MINUTE_MILLIS = 60_000;
const HOUR_MILLIS = 3_600_000;

export interface NginxParseResult {
  /** Najstarszy pierwszy — repozytorium sortuje samo, ale agregacje lubia porzadek. */
  records: RequestLog[];
  parsedLines: number;
  skippedLines: number;
  skipReasons: {
    malformed: number;
    timestamp: number;
    request: number;
  };
}

interface RequestParts {
  method: string;
  path: string;
  query: string | null;
}

function decode_escapes(value: string): string {
  if (!value.includes("\\")) {
    return value;
  }
  return value.replace(
    ESCAPE_PATTERN,
    (_match, hex: string | undefined, raw) =>
      hex === undefined
        ? String(raw)
        : String.fromCharCode(Number.parseInt(hex, 16)),
  );
}

/** nginx zapisuje brak wartosci jako `-`. */
function dash_to_null(value: string | undefined): string | null {
  if (value === undefined) {
    return null;
  }
  const decoded = decode_escapes(value).trim();
  return decoded === "" || decoded === "-" ? null : decoded;
}

/**
 * `25/Aug/2026:10:14:04 +0000` to strftime nginx-a, ktorego `Date.parse` nie rozumie
 * przenosnie — miesiac po nazwie, offset bez dwukropka.
 */
export function parse_nginx_time(value: string): string | null {
  const match = TIME_PATTERN.exec(value);
  if (match === null) {
    return null;
  }
  const [, day, month_name, year, hour, minute, second, sign, tz_h, tz_m] =
    match;
  const month = MONTHS[String(month_name).toLowerCase()];
  if (month === undefined) {
    return null;
  }

  const local = Date.UTC(
    Number(year),
    month,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );
  const offset = Number(tz_h) * HOUR_MILLIS + Number(tz_m) * MINUTE_MILLIS;
  const at = sign === "-" ? local + offset : local - offset;
  return Number.isFinite(at) ? new Date(at).toISOString() : null;
}

/**
 * Skanery wysylaja w linii requestu binaria i obciete smieci — takie wpisy pomijamy,
 * zamiast wpuszczac do panelu wiersze z metoda `\x16\x03`.
 */
export function parse_request_line(request: string): RequestParts | null {
  const parts = decode_escapes(request).split(" ");
  const method = parts[0];
  if (
    method === undefined ||
    parts.length < 2 ||
    !METHOD_PATTERN.test(method)
  ) {
    return null;
  }

  // Niezakodowana spacja w URI trafia do logu doslownie, wiec cel to wszystko
  // miedzy metoda a protokolem — a protokolu brak w requestach HTTP/0.9.
  const tail = parts[parts.length - 1];
  const has_protocol =
    parts.length > 2 && tail !== undefined && PROTOCOL_PATTERN.test(tail);
  if (parts.length > 2 && !has_protocol) {
    return null;
  }
  const target = has_protocol
    ? parts.slice(1, -1).join(" ")
    : parts.slice(1).join(" ");

  const uri = to_uri(target);
  if (uri === null) {
    return null;
  }

  const cut = uri.indexOf("?");
  if (cut === -1) {
    return { method, path: uri, query: null };
  }
  const query = uri.slice(cut + 1);
  return {
    method,
    path: uri.slice(0, cut),
    query: query === "" ? null : query,
  };
}

/** Proxy-scany leca w formie absolutnej (`GET http://host/sciezka`) — bierzemy sama sciezke. */
function to_uri(target: string): string | null {
  if (target.startsWith("/")) {
    return target;
  }
  if (!/^https?:\/\//i.test(target)) {
    return null;
  }
  try {
    const url = new URL(target);
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

type SkipReason = "malformed" | "timestamp" | "request";

type LineOutcome = { record: RequestLog } | { skip: SkipReason };

function parse_line(line: string, line_number: number): LineOutcome {
  const match = LINE_PATTERN.exec(line);
  if (match === null) {
    return { skip: "malformed" };
  }
  const [
    ,
    remote_addr,
    ,
    time_local,
    request,
    status,
    bytes,
    referrer,
    ua,
    lang,
  ] = match;

  const timestamp = parse_nginx_time(time_local);
  if (timestamp === null) {
    return { skip: "timestamp" };
  }

  const parts = parse_request_line(request);
  if (parts === null) {
    return { skip: "request" };
  }

  const user_agent = dash_to_null(ua);
  const agent = parse_user_agent(user_agent);
  const ip = dash_to_null(remote_addr);
  return {
    record: {
      // Log jest append-only, wiec numer linii w pliku jest stabilnym identyfikatorem
      // miedzy odswiezeniami; padding trzyma porzadek leksykalny zgodny z numerycznym.
      id: String(line_number).padStart(9, "0"),
      timestamp,
      method: parts.method,
      path: parts.path,
      query: parts.query,
      status: Number(status),
      bytes: bytes === "-" ? 0 : Number(bytes),
      // $remote_addr, nie X-Forwarded-For: naglowek jest spoofowalny i w logu sa juz
      // wpisy z podstawionym adresem.
      ip,
      country: lookup_country(ip),
      lang: dash_to_null(lang),
      referrer: dash_to_null(referrer),
      ua: user_agent,
      browser: agent.browser,
      is_bot: agent.is_bot,
    },
  };
}

/**
 * Czyta od konca, bo panel pokazuje najnowszy ruch, a plik rosnie bez rotacji —
 * przy limicie `max_records` starsze linie nie sa nawet dotykane.
 */
export function parse_nginx_log(
  text: string,
  max_records: number,
): NginxParseResult {
  const lines = text.split("\n");
  const records: RequestLog[] = [];
  const skipReasons = { malformed: 0, timestamp: 0, request: 0 };
  let skippedLines = 0;

  for (let index = lines.length - 1; index >= 0; index -= 1) {
    if (records.length >= max_records) {
      break;
    }
    const line = lines[index].trim();
    if (line === "") {
      continue;
    }

    const outcome = parse_line(line, index + 1);
    if ("record" in outcome) {
      records.push(outcome.record);
    } else {
      skipReasons[outcome.skip] += 1;
      skippedLines += 1;
    }
  }

  records.reverse();
  return {
    records,
    parsedLines: records.length,
    skippedLines,
    skipReasons,
  };
}
