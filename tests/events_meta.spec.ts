import { expect, test, type Page } from "@playwright/test";
import { E2E_EVENTS_API_KEY, EVENTS_API_BASE_URL } from "../playwright.config";
import {
  get_promoted_events,
  MARKETS_PATH,
  type TradeFairEvent,
} from "../src/components/events-data";
import { build_markets_description } from "../src/components/events-meta";
import { SEED_EVENTS } from "./fixtures/events";
import { log_in } from "./support/admin";
import { ADMIN_EVENTS_PATH, event_row } from "./support/admin_events";
import { is_event_schema, read_json_ld, required } from "./support/events";

/**
 * Opis `/markets` powstaje z wydarzeń, które strona i tak renderuje — nazwana w nim
 * konferencja zamarzłaby na dniu builda, a wydarzenia żyją dziś w API.
 */

/** Tyle, ile `MAX_LENGTH` w `events-meta.ts` — dwa długie tytuły nie mają prawa go minąć */
const MAX_LENGTH = 160;

/** Zegar testów jednostkowych: wydarzenia mają własny offset, więc doba jest ta sama wszędzie */
const NOW = new Date("2026-09-16T09:00:00+02:00");

const BASE: TradeFairEvent = {
  id: "meta-base",
  name: "Meta Base Conference",
  utcOffset: "+02:00",
  city: "Barcelona",
  country: "Spain",
  countryCode: "ES",
  startDate: "2026-09-16",
  endDate: "2026-09-17",
  image: "/assets/img/og-image.png",
  organizer: { name: "BlockchainWares", url: "https://blockchainwares.com.pl" },
  description: "Fixture opisu meta.",
  topics: ["Topic"],
};

function build_event(overrides: Partial<TradeFairEvent>): TradeFairEvent {
  return { ...BASE, ...overrides };
}

const PAST = build_event({
  id: "meta-past",
  name: "Meta Ledger Days Lisbon",
  city: "Lisbon",
  startDate: "2026-09-01",
  endDate: "2026-09-02",
});

const ONGOING = build_event({
  id: "meta-ongoing",
  name: "Meta Chain Summit",
  city: "Barcelona",
});

const UPCOMING = build_event({
  id: "meta-upcoming",
  name: "Meta HAF Workshop",
  kind: "workshop",
  city: "Gdansk",
  startDate: "2026-09-19",
  endDate: "2026-09-19",
});

const FAR = build_event({
  id: "meta-far",
  name: "Meta Tokyo Expo",
  city: "Tokyo",
  startDate: "2026-10-20",
  endDate: "2026-10-22",
});

test.describe("build_markets_description", () => {
  test("nazywa dwa najbliższe wydarzenia z datami, pomija resztę", () => {
    const description = build_markets_description(
      [FAR, PAST, UPCOMING, ONGOING],
      NOW,
    );

    expect(description).toContain(`${ONGOING.name} (Barcelona, Sep 16–17)`);
    expect(description).toContain(`${UPCOMING.name} (Gdansk, Sep 19)`);
    expect(description).not.toContain(PAST.name);
    expect(description).not.toContain(FAR.name);
    expect(description.length).toBeLessThanOrEqual(MAX_LENGTH);
  });

  test("bieżący rok zostaje przemilczany, przyszły dopisany", () => {
    const next_year = build_event({
      id: "meta-next-year",
      name: "Meta Winter Conference",
      startDate: "2027-02-03",
      endDate: "2027-02-05",
    });

    expect(build_markets_description([ONGOING], NOW)).not.toContain("2026");
    expect(build_markets_description([next_year], NOW)).toContain(
      "Feb 3–5, 2027",
    );
  });

  test("pusty kalendarz i sama przeszłość dają ogólny opis firmy", () => {
    const empty = build_markets_description([], NOW);

    expect(empty.length).toBeGreaterThan(0);
    expect(empty.length).toBeLessThanOrEqual(MAX_LENGTH);
    expect(empty).toContain("BlockchainWares");
    // Awaria API na zimnym cache wygląda tak samo jak brak wydarzeń.
    expect(build_markets_description([PAST], NOW)).toBe(empty);
  });

  test("długie tytuły schodzą na nazwy skrócone zamiast rozdmuchać tag", () => {
    const long_name = "Meta ".concat("Very Long Conference Name ".repeat(3));
    const first = build_event({
      id: "meta-long-first",
      name: `${long_name}One`,
      shortName: "Meta One",
    });
    const second = build_event({
      id: "meta-long-second",
      name: `${long_name}Two`,
      shortName: "Meta Two",
      startDate: "2026-09-19",
      endDate: "2026-09-19",
    });

    const description = build_markets_description([first, second], NOW);

    expect(description).toContain("Meta One");
    expect(description).toContain("Meta Two");
    expect(description.length).toBeLessThanOrEqual(MAX_LENGTH);
  });

  test("tytuły bez skrótu, których nie da się zmieścić, oddają ogólny opis", () => {
    const unwieldy = build_event({
      id: "meta-unwieldy",
      name: "Meta ".concat("Interminable Conference Title ".repeat(6)),
    });

    expect(build_markets_description([unwieldy], NOW)).toBe(
      build_markets_description([], NOW),
    );
  });
});

async function read_meta(page: Page, selector: string): Promise<string> {
  const content = await page
    .locator(`head ${selector}`)
    .getAttribute("content");

  expect(content, `Brak atrybutu content w ${selector}.`).not.toBeNull();

  return content ?? "";
}

