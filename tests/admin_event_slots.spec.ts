import { expect, test, type Page } from "@playwright/test";
import { NO_JS_TAG } from "../playwright.config";
import {
  CODE_TEXT,
  field_id,
  FIELD_LABELS,
} from "../src/components/admin/event_form_fields";
import {
  MAX_EVENT_BADGES,
  MAX_EVENT_LINKS,
  MAX_EVENT_TOPICS,
} from "../src/components/event-types";
import { get_seed_event, SEED_EVENT_IDS } from "./fixtures/events";
import { log_in } from "./support/admin";
import { reveal_slot, slots } from "./support/admin_event_slots";
import {
  advanced_section,
  create_event_via_panel,
  edit_path,
  error_summary,
  event_field,
  expect_field_error,
  fill_event_form,
  NEW_EVENT_PATH,
  open_advanced,
  read_fixture_event,
  reset_events,
  scoped_event_id,
  submit_button,
  submit_form,
  type EventFormValues,
} from "./support/admin_events";

/**
 * Grupy powtarzalne formularza (wyróżniki, fakty, tematy, linki) i schowek
 * „Zaawansowane". Sedno: bez JavaScriptu wszystkie sloty są widoczne i zapisują się
 * natywnym POST-em, a skrypt tylko chowa nadmiarowe puste i odsłania je „+".
 *
 * Plik zapisuje, więc chodzi po kolei — rekordy dzielą jeden stan fixture'a.
 */
test.describe.configure({ mode: "default" });

/** Daleka przyszłość: baner promuje dwa najbliższe wpisy i te muszą zostać seedowe. */
const FUTURE_DAY = "2038-06-16";

const BADGES = ["Slot badge one", "Slot badge two"];

const FACTS = [
  { icon: "clock", label: "Slot fact one" },
  { icon: "ticket", label: "Slot fact two" },
];

const LINKS = [
  { label: "Slot link one", url: "https://example.invalid/slot-one" },
  { label: "Slot link two", url: "https://example.invalid/slot-two" },
  { label: "Slot link three", url: "https://example.invalid/slot-three" },
];

const TOPICS = ["Slot topic one", "Slot topic two"];

/** Etykiety przycisku „+" w obu stanach — SSR i skrypt muszą składać ten sam tekst. */
const ADD_BADGE_LABEL = "+ Dodaj wyróżnik";
const BADGES_FULL_LABEL = `Komplet — ${MAX_EVENT_BADGES} z ${MAX_EVENT_BADGES}`;

function link_fields(): EventFormValues {
  const fields: EventFormValues = {};

  for (const [index, link] of LINKS.entries()) {
    fields[`links.${index}.label`] = link.label;
    fields[`links.${index}.url`] = link.url;
  }

  return fields;
}

function slot_fields(): EventFormValues {
  const fields: EventFormValues = link_fields();

  for (const [index, badge] of BADGES.entries()) {
    fields[`badges.${index}`] = badge;
  }
  for (const [index, fact] of FACTS.entries()) {
    fields[`facts.${index}.icon`] = fact.icon;
    fields[`facts.${index}.label`] = fact.label;
  }

  return fields;
}

function event_values(id: string): EventFormValues {
  return {
    id,
    name: `Sloty ${id}`,
    startDate: FUTURE_DAY,
    endDate: FUTURE_DAY,
    ...slot_fields(),
  };
}

/**
 * Natywny `<details>` otwiera się kliknięciem w `<summary>` — bez linijki skryptu, więc
 * tak samo w projekcie bez JavaScriptu. Krok jest wspólny, bo to jedyne wejście do pól
 * schowka: gdyby wymagało skryptu, połowa formularza byłaby tam nie do wypełnienia.
 */
async function expect_advanced_opens_on_click(page: Page): Promise<void> {
  await log_in(page);
  await page.goto(NEW_EVENT_PATH);

  const details = advanced_section(page);
  await expect(details).not.toHaveAttribute("open", "");
  await expect(event_field(page, "countryCode")).toBeHidden();

  await open_advanced(page);
  await expect(event_field(page, "countryCode")).toBeVisible();
}

test.beforeEach(async () => {
  await reset_events();
});

