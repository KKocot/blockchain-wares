import { expect, test, type Locator, type Page } from "@playwright/test";
import { E2E_ADMIN_PASSWORD, NO_JS_TAG } from "../playwright.config";
import { DEFAULT_PAGE_SIZE } from "../src/lib/logs/types";
import {
  BARE_COUNTRY_CODE,
  GEO_IPV4,
  GEO_IPV6,
  HIGHEST_COUNTRY,
  HIGHEST_PATH,
  HOSTILE_BROWSER,
  HOSTILE_MARKER,
  HOSTILE_REFERRER,
  HOSTILE_UA,
  INTERNAL_BROWSER,
  INTERNAL_IP,
  INTERNAL_PATH,
  INTERNAL_TOTAL,
  LOWEST_COUNTRY,
  LOWEST_NOT_FOUND_PATH,
  LOWEST_PATH,
  NOT_FOUND_TOTAL,
  PUBLIC_TOTAL,
  PUBLIC_UNIQUE_IPS,
  SPOOFED_XFF_HEADER_IP,
  SPOOFED_XFF_PATH,
  SPOOFED_XFF_REMOTE_ADDR,
  UNMAPPED_COUNTRY_PATH,
} from "./fixtures/access_log";

const ADMIN_PATH = "/admin";
const LOGIN_PATH = "/admin/login";
const SESSION_COOKIE = "bw_session";
const WRONG_PASSWORD = "zle-haslo-e2e";

const NAV_TIMEOUT = 20_000;
const ON_LOGIN = /\/admin\/login(?:\?|$)/;
const AFTER_LOGIN = /\/admin(?:\?|$)|\/admin\/login\?error=/;
const LOGIN_REDIRECT = /\/admin\/login\?redirect=%2Fadmin$/;

const TABLE_NAME = /Zarejestrowane żądania/;
const TOTAL_LABEL = "Żądania łącznie";
const COLUMN_COUNT = 10;
const ISO_CODE = /^[A-Z]{2}$/;

/** Warunek licencji CC BY 4.0 zbioru DB-IP — brzmienie i link muszą zostać w panelu. */
const GEOIP_DATASET = "DB-IP IP to Country Lite";
const GEOIP_LINK_TEXT = "IP Geolocation by DB-IP";
const GEOIP_URL = "https://db-ip.com";
const GEOIP_LICENSE = "licencja CC BY 4.0";
const FIRST_PAGE_ROWS = Math.min(PUBLIC_TOTAL, DEFAULT_PAGE_SIZE);
const LAST_PAGE_ROWS = PUBLIC_TOTAL - FIRST_PAGE_ROWS;

const MISCONFIGURED_SERVER =
  "Serwer testowy odrzucił poprawne hasło kodem `server`. Najczęstsza przyczyna: " +
  "testy trafiły na obcy serwer dev na porcie 4321, uruchomiony bez zmiennych " +
  "wstrzykiwanych przez playwright.config.ts (ADMIN_PASSWORD_HASH, AUTH_SECRET, LOG_SOURCE_URL).";

function logs_table(page: Page): Locator {
  return page.getByRole("table", { name: TABLE_NAME });
}

/** Także wiersz komunikatu („Brak wyników”) jest `tr`, więc liczbę porównujemy świadomie. */
function table_rows(page: Page): Locator {
  return logs_table(page).locator("tbody tr");
}

function stat_value(page: Page, label: string): Locator {
  return page
    .locator("dl > div")
    .filter({ hasText: label })
    .getByRole("definition");
}

function pagination(page: Page): Locator {
  return page.getByRole("navigation", { name: "Paginacja wyników" });
}

function column_header(page: Page, label: string): Locator {
  return logs_table(page).getByRole("columnheader", { name: label });
}

/** Kolumny mają tylko etykiety, więc pozycję czytamy z nagłówków zamiast ją zakładać. */
async function column_cells(page: Page, label: string): Promise<Locator> {
  const headers = await logs_table(page)
    .getByRole("columnheader")
    .allInnerTexts();
  const index = headers.findIndex((text) =>
    text.trim().toLowerCase().startsWith(label.toLowerCase()),
  );
  expect(index, `Brak kolumny "${label}" w tabeli logów.`).toBeGreaterThan(-1);
  return logs_table(page).locator(`tbody tr td:nth-child(${index + 1})`);
}

