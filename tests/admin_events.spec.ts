import { expect, test } from "@playwright/test";
import { NO_JS_TAG } from "../playwright.config";
import { SEED_EVENT_IDS } from "./fixtures/events";
import {
  has_session_cookie,
  log_in,
  LOGIN_PATH,
  navigate,
} from "./support/admin";
import {
  ADMIN_EVENTS_PATH,
  create_event_via_panel,
  delete_path,
  DELETE_CONFIRM_FIELD,
  DELETE_CONFIRM_VALUE,
  drop_fixture_event,
  edit_path,
  event_field,
  event_row,
  expect_form_values,
  expect_notice,
  fill_event_form,
  NEW_EVENT_PATH,
  read_fixture_event,
  reset_events,
  sample_event_values,
  scoped_event_id,
  submit_button,
  submit_form,
} from "./support/admin_events";

/**
 * Panel wydarzeń zapisuje, więc testy dzielą jeden stan fixture'a. `fullyParallel`
 * puszczałby je równocześnie na tym samym rekordzie — plik chodzi po kolei.
 */
test.describe.configure({ mode: "default" });

const DELETE_BUTTON = "Usuń wydarzenie";
const MISSING_HEADING = "Nie ma takiego wydarzenia";

/** Identyfikator nadany przez backend, gdy formularz go nie podał: `event-` + 8 znaków. */
const GENERATED_ID = /^event-[a-z2-9]{8}$/;

/**
 * Rekordy, których identyfikator wymyślił backend — nie mają prefiksu projektu, więc
 * `reset_events()` ich nie sprząta i przeżyłyby bieg, blokując reset kolejnemu.
 */
const generated: string[] = [];

test.beforeEach(async () => {
  await reset_events();
});

test.afterEach(async () => {
  for (const id of generated.splice(0)) {
    await drop_fixture_event(id);
  }
});

test.describe("Panel wydarzeń — pełna ścieżka", () => {
  test("dodanie, edycja i usunięcie przechodzą przez listę z potwierdzeniem", async ({
    page,
  }) => {
    test.slow();
    const id = scoped_event_id("crud");
    const values = sample_event_values(id);
    const edited = `${values.name} po edycji`;

    await log_in(page);
    await page.goto(ADMIN_EVENTS_PATH);
    await expect(event_row(page, id)).toHaveCount(0);

    await navigate(page, () =>
      page.getByRole("link", { name: "Dodaj wydarzenie" }).click(),
    );
    await expect(page).toHaveURL(NEW_EVENT_PATH);

    await fill_event_form(page, values);
    expect(
      (await submit_form(page, submit_button(page, "create"))).status(),
    ).toBe(303);

    await expect_notice(page, "created", id);
    await expect(event_row(page, id)).toContainText(values.name);
    await expect(event_row(page, id)).toContainText(values["venue.name"]);
    await expect(event_row(page, id)).toContainText(values.startDate);

    await navigate(page, () =>
      event_row(page, id).getByRole("link", { name: "Edytuj" }).click(),
    );
    await expect(page).toHaveURL(edit_path(id));
    // Identyfikator buduje adres publiczny, więc edycja nie może go ruszyć.
    await expect(event_field(page, "id")).toHaveAttribute("readonly", "");
    // Zapisany rekord wraca do formularza polem w pole — inaczej edycja gubiłaby dane.
    await expect_form_values(page, values);

    await fill_event_form(page, { name: edited, city: "Gliwice" });
    expect(
      (await submit_form(page, submit_button(page, "edit"))).status(),
    ).toBe(303);

    await expect_notice(page, "updated", id);
    await expect(event_row(page, id)).toContainText(edited);
    await expect(event_row(page, id)).toContainText("Gliwice");

    await navigate(page, () =>
      event_row(page, id).getByRole("link", { name: "Usuń" }).click(),
    );
    await expect(page).toHaveURL(delete_path(id));
    await expect(page.getByRole("heading", { name: edited })).toBeVisible();

    expect(
      (
        await submit_form(
          page,
          page.getByRole("button", { name: DELETE_BUTTON }),
        )
      ).status(),
    ).toBe(303);

    await expect_notice(page, "deleted", id);
    await expect(event_row(page, id)).toHaveCount(0);
    expect(await read_fixture_event(id)).toBeNull();
  });

  test("puste pole opcjonalne kasuje zapisaną wartość, a nie zostawia ją bez zmian", async ({
    page,
  }) => {
    test.slow();
    const id = scoped_event_id("kasowanie");
    const values = sample_event_values(id);

    await log_in(page);
    await create_event_via_panel(page, values);
    await expect(event_row(page, id)).toContainText(values["venue.name"]);

    await page.goto(edit_path(id));
    await fill_event_form(page, {
      "venue.name": "",
      "venue.room": "",
      "venue.streetAddress": "",
      "venue.postalCode": "",
      "venue.url": "",
      url: "",
      // Pola, które kiedyś blokowały zapis — pusto ma je kasować, nie odrzucać.
      city: "",
      description: "",
    });
    expect(
      (await submit_form(page, submit_button(page, "edit"))).status(),
    ).toBe(303);

    await expect_notice(page, "updated", id);
    await expect(event_row(page, id)).not.toContainText(values["venue.name"]);

    await page.goto(edit_path(id));
    for (const field of [
      "venue.name",
      "venue.room",
      "venue.streetAddress",
      "venue.postalCode",
      "venue.url",
      "url",
      "city",
      "description",
    ] as const) {
      await expect(event_field(page, field)).toHaveValue("");
    }

    // Widok mógłby milczeć o wartości, która wciąż siedzi w rekordzie.
    const stored = await read_fixture_event(id);
    expect(stored).not.toBeNull();
    expect(stored?.venue ?? null).toBeNull();
    expect(stored?.url ?? null).toBeNull();
    expect(stored?.city ?? null).toBeNull();
    expect(stored?.description ?? null).toBeNull();
  });

  test("wyczyszczona sala znika, a reszta obiektu zostaje na miejscu", async ({
    page,
  }) => {
    test.slow();
    const id = scoped_event_id("kasowanie-sali");
    const values = sample_event_values(id);

    await log_in(page);
    await create_event_via_panel(page, values);

    await page.goto(edit_path(id));
    await fill_event_form(page, { "venue.room": "" });
    expect(
      (await submit_form(page, submit_button(page, "edit"))).status(),
    ).toBe(303);
    await expect_notice(page, "updated", id);

    // Grupa jedzie do API w całości i podmienia cały subdokument, więc puste pole
    // kasuje samo siebie — i nie ma prawa zabrać ze sobą sąsiadów z tej samej grupy.
    expect((await read_fixture_event(id))?.venue).toEqual({
      name: values["venue.name"],
      streetAddress: values["venue.streetAddress"],
      postalCode: values["venue.postalCode"],
      url: values["venue.url"],
    });

    await page.goto(edit_path(id));
    await expect(event_field(page, "venue.room")).toHaveValue("");
    await expect(event_field(page, "venue.name")).toHaveValue(
      values["venue.name"],
    );
  });
});

