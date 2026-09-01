import { expect, type Locator, type Page } from "@playwright/test";
import { E2E_ADMIN_PASSWORD } from "../../playwright.config";

/** Wspólne lokatory i kroki panelu — dzielone przez wszystkie spece `/admin`. */

export const ADMIN_PATH = "/admin";
export const LOGIN_PATH = "/admin/login";
export const SESSION_COOKIE = "bw_session";

export const NAV_TIMEOUT = 20_000;
export const ON_LOGIN = /\/admin\/login(?:\?|$)/;
export const AFTER_LOGIN = /\/admin(?:\?|$)|\/admin\/login\?error=/;
export const LOGIN_REDIRECT = /\/admin\/login\?redirect=%2Fadmin$/;

export const TABLE_NAME = /Zarejestrowane żądania/;
export const TOTAL_LABEL = "Żądania łącznie";

const MISCONFIGURED_SERVER =
  "Serwer testowy odrzucił poprawne hasło kodem `server`. Najczęstsza przyczyna: " +
  "testy trafiły na obcy serwer dev na porcie 4321, uruchomiony bez zmiennych " +
  "wstrzykiwanych przez playwright.config.ts (ADMIN_PASSWORD_HASH, AUTH_SECRET, LOG_SOURCE_URL).";

const REGEX_SPECIALS = /[.*+?^${}()|[\]\\]/g;

/** Dokładny adres panelu; kanoniczny szyk parametrów ustala `serialize_log_query`. */
export function admin_url(search: string): RegExp {
  if (search === "") {
    return new RegExp(`${ADMIN_PATH}$`);
  }
  return new RegExp(
    `${ADMIN_PATH}\\?${search.replace(REGEX_SPECIALS, "\\$&")}$`,
  );
}

export function logs_table(page: Page): Locator {
  return page.getByRole("table", { name: TABLE_NAME });
}

/** Także wiersz komunikatu („Brak wyników”) jest `tr`, więc liczbę porównujemy świadomie. */
export function table_rows(page: Page): Locator {
  return logs_table(page).locator("tbody tr");
}

export function stat_value(page: Page, label: string): Locator {
  return page
    .locator("dl > div")
    .filter({ hasText: label })
    .getByRole("definition");
}

export function pagination(page: Page): Locator {
  return page.getByRole("navigation", { name: "Paginacja wyników" });
}

export function column_header(page: Page, label: string): Locator {
  return logs_table(page).getByRole("columnheader", { name: label });
}

/** Kolumny mają tylko etykiety, więc pozycję czytamy z nagłówków zamiast ją zakładać. */
export async function column_cells(
  page: Page,
  label: string,
): Promise<Locator> {
  const headers = await logs_table(page)
    .getByRole("columnheader")
    .allInnerTexts();
  const index = headers.findIndex((text) =>
    text.trim().toLowerCase().startsWith(label.toLowerCase()),
  );
  expect(index, `Brak kolumny "${label}" w tabeli logów.`).toBeGreaterThan(-1);
  return logs_table(page).locator(`tbody tr td:nth-child(${index + 1})`);
}

export async function column_values(
  page: Page,
  label: string,
): Promise<string[]> {
  const cells = await column_cells(page, label);
  return (await cells.allInnerTexts()).map((value) => value.trim());
}

export async function has_session_cookie(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies();
  return cookies.some((cookie) => cookie.name === SESSION_COOKIE);
}

/**
 * Panel nie ma JS-a, więc każda interakcja to pełna nawigacja. Czekamy na zmianę
 * adresu, inaczej kolejna asercja mogłaby jeszcze przeczytać poprzedni dokument.
 */
export async function navigate(
  page: Page,
  act: () => Promise<void>,
): Promise<void> {
  const before = page.url();
  await act();
  await page.waitForURL((url) => url.toString() !== before, {
    timeout: NAV_TIMEOUT,
  });
}

export async function submit_password(
  page: Page,
  password: string,
): Promise<void> {
  await page.getByLabel("Hasło").fill(password);
  await page.getByRole("button", { name: "Zaloguj" }).click();
}

export async function log_in(page: Page): Promise<void> {
  await page.goto(LOGIN_PATH);
  await submit_password(page, E2E_ADMIN_PASSWORD);
  await page.waitForURL(AFTER_LOGIN, { timeout: NAV_TIMEOUT });

  const failure = new URL(page.url()).searchParams.get("error");
  if (failure === "server") {
    throw new Error(MISCONFIGURED_SERVER);
  }
  expect(failure, "Logowanie poprawnym hasłem zostało odrzucone.").toBeNull();
}

export async function apply_filters(page: Page): Promise<void> {
  await navigate(page, () =>
    page.getByRole("button", { name: "Zastosuj filtry" }).click(),
  );
}

export async function sort_by(page: Page, label: string): Promise<void> {
  await navigate(page, () =>
    column_header(page, label).getByRole("link").click(),
  );
}

/** Przełączniki ruchu są linkami `role="switch"`; nazwa dostępna to ich etykieta. */
export function traffic_switch(page: Page, name: string): Locator {
  return page.getByRole("switch", { name, exact: true });
}

/** Jedno kliknięcie przeładowuje panel — bez „Zastosuj filtry”. */
export async function toggle_switch(page: Page, name: string): Promise<void> {
  await navigate(page, () => traffic_switch(page, name).click());
}
