import { expect, test } from "@playwright/test";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer, type ViteDevServer } from "vite";
import { parse_event } from "../src/lib/events/parse_event";
import {
  MAX_EVENT_BADGES,
  MAX_EVENT_FACTS,
  MAX_EVENT_LINKS,
} from "../src/components/event-types";
import type {
  EventStatus,
  TradeFairEvent,
} from "../src/components/events-data";
import {
  BADGES_ALL_INVALID,
  BADGES_MIXED,
  BADGES_NOT_ARRAY,
  BADGES_OVER_LIMIT,
  CONFERENCE,
  FACTS_BAD_ICON,
  FACTS_MISSING_LABEL,
  FACTS_OVER_LIMIT,
  FULL_NEW_FIELDS,
  LINKS_BAD_URL,
  LINKS_MISSING_LABEL,
  LINKS_OVER_LIMIT,
  LINKS_UNSAFE_SCHEMES,
  NOTE_ONLY_VENUE,
  ONLY_BADGES,
  ONLY_FACTS,
  ONLY_LINKS,
  VENUE_NOTE_BLANK,
  VENUE_NOTE_NOT_STRING,
  WORKSHOP_MAP_URL,
  WORKSHOP_VENUE_NOTED,
} from "./fixtures/event_shapes";

/**
 * Task 20: bramka kształtu `parse_event()` dla `badges`/`facts`/`links`/`venue.note`
 * (bez przeglądarki) i render tych samych pól na karcie, banerze i detalu
 * (SSR przez Vite, wzorem `events_partial_render.spec.ts`). Osobny plik, bo
 * `events_partial_render.spec.ts` i `events_source.spec.ts` są blisko limitu 500 linii.
 */

test.describe("parse_event — badges", () => {
  test("nie-tablica: całe pole znika, reszta rekordu zostaje", () => {
    const event = parse_event(BADGES_NOT_ARRAY);

    expect(event).not.toBeNull();
    expect(event?.id).toBe("shape-badges-not-array");
    expect(event?.badges).toBeUndefined();
  });

  test("element nie-string/pusty wypada sam, reszta listy zostaje", () => {
    const event = parse_event(BADGES_MIXED);

    expect(event?.badges).toEqual(["Valid One", "Valid Two"]);
  });

  test("powyżej limitu — ucięte do MAX_EVENT_BADGES, kolejność zachowana", () => {
    const event = parse_event(BADGES_OVER_LIMIT);

    expect(event?.badges).toHaveLength(MAX_EVENT_BADGES);
    expect(event?.badges).toEqual(["One", "Two", "Three", "Four"]);
  });

  test("pusta po odsiewie — pole znika, nie zostaje `[]`", () => {
    const event = parse_event(BADGES_ALL_INVALID);

    expect(event).not.toBeNull();
    expect(event?.badges).toBeUndefined();
  });
});

test.describe("parse_event — facts", () => {
  test("element bez `label` wypada, reszta rekordu zostaje", () => {
    const event = parse_event(FACTS_MISSING_LABEL);

    expect(event).not.toBeNull();
    expect(event?.facts).toEqual([
      { icon: "wifi", label: "Free wifi on site" },
    ]);
  });

  test("ikona spoza ICON_KEYS wypada, reszta zostaje", () => {
    const event = parse_event(FACTS_BAD_ICON);

    expect(event?.facts).toEqual([
      { icon: "wifi", label: "Free wifi on site" },
    ]);
  });

  test("powyżej limitu — ucięte do MAX_EVENT_FACTS, kolejność zachowana", () => {
    const event = parse_event(FACTS_OVER_LIMIT);

    expect(event?.facts).toHaveLength(MAX_EVENT_FACTS);
    expect(event?.facts?.map((fact) => fact.label)).toEqual([
      "Fact 1",
      "Fact 2",
      "Fact 3",
      "Fact 4",
      "Fact 5",
      "Fact 6",
    ]);
  });
});

test.describe("parse_event — links", () => {
  test("element bez `label` wypada, reszta rekordu zostaje", () => {
    const event = parse_event(LINKS_MISSING_LABEL);

    expect(event).not.toBeNull();
    expect(event?.links).toEqual([
      { label: "Agenda", url: "https://example.invalid/agenda" },
    ]);
  });

  test("URL niepasujący do wzorca http(s) wypada, reszta zostaje", () => {
    const event = parse_event(LINKS_BAD_URL);

    expect(event?.links).toEqual([
      { label: "Agenda", url: "https://example.invalid/agenda" },
    ]);
  });

  test("javascript: i data: wypadają zawsze — bezpieczeństwo linków publicznych", () => {
    const event = parse_event(LINKS_UNSAFE_SCHEMES);

    expect(event).not.toBeNull();
    expect(event?.links).toEqual([
      { label: "Agenda", url: "https://example.invalid/agenda" },
    ]);
  });

  test("powyżej limitu — ucięte do MAX_EVENT_LINKS, kolejność zachowana", () => {
    const event = parse_event(LINKS_OVER_LIMIT);

    expect(event?.links).toHaveLength(MAX_EVENT_LINKS);
    expect(event?.links?.map((link) => link.label)).toEqual([
      "Link 1",
      "Link 2",
      "Link 3",
      "Link 4",
      "Link 5",
      "Link 6",
    ]);
  });
});

