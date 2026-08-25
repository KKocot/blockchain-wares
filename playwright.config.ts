import { randomBytes, scryptSync } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;
const BASE_URL = `http://localhost:${PORT}`;

const LOG_FIXTURE_HOST = "127.0.0.1";
const LOG_FIXTURE_PORT = 4322;
const LOG_FIXTURE_ORIGIN = `http://${LOG_FIXTURE_HOST}:${LOG_FIXTURE_PORT}`;

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
      },
    },
  ],
});
