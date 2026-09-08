import { createHash } from "node:crypto";
import { basename } from "node:path";
import {
  expect,
  test,
  type Locator,
  type Page,
  type Response as PageResponse,
} from "@playwright/test";
import {
  E2E_EVENTS_API_KEY,
  EVENTS_API_BASE_URL,
  EVENTS_FIXTURE_RESET_URL,
} from "../../playwright.config";
import {
  CODE_TEXT,
  field_id,
  GROUPS,
  REGISTRATION_FIELD,
  type FieldKind,
} from "../../src/components/admin/event_form_fields";
import { ADVANCED_GROUPS } from "../../src/components/admin/event_form_groups";
import { to_iso_day } from "../../src/components/events-data";
import {
  ADMIN_EVENTS_PATH,
  DELETE_CONFIRM_FIELD,
  DELETE_CONFIRM_VALUE,
  type EventActionKind,
} from "../../src/lib/events/admin_actions";
import type {
  EventFormErrorCode,
  EventFormErrorField,
  EventFormField,
  SlotFormField,
} from "../../src/lib/events/form_mapping";
import { HARNESS_USER_AGENT } from "../fixtures/events";
import { NAV_TIMEOUT } from "./admin";
import {
  expect_topics,
  fill_topics,
  parse_slot,
  reveal_slot,
} from "./admin_event_slots";

/**
 * Wspólne lokatory i kroki panelu wydarzeń — dzielone przez spece CRUD-a. Grupy
 * powtarzalne (wyróżniki, fakty, tematy, linki) mają własny moduł `admin_event_slots.ts`;
 * ten woła po nie przy wypełnianiu formularza.
 */

export { ADMIN_EVENTS_PATH, DELETE_CONFIRM_FIELD, DELETE_CONFIRM_VALUE };

export const NEW_EVENT_PATH = `${ADMIN_EVENTS_PATH}/new`;

/** Wartość zaznaczonego checkboxa; w `EventFormValues` puste znaczy „odznacz”. */
const CHECKED = "on";

/** Daleka przyszłość: baner promuje dwa najbliższe wpisy i te muszą zostać seedowe. */
const FUTURE_DAY_OFFSET = 240;

const SUBMIT_LABEL = {
  create: "Dodaj wydarzenie",
  edit: "Zapisz zmiany",
} as const;

const NOTICE_TEXT: Record<EventActionKind, string> = {
  created: "Wydarzenie zostało dodane.",
  updated: "Wydarzenie zostało zaktualizowane.",
  deleted: "Wydarzenie zostało usunięte.",
};

const FIELD_KIND: ReadonlyMap<EventFormField, FieldKind | undefined> = new Map(
  GROUPS.flatMap((group) =>
    group.fields.map(
      (spec) =>
        [spec.name, spec.kind] as [EventFormField, FieldKind | undefined],
    ),
  ),
);

/**
 * Katalog `EventFormField` plus sloty grup powtarzalnych (`badges.0`, `facts.1.icon`),
 * które stoją poza nim. `topics` zostaje jednym wpisem z listą po przecinku — spec mówi
 * o temacie, nie o numerze chipsa, a rozbicie na osiem `topics.<i>` robi helper.
 */
export type EventFormValues = Partial<
  Record<EventFormField | SlotFormField, string>
>;

/** Pola schowane w `<details data-advanced>` — Playwright ich nie widzi przed otwarciem. */
const ADVANCED_FIELDS: ReadonlySet<string> = new Set<string>([
  ...ADVANCED_GROUPS.flatMap((group) =>
    group.fields.map((field) => field.name),
  ),
  REGISTRATION_FIELD,
]);

function is_select(field: string): boolean {
  return (
    FIELD_KIND.get(field as EventFormField) === "select" ||
    field.endsWith(".icon")
  );
}

export function edit_path(id: string): string {
  return `${ADMIN_EVENTS_PATH}/${encodeURIComponent(id)}/edit`;
}

export function delete_path(id: string): string {
  return `${ADMIN_EVENTS_PATH}/${encodeURIComponent(id)}/delete`;
}

/**
 * Oba projekty i każdy plik speca mielą ten sam fixture, a workery chodzą równolegle:
 * rekordy muszą mieć rozłączne przestrzenie nazw, inaczej sprzątanie jednego zabiera
 * wpisy drugiego. Token pliku jest skrótem stałej długości — dwa różne nigdy nie są
 * swoim prefiksem, w odróżnieniu od samych nazw plików (`admin_events` jest początkiem
 * `admin_events_rejected`), a `startsWith` decyduje, co reset zdejmuje.
 */