async function column_values(page: Page, label: string): Promise<string[]> {
  const cells = await column_cells(page, label);
  return (await cells.allInnerTexts()).map((value) => value.trim());
}

async function has_session_cookie(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies();
  return cookies.some((cookie) => cookie.name === SESSION_COOKIE);
}

/**
 * Panel nie ma JS-a, więc każda interakcja to pełna nawigacja. Czekamy na zmianę
 * adresu, inaczej kolejna asercja mogłaby jeszcze przeczytać poprzedni dokument.
 */
async function navigate(page: Page, act: () => Promise<void>): Promise<void> {
  const before = page.url();
  await act();
  await page.waitForURL((url) => url.toString() !== before, {
    timeout: NAV_TIMEOUT,
  });
}

async function submit_password(page: Page, password: string): Promise<void> {
  await page.getByLabel("Hasło").fill(password);
  await page.getByRole("button", { name: "Zaloguj" }).click();
}

async function log_in(page: Page): Promise<void> {
  await page.goto(LOGIN_PATH);
  await submit_password(page, E2E_ADMIN_PASSWORD);
  await page.waitForURL(AFTER_LOGIN, { timeout: NAV_TIMEOUT });

  const failure = new URL(page.url()).searchParams.get("error");
  if (failure === "server") {
    throw new Error(MISCONFIGURED_SERVER);
  }
  expect(failure, "Logowanie poprawnym hasłem zostało odrzucone.").toBeNull();
}

async function apply_filters(page: Page): Promise<void> {
  await navigate(page, () =>
    page.getByRole("button", { name: "Zastosuj filtry" }).click(),
  );
}

async function sort_by(page: Page, label: string): Promise<void> {
  await navigate(page, () =>
    column_header(page, label).getByRole("link").click(),
  );
}

