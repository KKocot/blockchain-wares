import type { TradeFairEvent } from "../../components/events-data";
import { get_events_api_url, get_events_ttl_millis } from "../env";
import { SSR_USER_AGENT } from "../net/user_agent";
import { parse_event } from "./parse_event";
import type {
  EventsCacheEntry,
  EventsSnapshot,
  EventsSourceError,
  EventsSourceErrorKind,
  EventsSourceStatus,
  LoadEventsOptions,
} from "./types";

/**
 * Lista wydarzen to kilka kilobajtow JSON-a, na ktore czeka odwiedzajacy w trakcie
 * SSR — sekundy, nie minuty jak przy wielosetmegabajtowym logu nginx. 5 s miesci
 * zimne polaczenie backendu z Mongo, a przy martwym API strona poddaje sie sama,
 * na dlugo przed `maxDuration` adaptera (90 s w astro.config.mjs).
 */
const FETCH_TIMEOUT_MS = 5_000;

/**
 * Po nieudanej probie strony z niepustym cache oddaja stale dane od razu, zamiast
 * placic pelny timeout na kazdym renderze. Dedup przez `inflight` tego nie zalatwia:
 * dziala tylko w obrebie jednej cieplej instancji. Zimny cache nie ma cooldownu —
 * tam nie ma czego oddac, wiec kazde wejscie probuje od nowa.
 */
const FAILURE_COOLDOWN_MS = 20_000;

const EVENTS_LIST_PATH = "/events";

let cache: EventsCacheEntry | null = null;
let last_error: EventsSourceError | null = null;
/** Chwila ostatniej nieudanej proby — poczatek cooldownu. */
let failed_at: number | null = null;
/** Rownolegle rendery stron maja dzielic jedno pobranie, nie zalewac backendu. */
let inflight: Promise<EventsCacheEntry> | null = null;
/** Rosnie przy kazdej inwalidacji — wynik z poprzedniej generacji nie zapisze cache. */
let generation = 0;

class EventsSourceFailure extends Error {
  constructor(
    readonly kind: EventsSourceErrorKind,
    message: string,
  ) {
    super(message);
    this.name = "EventsSourceFailure";
  }
}

/**
 * Sciezka doklejana jest konkatenacja, nie `new URL(path, base)` — konstruktor gubi
 * ostatni segment bazy (`https://host/blockchain-wares` -> `https://host/events`).
 * `get_events_api_url()` przepuszcza baze z `?query` i `#fragment`, a wtedy konkatenacja
 * dalaby adres w rodzaju `.../base?x=1/events` — lepiej nazwac zla konfiguracje wprost.
 */
function build_list_url(): string {
  const base = get_events_api_url();

  if (base.includes("?") || base.includes("#")) {
    throw new EventsSourceFailure(
      "misconfigured",
      "EVENTS_API_URL must be a plain base URL: a query string or fragment breaks path concatenation.",
    );
  }

  return `${base}${EVENTS_LIST_PATH}`;
}

function is_aborted(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "TimeoutError" || error.name === "AbortError")
  );
}

/**
 * Komunikaty powstaja tutaj, a nie z bledu fetcha: base URL moze nosic dane
 * logowania w czesci userinfo i nie ma prawa wyciec do logow aplikacji.
 */
function describe_network_failure(error: unknown): EventsSourceFailure {
  return is_aborted(error)
    ? new EventsSourceFailure(
        "timeout",
        `Events API did not respond within ${FETCH_TIMEOUT_MS / 1000}s.`,
      )
    : new EventsSourceFailure("unreachable", "Events API is unreachable.");
}

/** Endpoint listy jest publiczny — klucz serwisowy idzie tylko przy mutacjach. */
async function fetch_entry(): Promise<EventsCacheEntry> {
  const url = build_list_url();

  let response: Response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        accept: "application/json",
        "user-agent": SSR_USER_AGENT,
      },
      redirect: "follow",
    });
  } catch (error) {
    throw describe_network_failure(error);
  }

  if (!response.ok) {
    throw new EventsSourceFailure(
      "http_status",
      `Events API responded with HTTP ${response.status}.`,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    // Timeout w trakcie czytania ciala to awaria sieci, nie zly JSON — inaczej
    // panel zrzucalby awarie backendu na nasza strone.
    if (is_aborted(error)) throw describe_network_failure(error);
    throw new EventsSourceFailure(
      "malformed_payload",
      "Events API returned a body that is not valid JSON.",
    );
  }

  // Router zwraca gola tablice, bez koperty. Gdyby kiedys doszla paginacja
  // (`{ data, total }`), ma polec tutaj, a nie przejsc cicho bez metadanych.
  if (!Array.isArray(payload)) {
    throw new EventsSourceFailure(
      "malformed_payload",
      "Events API did not return a list of events.",
    );
  }

  return build_entry(payload);
}

/**
 * Rekord bez wymaganych pol wypada z listy, a nie wywala renderu. Duplikat `id` tez:
 * `get_event_by_id()` buduje mape rzucajaca na duplikacie, wiec drugi wpis o tym
 * samym slugu polozylby cala trase `/markets/<id>`.
 *
 * Ale odpadniecie CALEJ niepustej listy to nie jest stan do zapisania w cache —
 * tak wyglada dryf kontraktu po stronie backendu. Blad zostawia poprzednie
 * wydarzenia na stronie, zamiast po cichu zamienic je na pustke.
 */
