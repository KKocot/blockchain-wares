import { expect, test } from "@playwright/test";
import { build_event_schema, to_json_ld } from "../src/components/event-schema";
import {
  EVENTS,
  format_admission,
  format_venue_address,
  get_event_end_datetime,
  get_event_start_datetime,
  get_event_status,
  get_promoted_events,
  get_venue_map_url,
  parse_iso_day,
  type EventAdmission,
  type TradeFairEvent,
} from "../src/components/events-data";

const SITE = new URL("https://blockchainwares.com.pl");

const EBC_ID = "ebc-2026-barcelona";

const FREE_ADMISSION: EventAdmission = {
  price: "0",
  priceCurrency: "EUR",
  requiresRegistration: false,
  validFrom: "2026-09-03",
};

/** Wydarzenie z `EVENTS`, nie z fixture — pilnuje danych wystawionych na produkcji */
function find_event(id: string): TradeFairEvent {
  const event = EVENTS.find((entry) => entry.id === id);

  if (!event) {
    throw new Error(`Brak wydarzenia ${id} w EVENTS`);
  }

  return event;
}

/** Wydarzenie własne: jeden dzień, godziny zegarowe, link do mapy zamiast strony */
const WORKSHOP: TradeFairEvent = {
  id: "test-workshop",
  name: "Test Workshop",
  kind: "workshop",
  city: "Barcelona",
  country: "Spain",
  countryCode: "ES",
  startDate: "2026-09-19",
  endDate: "2026-09-19",
  schedule: {
    startTime: "10:00",
    endTime: "14:00",
    utcOffset: "+02:00",
    timeZoneLabel: "CEST",
  },
  venue: {
    name: "Test Venue",
    streetAddress: "Carrer de Prova, 49",
    postalCode: "08019",
  },
  admission: FREE_ADMISSION,
  image: "/assets/img/og-image.png",
  organizer: { name: "BlockchainWares", url: "https://blockchainwares.com.pl" },
  description: "Test description",
  topics: ["Topic"],
};

/** Konferencja: zakres dni bez godzin, własna strona */
const CONFERENCE: TradeFairEvent = {
  id: "test-conference",
  name: "Test Conference",
  city: "Barcelona",
  country: "Spain",
  countryCode: "ES",
  startDate: "2026-09-16",
  endDate: "2026-09-17",
  url: "https://example.com/",
  image: "/assets/img/og-image.png",
  organizer: { name: "Organizer", url: "https://example.com/" },
  description: "Test description",
  topics: ["Topic"],
};

const WORKSHOP_START_MS = new Date(
  get_event_start_datetime(WORKSHOP),
).getTime();
const WORKSHOP_END_MS = new Date(get_event_end_datetime(WORKSHOP)).getTime();

const WORKSHOP_MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=Carrer%20de%20Prova%2C%2049%2C%2008019%20Barcelona";

test.describe("daty wydarzenia", () => {
  test("harmonogram dokłada godzinę i offset", () => {
    expect(get_event_start_datetime(WORKSHOP)).toBe(
      "2026-09-19T10:00:00+02:00",
    );
    expect(get_event_end_datetime(WORKSHOP)).toBe("2026-09-19T14:00:00+02:00");
  });

  test("bez harmonogramu zostają same dni", () => {
    expect(get_event_start_datetime(CONFERENCE)).toBe("2026-09-16");
    expect(get_event_end_datetime(CONFERENCE)).toBe("2026-09-17");
  });
});

test.describe("get_event_status — granice godzin", () => {
  test("milisekundę przed startem wydarzenie jest wciąż nadchodzące", () => {
    expect(get_event_status(WORKSHOP, new Date(WORKSHOP_START_MS - 1))).toBe(
      "upcoming",
    );
  });

  test("w godzinie startu wydarzenie zaczyna trwać", () => {
    expect(get_event_status(WORKSHOP, new Date(WORKSHOP_START_MS))).toBe(
      "ongoing",
    );
  });

  test("milisekundę przed końcem wydarzenie wciąż trwa", () => {
    expect(get_event_status(WORKSHOP, new Date(WORKSHOP_END_MS - 1))).toBe(
      "ongoing",
    );
  });

  test("w godzinie końca wydarzenie jest już przeszłe", () => {
    expect(get_event_status(WORKSHOP, new Date(WORKSHOP_END_MS))).toBe("past");
  });

  test("północ dnia wydarzenia daje ten sam wynik co render serwerowy", () => {
    // Prerender i pierwszy render klienta liczą status z `parse_iso_day(todayIso)` —
    // precyzja godzinowa nie może przestawić karty przed hydracją.
    expect(get_event_status(WORKSHOP, parse_iso_day("2026-09-19"))).toBe(
      "upcoming",
    );
  });

  test("bez harmonogramu status nadal zmienia się na całych dniach", () => {
    const first_day_dawn = new Date(2026, 8, 16, 0, 30);
    const last_day_evening = new Date(2026, 8, 17, 23, 30);
    const next_day = new Date(2026, 8, 18, 0, 30);

    expect(get_event_status(CONFERENCE, first_day_dawn)).toBe("ongoing");
    expect(get_event_status(CONFERENCE, last_day_evening)).toBe("ongoing");
    expect(get_event_status(CONFERENCE, next_day)).toBe("past");
  });
});

