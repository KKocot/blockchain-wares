import type {
  EventAdmission,
  EventFact,
  EventLink,
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

/*
 * Nowe pola (task 20): badges, facts, links, venue.note — kształty poprawne dla
 * testów renderu i kształty surowe (`Record<string, unknown>`) dla `parse_event`.
 */

export const FULL_FACTS: EventFact[] = [
  { icon: "attendees", label: "500+ attendees" },
  { icon: "wifi", label: "Free wifi on site" },
];

export const FULL_LINKS: EventLink[] = [
  { label: "Agenda", url: "https://example.invalid/agenda" },
  { label: "Livestream", url: "https://example.invalid/live" },
];

/** Komplet nowych pól naraz: badge'e, fakty, linki, notatka o miejscu obok pełnego venue */
export const FULL_NEW_FIELDS = {
  id: "test-full-new-fields",
  name: "Full New Fields Summit",
  city: "Barcelona",
  country: "Spain",
  countryCode: "ES",
  startDate: "2026-09-16",
  endDate: "2026-09-17",
  badges: ["Featured", "Sponsor"],
  facts: FULL_FACTS,
  links: FULL_LINKS,
  venue: {
    name: "Full Fields Hall",
    streetAddress: "Carrer de Prova, 49",
    postalCode: "08019",
    note: "Entrance from the courtyard",
  },
} satisfies TradeFairEvent;

/** Notatka o miejscu bez nazwy/sali/adresu — blok „Where” nie ma czego pokazać */
export const NOTE_ONLY_VENUE = {
  id: "test-note-only-venue",
  name: "Note Only Draft",
  startDate: "2026-09-16",
  endDate: "2026-09-16",
  venue: { note: "Entrance from the courtyard" },
} satisfies TradeFairEvent;

/** Notatka obok pełnego adresu warsztatu — link mapy ma powstać z adresu, nie z notatki */
export const WORKSHOP_VENUE_NOTED = {
  ...WORKSHOP,
  id: "test-workshop-venue-noted",
  venue: { ...WORKSHOP.venue, note: "Entrance from the courtyard" },
} satisfies TradeFairEvent;

/** Same badge'e, bez faktów/linków — sekcje pozostałych pól mają zniknąć w całości */
export const ONLY_BADGES = {
  id: "test-only-badges",
  name: "Only Badges Draft",
  startDate: "2026-09-16",
  endDate: "2026-09-16",
  badges: ["Featured"],
} satisfies TradeFairEvent;

/** Same fakty, bez badge'y/linków */
export const ONLY_FACTS = {
  id: "test-only-facts",
  name: "Only Facts Draft",
  startDate: "2026-09-16",
  endDate: "2026-09-16",
  facts: [{ icon: "wifi", label: "Free wifi on site" }],
} satisfies TradeFairEvent;

/** Same linki, bez badge'y/faktów */
export const ONLY_LINKS = {
  id: "test-only-links",
  name: "Only Links Draft",
  startDate: "2026-09-16",
  endDate: "2026-09-16",
  links: [{ label: "Agenda", url: "https://example.invalid/agenda" }],
} satisfies TradeFairEvent;

/** `badges` nie-tablicą — całe pole ma zniknąć, reszta rekordu zostaje */
export const BADGES_NOT_ARRAY: Record<string, unknown> = {
  id: "shape-badges-not-array",
  name: "Badges Not Array",
  badges: "Featured",
};

/** Poprawne i niepoprawne elementy wymieszane — wypadają tylko złe */
export const BADGES_MIXED: Record<string, unknown> = {
  id: "shape-badges-mixed",
  name: "Badges Mixed",
  badges: ["Valid One", 42, "   ", "Valid Two", null],
};

/** Powyżej `MAX_EVENT_BADGES` — ucięte, kolejność zachowana */
export const BADGES_OVER_LIMIT: Record<string, unknown> = {
  id: "shape-badges-over-limit",
  name: "Badges Over Limit",
  badges: ["One", "Two", "Three", "Four", "Five", "Six"],
};

/** Same złe elementy — pole ma zniknąć całkiem, nie zostać `[]` */
export const BADGES_ALL_INVALID: Record<string, unknown> = {
  id: "shape-badges-all-invalid",
  name: "Badges All Invalid",
  badges: ["", "   ", 42, null, {}],
};

/** Element bez `label` — wypada sam element, reszta rekordu zostaje */
export const FACTS_MISSING_LABEL: Record<string, unknown> = {
  id: "shape-facts-missing-label",
  name: "Facts Missing Label",
  facts: [{ icon: "wifi", label: "Free wifi on site" }, { icon: "parking" }],
};

/** Ikona spoza `ICON_KEYS` — wypada sam element */
export const FACTS_BAD_ICON: Record<string, unknown> = {
  id: "shape-facts-bad-icon",
  name: "Facts Bad Icon",
  facts: [
    { icon: "wifi", label: "Free wifi on site" },
    { icon: "not-a-real-icon", label: "Ghost fact" },
  ],
};

/** Powyżej `MAX_EVENT_FACTS` — ucięte, kolejność zachowana */
export const FACTS_OVER_LIMIT: Record<string, unknown> = {
  id: "shape-facts-over-limit",
  name: "Facts Over Limit",
  facts: Array.from({ length: 7 }, (_, index) => ({
    icon: "info",
    label: `Fact ${index + 1}`,
  })),
};

/** Element bez `label` — wypada sam element */
export const LINKS_MISSING_LABEL: Record<string, unknown> = {
  id: "shape-links-missing-label",
  name: "Links Missing Label",
  links: [
    { label: "Agenda", url: "https://example.invalid/agenda" },
    { url: "https://example.invalid/no-label" },
  ],
};

/** Adres, który nie pasuje do wzorca `http(s)` — wypada sam element */
export const LINKS_BAD_URL: Record<string, unknown> = {
  id: "shape-links-bad-url",
  name: "Links Bad Url",
  links: [
    { label: "Agenda", url: "https://example.invalid/agenda" },
    { label: "Broken", url: "not a url" },
  ],
};

/** `javascript:`/`data:` muszą wypaść zawsze — linki idą wprost na stronę publiczną */
export const LINKS_UNSAFE_SCHEMES: Record<string, unknown> = {
  id: "shape-links-unsafe-schemes",
  name: "Links Unsafe Schemes",
  links: [
    { label: "Agenda", url: "https://example.invalid/agenda" },
    { label: "Script", url: "javascript:alert(1)" },
    { label: "Data", url: "data:text/html,<script>alert(1)</script>" },
  ],
};

/** Powyżej `MAX_EVENT_LINKS` — ucięte, kolejność zachowana */
export const LINKS_OVER_LIMIT: Record<string, unknown> = {
  id: "shape-links-over-limit",
  name: "Links Over Limit",
  links: Array.from({ length: 7 }, (_, index) => ({
    label: `Link ${index + 1}`,
    url: `https://example.invalid/link-${index + 1}`,
  })),
};

/** `venue.note` puste/białe znaki — samo pole znika, reszta `venue` zostaje nietknięta */
export const VENUE_NOTE_BLANK: Record<string, unknown> = {
  id: "shape-venue-note-blank",
  name: "Venue Note Blank",
  venue: { name: "Test Hall", note: "   " },
};

/** `venue.note` nie-string — samo pole znika, reszta `venue` zostaje nietknięta */
export const VENUE_NOTE_NOT_STRING: Record<string, unknown> = {
  id: "shape-venue-note-not-string",
  name: "Venue Note Not String",
  venue: { name: "Test Hall", note: 42 },
};
