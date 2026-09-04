import { expect, test } from "@playwright/test";
import { NO_JS_TAG } from "../playwright.config";
import {
  build_event_schema,
  type EventSchema,
} from "../src/components/event-schema";
import {
  get_event_link,
  get_status_badge_label,
} from "../src/components/event-theme";
import {
  format_admission,
  format_event_date,
  format_venue_address,
  get_event_end_datetime,
  get_event_path,
  get_event_start_datetime,
  get_event_status,
  get_promoted_events,
  get_venue_map_url,
  MARKETS_PATH,
  type TradeFairEvent,
} from "../src/components/events-data";
import {
  back_links,
  detail_main,
  EBC_ID,
  find_event,
  read_json_ld,
  required,
  WORKSHOP_ID,
} from "./support/events";

/** Kanoniczny origin z `astro.config.mjs` — schematy na stronie są nim adresowane */
const SITE = "https://blockchainwares.com.pl";

const MISSING_PATH = "/markets/nie-ma-takiego";

const WORKSHOP = find_event(WORKSHOP_ID);
const EBC = find_event(EBC_ID);

/** Trasa jest SSR-owa i liczy status z zegara requestu, więc test czyta ten sam kalendarz */
function status_now(event: TradeFairEvent) {
  return get_event_status(event, new Date());
}

function is_event_schema(block: unknown): block is EventSchema {
  return (
    typeof block === "object" &&
    block !== null &&
    (block as { "@type"?: unknown })["@type"] === "Event"
  );
}

