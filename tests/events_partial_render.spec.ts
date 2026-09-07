import { expect, test } from "@playwright/test";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer, type ViteDevServer } from "vite";
import {
  DETAILS_PENDING_LONG,
  DETAILS_PENDING_SHORT,
  STATUS_THEME,
} from "../src/components/event-theme";
import {
  UNTITLED_EVENT_NAME,
  type EventStatus,
  type TradeFairEvent,
} from "../src/components/events-data";

/**
 * Render szkiców: co widać, gdy wydarzenie ma tylko część pól. Komponenty idą przez
 * Vite, bo runner Playwrighta kompiluje JSX na własny runtime komponentowy i
 * `renderToStaticMarkup` dostałby wtedy obiekty `__pw_type` zamiast elementów Reacta.
 */

/** Ślady po brakującym polu, których żaden wariant nie ma prawa zostawić w HTML-u. */
const ARTIFACTS: readonly { what: string; pattern: RegExp }[] = [
  { what: "surowy brak wartości", pattern: /undefined|\[object Object\]|NaN/ },
  {
    what: "pusty element",
    pattern:
      /<(p|span|ul|li|dd|dt|h[1-6])\b(?![^>]*aria-hidden)[^>]*>\s*<\/\1>/,
  },
  { what: "wiszący przecinek", pattern: />\s*,\s*<\// },
];

const MAPS_PREFIX = "https://www.google.com/maps";

const BARE: TradeFairEvent = { id: "draft-bare" };
const NAMED: TradeFairEvent = { ...BARE, id: "draft-named", name: "Draft" };
const DATED: TradeFairEvent = {
  id: "draft-dated",
  name: "Dated Draft",
  startDate: "2099-01-16",
  endDate: "2099-01-17",
};
/** Znamy salę, nie znamy adresu — dojazdu nie ma z czego zbudować */
const VENUE_NAMED: TradeFairEvent = {
  ...DATED,
  id: "draft-venue-named",
  venue: { name: "Draft Congress Hall" },
};
/** Ulica bez miasta: mapa szukałaby jej po całym świecie i trafiła gdzie indziej */
const VENUE_HOMELESS: TradeFairEvent = {
  ...DATED,
  id: "draft-venue-homeless",
  venue: { name: "Draft Congress Hall", streetAddress: "Draft Street 49" },
};
const LOCATED: TradeFairEvent = {
  ...VENUE_HOMELESS,
  id: "draft-located",
  city: "Barcelona",
  country: "Spain",
  venue: {
    name: "Draft Congress Hall",
    streetAddress: "Draft Street 49",
    postalCode: "08019",
  },
};

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
  related: { event: TradeFairEvent; status: EventStatus }[] = [],
): Promise<string> {
  const EventDetail = await load<{
    event: TradeFairEvent;
    status: EventStatus;
    related: { event: TradeFairEvent; status: EventStatus }[];
  }>("/src/components/EventDetail.tsx", "EventDetail");

  return renderToStaticMarkup(
    createElement(EventDetail, { event, status, related }),
  );
}

