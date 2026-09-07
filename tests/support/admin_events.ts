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
} from "../../src/lib/events/form_mapping";
import { HARNESS_USER_AGENT, SEED_EVENT_IDS } from "../fixtures/events";
import { NAV_TIMEOUT } from "./admin";

/** Wspólne lokatory i kroki panelu wydarzeń — dzielone przez spece CRUD-a. */

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

const SEED_IDS: ReadonlySet<string> = new Set(Object.values(SEED_EVENT_IDS));

const FIELD_KIND: ReadonlyMap<EventFormField, FieldKind | undefined> = new Map(
  GROUPS.flatMap((group) =>
    group.fields.map(
      (spec) =>
        [spec.name, spec.kind] as [EventFormField, FieldKind | undefined],
    ),
  ),
);

export type EventFormValues = Partial<Record<EventFormField, string>>;

export function edit_path(id: string): string {
  return `${ADMIN_EVENTS_PATH}/${encodeURIComponent(id)}/edit`;
}

export function delete_path(id: string): string {
  return `${ADMIN_EVENTS_PATH}/${encodeURIComponent(id)}/delete`;
}

/**
 * Oba projekty mielą ten sam fixture, więc ich rekordy muszą mieć rozłączne
 * przestrzenie nazw — inaczej sprzątanie jednego zabierałoby wpisy drugiego.
 * Prefiksy są dobrane tak, żeby żaden nie był początkiem drugiego.
 */
function event_scope(): string {
  return test.info().project.use.javaScriptEnabled === false
    ? "e2e-nojs"
    : "e2e-js";
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
    "venue.streetAddress": "Ulica Testowa 7",
    "venue.postalCode": "40-001",
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

export function event_field(page: Page, field: EventFormField): Locator {
  return page.locator(`#${field_id(field)}`);
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
  const entries = Object.entries(values) as readonly [EventFormField, string][];

  for (const [field, value] of entries) {
    if (field === REGISTRATION_FIELD) {
      await registration_checkbox(page).setChecked(value !== "");
      continue;
    }
    if (FIELD_KIND.get(field) === "select") {
      await event_field(page, field).selectOption(value);
      continue;
    }
    await event_field(page, field).fill(value);
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
  field: EventFormField,
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
  const entries = Object.entries(values) as readonly [EventFormField, string][];

  for (const [field, value] of entries) {
    if (field === REGISTRATION_FIELD) {
      await expect(registration_checkbox(page)).toBeChecked({
        checked: value !== "",
      });
      continue;
    }
    await expect(event_field(page, field)).toHaveValue(value);
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

async function read_fixture_ids(): Promise<string[]> {
  const response = await fetch(`${EVENTS_API_BASE_URL}/events`, {
    headers: { "user-agent": HARNESS_USER_AGENT },
  });
  expect(
    response.ok,
    `Fixture wydarzeń odpowiedział ${response.status} na listę.`,
  ).toBe(true);

  const events = (await response.json()) as readonly { id: string }[];
  return events.map((event) => event.id);
}

async function drop_fixture_event(id: string): Promise<void> {
  await fetch(`${EVENTS_API_BASE_URL}/events/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      "x-api-key": E2E_EVENTS_API_KEY,
      "user-agent": HARNESS_USER_AGENT,
    },
  });
}

/**
 * Przywraca zestaw startowy fixture'a — bez tego test zależałby od tego, co
 * zostawił poprzedni (`reuseExistingServer` oddaje serwer po poprzednim biegu).
 *
 * `/__reset` czyści stan globalnie, a projekty `chromium` i `chromium-no-js`
 * chodzą na jednym fixture: reset w trakcie testu drugiego projektu skasowałby
 * rekord, na którym on stoi. Dlatego reset idzie tylko wtedy, gdy poza zestawem
 * startowym nie ma cudzych wpisów; inaczej sprzątamy sam swój prefiks.
 */
export async function reset_events(): Promise<void> {
  const scope = `${event_scope()}-`;
  const ids = await read_fixture_ids();
  const foreign = ids.filter(
    (id) => !SEED_IDS.has(id) && !id.startsWith(scope),
  );

  if (foreign.length === 0) {
    const response = await fetch(EVENTS_FIXTURE_RESET_URL, { method: "POST" });
    expect(
      response.ok,
      `Fixture wydarzeń odrzucił reset stanu (${response.status}).`,
    ).toBe(true);
    return;
  }

  for (const id of ids.filter((candidate) => candidate.startsWith(scope))) {
    await drop_fixture_event(id);
  }
}
