import { expect, test } from "@playwright/test";
import {
  build_event_schema,
  to_json_ld,
  type EventSchema,
} from "../src/components/event-schema";
import {
  get_event_path,
  type TradeFairEvent,
} from "../src/components/events-data";
import {
  CONFERENCE,
  FREE_ADMISSION,
  ROOMED_WORKSHOP,
  WORKSHOP,
  WORKSHOP_MAP_URL,
} from "./fixtures/event_shapes";
import { SEED_EVENTS } from "./fixtures/events";
import { required } from "./support/events";

/**
 * Wydarzenie z datami ma dostać blok `Event` — `null` w tych testach to regresja,
 * a nie stan do obsłużenia. Wariant bez dat ma własny spec.
 */
function dated_schema(
  ...args: Parameters<typeof build_event_schema>
): EventSchema {
  return required(
    build_event_schema(...args),
    `Schemat JSON-LD wydarzenia "${args[0].id}"`,
  );
}

const SITE = new URL("https://blockchainwares.com.pl");

test.describe("JSON-LD", () => {
  test("wydarzenie z harmonogramem: pełny kształt schematu", () => {
    expect(dated_schema(WORKSHOP, SITE)).toEqual({
      "@context": "https://schema.org",
      "@type": "Event",
      name: "Test Workshop",
      description: "Test description",
      image: "https://blockchainwares.com.pl/assets/img/og-image.png",
      startDate: "2026-09-19T10:00:00+02:00",
      endDate: "2026-09-19T14:00:00+02:00",
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        url: "https://blockchainwares.com.pl/markets",
        validFrom: "2026-09-03",
      },
      location: {
        "@type": "Place",
        name: "Test Venue",
        hasMap: WORKSHOP_MAP_URL,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Carrer de Prova, 49",
          postalCode: "08019",
          addressLocality: "Barcelona",
          addressCountry: "ES",
        },
      },
      organizer: {
        "@type": "Organization",
        name: "BlockchainWares",
        url: "https://blockchainwares.com.pl",
      },
    });
  });

  test("link do mapy nie trafia do Place.url", () => {
    const schema = dated_schema(WORKSHOP, SITE);
    const location = required(schema.location, "Miejsce w schemacie");

    // Obiekt bez własnej strony nie dostaje jej z mapy — ta ma własne pole.
    expect("url" in location).toBe(false);
    // Wydarzenie własne nie ma strony, więc Event.url też się nie pojawia.
    expect("url" in schema).toBe(false);
  });

  test("strona obiektu idzie do Place.url, mapa zostaje w hasMap", () => {
    const location = required(
      dated_schema(ROOMED_WORKSHOP, SITE).location,
      "Miejsce w schemacie",
    );

    expect(location.url).toBe("https://venue.invalid/social-hub");
    expect(location.hasMap).toBe(WORKSHOP_MAP_URL);
  });

  test("sala zostaje przy prezentacji i nie wchodzi do JSON-LD", () => {
    const schema = dated_schema(ROOMED_WORKSHOP, SITE);
    const room = required(ROOMED_WORKSHOP.venue.room, "Sala warsztatu");

    expect(JSON.stringify(schema)).not.toContain(room);
  });

  test("sama strona obiektu nie powołuje Place, którego nie ma czym opisać", () => {
    const linked_only = {
      ...WORKSHOP,
      city: undefined,
      countryCode: undefined,
      venue: { url: "https://venue.invalid/social-hub" },
    } satisfies TradeFairEvent;

    // Google czyta miejsce wydarzenia offline po nazwie i adresie: Place z samym
    // adresem strony byłby znacznikiem, który i tak zostanie odrzucony.
    expect(dated_schema(linked_only, SITE).location).toBeUndefined();
  });

  test("wydarzenie bez harmonogramu: daty dzienne i miasto jako miejsce", () => {
    const schema = dated_schema(CONFERENCE, SITE);
    const location = required(schema.location, "Miejsce w schemacie");

    expect(schema.startDate).toBe("2026-09-16");
    expect(schema.endDate).toBe("2026-09-17");
    expect(schema.url).toBe("https://example.com/");
    expect(location.name).toBe("Barcelona");
    expect("hasMap" in location).toBe(false);
    expect("streetAddress" in location.address).toBe(false);
  });

  test("wydarzenie bez wstępu na własnych zasadach nie dostaje oferty", () => {
    const schema = dated_schema(CONFERENCE, SITE);

    expect("offers" in schema).toBe(false);
    expect("isAccessibleForFree" in schema).toBe(false);
  });

  test("płatny wstęp nie jest oznaczany jako darmowy", () => {
    const paid = {
      ...WORKSHOP,
      admission: { ...FREE_ADMISSION, price: "120" },
    } satisfies TradeFairEvent;
    const schema = dated_schema(paid, SITE);

    expect(schema.offers?.price).toBe("120");
    expect("isAccessibleForFree" in schema).toBe(false);
  });

  test("niepełna grupa trafia do JSON-LD tylko wtedy, gdy jest poprawna", () => {
    const partial = {
      ...WORKSHOP,
      admission: { price: "0", requiresRegistration: false },
      organizer: { name: "Sam organizator" },
    } satisfies TradeFairEvent;
    const schema = dated_schema(partial, SITE);

    // Cena bez waluty nie składa się na `Offer`, ale wstęp wolny zostaje ogłoszony.
    expect("offers" in schema).toBe(false);
    expect(schema.isAccessibleForFree).toBe(true);
    expect(schema.organizer).toEqual({
      "@type": "Organization",
      name: "Sam organizator",
    });
  });

  test("organizator bez nazwy nie staje się pustą Organization", () => {
    const anonymous = {
      ...WORKSHOP,
      organizer: { url: "https://example.invalid/org" },
    } satisfies TradeFairEvent;

    expect("organizer" in dated_schema(anonymous, SITE)).toBe(false);
  });

  test("adres bez miasta nie dokleja mapy prowadzącej w złe miejsce", () => {
    const homeless = {
      ...WORKSHOP,
      city: undefined,
    } satisfies TradeFairEvent;
    const location = required(
      dated_schema(homeless, SITE).location,
      "Miejsce w schemacie",
    );

    expect("hasMap" in location).toBe(false);
    expect(location.address.streetAddress).toBe("Carrer de Prova, 49");
  });

  test("schemat ze strony wydarzenia kieruje ofertę na tę stronę", () => {
    const schema = dated_schema(WORKSHOP, SITE, get_event_path(WORKSHOP));

    expect(schema.offers?.url).toBe(
      "https://blockchainwares.com.pl/markets/test-workshop",
    );
  });

  test("bez ścieżki oferta zostaje przy listingu", () => {
    // Listing emituje schematy wszystkich wydarzeń naraz — tam oferta nie ma dokąd celować.
    expect(dated_schema(WORKSHOP, SITE).offers?.url).toBe(
      "https://blockchainwares.com.pl/markets",
    );
  });

  test("badges, facts, links i notatka o miejscu nie przeciekają do schematu", () => {
    // Wydarzenie z WSZYSTKIMI polami prezentacyjnymi wypełnionymi — to test na wyciek,
    // nie tylko na brak klucza. Unikalne stringi muszą nie pojawić się nigdzie w JSON-LD.
    const decorated = {
      ...WORKSHOP,
      venue: { ...WORKSHOP.venue, note: "UNIQUE_VENUE_NOTE_5a6c8f" },
      badges: ["UNIQUE_BADGE_LABEL_9f3a21"],
      facts: [{ icon: "info", label: "UNIQUE_FACT_LABEL_7c1b44" }],
      links: [
        {
          label: "UNIQUE_LINK_LABEL_2e9d17",
          url: "https://unique-link-target.invalid/8b4f",
        },
      ],
    } satisfies TradeFairEvent;

    const serialized = JSON.stringify(dated_schema(decorated, SITE));

    expect(serialized).not.toContain("UNIQUE_VENUE_NOTE_5a6c8f");
    expect(serialized).not.toContain("UNIQUE_BADGE_LABEL_9f3a21");
    expect(serialized).not.toContain("UNIQUE_FACT_LABEL_7c1b44");
    expect(serialized).not.toContain("UNIQUE_LINK_LABEL_2e9d17");
    expect(serialized).not.toContain("unique-link-target.invalid");
    expect(serialized).not.toContain('"badges"');
    expect(serialized).not.toContain('"facts"');
    expect(serialized).not.toContain('"links"');
    expect(serialized).not.toContain('"note"');
  });

  test("escapowanie nie zmienia danych — round-trip 1:1", () => {
    const schemas = SEED_EVENTS.map((event) => dated_schema(event, SITE));
    const serialized = to_json_ld(schemas);

    // Adres Maps URLs API zawiera `&`, jeden ze znaków uciekanych do \\uXXXX.
    // Bez niego w danych test przechodziłby, nie sprawdzając niczego.
    expect(JSON.stringify(schemas)).toMatch(/&/);
    expect(serialized).not.toMatch(/[<>&]/);
    expect(JSON.parse(serialized)).toEqual(schemas);
  });
});
