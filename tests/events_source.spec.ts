import { expect, test } from "@playwright/test";
import { parse_event } from "../src/lib/events/parse_event";

/**
 * Cache wydarzeń, cooldown i dedup pobrań żyją w module — jak `nginx_parser.spec.ts`
 * spec chodzi bez przeglądarki, na podstawionym `fetch` zamiast na sieci.
 */
const API_BASE = "http://events.spec.invalid/blockchain-wares";
const LIST_URL = `${API_BASE}/events`;
const ALPHA_ID = "spec-event-alpha";
const BETA_ID = "spec-event-beta";

type EventsSourceModule = typeof import("../src/lib/events/source");

let module_instances = 0;

/**
 * Stan cache jest modułowy i nie ma resetu — każdy test dostaje własną instancję
 * modułu, zamiast dziedziczyć cudzy cache, cooldown i licznik generacji.
 */
async function fresh_source(): Promise<EventsSourceModule> {
  module_instances += 1;
  const specifier = `../src/lib/events/source.ts?spec=${module_instances}`;

  return (await import(specifier)) as EventsSourceModule;
}

function event_record(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id: ALPHA_ID,
    name: "Spec Chain Summit",
    city: "Gdańsk",
    country: "Poland",
    countryCode: "PL",
    startDate: "2026-05-04",
    endDate: "2026-05-05",
    image: "/assets/img/og-image.png",
    organizer: { name: "BlockchainWares", url: "https://example.invalid/org" },
    description: "Rekord na potrzeby specu źródła wydarzeń.",
    topics: ["Blockchain"],
    ...overrides,
  };
}

interface FetchProbe {
  calls: () => number;
  urls: () => readonly string[];
}

function stub_fetch(respond: () => Promise<Response>): FetchProbe {
  const urls: string[] = [];

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    urls.push(typeof input === "string" ? input : String(input));
    return respond();
  }) as typeof globalThis.fetch;

  return { calls: () => urls.length, urls: () => urls };
}

function json_body(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function unreachable_api(): () => Promise<Response> {
  return () => Promise.reject(new TypeError("fetch failed"));
}

/** To, czym `AbortSignal.timeout()` przerywa czytanie ciała po stronie Node. */
function timeout_while_reading(): Response {
  const response = new Response("", { status: 200 });
  const aborted = new DOMException(
    "The operation was aborted.",
    "TimeoutError",
  );

  return Object.assign(response, { json: () => Promise.reject(aborted) });
}

function ids_of(events: ReadonlyArray<{ id: string }>): string[] {
  return events.map((event) => event.id);
}

const real_fetch = globalThis.fetch;
const real_api_url = process.env.EVENTS_API_URL;
const real_ttl = process.env.EVENTS_API_TTL_SECONDS;

test.beforeEach(() => {
  process.env.EVENTS_API_URL = API_BASE;
  // TTL długie względem testu: pobranie ma być efektem inwalidacji albo `force`,
  // nie wyścigu z zegarem.
  process.env.EVENTS_API_TTL_SECONDS = "300";
});

test.afterEach(() => {
  globalThis.fetch = real_fetch;
  restore_env("EVENTS_API_URL", real_api_url);
  restore_env("EVENTS_API_TTL_SECONDS", real_ttl);
});

function restore_env(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }
  process.env[name] = value;
}

test.describe("load_events — pobranie", () => {
  test("dwa równoległe wywołania przy zimnym cache dzielą jedno pobranie", async () => {
    const source = await fresh_source();
    let release = (): void => {};
    const gate = new Promise<void>((resolve) => {
      release = () => resolve();
    });
    const probe = stub_fetch(async () => {
      await gate;
      return json_body([event_record()]);
    });

    const first = source.load_events();
    const second = source.load_events();
    release();
    const [left, right] = await Promise.all([first, second]);

    expect(probe.calls()).toBe(1);
    expect(probe.urls()).toEqual([LIST_URL]);
    expect(ids_of(left.events)).toEqual([ALPHA_ID]);
    expect(ids_of(right.events)).toEqual([ALPHA_ID]);
    // Snapshot oddaje kopię, więc konsument sortujący listę nie przestawia cache.
    expect(right.events).not.toBe(left.events);
  });

  test("pusta lista to poprawna odpowiedź, nie awaria", async () => {
    const source = await fresh_source();
    stub_fetch(async () => json_body([]));

    const snapshot = await source.load_events();

    expect(snapshot.events).toEqual([]);
    expect(snapshot.status.error).toBeNull();
    expect(snapshot.status.fetchedAt).not.toBeNull();
  });

  test("rekord bez wymaganych pól wypada z listy, reszta zostaje", async () => {
    const source = await fresh_source();
    stub_fetch(async () =>
      json_body([
        event_record(),
        { id: "spec-event-broken" },
        event_record({ id: BETA_ID }),
      ]),
    );

    const snapshot = await source.load_events();

    expect(ids_of(snapshot.events)).toEqual([ALPHA_ID, BETA_ID]);
    expect(snapshot.status.rejected).toBe(1);
    expect(snapshot.status.error).toBeNull();
  });

  test("zimny cache i martwe API kończą się wyjątkiem", async () => {
    const source = await fresh_source();
    stub_fetch(unreachable_api());

    await expect(source.load_events()).rejects.toThrow(/unreachable/i);

    const status = source.get_events_source_status();
    expect(status.fetchedAt).toBeNull();
    expect(status.events).toBe(0);
    expect(status.error?.kind).toBe("unreachable");
  });
});

