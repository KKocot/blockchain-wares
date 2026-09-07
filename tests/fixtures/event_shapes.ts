import type {
  EventAdmission,
  TradeFairEvent,
} from "../../src/components/events-data";

/**
 * Wydarzenia pisane ręcznie, dla speców liczących na czystych danych zamiast na
 * fixturze serwera (`fixtures/events.ts`). Dzielą je spece kalendarza i JSON-LD —
 * jedna kopia, żeby asercje obu mówiły o tym samym wydarzeniu.
 */

export const FREE_ADMISSION: EventAdmission = {
  price: "0",
  priceCurrency: "EUR",
  requiresRegistration: false,
  validFrom: "2026-09-03",
};

/** Wydarzenie własne: jeden dzień, godziny zegarowe, link do mapy zamiast strony */
export const WORKSHOP = {
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
} satisfies TradeFairEvent;

/** Konferencja: zakres dni bez godzin, własna strona */
export const CONFERENCE = {
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
} satisfies TradeFairEvent;

/** Konferencja po drugiej stronie globu — jej doba nie może zależeć od strefy renderera */
export const TOKYO_CONFERENCE = {
  ...CONFERENCE,
  id: "test-conference-tokyo",
  city: "Tokyo",
  country: "Japan",
  countryCode: "JP",
  utcOffset: "+09:00",
} satisfies TradeFairEvent;

/** Sala i strona obiektu: dwa pola prezentacyjne obok adresu, nie zamiast niego */
export const ROOMED_WORKSHOP = {
  ...WORKSHOP,
  id: "test-workshop-roomed",
  venue: {
    ...WORKSHOP.venue,
    room: "Meeting Room 0.5+0.6, ground floor",
    url: "https://venue.invalid/social-hub",
  },
} satisfies TradeFairEvent;

export const WORKSHOP_MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=Carrer%20de%20Prova%2C%2049%2C%2008019%20Barcelona";
