import type { TradeFairEvent } from "../../components/events-data";
import { get_events_api_key, get_events_api_url } from "../env";
import { parse_event } from "./parse_event";
import { invalidate_events_cache, load_events } from "./source";

/** Wiecej niz 5 s odczytu listy: tam poddanie sie kosztuje render, tutaj — przepisanie formularza. */
const FETCH_TIMEOUT_MS = 15_000;

/** Kontraktowy limit ciala mutacji (backend odpowiada 413) — sprawdzany przed wyslaniem. */
const MAX_BODY_BYTES = 64 * 1024;

const EVENTS_PATH = "/events";

const MAX_DETAIL_LINES = 10;
const MAX_TEXT_LENGTH = 200;

/** Wzorzec i limit dlugosci `id` z backendu; kopia, bo w parse_event.ts wzorzec jest prywatny. */
const EVENT_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_EVENT_ID_LENGTH = 100;

/** C0/C1 (Cc) i separatory linii (Zl/Zp): CR/LF w komunikacie rozwala `Location` przy 303. */
const CONTROL_CHARS = /[\p{Cc}\p{Zl}\p{Zp}]+/gu;

/** Samotny surrogate wywraca `encodeURIComponent` na URIError — czyli 500 zamiast redirectu. */
const LONE_SURROGATE = /\p{Cs}/gu;

/**
 * Bledy, przy ktorych zadanie NIE doszlo do serwera. ECONNRESET, EPIPE i UND_ERR_SOCKET
 * (zerwanie juz po wyslaniu) daja ten sam `TypeError('fetch failed')`, wiec ich tu nie ma.
 */
const NO_CONNECTION_CODES = new Set(
  "ENOTFOUND EAI_AGAIN ECONNREFUSED EHOSTUNREACH ENETUNREACH".split(" "),
);

/** Odrzucony certyfikat = handshake nie doszedl do skutku, wiec zapisu nie bylo. */
const TLS_FAILURE_CODE =
  /^(?:ERR_TLS_|CERT_|UNABLE_TO_|SELF_SIGNED_|DEPTH_ZERO_|HOSTNAME_MISMATCH)/;

/**
 * Kody sa URL-safe: endpoint panelu wpisuje je wprost w `?error=` przy 303, tak samo jak
 * `FormBodyRejection` w src/lib/api/form_body.ts. Po redirekcie przezywa tylko kod, wiec
 * rozdzielone sa po tym, co kaza zrobic uzytkownikowi:
 *
 * - `unreachable` — na pewno nie zapisano (DNS, odmowa polaczenia, certyfikat, 408/429/503).
 * - `uncertain` — nie wiadomo (timeout, zerwane polaczenie, 5xx): najpierw odswiez liste.
 * - `malformed_response` — zapis przeszedl, nie rozumiemy odpowiedzi: odswiez liste.
 * - `unauthorized`, `misconfigured` — blad wdrozenia (rozjechany klucz, zly adres), nie dane.
 */
export type EventMutationErrorCode =
  | "duplicate_id"
  | "not_found"
  | "rejected"
  | "unauthorized"
  | "too_large"
  | "unreachable"
  | "uncertain"
  | "malformed_response"
  | "misconfigured"
  | "unknown";

export interface EventMutationSuccess {
  ok: true;
  /** Rekord tak, jak zapisal go backend; przy DELETE — rekord skasowany. */
  event: TradeFairEvent;
}

export interface EventMutationFailure {
  ok: false;
  code: EventMutationErrorCode;
  /**
   * Bez klucza, bez znakow sterujacych, dobrze uformowany UTF-16. Do URL-a wchodzi przez
   * `URLSearchParams`, NIE konkatenacja: `Headers` odrzuca znaki spoza Latin-1.
   */
  message: string;
  /** Tylko dla `rejected` — pola odrzucone przez walidacje backendu. */
  details?: readonly string[];
}

export type EventMutationResult = EventMutationSuccess | EventMutationFailure;

const REJECTED_ID: EventMutationFailure = {
  ok: false,
  code: "not_found",
  message: "The event id is missing or malformed.",
};