test.describe("load_events — awaria API przy niepustym cache", () => {
  async function warm(): Promise<EventsSourceModule> {
    const source = await fresh_source();
    stub_fetch(async () => json_body([event_record()]));
    await source.load_events();

    return source;
  }

  test("HTTP 500 zostawia poprzednie wydarzenia", async () => {
    const source = await warm();
    stub_fetch(async () => json_body({ error: "boom" }, 500));

    const snapshot = await source.load_events({ force: true });

    expect(ids_of(snapshot.events)).toEqual([ALPHA_ID]);
    expect(snapshot.status.error?.kind).toBe("http_status");
    expect(snapshot.status.error?.message).toContain("500");
  });

  test("odpowiedź, która nie jest JSON-em, zostawia poprzednie wydarzenia", async () => {
    const source = await warm();
    stub_fetch(
      async () =>
        new Response("<html>maintenance</html>", {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    );

    const snapshot = await source.load_events({ force: true });

    expect(ids_of(snapshot.events)).toEqual([ALPHA_ID]);
    expect(snapshot.status.error?.kind).toBe("malformed_payload");
  });

  test("błąd sieci zostawia poprzednie wydarzenia", async () => {
    const source = await warm();
    stub_fetch(unreachable_api());

    const snapshot = await source.load_events({ force: true });

    expect(ids_of(snapshot.events)).toEqual([ALPHA_ID]);
    expect(snapshot.status.error?.kind).toBe("unreachable");
  });

  test("niepusta lista, z której nic nie przechodzi walidacji, jest błędem", async () => {
    const source = await warm();
    stub_fetch(async () =>
      json_body([{ id: "spec-event-broken" }, { nope: true }]),
    );

    const snapshot = await source.load_events({ force: true });

    // Tak wygląda dryf kontraktu backendu, a nie pusty kalendarz: podmiana wydarzeń
    // na pustkę byłaby cichą utratą treści na stronie publicznej.
    expect(ids_of(snapshot.events)).toEqual([ALPHA_ID]);
    expect(snapshot.status.error?.kind).toBe("malformed_payload");
  });

  test("timeout w trakcie czytania odpowiedzi to awaria sieci, nie zły JSON", async () => {
    const source = await warm();
    stub_fetch(async () => timeout_while_reading());

    const snapshot = await source.load_events({ force: true });

    expect(snapshot.status.error?.kind).toBe("timeout");
  });

  test("cooldown tnie pobrania, `force` je wymusza", async () => {
    const source = await warm();
    // Bez inwalidacji świeży TTL sam odesłałby cache i cooldownu nie dałoby się zobaczyć.
    source.invalidate_events_cache();
    const dead = stub_fetch(unreachable_api());

    await source.load_events();
    const during = await source.load_events();

    expect(dead.calls()).toBe(1);
    expect(ids_of(during.events)).toEqual([ALPHA_ID]);
    expect(during.status.error?.kind).toBe("unreachable");

    await source.load_events({ force: true });

    expect(dead.calls()).toBe(2);
  });
});

test.describe("invalidate_events_cache", () => {
  test("wygasza wpis, ale zostawia dane jako fallback", async () => {
    const source = await fresh_source();
    stub_fetch(async () => json_body([event_record()]));
    await source.load_events();

    source.invalidate_events_cache();

    const status = source.get_events_source_status();
    expect(status.stale).toBe(true);
    expect(status.events).toBe(1);
    expect(status.fetchedAt).not.toBeNull();

    const dead = stub_fetch(unreachable_api());
    const snapshot = await source.load_events();

    expect(dead.calls()).toBe(1);
    expect(ids_of(snapshot.events)).toEqual([ALPHA_ID]);
    expect(snapshot.status.error?.kind).toBe("unreachable");
  });

  test("kolejne wywołanie idzie po świeże dane mimo ważnego TTL", async () => {
    const source = await fresh_source();
    const before = stub_fetch(async () => json_body([event_record()]));
    await source.load_events();
    await source.load_events();

    expect(before.calls()).toBe(1);

    source.invalidate_events_cache();
    const after = stub_fetch(async () =>
      json_body([event_record({ id: BETA_ID })]),
    );
    const snapshot = await source.load_events();

    expect(after.calls()).toBe(1);
    expect(ids_of(snapshot.events)).toEqual([BETA_ID]);
    expect(snapshot.status.stale).toBe(false);
  });
});

test.describe("parse_event", () => {
  test("adres `javascript:` zdejmuje rekord z listy", () => {
    expect(
      parse_event(event_record({ url: "javascript:alert(1)" })),
    ).toBeNull();
    expect(
      parse_event(
        event_record({
          organizer: { name: "Spec", url: "javascript:alert(1)" },
        }),
      ),
    ).toBeNull();
    expect(
      parse_event(event_record({ url: "https://example.invalid/event" }))?.url,
    ).toBe("https://example.invalid/event");
  });

  test("pusty string w polu opcjonalnym znaczy brak, nie powód odrzucenia", () => {
    const event = parse_event(
      event_record({ shortName: "", edition: "   ", url: "" }),
    );

    expect(event).not.toBeNull();
    expect(event?.shortName).toBeUndefined();
    expect(event?.edition).toBeUndefined();
    expect(event?.url).toBeUndefined();
  });
});
