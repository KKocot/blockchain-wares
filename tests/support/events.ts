import type { Locator, Page } from "@playwright/test";
import { MARKETS_PATH } from "../../src/components/events-data";

/** Wspólne lokatory i kroki wydarzeń — dzielone przez spece listingu i stron detalu. */

/**
 * Zawęża pole opcjonalne w `TradeFairEvent`. Brak danych to zmiana zestawu
 * startowego fixture'a, a nie regresja strony — komunikat ma o tym mówić wprost.
 */
export function required<T>(value: T | undefined, what: string): T {
  if (value === undefined) {
    throw new Error(`${what} zniknęło z danych, na których stoi ten test.`);
  }

  return value;
}

/** Treść strony wydarzenia — nawigacja i stopka mają własne linki na listing. */
export function detail_main(page: Page): Locator {
  return page.getByRole("main");
}

/** Powroty na listing: link nad nagłówkiem i ten domykający treść. */
export function back_links(page: Page): Locator {
  return detail_main(page).locator(`a[href="${MARKETS_PATH}"]`);
}

/** Wszystkie bloki JSON-LD dokumentu — `Layout` dokłada własne obok schematu wydarzenia. */
export async function read_json_ld(page: Page): Promise<unknown[]> {
  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();

  return blocks.map((block) => JSON.parse(block) as unknown);
}
