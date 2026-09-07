import { expect, test } from "@playwright/test";
import { EVENTS_FIXTURE_REQUESTS_URL } from "../playwright.config";
import type { TradeFairEvent } from "../src/components/events-data";
import {
  SSR_USER_AGENT,
  SSR_USER_AGENT_ORIGIN,
} from "../src/lib/net/user_agent";
import { HARNESS_USER_AGENT } from "./fixtures/events";

/**
 * Cloudflare przed API właściciela odrzucał (403) żądania SSR z Vercela, bo undici
 * wysyła je bez `User-Agent` — do Traefika nie docierały wcale. Nagłówek musi więc
 * jechać na każdym żądaniu do modułu wydarzeń: odczycie listy i wszystkich mutacjach.
 *
 * Warstwy są dwie, bo mierzą co innego: spece na podstawionym `fetch` (wzorem
 * `events_source.spec.ts`, bez przeglądarki) pilnują każdej metody z osobna,
 * a test przez przeglądarkę sprawdza, co realnie przyszło do fixture'a — kod może
 * ustawić nagłówek, którego środowisko i tak nie wyśle.
 */

const API_BASE = "http://ua.spec.invalid/blockchain-wares";
const API_KEY = "spec-user-agent-service-key-local-only";
const EVENT_ID = "spec-user-agent-event";

interface CapturedRequest {
  method: string;
  url: string;
  headers: Headers;
}

/** Kształt `GET /__requests` fixture'a (tests/fixtures/serve_events.mjs). */
interface FixtureRequests {
  next: number;
  oldest: number;
  entries: {
    seq: number;
    method: string;
    path: string;
    userAgent: string | null;
  }[];
}

function event_record(): TradeFairEvent {
  return {
    id: EVENT_ID,
    name: "Spec User Agent Summit",
    city: "Katowice",
    country: "Poland",
    countryCode: "PL",
    startDate: "2026-06-01",
    endDate: "2026-06-02",
    image: "/assets/img/og-image.png",
    organizer: { name: "BlockchainWares", url: "https://example.invalid/org" },
    description: "Rekord na potrzeby specu nagłówka User-Agent.",
    topics: ["Blockchain"],
  };
}

function stub_fetch(): CapturedRequest[] {
  const captured: CapturedRequest[] = [];

  globalThis.fetch = (async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    captured.push({
      method: init?.method ?? "GET",
      url: typeof input === "string" ? input : String(input),
      headers: new Headers(init?.headers),
    });

    // Lista (żądanie bez metody) oddaje tablicę, mutacja — sam rekord, jak backend.
    const payload =
      init?.method === undefined ? [event_record()] : event_record();
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof globalThis.fetch;

  return captured;
}

let module_instances = 0;

/** Cache źródła jest modułowy i nie ma resetu — każdy test dostaje własną instancję. */
async function fresh_source(): Promise<
  typeof import("../src/lib/events/source")
> {
  module_instances += 1;

  return (await import(
    `../src/lib/events/source.ts?spec=ua-${module_instances}`
  )) as typeof import("../src/lib/events/source");
}

const real_fetch = globalThis.fetch;
const real_api_url = process.env.EVENTS_API_URL;
const real_api_key = process.env.EVENTS_API_KEY;

function restore_env(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }
  process.env[name] = value;
}

test.describe("nagłówek żądań do modułu wydarzeń", () => {
  test.beforeEach(() => {
    process.env.EVENTS_API_URL = API_BASE;
    process.env.EVENTS_API_KEY = API_KEY;
  });

  test.afterEach(() => {
    globalThis.fetch = real_fetch;
    restore_env("EVENTS_API_URL", real_api_url);
    restore_env("EVENTS_API_KEY", real_api_key);
  });

  test("odczyt listy przedstawia się nazwą aplikacji", async () => {
    const captured = stub_fetch();
    const source = await fresh_source();

    await source.load_events();

    expect(captured).toHaveLength(1);
    expect(captured[0]?.headers.get("user-agent")).toBe(SSR_USER_AGENT);
  });

  test("każda mutacja niesie ten sam nagłówek obok klucza serwisowego", async () => {
    const captured = stub_fetch();
    const mutations = await import("../src/lib/events/mutations");

    await mutations.create_event(event_record());
    await mutations.update_event(EVENT_ID, { city: "Gdańsk" });
    await mutations.delete_event(EVENT_ID);

    const writes = captured.filter((request) => request.method !== "GET");
    expect(writes.map((request) => request.method)).toEqual([
      "POST",
      "PATCH",
      "DELETE",
    ]);
    // Po zapisie leci jeszcze odświeżenie listy — ono też ma się przedstawiać.
    for (const request of captured) {
      expect(
        request.headers.get("user-agent"),
        `Żądanie ${request.method} ${request.url} poszło bez User-Agent.`,
      ).toBe(SSR_USER_AGENT);
    }
    // Klucz serwisowy zostaje na miejscu: nagłówek doszedł obok niego, nie zamiast.
    for (const write of writes) {
      expect(write.headers.get("x-api-key")).toBe(API_KEY);
    }
  });

  test("nie podszywa się pod przeglądarkę", () => {
    expect(SSR_USER_AGENT).not.toMatch(/mozilla|chrome|safari|webkit|gecko/i);
    expect(SSR_USER_AGENT).toContain(SSR_USER_AGENT_ORIGIN);
  });

  /**
   * Origin w nagłówku jest wpisany na sztywno (moduł czytają spece bez runtime'u
   * Astro), więc przy zmianie domeny nic nie pociągnęłoby go za `site`.
   */
  test("origin zgadza się z `site` z astro.config.mjs", async () => {
    const config = await import("../astro.config.mjs");

    expect(config.default.site).toBe(SSR_USER_AGENT_ORIGIN);
  });
});

async function read_fixture_requests(since: number): Promise<FixtureRequests> {
  const response = await fetch(
    `${EVENTS_FIXTURE_REQUESTS_URL}?since=${since}`,
    {
      headers: { "user-agent": HARNESS_USER_AGENT },
    },
  );
  expect(
    response.ok,
    `Fixture wydarzeń nie oddał podglądu żądań (${response.status}).`,
  ).toBe(true);

  return (await response.json()) as FixtureRequests;
}

/** Ruch aplikacji, bez własnych żądań testów (sprzątanie stanu, odczyt rekordu). */
async function read_app_requests(
  since: number,
): Promise<FixtureRequests["entries"]> {
  const { entries } = await read_fixture_requests(since);

  return entries.filter((entry) => entry.userAgent !== HARNESS_USER_AGENT);
}

test.describe("żądania, które realnie dochodzą do modułu wydarzeń", () => {
  /**
   * Cache listy ma w testach 1 s TTL, więc wejście na `/markets` prawie zawsze
   * wywołuje pobranie — ale nie zawsze, bo równoległy worker mógł odświeżyć je
   * chwilę wcześniej. Stąd ponawianie zamiast pojedynczego strzału.
   */
  test("render /markets pobiera listę z nagłówkiem aplikacji", async ({
    page,
  }) => {
    const start = (await read_fixture_requests(0)).next;

    await expect
      .poll(
        async () => {
          await page.goto("/markets");
          return (await read_app_requests(start)).length;
        },
        { message: "Render /markets nie wywołał pobrania listy wydarzeń." },
      )
      .toBeGreaterThan(0);

    for (const entry of await read_app_requests(start)) {
      expect(
        entry.userAgent,
        `Żądanie ${entry.method} ${entry.path} doszło do API bez User-Agent.`,
      ).toBe(SSR_USER_AGENT);
    }
  });
});