test.describe("Panel wydarzeń — szkic", () => {
  test("pusty formularz zapisuje wydarzenie, a identyfikator składa backend", async ({
    page,
  }) => {
    await log_in(page);
    await page.goto(NEW_EVENT_PATH);

    expect(
      (await submit_form(page, submit_button(page, "create"))).status(),
      "Pusty formularz nie skończył się przekierowaniem na listę.",
    ).toBe(303);

    const created = new URL(page.url()).searchParams.get("event") ?? "";
    generated.push(created);
    expect(created).toMatch(GENERATED_ID);

    await expect_notice(page, "created", created);
    await expect(event_row(page, created)).toHaveCount(1);
    // Puste pole ma nie dojechać do API jako pusty string ani jako `null`.
    expect(await read_fixture_event(created)).toEqual({ id: created });
  });

  test("sama nazwa wystarczy: identyfikator powstaje z jej slugu", async ({
    page,
  }) => {
    const expected = scoped_event_id("szkic-z-nazwy");
    const name = expected.replaceAll("-", " ");

    await log_in(page);
    await page.goto(NEW_EVENT_PATH);
    await fill_event_form(page, { name });

    expect(
      (await submit_form(page, submit_button(page, "create"))).status(),
    ).toBe(303);

    await expect_notice(page, "created", expected);
    await expect(event_row(page, expected)).toContainText(name);
    expect(await read_fixture_event(expected)).toEqual({ id: expected, name });
  });
});

test.describe("Panel wydarzeń — usuwanie", () => {
  test("wymaga potwierdzenia: strona mówi co zniknie, a POST bez zgody nic nie rusza", async ({
    page,
  }) => {
    test.slow();
    const id = scoped_event_id("potwierdzenie");
    const values = sample_event_values(id);

    await log_in(page);
    await create_event_via_panel(page, values);

    const confirmation = await page.goto(delete_path(id));
    expect(confirmation?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: values.name }),
    ).toBeVisible();

    const details = page.locator("dl");
    await expect(details).toContainText(id);
    await expect(details).toContainText(values["venue.name"]);
    await expect(details).toContainText(values["venue.room"]);
    await expect(details).toContainText(values.startDate);
    await expect(page.locator(`a[href="/markets/${id}"]`)).toBeVisible();

    // Zgoda jedzie jako name/value przycisku: ukryte pole robiłoby ją z samego
    // otwarcia strony, a wtedy potwierdzenie niczego by nie potwierdzało.
    const confirm = page.getByRole("button", { name: DELETE_BUTTON });
    await expect(confirm).toHaveAttribute("name", DELETE_CONFIRM_FIELD);
    await expect(confirm).toHaveAttribute("value", DELETE_CONFIRM_VALUE);
    expect(
      await page.locator(`input[name="${DELETE_CONFIRM_FIELD}"]`).count(),
    ).toBe(0);

    const forged = await page.request.post(delete_path(id), {
      form: { [DELETE_CONFIRM_FIELD]: "" },
    });
    expect(forged.status()).toBe(400);
    expect(await forged.text()).toContain("Usunięcie nie zostało potwierdzone");

    await page.goto(ADMIN_EVENTS_PATH);
    await expect(event_row(page, id)).toHaveCount(1);

    await page.goto(delete_path(id));
    expect(
      (
        await submit_form(
          page,
          page.getByRole("button", { name: DELETE_BUTTON }),
        )
      ).status(),
    ).toBe(303);

    await expect_notice(page, "deleted", id);
    await expect(event_row(page, id)).toHaveCount(0);
  });

  test("nieznany identyfikator na edycji i usuwaniu zwraca 404", async ({
    page,
  }) => {
    await log_in(page);
    const missing = scoped_event_id("nie-ma-takiego");

    for (const path of [edit_path(missing), delete_path(missing)]) {
      const response = await page.goto(path);
      expect(response?.status(), `Trasa ${path} nie zwróciła 404.`).toBe(404);
      await expect(
        page.getByRole("heading", { name: MISSING_HEADING }),
      ).toBeVisible();
    }
  });
});