test.describe("parse_event — venue.note", () => {
  test("puste/białe znaki: samo pole znika, reszta venue nietknięta", () => {
    const event = parse_event(VENUE_NOTE_BLANK);

    expect(event?.venue).toEqual({ name: "Test Hall" });
  });

  test("nie-string: samo pole znika, reszta venue nietknięta", () => {
    const event = parse_event(VENUE_NOTE_NOT_STRING);

    expect(event?.venue).toEqual({ name: "Test Hall" });
  });
});

test.describe("parse_event — zły element listy nie zdejmuje rekordu", () => {
  test("badges/facts/links złe naraz: rekord zostaje, złe elementy same wypadają", () => {
    const event = parse_event({
      id: "shape-mixed-bad-lists",
      name: "Mixed Bad Lists",
      badges: ["Valid", 42],
      facts: [
        { icon: "wifi", label: "Ok" },
        { icon: "not-a-real-icon", label: "Ghost" },
      ],
      links: [
        { label: "Ok", url: "https://example.invalid/ok" },
        { label: "Broken", url: "javascript:alert(1)" },
      ],
    });

    expect(event).not.toBeNull();
    expect(event?.id).toBe("shape-mixed-bad-lists");
    expect(event?.badges).toEqual(["Valid"]);
    expect(event?.facts).toEqual([{ icon: "wifi", label: "Ok" }]);
    expect(event?.links).toEqual([
      { label: "Ok", url: "https://example.invalid/ok" },
    ]);
  });
});

/*
 * Render: te same pola na karcie, banerze i detalu, przez SSR pod Vite —
 * `renderToStaticMarkup` dostałby `__pw_type` zamiast elementów Reacta, gdyby
 * komponenty przeszły przez transform Playwrighta zamiast przez Vite.
 */

