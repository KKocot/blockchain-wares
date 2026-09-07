import { randomBytes, scryptSync } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig, devices } from "@playwright/test";
import { EVENTS_API_PREFIX, SEED_EVENTS } from "./tests/fixtures/events";

const PORT = 4321;
const BASE_URL = `http://localhost:${PORT}`;

const LOG_FIXTURE_HOST = "127.0.0.1";
const LOG_FIXTURE_PORT = 4322;
const LOG_FIXTURE_ORIGIN = `http://${LOG_FIXTURE_HOST}:${LOG_FIXTURE_PORT}`;

const EVENTS_FIXTURE_HOST = "127.0.0.1";
const EVENTS_FIXTURE_PORT = 4323;
const EVENTS_FIXTURE_ORIGIN = `http://${EVENTS_FIXTURE_HOST}:${EVENTS_FIXTURE_PORT}`;

/** Baza modułu wydarzeń, tak jak widzi ją aplikacja — ścieżki dokleja `src/lib/events`. */
export const EVENTS_API_BASE_URL = `${EVENTS_FIXTURE_ORIGIN}${EVENTS_API_PREFIX}`;

/**
 * Przywraca zestaw startowy fixture'a. Stan mutacji żyje w pamięci jego procesu,
 * a `reuseExistingServer` potrafi oddać serwer po poprzednim biegu — test dotykający
 * zapisu wywołuje to w `beforeEach`, inaczej zależy od tego, co zostawił poprzedni.
 */
export const EVENTS_FIXTURE_RESET_URL = `${EVENTS_FIXTURE_ORIGIN}/__reset`;

/**
 * Podgląd nagłówków, które doszły do fixture'a — stąd spec czyta `User-Agent`
 * żądań SSR, zamiast wierzyć na słowo kodowi, który je ustawia.
 */
export const EVENTS_FIXTURE_REQUESTS_URL = `${EVENTS_FIXTURE_ORIGIN}/__requests`;

/** Klucz serwisowy serwera testowego — backend odrzuca krótsze niż 32 znaki. */
export const E2E_EVENTS_API_KEY =
  "playwright-e2e-events-service-key-local-only";

/**
 * Panel realnie zapisuje wydarzenia, więc cache listy musi wygasać w trakcie testu.
 * Sekunda to minimum, jakie przepuszcza `get_events_ttl_millis()`.
 */
const EVENTS_API_TTL_SECONDS = "1";

/**
 * Wygenerowany log nginx trzymamy poza repozytorium: plik jest artefaktem
 * uruchomienia (timestampy liczone od startu runnera), a nie danymi wejściowymi.
 */
export const LOG_FIXTURE_FILE = join(tmpdir(), "bw-e2e", "access.log");

/** Hasło serwera testowego. Jawne celowo — istnieje tylko w procesie uruchomionym przez Playwright. */
export const E2E_ADMIN_PASSWORD = "playwright-e2e-local-only";

/** Testy bez JavaScriptu chodzą w osobnym projekcie — reszta ich nie uruchamia. */
export const NO_JS_TAG = "@no-js";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_SALT_LENGTH = 16;
const AUTH_SECRET_BYTES = 32;

/**
 * Buduje hash w formacie czytanym przez src/lib/auth/password.ts:
 * `scrypt:N:r:p:salt_b64:hash_b64`. Liczony przy każdym starcie runnera, żeby
 * żaden hash ani sekret nie musiał istnieć w repozytorium.
 */
function build_admin_password_hash(plain: string): string {
  const salt = randomBytes(SCRYPT_SALT_LENGTH);
  const key = scryptSync(plain, salt, SCRYPT_KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: 2 * (128 * SCRYPT_N * SCRYPT_R + 128 * SCRYPT_R * SCRYPT_P),
  });
  return [
    "scrypt",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("base64"),
    key.toString("base64"),
  ].join(":");
}

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./tests/fixtures/global_setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      grepInvert: new RegExp(NO_JS_TAG),
    },
    {
      // Panel jest renderowany serwerowo — cały przepływ musi działać bez JS-a.
      name: "chromium-no-js",
      use: { ...devices["Desktop Chrome"], javaScriptEnabled: false },
      grep: new RegExp(NO_JS_TAG),
    },
  ],
  webServer: [
    {
      command: "node ./tests/fixtures/serve_log.mjs",
      url: `${LOG_FIXTURE_ORIGIN}/health`,
      reuseExistingServer: !process.env.CI,
      env: {
        LOG_FIXTURE_FILE,
        LOG_FIXTURE_HOST,
        LOG_FIXTURE_PORT: String(LOG_FIXTURE_PORT),
      },
    },
    {
      command: "node ./tests/fixtures/serve_events.mjs",
      url: `${EVENTS_FIXTURE_ORIGIN}/health`,
      reuseExistingServer: !process.env.CI,
      env: {
        EVENTS_FIXTURE_HOST,
        EVENTS_FIXTURE_PORT: String(EVENTS_FIXTURE_PORT),
        EVENTS_FIXTURE_PREFIX: EVENTS_API_PREFIX,
        EVENTS_FIXTURE_API_KEY: E2E_EVENTS_API_KEY,
        // Zestaw startowy idzie przez środowisko: serwer jest zwykłym .mjs i nie
        // czyta modułów TypeScript, a globalSetup należy do innego zadania.
        EVENTS_FIXTURE_SEED: JSON.stringify(SEED_EVENTS),
      },
    },
    {
      command: `npm run dev -- --port ${PORT}`,
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      env: {
        ADMIN_PASSWORD_HASH: build_admin_password_hash(E2E_ADMIN_PASSWORD),
        AUTH_SECRET: randomBytes(AUTH_SECRET_BYTES).toString("hex"),
        // Zamiast zdalnego logu właściciela: deterministyczny plik z tests/fixtures.
        LOG_SOURCE_URL: `${LOG_FIXTURE_ORIGIN}/access.log`,
        // Zbiór nie zmienia się w trakcie biegu — jedno pobranie na cały run.
        LOG_SOURCE_TTL_SECONDS: "3600",
        // Zamiast modułu wydarzeń backend-api: lokalny fixture ze stanem w pamięci.
        EVENTS_API_URL: EVENTS_API_BASE_URL,
        EVENTS_API_KEY: E2E_EVENTS_API_KEY,
        EVENTS_API_TTL_SECONDS,
      },
    },
  ],
});