/** Klucze opcjonalne `TradeFairEvent` — tylko te wolno skasowac `null`-em. */
type OptionalEventKey = {
  [K in keyof TradeFairEvent]-?: {} extends Pick<TradeFairEvent, K> ? K : never;
}[keyof TradeFairEvent];

/** Pole pominiete zostaje bez zmian, `null` kasuje (`$unset`); wymagane nie sa nullowalne. */
export type EventPatch = Partial<Omit<TradeFairEvent, OptionalEventKey>> & {
  [K in OptionalEventKey]?: TradeFairEvent[K] | null;
};

export function create_event(
  event: TradeFairEvent,
): Promise<EventMutationResult> {
  return send("POST", EVENTS_PATH, event);
}

export function update_event(
  id: string,
  patch: EventPatch,
): Promise<EventMutationResult> {
  const path = build_event_path(id);
  return path === null
    ? Promise.resolve(REJECTED_ID)
    : send("PATCH", path, patch);
}

export function delete_event(id: string): Promise<EventMutationResult> {
  const path = build_event_path(id);
  return path === null ? Promise.resolve(REJECTED_ID) : send("DELETE", path);
}

type MutationMethod = "POST" | "PATCH" | "DELETE";

/** Jedna proba: powtorzony POST po timeoucie tworzy drugie wydarzenie albo wraca jako 409. */
async function send(
  method: MutationMethod,
  path: string,
  body?: unknown,
): Promise<EventMutationResult> {
  let url: string;
  let api_key: string;
  try {
    url = build_url(path);
    api_key = get_events_api_key();
  } catch (error) {
    return {
      ok: false,
      code: "misconfigured",
      message: clean(error instanceof Error ? error.message : String(error)),
    };
  }

  const payload = body === undefined ? undefined : serialize(body);
  if (payload === null) {
    return {
      ok: false,
      code: "unknown",
      message: "The event payload could not be serialized to JSON.",
    };
  }
  // Backend odpowiedzialby 413; przesylanie tego przez siec nic by nie wnioslo.
  if (payload !== undefined && byte_length(payload) > MAX_BODY_BYTES) {
    return {
      ok: false,
      code: "too_large",
      message: default_message("too_large", 413),
    };
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: build_headers(api_key, payload !== undefined),
      body: payload,
      // NIE "follow": undici zdejmuje przy zmianie originu `Authorization`, `Cookie` i `Host`,
      // ale nie `X-API-Key` — `Location` z backendu albo z proxy wyslalby klucz na obcy host.
      redirect: "manual",
    });
  } catch (error) {
    return describe_network_failure(error);
  }

  if (is_redirect(response)) return redirect_failure(response.status);

  return response.ok
    ? await read_success(response)
    : await read_failure(response, api_key);
}

/** Jedyne miejsce, gdzie klucz trafia do zadania; nizej krazy tylko jako wzorzec dla `redact`. */
function build_headers(api_key: string, has_body: boolean): HeadersInit {
  const headers: Record<string, string> = {
    accept: "application/json",
    "x-api-key": api_key,
  };
  if (has_body) headers["content-type"] = "application/json";
  return headers;
}

/** `redirect: "manual"` daje odpowiedz typu `opaqueredirect` ze statusem 0, nie 3xx. */
function is_redirect(response: Response): boolean {
  return (
    response.type === "opaqueredirect" ||
    (response.status >= 300 && response.status < 400)
  );
}

function redirect_failure(status: number): EventMutationFailure {
  return {
    ok: false,
    code: "misconfigured",
    message: `Events API redirected the write${status === 0 ? "" : ` (HTTP ${status})`}. EVENTS_API_URL must point straight at the module base: following the redirect would carry the service key to another host.`,
  };
}

/** Cialo przed cache: oba na tym samym sygnale, wiec odwrotna kolejnosc psula wolne 2xx. */
async function read_success(response: Response): Promise<EventMutationResult> {
  const payload = await read_json(response);
  await refresh_after_write();

  const event = parse_event(payload);
  if (event === null) {
    return {
      ok: false,
      code: "malformed_response",
      message:
        "Events API accepted the write but returned an event we cannot read. Refresh the list to see the current state.",
    };
  }

  return { ok: true, event };
}