/** Ślady po brakującym/złym polu, których żaden wariant nie ma prawa zostawić w HTML-u. */
const ARTIFACTS: readonly { what: string; pattern: RegExp }[] = [
  { what: "surowy brak wartości", pattern: /undefined|\[object Object\]|NaN/ },
  {
    what: "pusty element",
    pattern:
      /<(p|span|ul|li|dd|dt|h[1-6])\b(?![^>]*aria-hidden)[^>]*>\s*<\/\1>/,
  },
  { what: "wiszący przecinek", pattern: />\s*,\s*<\// },
];

function expect_clean(html: string, where: string): void {
  for (const { what, pattern } of ARTIFACTS) {
    expect(pattern.test(html), `${where}: ${what} w HTML-u`).toBe(false);
  }
}

/** Widoczna treść: same węzły tekstowe, sklejone tak, jak czyta je przeglądarka */
function text_of(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

let vite: ViteDevServer;

test.beforeAll(async () => {
  vite = await createServer({
    configFile: false,
    root: process.cwd(),
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "silent",
  });
});

test.afterAll(async () => {
  await vite.close();
});

async function load<P>(module_path: string, name: string) {
  const module = (await vite.ssrLoadModule(module_path)) as Record<
    string,
    unknown
  >;
  const component = module[name];

  if (typeof component !== "function") {
    throw new Error(`${module_path} nie eksportuje komponentu ${name}.`);
  }

  return component as ComponentType<P>;
}

async function render_card(
  event: TradeFairEvent,
  status: EventStatus,
): Promise<string> {
  const EventCard = await load<{ event: TradeFairEvent; status: EventStatus }>(
    "/src/components/EventCard.tsx",
    "EventCard",
  );

  return renderToStaticMarkup(createElement(EventCard, { event, status }));
}

async function render_banner(event: TradeFairEvent): Promise<string> {
  const EventBanner = await load<{
    events: TradeFairEvent[];
    todayIso: string;
  }>("/src/components/EventBanner.tsx", "EventBanner");

  return renderToStaticMarkup(
    createElement(EventBanner, { events: [event], todayIso: "2026-09-07" }),
  );
}

async function render_detail(
  event: TradeFairEvent,
  status: EventStatus,
): Promise<string> {
  const EventDetail = await load<{
    event: TradeFairEvent;
    status: EventStatus;
    related: { event: TradeFairEvent; status: EventStatus }[];
  }>("/src/components/EventDetail.tsx", "EventDetail");

  return renderToStaticMarkup(
    createElement(EventDetail, { event, status, related: [] }),
  );
}

test.describe("Komplet nowych pól — karta, baner, detal", () => {
  test("karta pokazuje badge'e, fakty i notatkę o miejscu", async () => {
    const html = await render_card(FULL_NEW_FIELDS, "upcoming");

    expect_clean(html, "karta z nowymi polami");
    const text = text_of(html);
    expect(text).toContain("Featured");
    expect(text).toContain("Sponsor");
    expect(text).toContain("500+ attendees");
    expect(text).toContain("Free wifi on site");
    expect(text).toContain("Entrance from the courtyard");
  });

  test("baner pokazuje badge'e promowanego wpisu", async () => {
    const html = await render_banner(FULL_NEW_FIELDS);

    expect_clean(html, "baner z nowymi polami");
    const text = text_of(html);
    expect(text).toContain("Featured");
    expect(text).toContain("Sponsor");
  });

  test("detal pokazuje badge'e, fakty, linki i notatkę o miejscu", async () => {
    const html = await render_detail(FULL_NEW_FIELDS, "upcoming");

    expect_clean(html, "detal z nowymi polami");
    const text = text_of(html);
    expect(text).toContain("Featured");
    expect(text).toContain("500+ attendees");
    expect(text).toContain("Entrance from the courtyard");
    expect(text).toContain("Agenda");
    expect(text).toContain("Livestream");
    expect(html).toContain('href="https://example.invalid/agenda"');
    expect(html).toContain('href="https://example.invalid/live"');
  });
});

test.describe("Regresja: wydarzenie bez nowych pól renderuje się jak dziś", () => {
  test("karta, baner i detal nie zostawiają śladu po nowych polach", async () => {
    const card = await render_card(CONFERENCE, "upcoming");
    const banner = await render_banner(CONFERENCE);
    const detail = await render_detail(CONFERENCE, "upcoming");

    for (const [html, where] of [
      [card, "karta"],
      [banner, "baner"],
      [detail, "detal"],
    ] as const) {
      expect_clean(html, `${where} bez nowych pól`);
    }

    expect(detail).not.toContain(">Good to know<");
    expect(detail).not.toContain(">Links<");
  });
});

test.describe("Niepełne grupy nowych pól nie zabierają całej sekcji", () => {
  test("same badge'e: „Good to know” i „Links” zostają zamknięte", async () => {
    const html = await render_detail(ONLY_BADGES, "upcoming");

    expect_clean(html, "detal z samymi badge'ami");
    expect(text_of(html)).toContain("Featured");
    expect(html).not.toContain(">Good to know<");
    expect(html).not.toContain(">Links<");
  });

  test("same fakty: „Links” zostaje zamknięte, „Good to know” się otwiera", async () => {
    const html = await render_detail(ONLY_FACTS, "upcoming");

    expect_clean(html, "detal z samymi faktami");
    expect(text_of(html)).toContain("Free wifi on site");
    expect(html).toContain(">Good to know<");
    expect(html).not.toContain(">Links<");
  });

  test("same linki: „Good to know” zostaje zamknięte, „Links” się otwiera", async () => {
    const html = await render_detail(ONLY_LINKS, "upcoming");

    expect_clean(html, "detal z samymi linkami");
    expect(html).toContain(">Links<");
    expect(html).toContain('href="https://example.invalid/agenda"');
    expect(html).not.toContain(">Good to know<");
  });

  test("sama notatka o miejscu bez reszty venue nie tworzy bloku „Where”", async () => {
    const card = await render_card(NOTE_ONLY_VENUE, "upcoming");
    const detail = await render_detail(NOTE_ONLY_VENUE, "upcoming");

    expect_clean(card, "karta z samą notatką o miejscu");
    expect_clean(detail, "detal z samą notatką o miejscu");
    expect(card).not.toContain("Entrance from the courtyard");
    expect(detail).not.toContain(">Where<");
    expect(detail).not.toContain("Entrance from the courtyard");
  });
});

test.describe("venue.note nie wchodzi do linku mapy", () => {
  // JSX escapuje `&` do `&amp;` w atrybucie — porównanie idzie na tej samej postaci.
  const MAP_HREF = `href="${WORKSHOP_MAP_URL.replace(/&/g, "&amp;")}"`;

  test("karta: link mapy powstaje z adresu, notatka nie zmienia jego wartości", async () => {
    const html = await render_card(WORKSHOP_VENUE_NOTED, "upcoming");

    expect_clean(html, "karta z adresem i notatką");
    expect(html).toContain(MAP_HREF);
    expect(text_of(html)).toContain("Entrance from the courtyard");
  });

  test("detal: link mapy powstaje z adresu, notatka nie zmienia jego wartości", async () => {
    const html = await render_detail(WORKSHOP_VENUE_NOTED, "upcoming");

    expect_clean(html, "detal z adresem i notatką");
    expect(html).toContain(MAP_HREF);
    expect(text_of(html)).toContain("Entrance from the courtyard");
  });
});

test.describe("EventLinks nie ufa wyłącznie parse_event na renderze", () => {
  test("javascript:/data: przekazane wprost do komponentu też nie renderują się jako link", async () => {
    const unsafe: TradeFairEvent = {
      ...ONLY_LINKS,
      id: "test-links-unsafe-render",
      links: [
        { label: "Ok", url: "https://example.invalid/ok" },
        { label: "Script", url: "javascript:alert(1)" },
        { label: "Data", url: "data:text/html,<script>alert(1)</script>" },
      ],
    };
    const html = await render_detail(unsafe, "upcoming");

    expect_clean(html, "detal z niebezpiecznymi linkami");
    expect(html).toContain('href="https://example.invalid/ok"');
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("data:text/html");
  });
});
