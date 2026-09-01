import { expect, test, type Locator, type Page } from "@playwright/test";
import { NO_JS_TAG } from "../playwright.config";
import {
  BARE_COUNTRY_CODE,
  COUNTRY_IP_LIMIT,
  GEO_IPV4,
  UNRESOLVED_HIDDEN_IPS,
} from "./fixtures/access_log";
import {
  admin_url,
  log_in,
  toggle_switch,
  traffic_switch,
} from "./support/admin";

const CARD_NAME = "Kraje";
const COUNTRY_IPS_SWITCH = "Pokaż IP";
const UNRESOLVED_LABEL = "Nieprzypisane (brak w GeoIP)";

/** Warunek licencji CC BY 4.0 zbioru DB-IP — brzmienie i link muszą zostać w panelu. */
const GEOIP_DATASET = "DB-IP IP to Country Lite";
const GEOIP_LINK_TEXT = "IP Geolocation by DB-IP";
const GEOIP_URL = "https://db-ip.com";
const GEOIP_LICENSE = "licencja CC BY 4.0";

function country_card(page: Page): Locator {
  return page.getByRole("region", { name: CARD_NAME });
}

/** Wiersz kraju razem z rozwiniętą listą IP; sama lista to zagnieżdżony `ul`. */
function country_row(page: Page, label: string): Locator {
  return country_card(page).locator("ol > li").filter({ hasText: label });
}

/** Same nagłówki wierszy — bez adresów IP, które mogą zawierać dowolne znaki. */
async function country_headings(page: Page): Promise<string[]> {
  const rows = await country_card(page)
    .locator("ol > li > div")
    .allInnerTexts();
  return rows.map((text) => text.trim());
}

async function expect_attribution(page: Page): Promise<void> {
  const source_link = page.getByRole("link", { name: GEOIP_LINK_TEXT });
  await expect(source_link).toBeVisible();
  await expect(source_link).toHaveAttribute("href", GEOIP_URL);
  await expect(page.getByText(GEOIP_DATASET)).toBeVisible();
  await expect(page.getByText(GEOIP_LICENSE)).toBeVisible();
}

test.describe("Admin — karta krajów", () => {
  test("nagłówki wierszy pokazują pełne nazwy zamiast kodów ISO", async ({
    page,
  }) => {
    await log_in(page);

    const card = country_card(page);
    await expect(card.getByText("Polska", { exact: true })).toBeVisible();
    await expect(
      card.getByText("Stany Zjednoczone", { exact: true }),
    ).toBeVisible();
    await expect(card.getByText(UNRESOLVED_LABEL)).toBeVisible();

    for (const heading of await country_headings(page)) {
      expect(heading).not.toMatch(BARE_COUNTRY_CODE);
    }
  });

  test("przełącznik „Pokaż IP” rozwija adresy pod krajami i zwija je z powrotem", async ({
    page,
  }) => {
    await log_in(page);

    await expect(country_card(page)).not.toContainText(GEO_IPV4.ip);
    await expect(traffic_switch(page, COUNTRY_IPS_SWITCH)).toHaveAttribute(
      "aria-checked",
      "false",
    );

    await toggle_switch(page, COUNTRY_IPS_SWITCH);

    await expect(page).toHaveURL(admin_url("showCountryIps=1"));
    await expect(traffic_switch(page, COUNTRY_IPS_SWITCH)).toHaveAttribute(
      "aria-checked",
      "true",
    );

    const usa_ip = country_row(page, "Stany Zjednoczone")
      .locator("ul li")
      .filter({ hasText: GEO_IPV4.ip });
    await expect(usa_ip).toHaveCount(1);
    await expect(usa_ip).toContainText(String(GEO_IPV4.hits));

    await toggle_switch(page, COUNTRY_IPS_SWITCH);

    await expect(page).toHaveURL(admin_url(""));
    await expect(country_card(page)).not.toContainText(GEO_IPV4.ip);
  });

  test("kubełek „Nieprzypisane” przycina listę do limitu i liczy resztę", async ({
    page,
  }) => {
    await log_in(page);
    await page.goto("/admin?showCountryIps=1");

    const unresolved = country_row(page, UNRESOLVED_LABEL);
    await expect(unresolved.locator("ul li span[title]")).toHaveCount(
      COUNTRY_IP_LIMIT,
    );
    await expect(
      unresolved.getByText(
        new RegExp(`^\\+${UNRESOLVED_HIDDEN_IPS} więcej IP · \\d+ trafie`),
      ),
    ).toBeVisible();
  });

  // Atrybucja jest warunkiem licencji CC BY 4.0, a nie ozdobą stopki — ten test
  // pilnuje, żeby refaktor panelu jej nie zgubił w żadnym stanie karty.
  test("panel pokazuje atrybucję zbioru DB-IP razem z linkiem do źródła", async ({
    page,
  }) => {
    await log_in(page);
    await expect_attribution(page);

    await page.goto("/admin?showCountryIps=1");
    await expect_attribution(page);
  });
});

test.describe("Admin — karta krajów bez JavaScriptu", () => {
  test("lista IP rozwija się bez JS", { tag: NO_JS_TAG }, async ({ page }) => {
    await log_in(page);

    await expect(country_card(page)).not.toContainText(GEO_IPV4.ip);
    await toggle_switch(page, COUNTRY_IPS_SWITCH);

    await expect(page).toHaveURL(admin_url("showCountryIps=1"));
    await expect(country_row(page, "Stany Zjednoczone")).toContainText(
      GEO_IPV4.ip,
    );
    await expect(country_card(page).getByText(UNRESOLVED_LABEL)).toBeVisible();
  });
});