/** Para zostaje w module (strony nie moga o niej pamietac); source.ts ma 20 s cooldownu. */
async function refresh_after_write(): Promise<void> {
  invalidate_events_cache();
  try {
    await load_events({ force: true });
  } catch {
    // Wpis zostal wygaszony, wiec kolejny render sprobuje pobrac liste sam.
  }
}

async function read_failure(
  response: Response,
  api_key: string,
): Promise<EventMutationFailure> {
  const envelope = as_record(await read_json(response));
  const code = code_for_status(response.status);
  // Jak wyzej: "moze zapisano" bez inwalidacji konczy sie ponowieniem i duplikatem.
  if (code === "uncertain") invalidate_events_cache();

  const reported =
    envelope === null ? null : safe_text(envelope.error, api_key);

  // Przy 401 wygrywa nasz komunikat: backendowe "Unauthorized" brzmi dla obslugujacego
  // panel jak blad danych, a chodzi o rozjechany klucz miedzy strona a backendem.
  const message =
    code === "unauthorized" || reported === null
      ? default_message(code, response.status)
      : reported;

  const details =
    code === "rejected" ? read_details(envelope?.details, api_key) : undefined;

  return details === undefined
    ? { ok: false, code, message }
    : { ok: false, code, message, details };
}

/** 408/429/503 = odmowa przyjecia, nic nie zapisano; reszta 5xx moze przyjsc juz po zapisie. */
function code_for_status(status: number): EventMutationErrorCode {
  switch (status) {
    case 400:
    case 422:
      return "rejected";
    case 401:
    case 403:
      return "unauthorized";
    case 404:
      return "not_found";
    case 409:
      return "duplicate_id";
    case 413:
      return "too_large";
    case 408:
    case 429:
    case 503:
      return "unreachable";
    default:
      return status >= 500 ? "uncertain" : "unknown";
  }
}

function default_message(code: EventMutationErrorCode, status: number): string {
  switch (code) {
    case "duplicate_id":
      return "An event with this id already exists.";
    case "not_found":
      return "This event no longer exists.";
    case "rejected":
      return "Events API rejected the event data.";
    case "unauthorized":
      return "Events API rejected the service key: EVENTS_API_KEY does not match the key configured in the backend.";
    case "too_large":
      return "The event payload is larger than the 64 KiB the API accepts — shorten the description.";
    case "unreachable":
      return status === 429
        ? "Events API is rate limiting writes. Nothing was saved; try again in a moment."
        : `Events API is not accepting requests (HTTP ${status}). Nothing was saved; try again.`;
    case "uncertain":
      return `Events API failed with HTTP ${status}. The write may still have gone through — refresh the list before trying again.`;
    default:
      return `Events API responded with HTTP ${status}.`;
  }
}

/** Komunikat lokalny, nie z bledu fetcha: base URL nosi userinfo, a `cause` bywa z naglowkami. */
function describe_network_failure(error: unknown): EventMutationFailure {
  const aborted =
    error instanceof Error &&
    (error.name === "TimeoutError" || error.name === "AbortError");

  if (never_reached_server(error)) {
    return {
      ok: false,
      code: "unreachable",
      message: "Events API is unreachable. Nothing was saved; try again.",
    };
  }

  // Zapis mogl wyladowac w bazie: gdyby cache zostal wazny, panel pokazalby stan sprzed
  // zapisu, czlowiek ponowilby i dostal duplikat albo 409.
  invalidate_events_cache();
  return {
    ok: false,
    code: "uncertain",
    message: aborted
      ? `Events API did not respond within ${FETCH_TIMEOUT_MS / 1000}s. The write may still have gone through — refresh the list before trying again.`
      : "The connection to the Events API broke. The write may still have gone through — refresh the list before trying again.",
  };
}

/** Domysl jest ostrozny: nieznany blad sieci to "nie wiem", nie "na pewno nie zapisano". */
function never_reached_server(error: unknown): boolean {
  let current: unknown = error;

  for (
    let depth = 0;
    depth < 4 && current !== null && typeof current === "object";
    depth += 1
  ) {
    const { code, cause } = current as { code?: unknown; cause?: unknown };
    if (
      typeof code === "string" &&
      (NO_CONNECTION_CODES.has(code) || TLS_FAILURE_CODE.test(code))
    ) {
      return true;
    }
    current = cause;
  }

  return false;
}

