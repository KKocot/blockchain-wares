import { expect, test, type Locator, type Page } from "@playwright/test";
import { STATUS_THEME } from "../src/components/event-theme";
import { UNTITLED_EVENT_NAME } from "../src/components/events-data";
import { SEED_EVENTS, SEED_EVENT_IDS } from "./fixtures/events";
import { log_in } from "./support/admin";
import {
  edit_path,
  event_field,
  fill_event_form,
  NEW_EVENT_PATH,
} from "./support/admin_events";

/**
 * Panel wydarzeń jest serwerowy z jednym wyjątkiem: podgląd. Ten spec pilnuje obu stron
 * umowy — że podgląd nadąża za polami i że nadal nikt nie wysyła z niego żądania.
 *
 * Żaden test tutaj nie zapisuje: stan fixture'a należy do `admin_events.spec.ts`, a oba
 * pliki chodzą równolegle na jednym serwerze — reset stąd zabrałby tamtemu rekord.
 */

/** Odległa data: status ma być „upcoming” niezależnie od dnia biegu testu. */
const FUTURE_DAY = "2038-06-16";
const FUTURE_MONTH = "Jun";

const PREVIEW_NAME = "Podgląd na żywo";

const BANNER_SKIPPED = /Wydarzenie bez daty nie trafia do banera/;

function preview(page: Page): Locator {
  return page.locator("[data-event-preview]");
}

function stage(page: Page): Locator {
  return page.locator("[data-preview-stage]");
}

function variant_button(page: Page, label: string): Locator {
  return preview(page).getByRole("button", { name: label, exact: true });
}

/**
 * Przełącznik wariantów jest w DOM już po renderze serwera, ale klika się dopiero po
 * hydracji — bez tego oczekiwania test kliknąłby w martwy przycisk.
 */
async function await_live_preview(page: Page): Promise<void> {
  await expect(preview(page)).toHaveAttribute("data-event-preview", "live");
}

async function open_new_form(page: Page): Promise<void> {
  await log_in(page);
  await page.goto(NEW_EVENT_PATH);
  await await_live_preview(page);
}

test.describe("Panel wydarzeń — podgląd", () => {
  test("odświeża się przy pisaniu nazwy i daty", async ({ page }) => {
    await open_new_form(page);

    // Pusty formularz to szkic bez nazwy i bez terminu — podgląd mówi to wprost.
    await expect(stage(page)).toContainText(UNTITLED_EVENT_NAME);
    await expect(stage(page)).toContainText(STATUS_THEME.undated.label);

    await event_field(page, "name").fill(PREVIEW_NAME);
    await expect(stage(page)).toContainText(PREVIEW_NAME);

    await event_field(page, "startDate").fill(FUTURE_DAY);
    await expect(stage(page)).toContainText(FUTURE_MONTH);
    await expect(stage(page)).toContainText("2038");
    await expect(stage(page)).toContainText(STATUS_THEME.upcoming.label);
  });

  test("pokazuje wszystkie trzy warianty prezentacji", async ({ page }) => {
    await open_new_form(page);
    await fill_event_form(page, {
      name: PREVIEW_NAME,
      city: "Katowice",
      startDate: FUTURE_DAY,
      endDate: FUTURE_DAY,
      description: "Opis widoczny wyłącznie na stronie wydarzenia.",
    });

    await expect(stage(page)).toHaveAttribute("data-preview-stage", "card");

    await variant_button(page, "Baner").click();
    await expect(stage(page)).toHaveAttribute("data-preview-stage", "mini");
    // Baner mówi, dokąd jedziemy — nie powtarza karty.
    await expect(stage(page)).toContainText(`We are going to ${PREVIEW_NAME}`);
    await expect(stage(page)).toContainText("Katowice");

    await variant_button(page, "Strona").click();
    await expect(stage(page)).toHaveAttribute("data-preview-stage", "detail");
    await expect(stage(page)).toContainText(PREVIEW_NAME);
    await expect(stage(page)).toContainText(
      "Opis widoczny wyłącznie na stronie wydarzenia.",
    );

    await variant_button(page, "Karta").click();
    await expect(stage(page)).toHaveAttribute("data-preview-stage", "card");
  });

  test("wpis bez daty nie ma wariantu w banerze i mówi dlaczego", async ({
    page,
  }) => {
    await open_new_form(page);
    await event_field(page, "name").fill(PREVIEW_NAME);

    await variant_button(page, "Baner").click();
    await expect(preview(page)).toContainText(BANNER_SKIPPED);
    await expect(stage(page)).toBeEmpty();

    await event_field(page, "startDate").fill(FUTURE_DAY);
    await expect(preview(page)).not.toContainText(BANNER_SKIPPED);
    await expect(stage(page)).toContainText(`We are going to ${PREVIEW_NAME}`);
  });

  test("prefill edycji wchodzi do podglądu przed pierwszym klawiszem", async ({
    page,
  }) => {
    const seed = SEED_EVENTS.find(
      (event) => event.id === SEED_EVENT_IDS.upcoming_conference,
    );
    expect(seed, "Brak zestawu startowego fixture'a wydarzeń.").toBeDefined();

    await log_in(page);
    await page.goto(edit_path(SEED_EVENT_IDS.upcoming_conference));
    await await_live_preview(page);

    await expect(stage(page)).toContainText(seed?.name ?? "");

    // Sam podgląd, bez zapisu — rekord zostaje taki, jaki był. Miasto sprawdzamy
    // razem z krajem: nazwa wydarzenia też zawiera miasto i „zniknięcie” byłoby pozorne.
    const place = `${seed?.city ?? ""}, ${seed?.country ?? ""}`;
    await expect(stage(page)).toContainText(place);

    await event_field(page, "city").fill("Gliwice");
    await expect(stage(page)).toContainText(`Gliwice, ${seed?.country ?? ""}`);
    await expect(stage(page)).not.toContainText(place);
  });

  // Odstępstwo od serwerowego panelu jest wąskie: podgląd liczy się z pól formularza
  // w przeglądarce i nie ma prawa niczego pobrać.
  test("podgląd nie wysyła żadnego żądania XHR ani fetch", async ({ page }) => {
    await page.route(/dev-toolbar/, (route) => route.abort());

    const dynamic: string[] = [];
    page.on("request", (request) => {
      const type = request.resourceType();
      if (type === "xhr" || type === "fetch") {
        dynamic.push(`${type} ${request.method()} ${request.url()}`);
      }
    });

    await open_new_form(page);
    await fill_event_form(page, {
      name: PREVIEW_NAME,
      startDate: FUTURE_DAY,
      topics: "Podgląd, Panel",
    });

    for (const label of ["Baner", "Strona", "Karta"]) {
      await variant_button(page, label).click();
    }

    await expect(stage(page)).toContainText(PREVIEW_NAME);
    await page.waitForLoadState("networkidle");

    expect(dynamic).toEqual([]);
  });
});