test.describe("Wejścia na stronę wydarzenia", () => {
  for (const event of [EBC, WORKSHOP]) {
    test(`listing: tytuł „${event.name}” otwiera jego stronę`, async ({
      page,
    }) => {
      await page.goto(MARKETS_PATH);

      await page.getByRole("link", { name: event.name, exact: true }).click();

      await expect(page).toHaveURL(new RegExp(`${get_event_path(event)}$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        event.name,
      );
    });
  }

  test("baner strony głównej prowadzi na stronę promowanego wydarzenia", async ({
    page,
  }) => {
    const promoted = get_promoted_events(new Date());
    test.skip(
      promoted.length === 0,
      "Kalendarz pusty — baner nic nie promuje i nie renderuje się wcale.",
    );

    await page.goto("/");
    const banner = page.getByRole("complementary", {
      name: "Where to meet us",
    });
    await banner.scrollIntoViewIfNeeded();

    for (const event of promoted) {
      await expect(
        banner.locator(`a[href="${get_event_path(event)}"]`),
      ).toBeVisible();
    }

    // Baner promuje kilka wpisów naraz — każdy musi trafiać we własne wydarzenie.
    const last = promoted[promoted.length - 1];
    await banner.locator(`a[href="${get_event_path(last)}"]`).click();

    await expect(page).toHaveURL(new RegExp(`${get_event_path(last)}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(last.name);
  });
});

test.describe("Strona wydarzenia — treść", () => {
  test("warsztat: godziny, adres, wstęp i dojazd", async ({ page }) => {
    const schedule = required(WORKSHOP.schedule, "Harmonogram warsztatu");
    const venue = required(WORKSHOP.venue, "Miejsce warsztatu");
    const admission = required(WORKSHOP.admission, "Wstęp na warsztat");
    const map_url = required(get_venue_map_url(WORKSHOP), "Link do mapy");

    await page.goto(get_event_path(WORKSHOP));
    const main = detail_main(page);
    const date = format_event_date(WORKSHOP);

    await expect(page).toHaveTitle(`${WORKSHOP.name} — BlockchainWares`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      WORKSHOP.name,
    );
    await expect(
      main.getByText(get_status_badge_label(WORKSHOP, status_now(WORKSHOP)), {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      main.getByText(
        `${date.month} ${date.start_day}, ${date.year} · ${WORKSHOP.city}, ${WORKSHOP.country}`,
      ),
    ).toBeVisible();

    // Ta sama chwila startu opisuje blok daty i wiersz godzin — obie muszą być maszynowe.
    const starts = main.locator(
      `time[datetime="${get_event_start_datetime(WORKSHOP)}"]`,
    );
    await expect(starts).toHaveText([date.start_day, schedule.startTime]);
    await expect(
      main.locator(`time[datetime="${get_event_end_datetime(WORKSHOP)}"]`),
    ).toHaveText([schedule.endTime]);
    await expect(main.getByText(schedule.timeZoneLabel)).toBeVisible();

    await expect(main.getByText(venue.name, { exact: true })).toBeVisible();
    await expect(
      main.getByText(
        required(format_venue_address(WORKSHOP), "Adres warsztatu"),
        {
          exact: true,
        },
      ),
    ).toBeVisible();
    await expect(main.getByText(format_admission(admission))).toBeVisible();

    for (const topic of WORKSHOP.topics) {
      await expect(main.getByText(topic, { exact: true })).toBeVisible();
    }

    // Wydarzenie bez własnej strony wysyła pod adres, który wynajęliśmy.
    const directions = main.locator(`a[href="${map_url}"]`);
    await expect(directions).toHaveCount(1);
    await expect(directions).toHaveAttribute("target", "_blank");
    await expect(
      main.getByRole("link", { name: "Get in touch" }),
    ).toHaveAttribute("href", "/#contact");

    await expect(back_links(page)).toHaveText([
      /Markets/,
      /All markets & events/,
    ]);
  });

  test("konferencja: CTA na stronę wydarzenia, bez dojazdu i wstępu", async ({
    page,
  }) => {
    await page.goto(get_event_path(EBC));
    const main = detail_main(page);

    await expect(page).toHaveTitle(`${EBC.name} — BlockchainWares`);
    await expect(
      main.getByRole("link", { name: /Event website/ }),
    ).toHaveAttribute("href", required(EBC.url, "Strona konferencji"));
    await expect(
      main.locator('a[href^="https://www.google.com/maps"]'),
    ).toHaveCount(0);
    await expect(main.getByText("Admission")).toHaveCount(0);
    await expect(
      main.getByText(required(EBC.edition, "Edycja konferencji"), {
        exact: true,
      }),
    ).toBeVisible();

    // Reszta kalendarza wisi pod treścią i prowadzi dalej po stronach wydarzeń.
    await expect(
      main.locator(`a[href="${get_event_path(WORKSHOP)}"]`),
    ).toBeVisible();
  });
});

test.describe("Strona wydarzenia — nieznany identyfikator", () => {
  test("adres bez wydarzenia zwraca 404 i odsyła na listing", async ({
    page,
  }) => {
    const response = await page.goto(MISSING_PATH);

    // Trasa renderuje 404 sama — status musi przyjść nagłówkiem, nie samą treścią.
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle("Event not found — BlockchainWares");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Event not found",
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    await expect(back_links(page)).toHaveCount(1);
    // Strona błędu nie ma czego opisywać wyszukiwarce.
    expect(await read_json_ld(page)).toEqual([]);
  });
});

test.describe("Strona wydarzenia — JSON-LD", () => {
  test("wstrzykuje pojedyncze `Event` z ofertą, adresem i darmowym wstępem", async ({
    page,
  }) => {
    await page.goto(get_event_path(WORKSHOP));
    const blocks = await read_json_ld(page);

    // Listing emituje tablicę schematów; strona detalu opisuje jedno wydarzenie.
    expect(blocks.some(Array.isArray)).toBe(false);

    const events = blocks.filter(is_event_schema);
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual(
      build_event_schema(WORKSHOP, SITE, get_event_path(WORKSHOP)),
    );
    expect(events[0].offers?.url).toBe(`${SITE}${get_event_path(WORKSHOP)}`);
    expect(events[0].isAccessibleForFree).toBe(true);
    expect(events[0].location.address["@type"]).toBe("PostalAddress");
    expect(events[0].location.address.streetAddress).toBe(
      WORKSHOP.venue?.streetAddress,
    );
  });

  test("konferencja bez wstępu na naszych zasadach zostaje bez oferty", async ({
    page,
  }) => {
    await page.goto(get_event_path(EBC));
    const events = (await read_json_ld(page)).filter(is_event_schema);

    expect(events).toHaveLength(1);
    expect(events[0].offers).toBeUndefined();
    expect(events[0].url).toBe(EBC.url);
  });
});

/**
 * Warsztat po fakcie: produkcyjny kalendarz nie zawiera takiego wpisu, a trasa
 * czyta zegar serwera — regułę CTA sprawdzamy więc na fixture, w jej źródle.
 */
const HOSTED_EVENT: TradeFairEvent = {
  id: "test-hosted",
  name: "Test Hosted Event",
  kind: "workshop",
  city: "Barcelona",
  country: "Spain",
  countryCode: "ES",
  startDate: "2026-09-19",
  endDate: "2026-09-19",
  venue: {
    name: "Test Venue",
    streetAddress: "Carrer de Prova, 49",
    postalCode: "08019",
  },
  image: "/assets/img/og-image.png",
  organizer: { name: "BlockchainWares", url: "https://blockchainwares.com.pl" },
  description: "Test description",
  topics: ["Topic"],
};

test.describe("CTA wydarzenia bez własnej strony", () => {
  test("dopóki nie minęło, prowadzi pod wynajęty adres", () => {
    const link = get_event_link(HOSTED_EVENT, "upcoming");

    expect(link?.href).toBe(get_venue_map_url(HOSTED_EVENT));
    expect(link?.label).toBe("Venue & directions");
  });

  test("po fakcie znika — stronie zostaje samo zaproszenie do kontaktu", () => {
    // Adres wciąż jest znany, więc `null` bierze się ze statusu, nie z braku danych.
    expect(get_venue_map_url(HOSTED_EVENT)).toBeDefined();
    expect(get_event_link(HOSTED_EVENT, "past")).toBeNull();
  });
});

test.describe("Strona wydarzenia bez JavaScriptu", () => {
  test(
    "cała treść i oba powroty stoją w HTML",
    { tag: NO_JS_TAG },
    async ({ page }) => {
      await page.goto(get_event_path(WORKSHOP));
      const main = detail_main(page);

      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        WORKSHOP.name,
      );
      await expect(
        main.getByText(get_status_badge_label(WORKSHOP, status_now(WORKSHOP)), {
          exact: true,
        }),
      ).toBeVisible();
      await expect(main.getByText(WORKSHOP.description)).toBeVisible();
      await expect(
        main.getByText(required(WORKSHOP.venue, "Miejsce warsztatu").name, {
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        main.getByText(
          format_admission(required(WORKSHOP.admission, "Wstęp na warsztat")),
        ),
      ).toBeVisible();

      for (const topic of WORKSHOP.topics) {
        await expect(main.getByText(topic, { exact: true })).toBeVisible();
      }

      await expect(
        main.locator(`a[href="${get_venue_map_url(WORKSHOP)}"]`),
      ).toBeVisible();
      await expect(back_links(page)).toHaveCount(2);

      // Hydruje się sama nawigacja — treść detalu przychodzi gotowa z serwera.
      await expect(page.locator("astro-island")).toHaveCount(1);
    },
  );
});