test.describe("Panel wydarzeń — sloty grup powtarzalnych", () => {
  test("„+” odsłania kolejny slot, a komplet nie wypada z kolejności Tab", async ({
    page,
  }) => {
    await log_in(page);
    await page.goto(NEW_EVENT_PATH);

    const badges = slots(page, "badges");
    // Widoczny „+” znaczy, że skrypt przestawił już sloty w stan docelowy.
    await expect(badges.add).toBeVisible();
    await expect(badges.item(0)).toBeVisible();
    await expect(badges.item(1)).toBeHidden();
    await expect(badges.counter).toHaveText(`0 z ${MAX_EVENT_BADGES}`);
    await expect(badges.add).toHaveText(ADD_BADGE_LABEL);

    await badges.field(0).fill(BADGES[0]);
    await expect(badges.counter).toHaveText(`1 z ${MAX_EVENT_BADGES}`);

    await badges.add.click();
    await expect(badges.item(1)).toBeVisible();
    // Odsłonięty slot dostaje fokus — inaczej trzeba by go szukać wzrokiem.
    await expect(badges.field(1)).toBeFocused();
    expect(await badges.add.getAttribute("aria-disabled")).toBeNull();

    for (let index = 2; index < MAX_EVENT_BADGES; index += 1) {
      await badges.add.click();
      await expect(badges.item(index)).toBeVisible();
    }

    // Komplet gasi przycisk znaczeniowo, ale zostawia go w kolejności Tab: `disabled`
    // wyrzuciłby stąd fokus razem z jedynym miejscem, gdzie stoi wyjaśnienie limitu.
    await expect(badges.add).toHaveAttribute("aria-disabled", "true");
    expect(await badges.add.getAttribute("disabled")).toBeNull();
    await badges.add.focus();
    await expect(badges.add).toBeFocused();
    await expect(badges.add).toHaveText(BADGES_FULL_LABEL);

    // Etykieta i licznik są renderowane raz przez SSR — po wyczyszczeniu slotu bez
    // przeładowania strony musi je zaktualizować skrypt, inaczej zostają zamrożone.
    await badges.remove(0).click();
    await expect(badges.counter).toHaveText(`0 z ${MAX_EVENT_BADGES}`);
    await expect(badges.add).toHaveText(ADD_BADGE_LABEL);
    expect(await badges.add.getAttribute("aria-disabled")).toBeNull();
  });

  test("odrzucony zapis oddaje wpisane linki, nie sam formularz", async ({
    page,
  }) => {
    const id = scoped_event_id("odrzucone-linki");

    await log_in(page);
    await page.goto(NEW_EVENT_PATH);
    // Błąd na polu spoza grupy: same linki są poprawne i mają wrócić w całości.
    await fill_event_form(page, { id, ...link_fields(), countryCode: "pl" });

    const rejected = await submit_form(page, submit_button(page, "create"));
    expect(rejected.status()).toBe(422);

    const links = slots(page, "links");
    for (const [index, link] of LINKS.entries()) {
      await expect(links.field(index, "label")).toHaveValue(link.label);
      await expect(links.field(index, "url")).toHaveValue(link.url);
      await expect(links.item(index)).toBeVisible();
    }

    await expect(links.counter).toHaveText(
      `${LINKS.length} z ${MAX_EVENT_LINKS}`,
    );
    expect(await read_fixture_event(id)).toBeNull();
  });

  test("niepełna para wraca błędem, a slot pusty w całości jedzie bez słowa", async ({
    page,
  }) => {
    test.slow();
    const id = scoped_event_id("niepelna-para");
    const fact = { icon: "info", label: "Fakt wpisany bez ikony" };
    const link = {
      label: "Etykieta dopisana po błędzie",
      url: "https://example.invalid/slot-bez-etykiety",
    };

    await log_in(page);
    await page.goto(NEW_EVENT_PATH);
    await fill_event_form(page, {
      id,
      name: `Sloty ${id}`,
      "facts.0.label": fact.label,
      "links.0.url": link.url,
    });

    expect(
      (await submit_form(page, submit_button(page, "create"))).status(),
    ).toBe(422);

    // Wcześniej taka połówka znikała po cichu przy zapisie kończącym się sukcesem —
    // dziś wraca błędem przy tym polu, którego brakuje.
    await expect_field_error(page, "facts.0.icon", "required");
    await expect_field_error(page, "links.0.label", "required");
    expect(await read_fixture_event(id)).toBeNull();

    const facts = slots(page, "facts");
    const links = slots(page, "links");
    await expect(facts.field(0, "label")).toHaveValue(fact.label);
    await expect(links.field(0, "url")).toHaveValue(link.url);
    // Sąsiedni slot jest pusty w całości, więc nie jest niczemu winien.
    await expect(facts.field(1, "label")).toHaveAttribute(
      "aria-invalid",
      "false",
    );
    await expect(links.field(1, "url")).toHaveAttribute(
      "aria-invalid",
      "false",
    );
    // Podsumowanie prowadzi w konkretny wiersz, nie w samą nazwę grupy.
    await expect(
      error_summary(page).getByRole("link", {
        name: FIELD_LABELS.get("facts.0.icon") ?? "",
      }),
    ).toHaveAttribute("href", `#${field_id("facts.0.icon")}`);

    await facts.field(0, "icon").selectOption(fact.icon);
    await links.field(0, "label").fill(link.label);
    expect(
      (await submit_form(page, submit_button(page, "create"))).status(),
    ).toBe(303);

    // Pięć pozostałych slotów każdej grupy było pustych — do zapisu nie dojechały.
    const stored = await read_fixture_event(id);
    expect(stored?.facts).toEqual([fact]);
    expect(stored?.links).toEqual([link]);
  });

  test("więcej tematów niż limit wraca błędem zamiast cichego ucięcia", async ({
    page,
  }) => {
    const id = scoped_event_id("nadmiar-tematow");
    const topics = Array.from(
      { length: MAX_EVENT_TOPICS },
      (_, index) => `Temat ${index + 1}`,
    );
    const chip = slots(page, "topics").field;

    await log_in(page);
    await page.goto(NEW_EVENT_PATH);
    await fill_event_form(page, { id, name: `Sloty ${id}` });

    for (const [index, topic] of topics.entries()) {
      await reveal_slot(page, "topics", index);
      // Chipsów jest dokładnie tyle, ile wynosi limit — nadmiarowy temat da się wpisać
      // wyłącznie przecinkiem w ostatnim z nich, tak jak mówi podpowiedź pola.
      const last = index === topics.length - 1;
      await chip(index).fill(last ? `${topic}, Temat ponad limit` : topic);
    }

    expect(
      (await submit_form(page, submit_button(page, "create"))).status(),
    ).toBe(422);

    await expect(error_summary(page)).toContainText(
      FIELD_LABELS.get("topics") ?? "",
    );
    await expect(error_summary(page)).toContainText(CODE_TEXT.invalid);
    // Nadmiar wraca do autora do decyzji: nic się nie zapisało i nic nie zniknęło —
    // dziewiąty temat dostaje własny chip ponad limit, zamiast przepaść bez śladu.
    expect(await read_fixture_event(id)).toBeNull();
    for (const [index, topic] of topics.entries()) {
      await expect(chip(index)).toHaveValue(topic);
    }
    await expect(chip(topics.length)).toHaveValue("Temat ponad limit");
  });

  test("błąd pola ze schowka otwiera „Zaawansowane” już na serwerze", async ({
    page,
  }) => {
    const id = scoped_event_id("zaawansowane");

    await log_in(page);
    await page.goto(NEW_EVENT_PATH);
    await expect(advanced_section(page)).not.toHaveAttribute("open", "");

    await fill_event_form(page, { id, countryCode: "pl" });
    expect(
      (await submit_form(page, submit_button(page, "create"))).status(),
    ).toBe(422);

    // Link z podsumowania błędów prowadzi w pole schowka, a otworzyć <details> może
    // tylko serwer — bez JavaScriptu nie ma kto zrobić tego w przeglądarce.
    await expect(advanced_section(page)).toHaveAttribute("open", "");
    await expect(event_field(page, "countryCode")).toBeVisible();
    await expect_field_error(page, "countryCode", "invalid");
    expect(await read_fixture_event(id)).toBeNull();
  });

  test("klik w „Zaawansowane” odsłania pola schowka", async ({ page }) => {
    await expect_advanced_opens_on_click(page);
  });

  test("wyczyszczenie wszystkich slotów kasuje pole, sąsiednia grupa zostaje", async ({
    page,
  }) => {
    test.slow();
    const id = scoped_event_id("kasowanie-slotow");

    await log_in(page);
    await create_event_via_panel(page, event_values(id));
    expect((await read_fixture_event(id))?.badges).toEqual(BADGES);

    await page.goto(edit_path(id));
    const badges = slots(page, "badges");
    await expect(badges.field(0)).toHaveValue(BADGES[0]);

    // „×” czyści wartość, nie wyjmuje węzła — indeksy pozostałych slotów zostają.
    for (let index = BADGES.length - 1; index >= 0; index -= 1) {
      await badges.remove(index).click();
      await expect(badges.field(index)).toHaveValue("");
    }

    expect(
      (await submit_form(page, submit_button(page, "edit"))).status(),
    ).toBe(303);

    const saved = await read_fixture_event(id);
    expect(saved).not.toBeNull();
    // Pusta grupa jedzie jako `null` i backend robi `$unset` — pole ma zniknąć.
    expect(saved).not.toHaveProperty("badges");
    expect(saved?.facts).toEqual(FACTS);
    expect(saved?.links).toEqual(LINKS);
  });

  test("prefill edycji oddaje wyróżniki, fakty, linki i przypis lokalizacji", async ({
    page,
  }) => {
    const seed = get_seed_event(SEED_EVENT_IDS.upcoming_workshop);
    const badges = slots(page, "badges");
    const facts = slots(page, "facts");
    const links = slots(page, "links");

    await log_in(page);
    await page.goto(edit_path(seed.id));

    for (const [index, badge] of (seed.badges ?? []).entries()) {
      await expect(badges.field(index)).toHaveValue(badge);
    }
    for (const [index, fact] of (seed.facts ?? []).entries()) {
      await expect(facts.field(index, "icon")).toHaveValue(fact.icon);
      await expect(facts.field(index, "label")).toHaveValue(fact.label);
    }
    for (const [index, link] of (seed.links ?? []).entries()) {
      await expect(links.field(index, "label")).toHaveValue(link.label);
      await expect(links.field(index, "url")).toHaveValue(link.url);
    }

    await expect(event_field(page, "venue.note")).toHaveValue(
      seed.venue?.note ?? "",
    );
    // Slot za ostatnim wpisem zostaje pusty: prefill nie przesuwa listy o jeden.
    await expect(badges.field(seed.badges?.length ?? 0)).toHaveValue("");
  });
});

