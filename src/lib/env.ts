export type AuthConfig = {
  admin_password_hash: string;
  auth_secret: string;
};

export const MIN_AUTH_SECRET_LENGTH = 32;

const DEFAULT_LOG_TTL_SECONDS = 300;

/** Ostatnia deska ratunku, gdy ani SITE_ORIGIN, ani `site` z astro.config.mjs nie doszly. */
const FALLBACK_ORIGIN = "https://blockchainwares.com.pl";

const IS_SERVER_RUNTIME =
  typeof window === "undefined" &&
  typeof process !== "undefined" &&
  typeof process.versions?.node === "string";

if (!IS_SERVER_RUNTIME) {
  throw new Error(
    "src/lib/env.ts is server-only: it reads ADMIN_PASSWORD_HASH, AUTH_SECRET and LOG_SOURCE_URL. " +
      "Importing it from client code would leak secrets into the browser bundle — " +
      "keep the import inside .astro frontmatter, an API route or another server module.",
  );
}

function read_env(name: string): string | undefined {
  // process.env ma pierwszenstwo: obraz budowany jest bez sekretow, a rotacja
  // sekretu ma dzialac przez restart kontenera, bez rebuildu.
  const runtime = process.env[name];
  const meta_env = import.meta.env as unknown as
    | Record<string, unknown>
    | undefined;
  const build_time = meta_env?.[name];
  const value =
    typeof runtime === "string" && runtime.trim().length > 0
      ? runtime
      : build_time;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function get_auth_config(): AuthConfig {
  const admin_password_hash = read_env("ADMIN_PASSWORD_HASH");
  const auth_secret = read_env("AUTH_SECRET");

  if (admin_password_hash === undefined || auth_secret === undefined) {
    const missing = [
      admin_password_hash === undefined ? "ADMIN_PASSWORD_HASH" : null,
      auth_secret === undefined ? "AUTH_SECRET" : null,
    ].filter((name): name is string => name !== null);
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. Set them in the runtime environment (not at build time).`,
    );
  }

  if (auth_secret.length < MIN_AUTH_SECRET_LENGTH) {
    throw new Error(
      `AUTH_SECRET is too short: at least ${MIN_AUTH_SECRET_LENGTH} characters are required.`,
    );
  }

  return { admin_password_hash, auth_secret };
}

/**
 * Kanoniczny origin aplikacji (`schemat://host[:port]`, malymi literami) — punkt
 * odniesienia dla guardu CSRF. Domyslnie `site` z astro.config.mjs; SITE_ORIGIN
 * nadpisuje go, gdy aplikacja stoi pod innym adresem (staging, podglad).
 */
export function get_site_origin(): string {
  const raw = read_env("SITE_ORIGIN") ?? read_astro_site() ?? FALLBACK_ORIGIN;

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(
      `SITE_ORIGIN is not a valid absolute URL: expected e.g. https://example.com, got "${raw}".`,
    );
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(
      `SITE_ORIGIN must use http or https: got "${parsed.protocol}".`,
    );
  }

  return `${parsed.protocol}//${parsed.host}`.toLowerCase();
}

/** Astro wstawia tu wartosc `site` z konfiguracji — jedno zrodlo prawdy z sitemapa. */
function read_astro_site(): string | undefined {
  const meta_env = import.meta.env as unknown as
    | Record<string, unknown>
    | undefined;
  const site = meta_env?.SITE;
  if (typeof site !== "string") return undefined;
  const trimmed = site.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** Kill-switch: sesje wydane przed ta chwila sa odrzucane. Brak zmiennej = brak progu. */
export function get_session_not_before(): number | null {
  const raw = read_env("SESSION_NOT_BEFORE");
  if (raw === undefined) return null;

  const parsed = /^\d+$/.test(raw) ? Number.parseInt(raw, 10) : Date.parse(raw);
  if (!Number.isFinite(parsed)) {
    throw new Error(
      `SESSION_NOT_BEFORE is not a valid timestamp: expected ISO 8601 or unix milliseconds, got "${raw}".`,
    );
  }
  return parsed;
}

/**
 * Adres zdalnego logu nginx. Zawiera token w sciezce, wiec nigdy nie trafia do
 * repo ani do komunikatow bledow — walidacja raportuje sam fakt, nie wartosc.
 */
export function get_log_source_url(): string {
  const raw = read_env("LOG_SOURCE_URL");
  if (raw === undefined) {
    throw new Error(
      "Missing required environment variable: LOG_SOURCE_URL. Set it in the runtime environment (not at build time).",
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(
      "LOG_SOURCE_URL is not a valid absolute URL: expected e.g. https://example.com/path.",
    );
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(
      `LOG_SOURCE_URL must use http or https: got "${parsed.protocol}".`,
    );
  }

  return raw;
}

/** Jak dlugo pobrany log zyje w pamieci procesu. Brak zmiennej = 5 minut. */
export function get_log_source_ttl_millis(): number {
  const raw = read_env("LOG_SOURCE_TTL_SECONDS");
  if (raw === undefined) return DEFAULT_LOG_TTL_SECONDS * 1000;

  const seconds = /^\d+$/.test(raw) ? Number.parseInt(raw, 10) : Number.NaN;
  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new Error(
      `LOG_SOURCE_TTL_SECONDS is not a valid duration: expected a positive number of seconds, got "${raw}".`,
    );
  }
  return seconds * 1000;
}
