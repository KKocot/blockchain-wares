import { expect, test, type Page } from "@playwright/test";
import { NO_JS_TAG } from "../playwright.config";
import { EXCLUSION_FLAGS, type ExclusionFlag } from "../src/lib/logs/types";
import {
  EXCLUSION_IPS,
  EXCLUSION_TOTALS,
  INTERNAL_BROWSER,
  INTERNAL_IP,
  INTERNAL_PATH,
  INTERNAL_TOTAL,
  NON_HUMAN_TOTAL,
  PUBLIC_HUMAN_TOTAL,
  PUBLIC_TOTAL,
} from "./fixtures/access_log";
import {
  TOTAL_LABEL,
  admin_url,
  apply_filters,
  column_values,
  log_in,
  logs_table,
  navigate,
  pagination,
  sort_by,
  stat_value,
  table_rows,
  toggle_switch,
  traffic_switch,
} from "./support/admin";

/** Nazwy dostępne przełączników — kopie etykiet z `src/components/admin/TrafficFilters.tsx`. */
const SWITCH_LABEL: Readonly<Record<ExclusionFlag, string>> = {
  excludeCrawlers: "Crawlery wyszukiwarek",
  excludeSeoTools: "Narzędzia i podglądy",
  excludeScripts: "Skrypty CLI/HTTP",
  excludeHeadless: "Headless",
  excludeUnknownUa: "UA nierozpoznany",
  excludeNoUa: "Brak nagłówka UA",
};

const INTERNAL_SWITCH = "Loopback 127.0.0.1 / ::1";
const COUNTRY_IPS_SWITCH = "Pokaż IP";

/** Przełączniki zmieniające zbiór wyników — te muszą wracać na pierwszą stronę. */
const FILTER_SWITCHES = [
  ...EXCLUSION_FLAGS.map((flag) => SWITCH_LABEL[flag]),
  INTERNAL_SWITCH,
];

const ALL_SWITCHES = [...FILTER_SWITCHES, COUNTRY_IPS_SWITCH];

/** Kolejność parametrów jest kanoniczna — inna wymusza przekierowanie 303 na `/admin`. */
const GRANULAR_SEARCH = EXCLUSION_FLAGS.map((flag) => `${flag}=1`).join("&");
const ALL_FLAGS_SEARCH = `includeInternal=1&${GRANULAR_SEARCH}&showCountryIps=1`;

/** Cała tabela na jednej stronie — inaczej marker kategorii mógłby wpaść na stronę 2. */
const WHOLE_TABLE = "pageSize=100";

async function expect_switch(
  page: Page,
  name: string,
  checked: boolean,
): Promise<void> {
  await expect(traffic_switch(page, name)).toHaveAttribute(
    "aria-checked",
    String(checked),
  );
}