test.describe("Panel wydarzeń — sloty bez JavaScriptu", () => {
  test(
    "wszystkie sloty widoczne, a formularz zapisuje wyróżniki, fakty, tematy i linki",
    { tag: NO_JS_TAG },
    async ({ page }) => {
      test.slow();
      const id = scoped_event_id("sloty-bez-js");

      await log_in(page);
      await page.goto(NEW_EVENT_PATH);

      const badges = slots(page, "badges");
      // Bez skryptu nie ma czym odsłaniać ani czyścić slotu, więc oba sterowniki znikają.
      await expect(badges.add).toBeHidden();
      await expect(badges.remove(0)).toBeHidden();

      for (let index = 0; index < MAX_EVENT_BADGES; index += 1) {
        await expect(badges.item(index)).toBeVisible();
      }

      await fill_event_form(page, {
        ...event_values(id),
        topics: TOPICS.join(", "),
      });
      expect(
        (await submit_form(page, submit_button(page, "create"))).status(),
      ).toBe(303);

      const stored = await read_fixture_event(id);
      expect(stored?.badges).toEqual(BADGES);
      expect(stored?.facts).toEqual(FACTS);
      expect(stored?.links).toEqual(LINKS);
      expect(stored?.topics).toEqual(TOPICS);
    },
  );

  test(
    "klik w „Zaawansowane” odsłania pola schowka bez skryptu",
    { tag: NO_JS_TAG },
    async ({ page }) => {
      await expect_advanced_opens_on_click(page);
    },
  );
});