test.describe("Panel wydarzeń — bezpieczeństwo", () => {
  test("bez sesji każda trasa wydarzeń przekierowuje na logowanie", async ({
    page,
  }) => {
    const seed = SEED_EVENT_IDS.upcoming_workshop;

    for (const path of [
      ADMIN_EVENTS_PATH,
      NEW_EVENT_PATH,
      edit_path(seed),
      delete_path(seed),
    ]) {
      await page.goto(path);

      await expect(page).toHaveURL(
        `${LOGIN_PATH}?redirect=${encodeURIComponent(path)}`,
      );
      expect(await has_session_cookie(page)).toBe(false);
    }
  });

  // Wymóg właściciela: panel jest czysto serwerowy. Pierwszy fetch z frontu byłby
  // regresją, którą najłatwiej wprowadzić przypadkiem przy kolejnym refaktorze.
  test("CRUD wydarzeń nie wysyła z frontu żadnego żądania XHR ani fetch", async ({
    page,
  }) => {
    test.slow();
    // Pasek narzędziowy Astro istnieje tylko w devie i sam pobiera obrazki przez
    // fetch() — blokujemy go, żeby asercja mogła mówić o zerze bez wyjątków.
    await page.route(/dev-toolbar/, (route) => route.abort());

    const dynamic: string[] = [];
    page.on("request", (request) => {
      const type = request.resourceType();
      if (type === "xhr" || type === "fetch") {
        dynamic.push(`${type} ${request.method()} ${request.url()}`);
      }
    });

    const id = scoped_event_id("bez-fetcha");
    const values = sample_event_values(id);

    await log_in(page);
    await create_event_via_panel(page, values);

    await page.goto(edit_path(id));
    await fill_event_form(page, { city: "Gliwice" });
    await submit_form(page, submit_button(page, "edit"));

    await page.goto(delete_path(id));
    await submit_form(page, page.getByRole("button", { name: DELETE_BUTTON }));
    await expect(event_row(page, id)).toHaveCount(0);
    await page.waitForLoadState("networkidle");

    expect(dynamic).toEqual([]);
  });
});

test.describe("Panel wydarzeń — bez JavaScriptu", () => {
  test(
    "dodanie, edycja i usunięcie działają bez JS",
    { tag: NO_JS_TAG },
    async ({ page }) => {
      test.slow();
      const id = scoped_event_id("crud");
      const values = sample_event_values(id);

      await log_in(page);

      // Podgląd wydarzenia to jedyna wyspa panelu i jedyna rzecz, którą traci się bez
      // JavaScriptu — <noscript> chowa go, żeby nie zostawiać martwego przełącznika.
      await page.goto(NEW_EVENT_PATH);
      await expect(page.locator("[data-event-preview]")).toBeHidden();

      await create_event_via_panel(page, values);
      await expect_notice(page, "created", id);
      await expect(event_row(page, id)).toContainText(values.name);

      await navigate(page, () =>
        event_row(page, id).getByRole("link", { name: "Edytuj" }).click(),
      );
      await expect(event_field(page, "id")).toHaveValue(id);
      await fill_event_form(page, { city: "Gliwice" });
      expect(
        (await submit_form(page, submit_button(page, "edit"))).status(),
      ).toBe(303);

      await expect_notice(page, "updated", id);
      await expect(event_row(page, id)).toContainText("Gliwice");

      await navigate(page, () =>
        event_row(page, id).getByRole("link", { name: "Usuń" }).click(),
      );
      expect(
        (
          await submit_form(
            page,
            page.getByRole("button", { name: DELETE_BUTTON }),
          )
        ).status(),
      ).toBe(303);

      await expect_notice(page, "deleted", id);
      await expect(event_row(page, id)).toHaveCount(0);
      expect(await read_fixture_event(id)).toBeNull();
    },
  );
});
