import { expect, test } from "@playwright/test";
import { format_admission } from "../src/components/event-theme";
import {
  format_venue_address,
  get_event_by_id,
  get_event_end_datetime,
  get_event_path,
  get_event_start_datetime,
  get_event_status,
  get_promoted_events,
  get_venue_map_url,
  MARKETS_PATH,
  parse_iso_day,
  type TradeFairEvent,
} from "../src/components/events-data";
import {
  CONFERENCE,
  FREE_ADMISSION,
  ROOMED_WORKSHOP,
  TOKYO_CONFERENCE,
  WORKSHOP,
  WORKSHOP_MAP_URL,
} from "./fixtures/event_shapes";
import { required } from "./support/events";

const WORKSHOP_START_MS = new Date(
  required(get_event_start_datetime(WORKSHOP), "Otwarcie warsztatu"),
).getTime();
const WORKSHOP_END_MS = new Date(
  required(get_event_end_datetime(WORKSHOP), "Zamknięcie warsztatu"),
).getTime();

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

  test("sama godzina otwarcia domyka status startu, dnia nie zamyka wcześniej", () => {
    const opening_only = {
      ...WORKSHOP,
      schedule: { startTime: "10:00", utcOffset: "+02:00" },
    } satisfies TradeFairEvent;
    const before = new Date("2026-09-19T07:59:59Z");
    const after = new Date("2026-09-19T08:00:00Z");
    const late_evening = new Date("2026-09-19T21:30:00Z");

    expect(get_event_status(opening_only, before)).toBe("upcoming");
    expect(get_event_status(opening_only, after)).toBe("ongoing");
    // 23:30 w strefie wydarzenia: bez godziny zamknięcia dzień trwa do północy.
    expect(get_event_status(opening_only, late_evening)).toBe("ongoing");
  });

  test("harmonogram bez strefy liczy dobę strefą wydarzenia, nie renderera", () => {
    // `schedule.utcOffset` wygrywa, gdy jest; bez niego zostaje `utcOffset` wydarzenia,
    // więc niepełny harmonogram nie odrywa godzin od dni wydarzenia.
    const zoneless = {
      ...TOKYO_CONFERENCE,
      schedule: { startTime: "10:00", timeZoneLabel: "JST" },
    } satisfies TradeFairEvent;

    expect(get_event_start_datetime(zoneless)).toBe(
      "2026-09-16T10:00:00+09:00",
    );
    expect(get_event_status(zoneless, new Date("2026-09-16T00:59:59Z"))).toBe(
      "upcoming",
    );
    expect(get_event_status(zoneless, new Date("2026-09-16T01:00:00Z"))).toBe(
      "ongoing",
    );
  });

  test("doba wydarzenia zaczyna się w jego strefie, nie w strefie renderera", () => {
    // 2026-09-16, 00:30 w Tokio — u renderera (UTC albo CEST) trwa jeszcze 15.09
    const opening_night = new Date("2026-09-15T15:30:00Z");
    const still_the_eve = new Date("2026-09-15T14:30:00Z");

    expect(get_event_status(TOKYO_CONFERENCE, still_the_eve)).toBe("upcoming");
    expect(get_event_status(TOKYO_CONFERENCE, opening_night)).toBe("ongoing");
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

  test("sala i strona obiektu nie ruszają adresu ani linku do mapy", () => {
    expect(format_venue_address(ROOMED_WORKSHOP)).toBe(
      "Carrer de Prova, 49, 08019 Barcelona",
    );
    expect(get_venue_map_url(ROOMED_WORKSHOP)).toBe(WORKSHOP_MAP_URL);
  });
});

test.describe("adresy stron wydarzeń", () => {
  test("każde wydarzenie ma własną stronę pod listingiem", () => {
    expect(get_event_path(WORKSHOP)).toBe(`${MARKETS_PATH}/test-workshop`);
  });

  test("lookup zwraca wydarzenie, nieznane id zostaje bez strony", () => {
    expect(get_event_by_id(WORKSHOP.id, [WORKSHOP, CONFERENCE])).toBe(WORKSHOP);
    expect(
      get_event_by_id("nie-ma-takiego", [WORKSHOP, CONFERENCE]),
    ).toBeUndefined();
  });

  test("duplikat id wywala moduł, zamiast po cichu oddać stronę pierwszemu wpisowi", () => {
    const clash: TradeFairEvent = { ...CONFERENCE, id: WORKSHOP.id };

    expect(() => get_event_by_id(WORKSHOP.id, [WORKSHOP, clash])).toThrow(
      'Duplicate event id "test-workshop"',
    );
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