function event_scope(): string {
  const info = test.info();
  const project =
    info.project.use.javaScriptEnabled === false ? "e2e-nojs" : "e2e-js";
  const file = createHash("sha1")
    .update(basename(info.file))
    .digest("hex")
    .slice(0, 6);

  return `${project}-${file}`;
}

export function scoped_event_id(suffix: string): string {
  return `${event_scope()}-${suffix}`;
}

function iso_day_from_now(days: number): string {
  const day = new Date();
  day.setDate(day.getDate() + days);

  return to_iso_day(day);
}

/**
 * Komplet pól formularza — każde wypełnione, żeby powrót po błędzie miał co
 * odtwarzać, a edycja co skasować.
 */
export function sample_event_values(
  id: string,
): Record<EventFormField, string> {
  return {
    id,
    name: `Panel CRUD ${id}`,
    shortName: "Panel CRUD",
    edition: "PC1",
    kind: "workshop",
    utcOffset: "+02:00",
    city: "Katowice",
    country: "Poland",
    countryCode: "PL",
    startDate: iso_day_from_now(FUTURE_DAY_OFFSET),
    endDate: iso_day_from_now(FUTURE_DAY_OFFSET),
    "schedule.startTime": "10:00",
    "schedule.endTime": "16:00",
    "schedule.utcOffset": "+02:00",
    "schedule.timeZoneLabel": "CEST",
    "venue.name": "Panel CRUD Hall",
    "venue.room": "Meeting Room 0.5+0.6, ground floor",
    "venue.streetAddress": "Ulica Testowa 7",
    "venue.postalCode": "40-001",
    "venue.url": "https://example.invalid/panel-crud-hall",
    "admission.price": "0",
    "admission.priceCurrency": "PLN",
    "admission.requiresRegistration": CHECKED,
    "admission.validFrom": iso_day_from_now(0),
    url: `https://example.invalid/${id}`,
    image: "/assets/img/og-image.png",
    "organizer.name": "BlockchainWares",
    "organizer.url": "https://blockchainwares.com.pl",
    description: "Wydarzenie założone przez test E2E panelu wydarzeń.",
    topics: "Panel CRUD, Test E2E",
  };
}

export function event_field(
  page: Page,
  field: EventFormField | SlotFormField,
): Locator {
  return page.locator(`#${field_id(field)}`);
}

export function advanced_section(page: Page): Locator {
  return page.locator("details[data-advanced]");
}

/** `<details>` otwiera natywny klik w `<summary>` — tak samo w projekcie bez JavaScriptu. */
export async function open_advanced(page: Page): Promise<void> {
  const details = advanced_section(page);
  if ((await details.getAttribute("open")) !== null) return;

  await details.locator("summary").click();
  await expect(details).toHaveAttribute("open", "");
}

export function registration_checkbox(page: Page): Locator {
  return event_field(page, REGISTRATION_FIELD);
}

function field_error(page: Page, field: EventFormErrorField): Locator {
  return page.locator(`#${field_id(field)}-error`);
}

/** Podsumowanie odrzuconego zapisu; na stronach formularza jest jedynym alertem. */
export function error_summary(page: Page): Locator {
  return page.getByRole("alert");
}

function event_notice(page: Page): Locator {
  return page.getByRole("status");
}

/** Wiersz adresowany linkiem akcji, nie tekstem — nazwy wydarzeń bywają podobne. */
export function event_row(page: Page, id: string): Locator {
  return page
    .locator("tbody tr")
    .filter({ has: page.locator(`a[href="${edit_path(id)}"]`) });
}

export function submit_button(
  page: Page,
  mode: keyof typeof SUBMIT_LABEL,
): Locator {
  return page.getByRole("button", { name: SUBMIT_LABEL[mode] });
}

export async function fill_event_form(
  page: Page,
  values: EventFormValues,
): Promise<void> {
  const entries = Object.entries(values) as readonly [string, string][];

  // Pola „Zaawansowanych" są w DOM, ale schowane — wypełnia się je dopiero po otwarciu.
  if (entries.some(([field]) => ADVANCED_FIELDS.has(field))) {
    await open_advanced(page);
  }

  for (const [field, value] of entries) {
    if (field === REGISTRATION_FIELD) {
      await registration_checkbox(page).setChecked(value !== "");
      continue;
    }
    if (field === "topics") {
      await fill_topics(page, value);
      continue;
    }

    const slot = parse_slot(field);
    if (slot !== null) await reveal_slot(page, slot.group, slot.index);

    const control = page.locator(`#${field_id(field)}`);
    if (is_select(field)) await control.selectOption(value);
    else await control.fill(value);
  }
}

