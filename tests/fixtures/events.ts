import {
  type TradeFairEvent,
  to_iso_day,
} from "../../src/components/events-data";

/**
 * Zestaw startowy serwera fixture'a wydarzeń. Celowo NIE jest kopią produkcyjnego
 * `EVENTS` — testy mają przeżyć każdą zmianę oferty na produkcji.
 */

/** Prefiks modułu `blockchain-wares` w backend-api; fixture montuje CRUD pod nim. */
export const EVENTS_API_PREFIX = "/blockchain-wares";

/**
 * Nagłówek własnych żądań testów do fixture'a (sprzątanie stanu, odczyt rekordu).
 * Bez niego `ssr_user_agent.spec.ts` nie odróżniłby ruchu harnessu od ruchu aplikacji
 * i wywracał się, gdy równoległy worker akurat sprząta.
 */
export const HARNESS_USER_AGENT = "PlaywrightHarness/1.0 (+tests/support)";

export const SEED_EVENT_IDS = {
  past_conference: "fixture-past-conference-lisbon",
  ongoing_conference: "fixture-ongoing-conference-oslo",
  upcoming_workshop: "fixture-upcoming-workshop-gdansk",
  upcoming_conference: "fixture-upcoming-conference-tokyo",
} as const;

const OG_IMAGE = "/assets/img/og-image.png";

const BW_ORGANIZER = {
  name: "BlockchainWares",
  url: "https://blockchainwares.com.pl",
};

/** Dzień kalendarzowy przesunięty o `days` względem `reference`, ISO `YYYY-MM-DD`. */
function shift_iso_day(reference: Date, days: number): string {
  const shifted = new Date(reference.getTime());
  shifted.setDate(shifted.getDate() + days);

  return to_iso_day(shifted);
}

/**
 * Statusy liczą się względem `now`, nie względem dat wpisanych na sztywno.
 * `ongoing` obejmuje wczoraj–jutro, więc wypada w środku wielodniowego wydarzenia
 * i trzyma ten status o każdej godzinie doby, nie tylko w oknie `schedule`.
 */
export function build_seed_events(now: Date = new Date()): TradeFairEvent[] {
  return [
    {
      id: SEED_EVENT_IDS.past_conference,
      name: "Fixture Ledger Conference Lisbon",
      city: "Lisbon",
      country: "Portugal",
      countryCode: "PT",
      startDate: shift_iso_day(now, -10),
      endDate: shift_iso_day(now, -9),
      image: OG_IMAGE,
      organizer: {
        name: "Fixture Conference Group",
        url: "https://example.invalid/ledger-conference",
      },
      description:
        "Minimal fixture event: required fields only, no kind, schedule, venue, admission or url. Keeps the parser and the views honest about the leanest event we accept.",
      topics: ["Fixture minimal shape"],
    },
    {
      id: SEED_EVENT_IDS.ongoing_conference,
      name: "Fixture Nordic Chain Summit Oslo",
      shortName: "Nordic Summit",
      edition: "NCS3",
      kind: "conference",
      utcOffset: "+02:00",
      city: "Oslo",
      country: "Norway",
      countryCode: "NO",
      startDate: shift_iso_day(now, -1),
      endDate: shift_iso_day(now, 1),
      venue: {
        name: "Fixture Congress Hall",
        streetAddress: "Testveien 12",
        postalCode: "0150",
      },
      url: "https://example.invalid/nordic-chain-summit",
      image: OG_IMAGE,
      organizer: {
        name: "Fixture Nordic Events",
        url: "https://example.invalid/nordic-events",
      },
      description:
        "Multi-day fixture conference running at the moment the test starts — the ongoing status for the banner and the listing. It has a venue and a url, no admission: it is not ours to price.",
      topics: ["Blockchain infrastructure", "Fixture ongoing status"],
    },
    {
      id: SEED_EVENT_IDS.upcoming_workshop,
      name: "Fixture BlockchainWares Workshop in Gdansk",
      shortName: "Gdansk workshop",
      kind: "workshop",
      city: "Gdansk",
      country: "Poland",
      countryCode: "PL",
      startDate: shift_iso_day(now, 14),
      endDate: shift_iso_day(now, 14),
      schedule: {
        startTime: "10:00",
        endTime: "14:00",
        utcOffset: "+02:00",
        timeZoneLabel: "CEST",
      },
      badges: ["Fixture badge alpha", "Fixture badge beta"],
      venue: {
        name: "Fixture Coworking Gdansk",
        room: "Meeting Room 0.5+0.6, ground floor",
        streetAddress: "Ulica Testowa 7",
        postalCode: "80-001",
        url: "https://example.invalid/fixture-coworking",
        note: "Fixture note: entrance from the courtyard",
      },
      facts: [
        { icon: "clock", label: "Fixture fact: four hours" },
        { icon: "attendees", label: "Fixture fact: twenty seats" },
      ],
      links: [
        {
          label: "Fixture agenda",
          url: "https://example.invalid/fixture-agenda",
        },
        {
          label: "Fixture signup",
          url: "https://example.invalid/fixture-signup",
        },
      ],
      admission: {
        price: "0",
        priceCurrency: "PLN",
        requiresRegistration: false,
        validFrom: shift_iso_day(now, -7),
      },
      image: OG_IMAGE,
      organizer: BW_ORGANIZER,
      description:
        "Fullest fixture shape: a workshop with clock times and a zone, a venue with a room, a street address, a note and a page of its own, free entry without registration, plus the editorial slots — badges, facts and named links. Covers the host wording, the admission pill and the prefill of every repeatable group in the panel.",
      topics: ["Our scope of work", "Project demos", "Fixture full shape"],
    },
    {
      id: SEED_EVENT_IDS.upcoming_conference,
      name: "Fixture Tokyo Web3 Expo",
      shortName: "Tokyo Expo",
      kind: "conference",
      utcOffset: "+09:00",
      city: "Tokyo",
      country: "Japan",
      countryCode: "JP",
      startDate: shift_iso_day(now, 45),
      endDate: shift_iso_day(now, 47),
      url: "https://example.invalid/tokyo-web3-expo",
      image: OG_IMAGE,
      organizer: {
        name: "Fixture Expo Committee",
        url: "https://example.invalid/expo-committee",
      },
      description:
        "Second upcoming fixture event, in a distant time zone — gives the banner and the listing a second entry to order by date, and a day counted outside the renderer's zone.",
      topics: ["Enterprise integrations", "Fixture upcoming order"],
    },
  ];
}

/**
 * Zestaw wyliczony przy załadowaniu modułu. Każdy proces (config runnera, worker)
 * liczy go z własnego `new Date()`, więc bieg przechodzący przez północ może dać
 * dzień różnicy — tak samo jak fixture logu.
 */
export const SEED_EVENTS: TradeFairEvent[] = build_seed_events();

export function get_seed_event(id: string): TradeFairEvent {
  const event = SEED_EVENTS.find((candidate) => candidate.id === id);

  if (!event) {
    throw new Error(`Unknown seed event id "${id}"`);
  }

  return event;
}