test.describe("Opis strony wydarzeń", () => {
  test("wychodzi z kalendarza, a nie z tekstu wpisanego w repo", async ({
    page,
  }) => {
    const promoted = get_promoted_events(new Date(), 2, [...SEED_EVENTS]);
    expect(
      promoted.length,
      "Zestaw startowy fixture'a nie ma wydarzeń do promowania.",
    ).toBeGreaterThan(0);

    await page.goto(MARKETS_PATH);

    const description = await read_meta(page, 'meta[name="description"]');
    const og_description = await read_meta(
      page,
      'meta[property="og:description"]',
    );

    expect(description).toBe(og_description);
    expect(description.length).toBeLessThanOrEqual(MAX_LENGTH);
    // Opis sprzed migracji na API — jego powrót znaczyłby, że tag znowu jest stały.
    expect(description).not.toContain("European Blockchain Convention");

    for (const event of promoted) {
      const name = required(event.name, "Nazwa promowanego wydarzenia");
      const label = event.shortName ?? name;
      expect(
        description.includes(name) || description.includes(label),
        `Opis nie nazywa promowanego wydarzenia "${name}": ${description}`,
      ).toBe(true);
      expect(description).toContain(required(event.city, "Miasto wydarzenia"));
    }
  });
});

/**
 * Rekord, którego `image` wywala `new URL()` — API zapisu przepuszcza go samym wzorcem.
 * Każdy test dostaje własny `id`: stan fixture'a jest wspólny, a testy chodzą równolegle,
 * więc jeden zestaw danych na dwa testy znaczy 409 na zapisie i cudze sprzątanie w trakcie.
 */
function broken_image_event(id: string): Record<string, unknown> {
  return {
    id,
    name: `Meta Spec Broken Image ${id}`,
    city: "Katowice",
    country: "Poland",
    countryCode: "PL",
    startDate: "2027-03-01",
    endDate: "2027-03-02",
    image: "http://[",
    organizer: {
      name: "Meta Spec Organizer",
      url: "https://example.invalid/meta-spec",
    },
    description:
      "Rekord specu: pole image w kształcie, którego nie da się rozwiązać do adresu.",
    topics: ["Meta spec"],
  };
}

async function put_fixture_event(record: unknown): Promise<void> {
  const response = await fetch(`${EVENTS_API_BASE_URL}/events`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": E2E_EVENTS_API_KEY,
    },
    body: JSON.stringify(record),
  });

  expect(
    response.ok,
    `Fixture wydarzeń odrzucił zapis rekordu (${response.status}).`,
  ).toBe(true);
}

async function drop_fixture_event(id: string): Promise<void> {
  await fetch(`${EVENTS_API_BASE_URL}/events/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "x-api-key": E2E_EVENTS_API_KEY },
  });
}

/** Cache listy wygasa po `EVENTS_API_TTL_SECONDS` (1 s w testach) */
async function wait_for_events_cache(page: Page): Promise<void> {
  await page.waitForTimeout(1500);
}

/**
 * Dwa opisy zamiast jednego, bo `afterEach` obejmuje cały blok: wspólne sprzątanie
 * kasowałoby rekord drugiego testu w trakcie jego biegu.
 */
test.describe("Wydarzenie z niemożliwym do rozwiązania obrazkiem", () => {
  const PUBLIC_ID = "meta-spec-broken-image-public";

  test.afterEach(async () => {
    await drop_fixture_event(PUBLIC_ID);
  });

  test("traci sam obrazek, a nie miejsce na liście i własną stronę", async ({
    page,
  }) => {
    const broken_event = broken_image_event(PUBLIC_ID);
    const survivor = SEED_EVENTS[0];

    await put_fixture_event(broken_event);
    await wait_for_events_cache(page);

    const listing = await page.goto(MARKETS_PATH);
    expect(listing?.status(), "Zły rekord położył listę wydarzeń.").toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByText(String(broken_event.name)).first(),
    ).toBeVisible();

    const detail = await page.goto(`${MARKETS_PATH}/${survivor.id}`);
    expect(detail?.status(), "Zły rekord położył stronę wydarzenia.").toBe(200);

    const broken = await page.goto(`${MARKETS_PATH}/${PUBLIC_ID}`);
    expect(
      broken?.status(),
      "Wydarzenie z zepsutym obrazkiem ma dalej mieć własną stronę.",
    ).toBe(200);
    // Obrazek jest ozdobą JSON-LD: schemat wychodzi bez niego, zamiast bez wydarzenia.
    expect(
      (await read_json_ld(page))
        .filter(is_event_schema)
        .map((schema) => schema.image),
    ).toEqual([undefined]);
  });
});

test.describe("Wydarzenie z zepsutym obrazkiem w panelu", () => {
  const ADMIN_ID = "meta-spec-broken-image-admin";

  test.afterEach(async () => {
    await drop_fixture_event(ADMIN_ID);
  });

  test("zostaje na liście panelu, więc jest jak go poprawić", async ({
    page,
  }) => {
    await put_fixture_event(broken_image_event(ADMIN_ID));
    await log_in(page);

    // Panel czyta listę z `force: true`, więc TTL cache'u go nie dotyczy.
    await page.goto(ADMIN_EVENTS_PATH);

    await expect(event_row(page, ADMIN_ID)).toBeVisible();
  });
});