function to_entries(value: unknown): readonly unknown[] {
  if (Array.isArray(value)) return value;
  return value === undefined || value === null ? [] : [value];
}

/** Konkatenacja, nie `new URL(path, base)`: konstruktor gubi ostatni segment bazy. */
function build_url(path: string): string {
  const base = get_events_api_url();

  if (base.includes("?") || base.includes("#")) {
    throw new Error(
      "EVENTS_API_URL must be a plain base URL: a query string or fragment breaks path concatenation.",
    );
  }

  return `${base}${path}`;
}

/**
 * `encodeURIComponent` nie koduje kropek, wiec `id` rowne `..` normalizowaloby adres do
 * innego zasobu — z waznym kluczem w naglowku. Przechodzi tylko slug w ksztalcie backendu.
 */
function build_event_path(id: string): string | null {
  const trimmed = id.trim();
  return trimmed.length <= MAX_EVENT_ID_LENGTH && EVENT_ID.test(trimmed)
    ? `${EVENTS_PATH}/${encodeURIComponent(trimmed)}`
    : null;
}

function serialize(body: unknown): string | null {
  try {
    const json = JSON.stringify(body);
    return typeof json === "string" ? json : null;
  } catch {
    return null;
  }
}

/** Limit kontraktu jest w bajtach, a opis wydarzenia bywa w UTF-8 szerszy niz w znakach. */
function byte_length(payload: string): number {
  return new TextEncoder().encode(payload).byteLength;
}

/** `null` zamiast wyjatku: cialo bledu bywa HTML-em z proxy, a status i tak juz mamy. */
async function read_json(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function as_record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** Whitelist znanych pol: nieznanych kluczy nie kopiujemy, wiec odbity naglowek nie wyjdzie. */
function read_details(
  value: unknown,
  api_key: string,
): readonly string[] | undefined {
  const lines: string[] = [];

  for (const entry of to_entries(value)) {
    const line = describe_detail(entry, api_key);
    if (line !== null) lines.push(line);
    if (lines.length === MAX_DETAIL_LINES) break;
  }

  return lines.length > 0 ? lines : undefined;
}

function describe_detail(entry: unknown, api_key: string): string | null {
  const value = unwrap_json(entry);
  const record = as_record(value);
  if (record === null) return safe_text(value, api_key);

  const field = safe_text(
    record.property ?? record.path ?? record.field,
    api_key,
  );
  const message = safe_text(record.summary ?? record.message, api_key);

  if (message === null) return field;
  return field === null ? message : `${field}: ${message}`;
}

/** Elysia wklada w `details` blad z echem ciala: 200 znakow JSON-a nikomu nie pomoze. */
function unwrap_json(entry: unknown): unknown {
  if (typeof entry !== "string") return entry;

  const trimmed = entry.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return entry;

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return null;
  }
}

function safe_text(value: unknown, api_key: string): string | null {
  if (typeof value !== "string") return null;

  const cleaned = clean(redact(value, api_key));
  return cleaned.length === 0 ? null : cleaned;
}

/** Ostatnia deska ratunku: gdyby backend odbil klucz w tresci, i tak nie wyjdzie na wierzch. */
function redact(text: string, api_key: string): string {
  return api_key.length >= 8 ? text.split(api_key).join("[redacted]") : text;
}

/**
 * Kontrakt obiecuje tekst gotowy do URL-a: CR/LF wywraca `Headers`, samotny surrogate —
 * `encodeURIComponent`. Ciecie po code pointach, zeby limit nie rozerwal emoji na pol.
 */
function clean(text: string): string {
  const collapsed = well_formed(text)
    .replace(CONTROL_CHARS, " ")
    .replace(/\s+/g, " ")
    .trim();

  const points = Array.from(collapsed);
  return points.length <= MAX_TEXT_LENGTH
    ? collapsed
    : `${points.slice(0, MAX_TEXT_LENGTH - 1).join("")}…`;
}

/** `toWellFormed` jest w Node 20+; starsze srodowisko zdejmuje samotne surrogaty regexem. */
function well_formed(text: string): string {
  const value = text as string & { toWellFormed?: () => string };
  return value.toWellFormed?.() ?? text.replace(LONE_SURROGATE, "");
}
