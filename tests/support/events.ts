import type { Locator, Page } from "@playwright/test";
import {
  EVENTS,
  MARKETS_PATH,
  type TradeFairEvent,
} from "../../src/components/events-data";

/** Wspólne lokatory i kroki wydarzeń — dzielone przez spece listingu i stron detalu. */

export const EBC_ID = "ebc-2026-barcelona";
export const WORKSHOP_ID = "bw-workshop-2026-barcelona";

/** Wydarzenie z `EVENTS`, nie z fixture — pilnuje danych wystawionych na produkcji */
export function find_event(id: string): TradeFairEvent {
  const event = EVENTS.find((entry) => entry.id === id);

  if (!event) {
    throw new Error(`Brak wydarzenia ${id} w EVENTS`);
  }

  return event;
}

/**
 * Zawęża pole opcjonalne w `TradeFairEvent`. Brak danych to zmiana kalendarza,
 * a nie regresja strony — komunikat ma o tym mówić wprost.
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