test.describe("Admin — przełączniki ruchu", () => {
  test("czysty panel pokazuje wszystkie kategorie, a przełączenie flagi odwraca stan", async ({
    page,
  }) => {
    await log_in(page);

    for (const flag of EXCLUSION_FLAGS) {
      await expect_switch(page, SWITCH_LABEL[flag], true);
    }
    await expect_switch(page, INTERNAL_SWITCH, false);
    await expect_switch(page, COUNTRY_IPS_SWITCH, false);

    await toggle_switch(page, SWITCH_LABEL.excludeCrawlers);

    await expect(page).toHaveURL(admin_url("excludeCrawlers=1"));
    await expect_switch(page, SWITCH_LABEL.excludeCrawlers, false);
    for (const flag of EXCLUSION_FLAGS) {
      if (flag !== "excludeCrawlers") {
        await expect_switch(page, SWITCH_LABEL[flag], true);
      }
    }
    await expect_switch(page, INTERNAL_SWITCH, false);
  });

  test("każda flaga chowa dokładnie swoją kategorię i nie rusza pozostałych", async ({
    page,
  }) => {
    await log_in(page);

    for (const flag of EXCLUSION_FLAGS) {
      await page.goto(`/admin?${flag}=1&${WHOLE_TABLE}`);

      await expect(stat_value(page, TOTAL_LABEL)).toHaveText(
        String(PUBLIC_TOTAL - EXCLUSION_TOTALS[flag]),
      );

      const ips = await column_values(page, "IP");
      for (const ip of EXCLUSION_IPS[flag]) {
        expect(ips, `${flag} nie ukryło adresu ${ip}`).not.toContain(ip);
      }
      for (const other of EXCLUSION_FLAGS) {
        if (other === flag) {
          continue;
        }
        for (const ip of EXCLUSION_IPS[other]) {
          expect(ips, `${flag} ukryło ${ip} z kategorii ${other}`).toContain(
            ip,
          );
        }
      }
    }
  });

  test("dwie flagi naraz odcinają sumę swoich kategorii", async ({ page }) => {
    await log_in(page);
    await page.goto(
      `/admin?excludeCrawlers=1&excludeSeoTools=1&${WHOLE_TABLE}`,
    );

    await expect(stat_value(page, TOTAL_LABEL)).toHaveText(
      String(
        PUBLIC_TOTAL -
          EXCLUSION_TOTALS.excludeCrawlers -
          EXCLUSION_TOTALS.excludeSeoTools,
      ),
    );

    const ips = await column_values(page, "IP");
    for (const ip of [
      ...EXCLUSION_IPS.excludeCrawlers,
      ...EXCLUSION_IPS.excludeSeoTools,
    ]) {
      expect(ips).not.toContain(ip);
    }
    for (const ip of EXCLUSION_IPS.excludeScripts) {
      expect(ips).toContain(ip);
    }
    await expect_switch(page, SWITCH_LABEL.excludeCrawlers, false);
    await expect_switch(page, SWITCH_LABEL.excludeSeoTools, false);
    await expect_switch(page, SWITCH_LABEL.excludeScripts, true);
  });

  test("wszystkie sześć flag naraz zostawia sam ruch ludzki, także z loopbackiem", async ({
    page,
  }) => {
    await log_in(page);
    await page.goto(`/admin?includeInternal=1&${GRANULAR_SEARCH}`);

    await expect_switch(page, INTERNAL_SWITCH, true);
    // Health-checki loopbacku idą Wgetem, więc zdejmuje je flaga skryptów.
    await expect(stat_value(page, TOTAL_LABEL)).toHaveText(
      String(PUBLIC_TOTAL + INTERNAL_TOTAL - NON_HUMAN_TOTAL),
    );
    expect(await column_values(page, "IP")).not.toContain(INTERNAL_IP);

    await sort_by(page, "Ścieżka");
    await expect(page).toHaveURL(
      admin_url(`includeInternal=1&${GRANULAR_SEARCH}&sort=path`),
    );
    await expect(stat_value(page, TOTAL_LABEL)).toHaveText(
      String(PUBLIC_TOTAL + INTERNAL_TOTAL - NON_HUMAN_TOTAL),
    );
  });

  // Zapisane linki sprzed rozbicia `excludeBots` mają dalej chować to samo.
  test("stary adres ?excludeBots=1 przekierowuje na sześć flag i daje ten sam wynik", async ({
    page,
  }) => {
    await log_in(page);
    await page.goto("/admin?excludeBots=1");

    await expect(page).toHaveURL(admin_url(GRANULAR_SEARCH));
    await expect(stat_value(page, TOTAL_LABEL)).toHaveText(
      String(PUBLIC_HUMAN_TOTAL),
    );
    for (const flag of EXCLUSION_FLAGS) {
      await expect_switch(page, SWITCH_LABEL[flag], false);
    }

    const legacy_ips = await column_values(page, "IP");
    await page.goto(`/admin?${GRANULAR_SEARCH}`);
    expect(await column_values(page, "IP")).toEqual(legacy_ips);
  });

  test("każdy filtr ruchu wraca na pierwszą stronę i nie gubi sortowania", async ({
    page,
  }) => {
    await log_in(page);

    for (const name of FILTER_SWITCHES) {
      await page.goto("/admin?sort=path&dir=asc&page=2");
      await toggle_switch(page, name);

      await expect(page, `${name} nie zresetował strony`).not.toHaveURL(
        /[?&]page=/,
      );
      await expect(page).toHaveURL(/[?&]sort=path&dir=asc$/);
    }
  });

  // „Pokaż IP” nie rusza zbioru wyników, więc odesłanie na stronę 1 gubiłoby miejsce
  // w tabeli — w odróżnieniu od siedmiu przełączników filtrujących.
  test("„Pokaż IP” zachowuje numer strony i sortowanie", async ({ page }) => {
    await log_in(page);
    await page.goto("/admin?sort=path&dir=asc&page=2");

    await toggle_switch(page, COUNTRY_IPS_SWITCH);

    await expect(page).toHaveURL(
      admin_url("showCountryIps=1&sort=path&dir=asc&page=2"),
    );

    await toggle_switch(page, COUNTRY_IPS_SWITCH);

    await expect(page).toHaveURL(admin_url("sort=path&dir=asc&page=2"));
  });

  test("submit filtrów nie gasi żadnej z ośmiu flag", async ({ page }) => {
    await log_in(page);
    await page.goto(`/admin?${ALL_FLAGS_SEARCH}`);

    await page.getByLabel("Status").fill("404");
    await apply_filters(page);

    await expect(page).toHaveURL(admin_url(`status=404&${ALL_FLAGS_SEARCH}`));
    for (const flag of EXCLUSION_FLAGS) {
      await expect_switch(page, SWITCH_LABEL[flag], false);
    }
    await expect_switch(page, INTERNAL_SWITCH, true);
    await expect_switch(page, COUNTRY_IPS_SWITCH, true);
  });

  test("zmiana rozmiaru strony nie gasi żadnej z ośmiu flag", async ({
    page,
  }) => {
    await log_in(page);
    await page.goto(`/admin?${ALL_FLAGS_SEARCH}`);

    await navigate(page, async () => {
      await pagination(page).getByLabel("Na stronie").selectOption("25");
      await pagination(page).getByRole("button", { name: "Ustaw" }).click();
    });

    await expect(page).toHaveURL(admin_url(`${ALL_FLAGS_SEARCH}&pageSize=25`));
    for (const flag of EXCLUSION_FLAGS) {
      await expect_switch(page, SWITCH_LABEL[flag], false);
    }
    await expect_switch(page, INTERNAL_SWITCH, true);
    await expect_switch(page, COUNTRY_IPS_SWITCH, true);
  });

  test("health-checki z loopbacku pokazuje dopiero przełącznik ruchu wewnętrznego", async ({
    page,
  }) => {
    await log_in(page);

    expect(await column_values(page, "IP")).not.toContain(INTERNAL_IP);

    await page.getByLabel("Ścieżka").fill(INTERNAL_PATH);
    await apply_filters(page);

    await expect(logs_table(page).getByText("Brak wyników")).toBeVisible();
    await expect(stat_value(page, TOTAL_LABEL)).toHaveText("0");

    await toggle_switch(page, INTERNAL_SWITCH);

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

  test("przełączniki mają rolę switch z opisem, a grupy dostępne nazwy", async ({
    page,
  }) => {
    await log_in(page);

    await expect(
      page.getByRole("region", { name: "Filtry ruchu" }),
    ).toBeVisible();
    for (const name of [
      /^Boty rozpoznane/,
      /^Ruch niezidentyfikowany/,
      /^Ruch wewnętrzny/,
    ]) {
      await expect(page.getByRole("group", { name })).toBeVisible();
    }

    for (const name of ALL_SWITCHES) {
      const control = traffic_switch(page, name);
      await expect(control).toHaveAttribute("aria-checked", /^(?:true|false)$/);

      const described_by = await control.getAttribute("aria-describedby");
      expect(described_by, `${name} bez aria-describedby`).not.toBeNull();
      await expect(page.locator(`[id="${described_by}"]`)).toHaveText(/\S/);
    }
  });
});

test.describe("Admin — przełączniki bez JavaScriptu", () => {
  test(
    "flagi ruchu przełączają się bez JS i kumulują w adresie",
    { tag: NO_JS_TAG },
    async ({ page }) => {
      await log_in(page);

      await toggle_switch(page, SWITCH_LABEL.excludeCrawlers);
      await expect(page).toHaveURL(admin_url("excludeCrawlers=1"));
      await expect(stat_value(page, TOTAL_LABEL)).toHaveText(
        String(PUBLIC_TOTAL - EXCLUSION_TOTALS.excludeCrawlers),
      );

      await toggle_switch(page, INTERNAL_SWITCH);
      await expect(page).toHaveURL(
        admin_url("includeInternal=1&excludeCrawlers=1"),
      );
      await expect_switch(page, INTERNAL_SWITCH, true);
      await expect_switch(page, SWITCH_LABEL.excludeCrawlers, false);
    },
  );
});