function build_entry(list: readonly unknown[]): EventsCacheEntry {
  const events: TradeFairEvent[] = [];
  const seen = new Set<string>();
  let rejected = 0;

  for (const item of list) {
    const event = parse_event(item);
    if (event === null || seen.has(event.id)) {
      rejected += 1;
      continue;
    }

    seen.add(event.id);
    events.push(event);
  }

  if (list.length > 0 && events.length === 0) {
    throw new EventsSourceFailure(
      "malformed_payload",
      `Events API returned ${list.length} records and none of them are usable.`,
    );
  }

  return { events, fetchedAt: Date.now(), rejected, expired: false };
}

function refresh(): Promise<EventsCacheEntry> {
  const started_in = generation;

  inflight ??= fetch_entry()
    .then((entry) => {
      if (started_in === generation) {
        cache = entry;
        last_error = null;
        failed_at = null;
      }
      return entry;
    })
    .finally(() => {
      // Bez tego warunku pobranie z martwej generacji skasowaloby cudzy `inflight`.
      if (started_in === generation) inflight = null;
    });

  return inflight;
}

function describe(
  entry: EventsCacheEntry | null,
  ttl: number,
): EventsSourceStatus {
  if (entry === null) {
    return {
      fetchedAt: null,
      ageMillis: null,
      stale: true,
      error: last_error,
      events: 0,
      rejected: 0,
    };
  }

  const age = Date.now() - entry.fetchedAt;
  return {
    fetchedAt: new Date(entry.fetchedAt).toISOString(),
    ageMillis: age,
    stale: entry.expired || age > ttl,
    error: last_error,
    events: entry.events.length,
    rejected: entry.rejected,
  };
}

/** Kopia tablicy, bo konsument sortujacy ja w miejscu przestawilby zawartosc cache. */
function snapshot(entry: EventsCacheEntry, ttl: number): EventsSnapshot {
  return { events: [...entry.events], status: describe(entry, ttl) };
}

function to_source_error(error: unknown): EventsSourceError {
  if (error instanceof EventsSourceFailure) {
    return { kind: error.kind, message: error.message };
  }

  // Realny przypadek spoza fetcha to brakujaca zmienna srodowiskowa z `env.ts`.
  return {
    kind: "misconfigured",
    message: error instanceof Error ? error.message : String(error),
  };
}

function is_usable(entry: EventsCacheEntry, ttl: number): boolean {
  return !entry.expired && Date.now() - entry.fetchedAt < ttl;
}

function in_failure_cooldown(): boolean {
  return failed_at !== null && Date.now() - failed_at < FAILURE_COOLDOWN_MS;
}

/**
 * Backend moze paść w dowolnej chwili, a strona ma wtedy pokazac ostatnie znane
 * wydarzenia z adnotacja o bledzie i wieku. Wyjatek leci dopiero, gdy cache jest
 * pusty — wtedy nie ma czego pokazac. Nieudane pobranie nie zostawia po sobie
 * `inflight`, wiec ponowienie jest mozliwe od razu; cooldown tylko zdejmuje je
 * z kazdego pojedynczego requestu pod ruchem.
 */
export async function load_events(
  options: LoadEventsOptions = {},
): Promise<EventsSnapshot> {
  const ttl = get_events_ttl_millis();
  const started_in = generation;
  const cached = cache;
  const forced = options.force === true;

  if (
    cached !== null &&
    !forced &&
    (is_usable(cached, ttl) || in_failure_cooldown())
  ) {
    return snapshot(cached, ttl);
  }

  try {
    return snapshot(await refresh(), ttl);
  } catch (error) {
    const failure = to_source_error(error);
    // Generacja mogla sie zmienic w trakcie: blad z porzuconego pobrania nie ma
    // prawa nadpisac `null` zapisanego przez nowsze, udane odswiezenie.
    if (started_in === generation) {
      last_error = failure;
      failed_at = Date.now();
    }
    if (cached === null) {
      throw error instanceof Error ? error : new Error(failure.message);
    }
    return snapshot(cached, ttl);
  }
}

/** Stan cache bez ruszania sieci — do naglowka panelu i ostrzezenia na stronie. */
export function get_events_source_status(): EventsSourceStatus {
  return describe(cache, get_events_ttl_millis());
}

/**
 * Po zapisie wydarzenia panel i strony publiczne maja zobaczyc zmiane od razu.
 * Wpis jest wygaszany, a nie kasowany: gdyby najblizsze pobranie padlo, pusty cache
 * zostawilby strony publiczne bez zadnych wydarzen — jedyna ochrona przed awaria API
 * znikalaby przy kazdym zapisie. Trwajace pobranie jest porzucane, bo wystartowalo
 * przed mutacja; licznik generacji blokuje zapis jego wyniku.
 */
export function invalidate_events_cache(): void {
  generation += 1;
  inflight = null;
  last_error = null;
  failed_at = null;
  if (cache !== null) cache = { ...cache, expired: true };
}
