import { defineMiddleware } from "astro:middleware";
import type { APIContext } from "astro";
import { SESSION_COOKIE_NAME, verify_session_token } from "./lib/auth";
import { get_auth_config } from "./lib/env";

const LOGIN_PATH = "/admin/login";
const ADMIN_ROOT = "/admin";
const API_ADMIN_ROOT = "/api/admin";
const API_AUTH_ROOT = "/api/auth";

const NOSNIFF_HEADER = "X-Content-Type-Options";
const NOSNIFF_VALUE = "nosniff";

const SECURITY_HEADERS: ReadonlyArray<readonly [string, string]> = [
  ["X-Frame-Options", "DENY"],
  [NOSNIFF_HEADER, NOSNIFF_VALUE],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  // Egzekwowane sa tylko dyrektywy, ktore nie moga zablokowac zasobu strony.
  [
    "Content-Security-Policy",
    "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
  ],
  // Reszta polityki idzie w Report-Only: landing ma inline handler `onload` przy
  // preloadzie fontow i skrypty is:inline, wiec egzekwowany script-src wywalilby
  // strone. Przelaczyc na egzekwowanie dopiero po usunieciu inline'ow.
  [
    "Content-Security-Policy-Report-Only",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self'",
      "frame-src https://maps.google.com https://www.google.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  ],
];

const UNAUTHORIZED_BODY = JSON.stringify({ error: "Unauthorized." });

let auth_config_warned = false;

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const path = normalize_path(url.pathname);

  context.locals.isAuthenticated = has_valid_session(context);

  const blocked = guard(context, url, path);
  if (blocked !== null) {
    return apply_response_policy(blocked, path);
  }

  return apply_response_policy(await next(), path);
});

/**
 * Sprowadza sciezke do postaci, na ktorej mozna bezpiecznie porownywac prefiksy:
 * dekoduje `%2e%2e`/`%61`, rozwija segmenty `..`, sciaga zdublowane i koncowe
 * slashe, obniza wielkosc liter. Bez tego `/Admin/` czy `/admin/%2e%2e/admin`
 * omijaja guard.
 */
function normalize_path(pathname: string): string {
  try {
    const resolved = new URL(safe_decode(pathname), "http://normalize.local")
      .pathname;
    const collapsed = resolved.replace(/\/{2,}/g, "/").toLowerCase();
    return collapsed.length > 1 ? collapsed.replace(/\/+$/, "") : collapsed;
  } catch {
    return pathname.toLowerCase();
  }
}

function safe_decode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function is_within(path: string, root: string): boolean {
  return path === root || path.startsWith(`${root}/`);
}

function guard(context: APIContext, url: URL, path: string): Response | null {
  const authenticated = context.locals.isAuthenticated;

  if (is_within(path, API_AUTH_ROOT)) {
    return null;
  }

  if (is_within(path, API_ADMIN_ROOT)) {
    return authenticated ? null : unauthorized();
  }

  if (!is_within(path, ADMIN_ROOT)) {
    return null;
  }

  if (path === LOGIN_PATH) {
    return authenticated ? context.redirect(ADMIN_ROOT, 302) : null;
  }

  if (authenticated) {
    return null;
  }

  const target = encodeURIComponent(`${url.pathname}${url.search}`);
  return context.redirect(`${LOGIN_PATH}?redirect=${target}`, 302);
}

function unauthorized(): Response {
  return new Response(UNAUTHORIZED_BODY, {
    status: 401,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function has_valid_session(context: APIContext): boolean {
  const token = context.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
  if (token === null || token.length === 0) {
    return false;
  }
  try {
    return verify_session_token(token, get_auth_config().auth_secret);
  } catch (error) {
    // Brakujacy/za krotki AUTH_SECRET nie moze wywalic landingu - to samo co brak sesji.
    warn_auth_config_once(error);
    return false;
  }
}

/**
 * Bez ostrzezenia zla konfiguracja wyglada dla admina jak zle haslo: middleware
 * oddaje ciche 401, wiec galaz 500 "misconfigured" w route'ach nigdy nie startuje.
 * Raz na proces, bez wartosci sekretu.
 */
function warn_auth_config_once(error: unknown): void {
  if (auth_config_warned) {
    return;
  }
  auth_config_warned = true;
  const reason = error instanceof Error ? error.message : "unknown error";
  console.warn(
    `[middleware] auth config rejected, sessions disabled: ${reason}`,
  );
}

function apply_response_policy(response: Response, path: string): Response {
  add_security_headers(response);
  add_no_store(response, path);
  return response;
}

/**
 * Meta http-equiv w AdminLayout jest ignorowany przez przegladarki i proxy, wiec
 * shell panelu oraz redirecty na login moglyby wyladowac w cache posrednim.
 * Endpointy /api ustawiaja naglowek same - istniejacej wartosci nie nadpisujemy.
 */
function add_no_store(response: Response, path: string): void {
  if (!is_within(path, ADMIN_ROOT) || response.headers.has("Cache-Control")) {
    return;
  }
  response.headers.set("Cache-Control", "no-store");
}

function add_security_headers(response: Response): void {
  const content_type =
    response.headers.get("Content-Type")?.toLowerCase() ?? "";

  if (content_type.includes("text/html")) {
    for (const [name, value] of SECURITY_HEADERS) {
      response.headers.set(name, value);
    }
    return;
  }
  // Odpowiedzi API tez nie moga byc zgadywane po tresci - reszta polityki dotyczy
  // dokumentu i na JSON-ie nic nie zmienia.
  if (content_type.includes("application/json")) {
    response.headers.set(NOSNIFF_HEADER, NOSNIFF_VALUE);
  }
}
