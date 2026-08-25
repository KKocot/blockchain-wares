import type { APIRoute } from "astro";
import { is_same_site_request, json_error } from "../../../lib/api";
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  consume_login_attempt,
  create_session_token,
  login_client_key,
  reset_login_attempts,
  verify_password,
} from "../../../lib/auth";
import { get_auth_config, get_session_not_before } from "../../../lib/env";

export const prerender = false;

const MAX_BODY_BYTES = 4096;
const FORM_MEDIA_TYPE = "application/x-www-form-urlencoded";
const LOGIN_PATH = "/admin/login";
const DEFAULT_TARGET = "/admin";

/** Zamknieta lista kodow renderowanych przez /admin/login — nic spoza niej nie trafia do URL-a. */
type LoginErrorCode = "invalid" | "empty" | "request" | "rate_limit" | "server";

type Credentials = {
  password: string;
  redirect: string | null;
};

/** Przegladarka wycina TAB/CR/LF z URL-a przed parsowaniem, wiec `/<TAB>/host`
 *  ominalby sam test na `//` — znaki sterujace usuwamy przed walidacja. */
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;

/**
 * Sprowadza cel przekierowania do sciezki w tym samym originie. Zwraca zawsze
 * sciezke wzgledna, nigdy adresu absolutnego — zrodlo `origin` nie moze wiec
 * przeciec do naglowka Location, nawet gdy klient podszyje sie naglowkiem Host.
 */
export function safe_target(raw: string | null, origin: string): string {
  if (raw === null) {
    return DEFAULT_TARGET;
  }

  const path = raw.replace(CONTROL_CHARS, "");
  if (!is_local_path(path)) {
    return DEFAULT_TARGET;
  }

  try {
    const url = new URL(path, origin);
    if (url.origin !== origin) {
      return DEFAULT_TARGET;
    }
    const resolved = `${url.pathname}${url.search}${url.hash}`;
    // `/x/..//evil.com` i `/.//evil.com` przechodza test wejsciowy, ale normalizacja
    // zwija je do `//evil.com` — protokolo-wzglednego adresu. Stad drugi test.
    return is_local_path(resolved) ? resolved : DEFAULT_TARGET;
  } catch {
    return DEFAULT_TARGET;
  }
}

/** Sciezka w tym samym originie: jeden wiodacy slash, nigdy `//` ani `/\`. */
function is_local_path(path: string): boolean {
  return (
    path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\")
  );
}

export const POST: APIRoute = async (context) => {
  const { cookies, request, url } = context;

  try {
    if (!is_same_site_request(request) || is_cross_site_fetch(request)) {
      return json_error(403, "Żądanie z obcej domeny.");
    }

    const { admin_password_hash, auth_secret } = get_auth_config();
    // Wolane tutaj celowo: bledny SESSION_NOT_BEFORE ma wysypac logowanie glosnym
    // 500, a nie po cichu uniewazniac kazda wydana sesje przy jej weryfikacji.
    get_session_not_before();

    const credentials = await read_credentials(request);
    // Formularz zawsze wysyla poprawne pole i typ tresci, wiec tu wpada wylacznie
    // klient spoza strony — nie ma go czym obsluzyc na stronie logowania.
    if (credentials === null) {
      return json_error(400, "Nieprawidłowe żądanie.");
    }

    const target = safe_target(credentials.redirect, url.origin);
    if (credentials.password === "") {
      return login_redirect("empty", target);
    }

    const client_key = login_client_key(context);
    const verdict = consume_login_attempt(client_key);
    if (!verdict.allowed) {
      return login_redirect("rate_limit", target, verdict.retry_after_seconds);
    }

    if (!(await verify_password(credentials.password, admin_password_hash))) {
      return login_redirect("invalid", target);
    }

    reset_login_attempts(client_key);
    cookies.set(
      SESSION_COOKIE_NAME,
      create_session_token(auth_secret),
      SESSION_COOKIE_OPTIONS,
    );
    return redirect_to(target);
  } catch (error) {
    // Logujemy sama przyczyne — tresc zadania niesie haslo.
    console.error(
      "[api/auth/login] request failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    return login_redirect("server", DEFAULT_TARGET);
  }
};

export const ALL: APIRoute = () =>
  json_error(405, "Metoda niedozwolona.", { Allow: "POST" });

/**
 * Druga bariera CSRF w miejsce wymogu JSON-a: formularz z obcej domeny wysyla
 * `Sec-Fetch-Site: cross-site`. Brak naglowka (curl, healthcheck) przepuszczamy —
 * ocene przejmuje wtedy guard na `Origin`.
 */
function is_cross_site_fetch(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  return site !== null && site !== "same-origin" && site !== "none";
}

function redirect_to(
  location: string,
  headers: Record<string, string> = {},
): Response {
  return new Response(null, {
    status: 302,
    headers: { Location: location, "Cache-Control": "no-store", ...headers },
  });
}

/**
 * Blad wraca kodem w query, bo formularz nie ma juz JS-a, zeby odczytac cialo
 * odpowiedzi. Cel przekierowania jest juz zwalidowany, wiec przezywa ponowna probe.
 */
function login_redirect(
  code: LoginErrorCode,
  target: string,
  retry_after_seconds?: number,
): Response {
  const params = new URLSearchParams({ error: code });
  if (target !== DEFAULT_TARGET) {
    params.set("redirect", target);
  }
  if (retry_after_seconds !== undefined) {
    params.set("retry", String(retry_after_seconds));
    return redirect_to(`${LOGIN_PATH}?${params}`, {
      "Retry-After": String(retry_after_seconds),
    });
  }
  return redirect_to(`${LOGIN_PATH}?${params}`);
}

async function read_credentials(request: Request): Promise<Credentials | null> {
  const media_type = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!media_type.startsWith(FORM_MEDIA_TYPE)) return null;

  const body = await read_limited_body(request);
  if (body === null) return null;

  const fields = new URLSearchParams(body);
  const password = fields.get("password");
  if (password === null) return null;

  return { password, redirect: fields.get("redirect") };
}

/** Zwraca null, gdy body jest puste albo przekracza limit — bez czytania reszty. */
async function read_limited_body(request: Request): Promise<string | null> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return null;

  const body = request.body;
  if (body === null) return null;

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value === undefined) continue;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  return chunks.length === 0 ? null : Buffer.concat(chunks).toString("utf8");
}