/** Widoczna treść: same węzły tekstowe, sklejone tak, jak czyta je przeglądarka */
function text_of(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

function expect_clean(html: string, where: string): void {
  for (const { what, pattern } of ARTIFACTS) {
    expect(pattern.test(html), `${where}: ${what} w HTML-u`).toBe(false);
  }
}

test.describe("Karta wydarzenia przy niepełnych danych", () => {
  test("sam identyfikator: nazwa zastępcza, status i zapowiedź szczegółów", async () => {
    const html = await render_card(BARE, "undated");

    expect_clean(html, "karta szkicu");
    expect(html).toContain(UNTITLED_EVENT_NAME);
    expect(html).toContain(STATUS_THEME.undated.label);
    expect(html).toContain(DETAILS_PENDING_SHORT);
    // Bez opisu i bez dat karta zostaje kartą: własne tło, ramka i promień rogów.
    expect(html.startsWith("<article")).toBe(true);
    expect(html).toContain("rounded-[32px]");
  });

  test("nazwa i daty: blok daty wraca, zapowiedź szczegółów znika", async () => {
    const html = await render_card(DATED, "upcoming");

    expect_clean(html, "karta z datami");
    expect(html).toContain("Jan");
    expect(html).not.toContain(DETAILS_PENDING_SHORT);
  });

  test("sama nazwa miejsca nie robi z siebie dojazdu", async () => {
    const html = await render_card(VENUE_NAMED, "upcoming");

    expect_clean(html, "karta z samą nazwą miejsca");
    expect(html).toContain("Draft Congress Hall");
    expect(html).not.toContain(MAPS_PREFIX);
  });

  test("adres bez miasta też nie — link prowadziłby w złe miejsce", async () => {
    const html = await render_card(VENUE_HOMELESS, "upcoming");

    expect_clean(html, "karta z adresem bez miasta");
    expect(html).not.toContain(MAPS_PREFIX);
  });

  test("komplet danych zostaje bez zmian i dostaje dojazd", async () => {
    const html = await render_card(LOCATED, "upcoming");

    expect_clean(html, "karta kompletna");
    expect(html).toContain("Barcelona, Spain");
    expect(html).toContain(MAPS_PREFIX);
  });
});

test.describe("Baner przy niepełnych danych", () => {
  test("wpis bez miasta nie zostawia separatora bez sąsiada", async () => {
    const html = await render_banner(DATED);

    expect_clean(html, "baner bez miasta");
    expect(html).not.toContain("·");
    expect(text_of(html)).toContain("Jan 16–17, 2099");
    expect(text_of(html)).toContain("We are going to Dated Draft");
  });

  test("bez nazwy promowany wpis dalej ma o czym mówić", async () => {
    const html = await render_banner({ ...DATED, name: undefined });

    expect_clean(html, "baner bez nazwy");
    expect(html).toContain(`We are going to ${UNTITLED_EVENT_NAME}`);
  });

  test("samo państwo staje w miejscu nieznanego miasta", async () => {
    const html = await render_banner({ ...DATED, country: "Spain" });

    expect_clean(html, "baner bez miasta, z państwem");
    expect(html).toContain("Spain");
    expect(html.match(/·/g) ?? []).toHaveLength(1);
  });

  test("data, godziny i miasto rozdziela dokładnie tyle separatorów, ile przerw", async () => {
    const html = await render_banner({
      ...LOCATED,
      schedule: {
        startTime: "10:00",
        endTime: "16:00",
        utcOffset: "+02:00",
        timeZoneLabel: "CEST",
      },
    });

    expect_clean(html, "baner kompletny");
    expect(html.match(/·/g) ?? []).toHaveLength(2);
  });
});

test.describe("Strona wydarzenia przy niepełnych danych", () => {
  test("sam identyfikator: strona mówi, że szczegóły są w drodze", async () => {
    const html = await render_detail(BARE, "undated");

    expect_clean(html, "detal szkicu");
    expect(html).toContain(UNTITLED_EVENT_NAME);
    expect(html).toContain(STATUS_THEME.undated.label);
    expect(html).toContain(DETAILS_PENDING_LONG);
    // Puste sekcje znikają razem z nagłówkami, panel zostaje samym wezwaniem do kontaktu.
    for (const heading of ["When", "Where", "Admission", "Organizer"]) {
      expect(html, `nagłówek „${heading}” bez treści`).not.toContain(
        `>${heading}<`,
      );
    }
    expect(html).not.toContain("Topics");
    expect(html).not.toContain("What it is");
    expect(html).not.toContain("<dl");
    expect(html).toContain("Get in touch");
  });

  test("sama nazwa: nagłówek bez wiersza z datą i miejscem", async () => {
    const html = await render_detail(NAMED, "undated");

    expect_clean(html, "detal z samą nazwą");
    expect(html).toContain("Draft");
    expect(html).toContain(DETAILS_PENDING_LONG);
  });

  test("nazwa i daty: wiersz nagłówka to sama data, bez separatora na końcu", async () => {
    const html = await render_detail(DATED, "upcoming");

    expect_clean(html, "detal z datami");
    expect(text_of(html)).toContain("Jan 16–17, 2099");
    expect(html).not.toContain(" · ");
    expect(html).toContain(">When<");
    expect(html).not.toContain(">Where<");
  });

  test("miejsce bez adresu: sekcja „Where” jest, dojazdu nie ma", async () => {
    const html = await render_detail(VENUE_NAMED, "upcoming");

    expect_clean(html, "detal z samą nazwą miejsca");
    expect(html).toContain(">Where<");
    expect(html).toContain("Draft Congress Hall");
    expect(html).not.toContain(MAPS_PREFIX);
  });

  test("adres bez miasta nie generuje linku prowadzącego w złe miejsce", async () => {
    const html = await render_detail(VENUE_HOMELESS, "upcoming");

    expect_clean(html, "detal z adresem bez miasta");
    expect(html).not.toContain(MAPS_PREFIX);
  });

  test("komplet: data, miejsce i dojazd stoją obok siebie", async () => {
    const html = await render_detail(LOCATED, "upcoming");

    expect_clean(html, "detal kompletny");
    expect(html).toContain("Jan 16–17, 2099 · Barcelona, Spain");
    expect(html).toContain(MAPS_PREFIX);
  });

  test("szkic na liście innych wydarzeń dostaje status zamiast pustej kolumny", async () => {
    const html = await render_detail(LOCATED, "upcoming", [
      { event: BARE, status: "undated" },
      { event: DATED, status: "upcoming" },
    ]);

    expect_clean(html, "lista innych wydarzeń");
    expect(html).toContain(STATUS_THEME.undated.label);
    expect(html).toContain(UNTITLED_EVENT_NAME);
  });
});
