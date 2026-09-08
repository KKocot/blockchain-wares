import { expect, test, type Locator, type Page } from "@playwright/test";
import { field_id } from "../../src/components/admin/event_form_fields";
import {
  MAX_EVENT_TOPICS,
  slot_address,
  SLOT_GROUP_BY_NAME,
  type SlotGroupName,
} from "../../src/components/admin/event_form_groups";
import { TOPIC_SEPARATOR } from "../../src/lib/events/form_parsers";

/**
 * Lokatory i kroki grup powtarzalnych formularza wydarzenia (wyróżniki, fakty, tematy,
 * linki). Osobno od `admin_events.ts`, który po nich woła: tamten plik dobił do limitu
 * 500 linii, a sloty są spójną całością — jedyny kawałek panelu zależny od tego, czy
 * przeglądarka wykonuje skrypty.
 */

const SLOT_ADDRESS = /^(badges|facts|links)\.(\d+)/;

/** `facts.1.label` -> grupa i indeks slotu; pole spoza grup powtarzalnych daje `null`. */
export function parse_slot(
  field: string,
): { group: SlotGroupName; index: number } | null {
  const found = SLOT_ADDRESS.exec(field);

  return found === null
    ? null
    : { group: found[1] as SlotGroupName, index: Number(found[2]) };
}

/** Projekt `chromium-no-js` chodzi bez skryptu — sloty zachowują się tam inaczej. */
export function with_js(): boolean {
  return test.info().project.use.javaScriptEnabled !== false;
}

export function split_topics(csv: string): readonly string[] {
  return csv
    .split(TOPIC_SEPARATOR)
    .map((topic) => topic.trim())
    .filter((topic) => topic.length > 0)
    .slice(0, MAX_EVENT_TOPICS);
}

export interface SlotLocators {
  root: Locator;
  add: Locator;
  counter: Locator;
  item: (index: number) => Locator;
  remove: (index: number) => Locator;
  field: (index: number, key?: string) => Locator;
}

/** Lokatory jednej grupy slotów — markup adresujemy wyłącznie atrybutami `data-slot-*`. */
export function slots(page: Page, group: SlotGroupName): SlotLocators {
  const root = page.locator(`[data-slot-group="${group}"]`);

  return {
    root,
    add: root.locator("[data-slot-add]"),
    counter: root.locator("[data-slot-counter]"),
    item: (index: number) => root.locator(`[data-slot-index="${index}"]`),
    remove: (index: number) =>
      root.locator(`[data-slot-index="${index}"] [data-slot-remove]`),
    field: (index: number, key?: string) =>
      page.locator(`#${field_id(slot_address(group, index, key))}`),
  };
}

/**
 * Bez JS-a wszystkie sloty są widoczne. Ze skryptem widać wypełnione i jeden pusty, a
 * kolejne odsłania „+" — klikamy go zamiast ruszać `hidden`, a jego widoczność jest
 * zarazem sygnałem, że skrypt przestawił już sloty w stan docelowy.
 */
export async function reveal_slot(
  page: Page,
  group: SlotGroupName,
  index: number,
): Promise<void> {
  const { add, item } = slots(page, group);
  if (!with_js()) {
    await expect(item(index)).toBeVisible();
    return;
  }

  await expect(add).toBeVisible();
  const max = SLOT_GROUP_BY_NAME.get(group)?.max ?? 0;

  for (let attempt = 0; attempt <= max; attempt += 1) {
    if (await item(index).isVisible()) return;
    await add.click();
  }

  await expect(
    item(index),
    `Slot ${group}.${index} nie odsłonił się mimo klikania „+".`,
  ).toBeVisible();
}

/**
 * Tematy nie są już jednym polem: osiem chipsów `topics.<i>` o wspólnej nazwie `topics`,
 * które backend skleja przez `getAll`. Chipsy ponad podaną listą czyścimy — przy edycji
 * trzymają jeszcze poprzednie tematy, a puste znaczy „skasuj".
 */
export async function fill_topics(page: Page, csv: string): Promise<void> {
  const chip = slots(page, "topics").field;
  // Slot 0 jest widoczny zawsze — czeka tu na skrypt także pusta lista tematów.
  await reveal_slot(page, "topics", 0);
  const topics = split_topics(csv);

  for (const [index, topic] of topics.entries()) {
    await reveal_slot(page, "topics", index);
    await chip(index).fill(topic);
  }

  for (let index = topics.length; index < MAX_EVENT_TOPICS; index += 1) {
    if (await chip(index).isVisible()) await chip(index).fill("");
  }
}

/** Wartość ukrytego slotu jest nadal wysyłana, więc asercja nie wymaga odsłaniania go. */
export async function expect_topics(page: Page, csv: string): Promise<void> {
  const topics = split_topics(csv);
  const chip = slots(page, "topics").field;

  for (let index = 0; index < MAX_EVENT_TOPICS; index += 1) {
    await expect(chip(index)).toHaveValue(topics[index] ?? "");
  }
}
