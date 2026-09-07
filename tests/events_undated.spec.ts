import { expect, test } from "@playwright/test";
import { build_event_schema } from "../src/components/event-schema";
import { STATUS_THEME, WORKSHOP_LABEL } from "../src/components/event-theme";
import {
  format_event_date,
  get_event_by_id,
  get_event_days,
  get_event_name,
  get_event_start_datetime,
  get_event_status,
  get_promoted_events,
  group_events_by_status,
  parse_iso_day,
  UNTITLED_EVENT_NAME,
  type TradeFairEvent,
} from "../src/components/events-data";
import { parse_event } from "../src/lib/events/parse_event";

const SITE = new URL("https://blockchainwares.com.pl");

/** Szkic w stanie, w jakim zapisuje go właściciel: sam identyfikator i nazwa */
const DRAFT = {
  id: "draft-event",
  name: "Draft Event",
} satisfies TradeFairEvent;

const DATED = {
  id: "dated-event",
  name: "Dated Event",
  startDate: "2026-09-16",
  endDate: "2026-09-17",
} satisfies TradeFairEvent;

test.describe("wydarzenie bez terminu", () => {
  test("status nie zależy od zegara", () => {
    for (const now of [
      parse_iso_day("2020-01-01"),
      parse_iso_day("2026-09-16"),
      parse_iso_day("2099-12-31"),
    ]) {
      expect(get_event_status(DRAFT, now)).toBe("undated");
    }
  });

  test("sama data początku robi z niego wydarzenie jednodniowe", () => {
    const half = { ...DRAFT, startDate: "2026-09-19" } satisfies TradeFairEvent;

    expect(get_event_days(half)).toEqual({
      start: "2026-09-19",
      end: "2026-09-19",
    });
    expect(get_event_status(half, parse_iso_day("2026-09-19"))).toBe("ongoing");
    expect(get_event_status(half, parse_iso_day("2026-09-20"))).toBe("past");
  });

  test("bez dat nie ma czego sformatować ani wpisać w `datetime`", () => {
    expect(get_event_days(DRAFT)).toBeNull();
    expect(format_event_date(DRAFT)).toBeNull();
    expect(get_event_start_datetime(DRAFT)).toBeUndefined();
  });

  test("baner go nie promuje — nie ma czym odpowiedzieć na „kiedy”", () => {
    const promoted = get_promoted_events(parse_iso_day("2026-09-01"), 5, [
      DRAFT,
      DATED,
    ]);

    expect(promoted.map((event) => event.id)).toEqual([DATED.id]);
  });

  test("etykieta statusu zostaje po angielsku, jak reszta strony", () => {
    expect(STATUS_THEME.undated.label).toBe("Date to be announced");
    expect(WORKSHOP_LABEL.undated).toBe("Date to be announced");
  });

  test("szkic bez nazwy dostaje jeden wspólny zastępnik", () => {
    expect(get_event_name({ id: "no-name" })).toBe(UNTITLED_EVENT_NAME);
    expect(get_event_name(DRAFT)).toBe("Draft Event");
  });

  test("nadal ma własną stronę — id jest jedynym wymaganym polem", () => {
    expect(get_event_by_id(DRAFT.id, [DRAFT, DATED])).toBe(DRAFT);
  });
});

test.describe("group_events_by_status", () => {
  test("grupa bez terminu stoi na końcu, po archiwum", () => {
    const groups = group_events_by_status(parse_iso_day("2026-09-16"), [DRAFT]);

    expect(Object.keys(groups)).toEqual([
      "ongoing",
      "upcoming",
      "past",
      "undated",
    ]);
    expect(groups.undated.map((event) => event.id)).toEqual([DRAFT.id]);
  });

  test("kolejność jest stabilna: po nazwie, a bez niej po id", () => {
    // Bez własnego klucza sortowania nieodatowane ustawiałaby kolejność z API,
    // a ta zmienia się przy każdym zapisie w panelu.
    const drafts: TradeFairEvent[] = [
      { id: "zulu-draft" },
      { id: "b-draft", name: "Zeta" },
      { id: "a-draft", name: "Alpha" },
      { id: "kilo-draft" },
    ];

    const { undated } = group_events_by_status(
      parse_iso_day("2026-09-16"),
      drafts,
    );

    expect(undated.map((event) => event.id)).toEqual([
      "a-draft",
      "kilo-draft",
      "b-draft",
      "zulu-draft",
    ]);
  });
});

test.describe("JSON-LD szkicu", () => {
  test("bez daty nie powstaje blok Event — schema.org wymaga `startDate`", () => {
    expect(build_event_schema(DRAFT, SITE)).toBeNull();
  });

  test("sama data wystarczy, reszta pól po prostu znika ze schematu", () => {
    const schema = build_event_schema(DATED, SITE);

    expect(schema).not.toBeNull();
    expect(schema?.startDate).toBe("2026-09-16");
    expect(schema?.name).toBe("Dated Event");
    expect(schema?.location).toBeUndefined();
    expect(schema?.organizer).toBeUndefined();
    expect(schema?.description).toBeUndefined();
  });

  test("szkic bez nazwy nie emituje pustego `name`", () => {
    const nameless = { ...DATED, name: undefined } satisfies TradeFairEvent;

    expect(build_event_schema(nameless, SITE)?.name).toBe(UNTITLED_EVENT_NAME);
  });
});

test.describe("parse_event — wymagane jest samo id", () => {
  test("rekord z samym id przechodzi", () => {
    expect(parse_event({ id: "bare-draft" })).toEqual({ id: "bare-draft" });
  });

  test("brak id dalej zdejmuje rekord z listy", () => {
    expect(parse_event({ name: "Bez identyfikatora" })).toBeNull();
    expect(parse_event({ id: "Nie Slug" })).toBeNull();
  });

  test("pole obecne, ale w złym formacie, nadal odrzuca cały rekord", () => {
    // Brak wartości to zgoda na szkic; wartość, której nie rozumiemy, to uszkodzone dane.
    expect(parse_event({ id: "draft", startDate: "16.09.2026" })).toBeNull();
    expect(parse_event({ id: "draft", countryCode: "POL" })).toBeNull();
    expect(parse_event({ id: "draft", url: "javascript:alert(1)" })).toBeNull();
  });

  test("pusta lista tematów znaczy brak tematów, nie rekord do wyrzucenia", () => {
    expect(parse_event({ id: "draft", topics: [] })?.topics).toEqual([]);
  });
});
