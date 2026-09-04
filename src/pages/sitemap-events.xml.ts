import type { APIRoute } from "astro";
import { get_event_path, type TradeFairEvent } from "../components/events-data";
import { get_events_ttl_millis } from "../lib/env";
import { load_events } from "../lib/events";

// Wydarzenia przychodza z API w runtime, wiec ich URL-e nie istnieja w chwili builda
export const prerender = false;

/** Tyle samo, co cooldown zrodla wydarzen — robot ponawiajacy szybciej trafi w te sama awarie */
const RETRY_AFTER_SECONDS = "60";

/** Sitemapa moze byc nieaktualna dluzej niz swieza — lepsza stara lista niz 503 pod ruchem robotow */
const STALE_WHILE_REVALIDATE_SECONDS = 86_400;

const SOURCE_DOWN_BODY =
  "Events source unavailable. This sitemap is temporarily out of service; the events it lists are not.\n";

/**
 * Milczacy backend to nie jest dowod, ze wydarzen nie ma. Pusty `<urlset>` z kodem 200
 * powiedzialby robotom, ze `/markets/<id>` mozna wyindeksowac — a to stan przejsciowy,
 * ktory przezyje awarie. 503 kaze wrocic i zostawia poprzednia wersje sitemapy w mocy.
 */
function source_down(): Response {
  return new Response(SOURCE_DOWN_BODY, {
    status: 503,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Retry-After": RETRY_AFTER_SECONDS,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/** `id` wydarzenia pochodzi z API i laduje w tresci elementu — sam `new URL()` tego nie domyka */
function escape_xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function render_urlset(locations: readonly string[]): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...locations.map((loc) => `  <url><loc>${escape_xml(loc)}</loc></url>`),
    "</urlset>",
    "",
  ].join("\n");
}

export const GET: APIRoute = async (context) => {
  let events: TradeFairEvent[];
  try {
    ({ events } = await load_events());
  } catch (cause) {
    console.error(
      "[sitemap-events] events source failed:",
      cause instanceof Error ? cause.message : "unknown error",
    );
    return source_down();
  }

  // `site` z astro.config.mjs; origin requestu ratuje tylko konfiguracje bez `site`
  const site = context.site ?? new URL(context.url.origin);
  // Ten sam helper, co `canonicalPath` trasy detalu — inaczej sitemap wskazywalaby
  // adresy, ktore kanonicznie nie istnieja.
  const body = render_urlset(
    events.map((event) => new URL(get_event_path(event), site).href),
  );

  // Odpowiedz jest swieza tak dlugo, jak cache zrodla — robot nie ma powodu budzic API
  // czesciej, niz sitemapa moze sie zmienic. Wartosc przeszla juz walidacje w `load_events()`.
  const max_age = Math.floor(get_events_ttl_millis() / 1000);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, max-age=${max_age}, s-maxage=${max_age}, stale-while-revalidate=${STALE_WHILE_REVALIDATE_SECONDS}`,
      "X-Content-Type-Options": "nosniff",
    },
  });
};