test.describe("JSON-LD", () => {
  test("wydarzenie z harmonogramem: pełny kształt schematu", () => {
    expect(build_event_schema(WORKSHOP, SITE)).toEqual({
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
    const schema = build_event_schema(WORKSHOP, SITE);

    expect("url" in schema.location).toBe(false);
    // Wydarzenie własne nie ma strony, więc Event.url też się nie pojawia.
    expect("url" in schema).toBe(false);
  });

  test("wydarzenie bez harmonogramu: daty dzienne i miasto jako miejsce", () => {
    const schema = build_event_schema(CONFERENCE, SITE);

    expect(schema.startDate).toBe("2026-09-16");
    expect(schema.endDate).toBe("2026-09-17");
    expect(schema.url).toBe("https://example.com/");
    expect(schema.location.name).toBe("Barcelona");
    expect("hasMap" in schema.location).toBe(false);
    expect("streetAddress" in schema.location.address).toBe(false);
  });

  test("wydarzenie bez wstępu na własnych zasadach nie dostaje oferty", () => {
    const schema = build_event_schema(CONFERENCE, SITE);

    expect("offers" in schema).toBe(false);
    expect("isAccessibleForFree" in schema).toBe(false);
  });

  test("płatny wstęp nie jest oznaczany jako darmowy", () => {
    const paid: TradeFairEvent = {
      ...WORKSHOP,
      admission: { ...FREE_ADMISSION, price: "120" },
    };
    const schema = build_event_schema(paid, SITE);

    expect(schema.offers?.price).toBe("120");
    expect("isAccessibleForFree" in schema).toBe(false);
  });

  test("escapowanie nie zmienia danych — round-trip 1:1", () => {
    // Adres Maps URLs API zawiera `&`, a to jeden ze znaków uciekanych do \\uXXXX.
    const schemas = EVENTS.map((event) => build_event_schema(event, SITE));
    const serialized = to_json_ld(schemas);

    expect(serialized).not.toMatch(/[<>&]/);
    expect(JSON.parse(serialized)).toEqual(schemas);
  });
});

test.describe("wstęp, adres i link do mapy", () => {
  test("darmowe wejście bez zapisów opisane jest wprost", () => {
    expect(format_admission(FREE_ADMISSION)).toBe(
      "Free entry · no registration",
    );
  });

  test("adres łączy ulicę z kodem pocztowym i miastem", () => {
    expect(format_venue_address(WORKSHOP)).toBe(
      "Carrer de Prova, 49, 08019 Barcelona",
    );
  });

  test("bez ulicy karta nie ma czego pokazać", () => {
    expect(format_venue_address(CONFERENCE)).toBeUndefined();
  });

  test("mapa szuka po adresie pocztowym, nie po nazwie venue", () => {
    expect(get_venue_map_url(WORKSHOP)).toBe(WORKSHOP_MAP_URL);
  });

  test("bez ulicy nie ma pewnego trafienia, więc nie ma linku", () => {
    expect(get_venue_map_url(CONFERENCE)).toBeUndefined();
  });
});

test.describe("dane produkcyjne", () => {
  test("EBC: cudze wydarzenie zostaje bez oferty i bez adresu", () => {
    const schema = build_event_schema(find_event(EBC_ID), SITE);

    expect("offers" in schema).toBe(false);
    expect("streetAddress" in schema.location.address).toBe(false);
  });
});

/** Kalendarz sprowadzony do samych dat — kolejność promowania zależy tylko od nich */
function make_event(
  id: string,
  startDate: string,
  endDate: string,
): TradeFairEvent {
  return { ...CONFERENCE, id, startDate, endDate };
}

test.describe("get_promoted_events", () => {
  const CALENDAR = [CONFERENCE, WORKSHOP];

  test("przed konferencją promuje oba wydarzenia chronologicznie", () => {
    const promoted = get_promoted_events(
      parse_iso_day("2026-09-01"),
      2,
      CALENDAR,
    );

    expect(promoted.map((event) => event.id)).toEqual([
      CONFERENCE.id,
      WORKSHOP.id,
    ]);
  });

  test("trwające idą przed nadchodzącymi, każda grupa we własnej kolejności", () => {
    // Dłuższe trwające zaczęło się najwcześniej — sortowanie po `startDate`
    // postawiłoby je na czele grupy, a liczy się to, co kończy się pierwsze.
    const ending_later = make_event(
      "ongoing-later",
      "2026-09-10",
      "2026-09-20",
    );
    const ending_sooner = make_event(
      "ongoing-sooner",
      "2026-09-14",
      "2026-09-16",
    );
    const next_week = make_event("upcoming-next", "2026-09-22", "2026-09-23");
    const next_month = make_event("upcoming-later", "2026-10-01", "2026-10-02");

    const promoted = get_promoted_events(parse_iso_day("2026-09-15"), 4, [
      next_month,
      ending_later,
      next_week,
      ending_sooner,
    ]);

    expect(promoted.map((event) => event.id)).toEqual([
      "ongoing-sooner",
      "ongoing-later",
      "upcoming-next",
      "upcoming-later",
    ]);
  });

  test("po zamknięciu konferencji zostaje sam warsztat", () => {
    const promoted = get_promoted_events(
      parse_iso_day("2026-09-18"),
      2,
      CALENDAR,
    );

    expect(promoted.map((event) => event.id)).toEqual([WORKSHOP.id]);
  });

  test("po ostatnim wydarzeniu nie ma czego promować", () => {
    expect(
      get_promoted_events(parse_iso_day("2026-09-20"), 2, CALENDAR),
    ).toEqual([]);
  });

  test("limit ucina listę", () => {
    expect(
      get_promoted_events(parse_iso_day("2026-09-01"), 1, CALENDAR),
    ).toHaveLength(1);
  });
});