test.describe("Admin — dostęp i logowanie", () => {
  test("/admin bez sesji przekierowuje na logowanie z parametrem redirect", async ({
    page,
  }) => {
    await page.goto(ADMIN_PATH);

    await expect(page).toHaveURL(LOGIN_REDIRECT);
    expect(await has_session_cookie(page)).toBe(false);
  });

  test("/admin/login odpowiada 200 i renderuje formularz bez pętli przekierowań", async ({
    page,
  }) => {
    const response = await page.goto(LOGIN_PATH);

    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("form", { name: "Logowanie do panelu" }),
    ).toBeVisible();
    await expect(page.getByLabel("Hasło")).toBeVisible();
    await expect(page.getByRole("button", { name: "Zaloguj" })).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("złe hasło wraca na logowanie z komunikatem i nie zakłada sesji", async ({
    page,
  }) => {
    await page.goto(LOGIN_PATH);
    await submit_password(page, WRONG_PASSWORD);
    await page.waitForURL(ON_LOGIN, { timeout: NAV_TIMEOUT });

    await expect(page.getByRole("alert")).toHaveText("Nieprawidłowe hasło.");
    await expect(page).toHaveURL(/\/admin\/login\?error=invalid$/);
    expect(await has_session_cookie(page)).toBe(false);
  });

  test("poprawne hasło otwiera panel z danymi ze źródła logów", async ({
    page,
  }) => {
    await log_in(page);

    await expect(page).toHaveURL(/\/admin$/);
    expect(await has_session_cookie(page)).toBe(true);

    await expect(stat_value(page, TOTAL_LABEL)).toHaveText(
      String(PUBLIC_TOTAL),
    );
    await expect(stat_value(page, "Unikalne adresy IP")).toHaveText(
      String(PUBLIC_UNIQUE_IPS),
    );
    await expect(stat_value(page, "Średnio na dzień")).toHaveText(
      /^\d+(?:,\d+)?$/,
    );

    const chart = page.getByRole("img", { name: /Wykres słupkowy/ });
    await expect(chart).toBeVisible();
    expect(
      await chart.locator('rect[fill="currentColor"]').count(),
    ).toBeGreaterThan(0);

    await expect(table_rows(page)).toHaveCount(FIRST_PAGE_ROWS);
    await expect(table_rows(page).first().getByRole("cell")).toHaveCount(
      COLUMN_COUNT,
    );
  });

  test("wylogowanie kasuje ciasteczko i zamyka panel", async ({ page }) => {
    await log_in(page);
    expect(await has_session_cookie(page)).toBe(true);

    await navigate(page, () =>
      page.getByRole("button", { name: "Wyloguj" }).click(),
    );
    await expect(page).toHaveURL(ON_LOGIN);
    expect(await has_session_cookie(page)).toBe(false);

    await page.goto(ADMIN_PATH);
    await expect(page).toHaveURL(LOGIN_REDIRECT);
  });
});

test.describe("Admin — tabela, sortowanie i paginacja", () => {
  test("kliknięcie nagłówka zmienia aria-sort, kolejność wierszy i adres strony", async ({
    page,
  }) => {
    await log_in(page);

    await expect(column_header(page, "Czas")).toHaveAttribute(
      "aria-sort",
      "descending",
    );
    await expect(column_header(page, "Ścieżka")).toHaveAttribute(
      "aria-sort",
      "none",
    );

    await sort_by(page, "Ścieżka");
    await expect(page).toHaveURL(/\/admin\?sort=path$/);
    await expect(column_header(page, "Ścieżka")).toHaveAttribute(
      "aria-sort",
      "descending",
    );
    await expect(column_header(page, "Czas")).toHaveAttribute(
      "aria-sort",
      "none",
    );
    expect((await column_values(page, "Ścieżka"))[0]).toBe(HIGHEST_PATH);

    await sort_by(page, "Ścieżka");
    await expect(page).toHaveURL(/\/admin\?sort=path&dir=asc$/);
    await expect(column_header(page, "Ścieżka")).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    expect((await column_values(page, "Ścieżka"))[0]).toBe(LOWEST_PATH);
  });

  test("druga strona wyników zmienia zakres i liczbę wierszy", async ({
    page,
  }) => {
    await log_in(page);

    await expect(
      pagination(page).getByText(
        `1–${FIRST_PAGE_ROWS} z ${PUBLIC_TOTAL} wyników`,
      ),
    ).toBeVisible();
    await expect(table_rows(page)).toHaveCount(FIRST_PAGE_ROWS);

    await navigate(page, () =>
      pagination(page).getByRole("link", { name: "Następna" }).click(),
    );

    await expect(page).toHaveURL(/[?&]page=2\b/);
    await expect(
      pagination(page).getByText(
        `${FIRST_PAGE_ROWS + 1}–${PUBLIC_TOTAL} z ${PUBLIC_TOTAL} wyników`,
      ),
    ).toBeVisible();
    await expect(pagination(page).getByText("Strona 2 z 2")).toBeVisible();
    await expect(table_rows(page)).toHaveCount(LAST_PAGE_ROWS);
  });

  test("kolumna IP pokazuje remote_addr, nie podstawiony X-Forwarded-For", async ({
    page,
  }) => {
    await log_in(page);

    await page.getByLabel("Ścieżka").fill(SPOOFED_XFF_PATH);
    await apply_filters(page);

    await expect(table_rows(page)).toHaveCount(1);
    expect(await column_values(page, "IP")).toEqual([SPOOFED_XFF_REMOTE_ADDR]);
    await expect(logs_table(page)).not.toContainText(SPOOFED_XFF_HEADER_IP);
  });
});

test.describe("Admin — filtry", () => {
  test("filtr status=404 zawęża wyniki do samych 404", async ({ page }) => {
    await log_in(page);

    await page.getByLabel("Status").fill("404");
    await apply_filters(page);

    await expect(page).toHaveURL(/\/admin\?status=404$/);
    await expect(table_rows(page)).toHaveCount(NOT_FOUND_TOTAL);
    await expect(stat_value(page, TOTAL_LABEL)).toHaveText(
      String(NOT_FOUND_TOTAL),
    );
    expect([...new Set(await column_values(page, "Status"))]).toEqual(["404"]);
  });

  test("health-checki z loopbacku są ukryte, dopóki nie włączy się ruchu wewnętrznego", async ({
    page,
  }) => {
    await log_in(page);

    expect(await column_values(page, "IP")).not.toContain(INTERNAL_IP);

    await page.getByLabel("Ścieżka").fill(INTERNAL_PATH);
    await apply_filters(page);

    await expect(logs_table(page).getByText("Brak wyników")).toBeVisible();
    await expect(stat_value(page, TOTAL_LABEL)).toHaveText("0");

    await page.getByLabel("Ruch wewnętrzny (localhost)").check();
    await apply_filters(page);

    await expect(page).toHaveURL(/[?&]includeInternal=1\b/);
    await expect(table_rows(page)).toHaveCount(INTERNAL_TOTAL);
    await expect(stat_value(page, TOTAL_LABEL)).toHaveText(
      String(INTERNAL_TOTAL),
    );
    expect([...new Set(await column_values(page, "IP"))]).toEqual([
      INTERNAL_IP,
    ]);
    expect([...new Set(await column_values(page, "Przeglądarka"))]).toEqual([
      INTERNAL_BROWSER,
    ]);
  });

  test("filtr i sortowanie z adresu strony przeżywają przeładowanie", async ({
    page,
  }) => {
    await log_in(page);
    await page.goto("/admin?status=404&sort=path&dir=asc");

    const expect_restored = async (): Promise<void> => {
      await expect(page).toHaveURL(/\/admin\?status=404&sort=path&dir=asc$/);
      await expect(page.getByLabel("Status")).toHaveValue("404");
      await expect(column_header(page, "Ścieżka")).toHaveAttribute(
        "aria-sort",
        "ascending",
      );
      expect((await column_values(page, "Ścieżka"))[0]).toBe(
        LOWEST_NOT_FOUND_PATH,
      );
    };

    await expect_restored();
    await page.reload();
    await expect_restored();
  });
});

test.describe("Admin — geolokalizacja", () => {
  test("kolumna „Kraj” pokazuje kod ISO dla IPv4 i IPv6, a placeholder dla adresu bez kraju", async ({
    page,
  }) => {
    await log_in(page);

    for (const source of [GEO_IPV4, GEO_IPV6]) {
      await page.getByLabel("Ścieżka").fill(source.path);
      await apply_filters(page);

      await expect(table_rows(page)).toHaveCount(source.hits);
      expect([...new Set(await column_values(page, "IP"))]).toEqual([
        source.ip,
      ]);
      expect([...new Set(await column_values(page, "Kraj"))]).toEqual([
        source.country,
      ]);
    }

    await page.getByLabel("Ścieżka").fill(UNMAPPED_COUNTRY_PATH);
    await apply_filters(page);
    await expect(table_rows(page)).toHaveCount(1);

    const [placeholder] = await column_values(page, "Kraj");
    expect(placeholder).not.toBe("");
    expect(["null", "undefined"]).not.toContain(placeholder);
    expect(placeholder).not.toMatch(ISO_CODE);
    await expect(
      (await column_cells(page, "Kraj")).first().locator("[title]"),
    ).toHaveAttribute("title", /\S/);
  });

  test("sortowanie po kraju zmienia aria-sort, kolejność wierszy i adres strony", async ({
    page,
  }) => {
    await log_in(page);
    await expect(column_header(page, "Kraj")).toHaveAttribute(
      "aria-sort",
      "none",
    );

    await sort_by(page, "Kraj");
    await expect(page).toHaveURL(/\/admin\?sort=country$/);
    await expect(column_header(page, "Kraj")).toHaveAttribute(
      "aria-sort",
      "descending",
    );
    expect((await column_values(page, "Kraj"))[0]).toBe(HIGHEST_COUNTRY);

    await sort_by(page, "Kraj");
    await expect(page).toHaveURL(/\/admin\?sort=country&dir=asc$/);
    await expect(column_header(page, "Kraj")).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    expect((await column_values(page, "Kraj"))[0]).toBe(LOWEST_COUNTRY);
  });

  test("karta „Kraje” pokazuje pełne nazwy zamiast kodów ISO", async ({
    page,
  }) => {
    await log_in(page);

    const card = page.getByRole("region", { name: "Kraje" });
    await expect(card.getByText("Polska", { exact: true })).toBeVisible();
    await expect(
      card.getByText("Stany Zjednoczone", { exact: true }),
    ).toBeVisible();
    expect(await card.innerText()).not.toMatch(BARE_COUNTRY_CODE);
  });

  // Atrybucja jest warunkiem licencji CC BY 4.0, a nie ozdobą stopki — ten test
  // pilnuje, żeby refaktor panelu jej nie zgubił.
  test("panel pokazuje atrybucję zbioru DB-IP razem z linkiem do źródła", async ({
    page,
  }) => {
    await log_in(page);

    const source_link = page.getByRole("link", { name: GEOIP_LINK_TEXT });
    await expect(source_link).toBeVisible();
    await expect(source_link).toHaveAttribute("href", GEOIP_URL);
    await expect(page.getByText(GEOIP_DATASET)).toBeVisible();
    await expect(page.getByText(GEOIP_LICENSE)).toBeVisible();
  });
});

test.describe("Admin — bezpieczeństwo", () => {
  // Wymóg właściciela: panel czyta log serwerowo. Pierwszy fetch z frontu byłby
  // regresją, którą najłatwiej wprowadzić przypadkiem przy kolejnym refaktorze.
  test("panel nie wysyła z frontu żadnego żądania XHR ani fetch", async ({
    page,
  }) => {
    // Astro w trybie dev wstrzykuje pasek narzędziowy, którego audyt wydajności
    // pobiera obrazki strony przez fetch(). To narzędzie deweloperskie, w buildzie
    // go nie ma — blokujemy je, żeby asercja mogła mówić o zerze bez wyjątków.
    await page.route(/dev-toolbar/, (route) => route.abort());

    const dynamic: string[] = [];
    page.on("request", (request) => {
      const type = request.resourceType();
      if (type === "xhr" || type === "fetch") {
        dynamic.push(`${type} ${request.method()} ${request.url()}`);
      }
    });

    await log_in(page);
    await page.waitForLoadState("networkidle");

    await sort_by(page, "Status");
    await page.getByLabel("Status").fill("404");
    await apply_filters(page);
    await navigate(page, async () => {
      await pagination(page).getByLabel("Na stronie").selectOption("25");
      await pagination(page).getByRole("button", { name: "Ustaw" }).click();
    });
    await page.waitForLoadState("networkidle");

    expect(dynamic).toEqual([]);
  });

  test("wrogi User-Agent ze skanera renderuje się jako tekst, nie jako znacznik", async ({
    page,
  }) => {
    await log_in(page);

    await page.getByLabel("Szukaj").fill(HOSTILE_MARKER);
    await apply_filters(page);

    await expect(table_rows(page)).toHaveCount(1);
    await expect(page.getByLabel("Szukaj")).toHaveValue(HOSTILE_MARKER);
    expect(await column_values(page, "Referrer")).toEqual([HOSTILE_REFERRER]);
    expect(await column_values(page, "Przeglądarka")).toEqual([
      HOSTILE_BROWSER,
    ]);

    const browser_cell = (await column_cells(page, "Przeglądarka")).first();
    await expect(browser_cell.locator("[title]")).toHaveAttribute(
      "title",
      HOSTILE_UA,
    );

    expect(await logs_table(page).locator("script").count()).toBe(0);
    const scripted = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll("script"),
        (node) => node.textContent ?? "",
      ).filter((code) => code.includes("alert(")),
    );
    expect(scripted).toEqual([]);
  });
});

test.describe("Admin — bez JavaScriptu", () => {
  test(
    "logowanie, filtrowanie i wylogowanie działają bez JS",
    { tag: NO_JS_TAG },
    async ({ page }) => {
      await log_in(page);
      await expect(page).toHaveURL(/\/admin$/);
      await expect(stat_value(page, TOTAL_LABEL)).toHaveText(
        String(PUBLIC_TOTAL),
      );

      await page.getByLabel("Status").fill("404");
      await apply_filters(page);

      await expect(page).toHaveURL(/\/admin\?status=404$/);
      await expect(table_rows(page)).toHaveCount(NOT_FOUND_TOTAL);
      expect([...new Set(await column_values(page, "Status"))]).toEqual([
        "404",
      ]);

      await sort_by(page, "Ścieżka");
      await expect(column_header(page, "Ścieżka")).toHaveAttribute(
        "aria-sort",
        "descending",
      );

      await navigate(page, () =>
        page.getByRole("button", { name: "Wyloguj" }).click(),
      );
      await expect(page).toHaveURL(ON_LOGIN);
      expect(await has_session_cookie(page)).toBe(false);

      await page.goto(ADMIN_PATH);
      await expect(page).toHaveURL(LOGIN_REDIRECT);
    },
  );
});