/**
 * Formularze panelu są natywne, więc wysłanie to pełna nawigacja. Czekamy na
 * dokument, a nie na sam klik — inaczej asercja czytałaby jeszcze poprzednią stronę.
 */
export async function submit_form(
  page: Page,
  control: Locator,
): Promise<PageResponse> {
  const [response] = await Promise.all([
    page.waitForResponse(
      (candidate) =>
        candidate.request().isNavigationRequest() &&
        candidate.request().method() === "POST",
      { timeout: NAV_TIMEOUT },
    ),
    page.waitForEvent("domcontentloaded", { timeout: NAV_TIMEOUT }),
    control.click(),
  ]);

  return response;
}

/** Wydarzenie, na którym stoi dalsza część testu — zakładane tą samą drogą co ręcznie. */
export async function create_event_via_panel(
  page: Page,
  values: EventFormValues,
): Promise<void> {
  await page.goto(NEW_EVENT_PATH);
  await fill_event_form(page, values);

  const response = await submit_form(page, submit_button(page, "create"));
  expect(
    response.status(),
    "Zapis nowego wydarzenia nie skończył się przekierowaniem na listę.",
  ).toBe(303);
}

export async function expect_notice(
  page: Page,
  kind: EventActionKind,
  id: string,
): Promise<void> {
  await expect(page).toHaveURL(`${ADMIN_EVENTS_PATH}?done=${kind}&event=${id}`);
  await expect(event_notice(page)).toContainText(NOTICE_TEXT[kind]);
  await expect(event_notice(page)).toContainText(id);
}

/** Komunikat ma stać przy swoim inpucie i być z nim powiązany dla czytnika ekranu. */
export async function expect_field_error(
  page: Page,
  field: EventFormField | SlotFormField,
  code: EventFormErrorCode,
): Promise<void> {
  await expect(event_field(page, field)).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(field_error(page, field)).toHaveText(CODE_TEXT[code]);
  await expect(event_field(page, field)).toHaveAttribute(
    "aria-describedby",
    new RegExp(`(?:^|\\s)${field_id(field)}-error(?:\\s|$)`),
  );
}

export async function expect_form_values(
  page: Page,
  values: EventFormValues,
): Promise<void> {
  const entries = Object.entries(values) as readonly [string, string][];

  for (const [field, value] of entries) {
    if (field === REGISTRATION_FIELD) {
      await expect(registration_checkbox(page)).toBeChecked({
        checked: value !== "",
      });
      continue;
    }
    if (field === "topics") {
      await expect_topics(page, value);
      continue;
    }
    await expect(page.locator(`#${field_id(field)}`)).toHaveValue(value);
  }
}

/** Rekord prosto z fixture'a: dowód, że pole zniknęło z danych, a nie z widoku. */
export async function read_fixture_event(
  id: string,
): Promise<Record<string, unknown> | null> {
  const response = await fetch(
    `${EVENTS_API_BASE_URL}/events/${encodeURIComponent(id)}`,
    { headers: { "user-agent": HARNESS_USER_AGENT } },
  );
  if (response.status === 404) return null;

  expect(
    response.ok,
    `Fixture wydarzeń odpowiedział ${response.status} na odczyt "${id}".`,
  ).toBe(true);

  return (await response.json()) as Record<string, unknown>;
}

/** Sprzątanie po rekordzie, którego identyfikator nadał backend — poza prefiksem pliku. */
export async function drop_fixture_event(id: string): Promise<void> {
  await fetch(`${EVENTS_API_BASE_URL}/events/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      "x-api-key": E2E_EVENTS_API_KEY,
      "user-agent": HARNESS_USER_AGENT,
    },
  });
}

/**
 * Zdejmuje rekordy tego pliku i przywraca brakujące wpisy zestawu startowego — bez
 * tego test zależałby od tego, co zostawił poprzedni (`reuseExistingServer` oddaje
 * serwer po poprzednim biegu).
 *
 * Reset jest ograniczony do własnej przestrzeni nazw, bo oba projekty i wszystkie
 * mutujące spece chodzą równolegle na jednym fixturze: globalny reset kasowałby
 * rekord, na którym stoi test w sąsiednim workerze.
 */
export async function reset_events(): Promise<void> {
  const scope = encodeURIComponent(`${event_scope()}-`);
  const response = await fetch(`${EVENTS_FIXTURE_RESET_URL}?scope=${scope}`, {
    method: "POST",
  });

  expect(
    response.ok,
    `Fixture wydarzeń odrzucił reset stanu (${response.status}).`,
  ).toBe(true);
}
