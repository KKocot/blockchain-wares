import { expect, test } from "@playwright/test";
import { field_id } from "../src/components/admin/event_form_fields";
import { SEED_EVENT_IDS } from "./fixtures/events";
import { log_in } from "./support/admin";
import {
  create_event_via_panel,
  error_summary,
  event_field,
  event_row,
  expect_field_error,
  expect_form_values,
  fill_event_form,
  NEW_EVENT_PATH,
  read_fixture_event,
  registration_checkbox,
  reset_events,
  sample_event_values,
  scoped_event_id,
  submit_button,
  submit_form,
} from "./support/admin_events";

/**
 * Zapisy odrzucone przez API i przez walidację formularza. Osobny plik od ścieżki
 * happy path: obie grupy dzielą jeden stan fixture'a, więc każda chodzi po kolei.
 */
test.describe.configure({ mode: "default" });

test.beforeEach(async () => {
  await reset_events();
});

test.describe("Panel wydarzeń — odrzucony zapis", () => {
  test("oddaje wpisane wartości, łącznie z checkboxem i selectem", async ({
    page,
  }) => {
    const values = {
      ...sample_event_values(scoped_event_id("duplikat")),
      id: SEED_EVENT_IDS.ongoing_conference,
    };

    await log_in(page);
    await page.goto(NEW_EVENT_PATH);
    await fill_event_form(page, values);

    const rejected = await submit_form(page, submit_button(page, "create"));
    expect(rejected.status()).toBe(409);
    await expect(page).toHaveURL(NEW_EVENT_PATH);
    await expect(error_summary(page)).toContainText(
      "Wydarzenie o tym identyfikatorze już istnieje.",
    );

    await expect_field_error(page, "id", "invalid");
    // Sedno panelu bez JS-a: odtworzyć formularz może tylko serwer.
    await expect_form_values(page, values);
    await expect(event_field(page, "name")).toHaveAttribute(
      "aria-invalid",
      "false",
    );
  });

  test("stawia komunikat przy właściwym polu, nie tylko w podsumowaniu", async ({
    page,
  }) => {
    const values = {
      ...sample_event_values(scoped_event_id("walidacja")),
      // Żadne pole nie ma atrybutu `required` ani `pattern`, więc odrzucenie musi
      // przyjść z serwera i wskazać input. Puste znaczy „bez wartości", ale wpisany
      // z błędem format zostaje błędem — także ten, który parser cicho by zdjął.
      "venue.name": "",
      countryCode: "pl",
      image: "assets/img/og-image.png",
    };

    await log_in(page);
    await page.goto(NEW_EVENT_PATH);
    await fill_event_form(page, values);

    const rejected = await submit_form(page, submit_button(page, "create"));
    expect(rejected.status()).toBe(422);

    await expect_field_error(page, "countryCode", "invalid");
    await expect_field_error(page, "image", "invalid");
    // Puste pole rozpoczętej grupy nie jest już błędem: obiekt bez nazwy zostaje obiektem.
    await expect(event_field(page, "venue.name")).toHaveAttribute(
      "aria-invalid",
      "false",
    );
    await expect(
      error_summary(page).getByRole("link", { name: "Kod kraju" }),
    ).toHaveAttribute("href", `#${field_id("countryCode")}`);
    await expect(
      error_summary(page).getByRole("link", { name: "Obraz" }),
    ).toHaveAttribute("href", `#${field_id("image")}`);

    await expect(event_field(page, "description")).toHaveValue(
      values.description,
    );
    await expect(registration_checkbox(page)).toBeChecked();
    expect(await read_fixture_event(values.id)).toBeNull();
  });

  test("adres obiektu zgodny ze wzorcem, ale nie do zbudowania, jest odrzucany", async ({
    page,
  }) => {
    const id = scoped_event_id("adres-obiektu");

    await log_in(page);
    // Pole `type="url"` nie wypuści takiego adresu z formularza, więc żądanie idzie
    // wprost: guard broni zapisu przed klientem spoza panelu, nie samego formularza.
    const rejected = await page.request.post(NEW_EVENT_PATH, {
      form: { id, "venue.url": "http://[" },
    });

    expect(rejected.status()).toBe(422);
    expect(await rejected.text()).toContain(`${field_id("venue.url")}-error`);
    expect(await read_fixture_event(id)).toBeNull();
  });

  test("grupa wypełniona w połowie zapisuje się tak, jak ją wpisano", async ({
    page,
  }) => {
    const id = scoped_event_id("polowa-grupy");
    const values = {
      ...sample_event_values(id),
      // Sala i strona obiektu bez nazwy budynku: pola grupy są niezależne od siebie
      "venue.name": "",
      "venue.streetAddress": "",
      "venue.postalCode": "",
      "schedule.endTime": "",
      "schedule.timeZoneLabel": "",
      "admission.priceCurrency": "",
      "admission.validFrom": "",
      "organizer.url": "",
    };

    await log_in(page);
    await create_event_via_panel(page, values);
    // Lista panelu nazywa obiekt salą, kiedy nazwy budynku nie znamy.
    await expect(event_row(page, id)).toContainText(values["venue.room"]);

    const saved = await read_fixture_event(id);
    expect(saved?.venue).toEqual({
      room: values["venue.room"],
      url: values["venue.url"],
    });
    expect(saved?.schedule).toEqual({
      startTime: values["schedule.startTime"],
      utcOffset: values["schedule.utcOffset"],
    });
    expect(saved?.admission).toEqual({
      price: values["admission.price"],
      requiresRegistration: true,
    });
    expect(saved?.organizer).toEqual({ name: values["organizer.name"] });
  });
});
