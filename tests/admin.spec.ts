import { expect, test } from "@playwright/test";
import { NO_JS_TAG } from "../playwright.config";
import { DEFAULT_PAGE_SIZE } from "../src/lib/logs/types";
import {
  BOT_BROWSER,
  BOT_PATH,
  GEO_IPV4,
  GEO_IPV6,
  HIGHEST_COUNTRY,
  HIGHEST_PATH,
  HOSTILE_BROWSER,
  HOSTILE_MARKER,
  HOSTILE_REFERRER,
  HOSTILE_UA,
  LOWEST_COUNTRY,
  LOWEST_NOT_FOUND_PATH,
  LOWEST_PATH,
  NO_UA_PATH,
  NOT_FOUND_TOTAL,
  PUBLIC_TOTAL,
  PUBLIC_UNIQUE_IPS,
  SPOOFED_XFF_HEADER_IP,
  SPOOFED_XFF_PATH,
  SPOOFED_XFF_REMOTE_ADDR,
  UNKNOWN_BROWSER,
  UNMAPPED_COUNTRY_PATH,
} from "./fixtures/access_log";
import {
  ADMIN_PATH,
  LOGIN_PATH,
  LOGIN_REDIRECT,
  ON_LOGIN,
  TOTAL_LABEL,
  apply_filters,
  column_cells,
  column_header,
  column_values,
  has_session_cookie,
  log_in,
  logs_table,
  navigate,
  pagination,
  sort_by,
  stat_value,
  submit_password,
  table_rows,
  toggle_switch,
} from "./support/admin";

const WRONG_PASSWORD = "zle-haslo-e2e";
const COLUMN_COUNT = 10;
const ISO_CODE = /^[A-Z]{2}$/;

const FIRST_PAGE_ROWS = Math.min(PUBLIC_TOTAL, DEFAULT_PAGE_SIZE);
const LAST_PAGE_ROWS = PUBLIC_TOTAL - FIRST_PAGE_ROWS;

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
    await page.waitForURL(ON_LOGIN);

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

  test("filtr ścieżki zawęża tabelę do jednej kategorii ruchu", async ({
    page,
  }) => {
    await log_in(page);

    await page.getByLabel("Ścieżka").fill(BOT_PATH);
    await apply_filters(page);
    expect(await column_values(page, "Przeglądarka")).toEqual([BOT_BROWSER]);

    await page.getByLabel("Ścieżka").fill(NO_UA_PATH);
    await apply_filters(page);
    expect(await column_values(page, "Przeglądarka")).toEqual([
      UNKNOWN_BROWSER,
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
    await toggle_switch(page, "Crawlery wyszukiwarek");
    await toggle_switch(page, "Pokaż IP");
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
