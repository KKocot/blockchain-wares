import { createServer } from "node:http";

/**
 * Lokalny moduł wydarzeń backend-api dla testów — zastępuje prawdziwy backend.
 * Kody i kształty odpowiedzi idą za routerem `blockchain-wares`: goły `TradeFairEvent`
 * (lista: goła tablica) na sukces, koperta `{ok:false,error}` na błąd, 201 na POST.
 * Stan żyje w pamięci procesu i zmieniają go mutacje panelu, więc `POST /__reset`
 * przywraca zestaw startowy; bez tego testy CRUD zależałyby od kolejności.
 */

const HEALTH_PATH = "/health";
const RESET_PATH = "/__reset";
const REQUESTS_PATH = "/__requests";
/**
 * Podglad naglowkow, ktore realnie doszly do modulu — stad spec czyta `User-Agent`
 * zadan SSR. Kursor jest monotoniczny (`?since=`), a nie indeks w tablicy: projekty
 * i workery Playwrighta chodza na jednym fixturze i przycinanie bufora przestawiloby
 * numerację pod cudzym kursorem. `/__reset` tego nie czysci z tego samego powodu.
 */
const REQUEST_LOG_LIMIT = 500;
// Tyle samo, ile hook `parse` mutujacych tras w backend-api — po przekroczeniu 413.
const BODY_LIMIT_BYTES = 64 * 1024;
const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

const prefix = (
  process.env.EVENTS_FIXTURE_PREFIX ?? "/blockchain-wares"
).replace(/\/+$/, "");
const host = process.env.EVENTS_FIXTURE_HOST ?? "127.0.0.1";
const port = Number(process.env.EVENTS_FIXTURE_PORT ?? "4323");
const api_key = process.env.EVENTS_FIXTURE_API_KEY;
const seed_raw = process.env.EVENTS_FIXTURE_SEED;

if (!api_key) {
  console.error("[events-fixture] EVENTS_FIXTURE_API_KEY is required");
  process.exit(1);
}
if (!seed_raw) {
  console.error("[events-fixture] EVENTS_FIXTURE_SEED is required");
  process.exit(1);
}

let seed;
try {
  seed = JSON.parse(seed_raw);
} catch {
  console.error("[events-fixture] EVENTS_FIXTURE_SEED is not valid JSON");
  process.exit(1);
}
if (!Array.isArray(seed)) {
  console.error("[events-fixture] EVENTS_FIXTURE_SEED must be a JSON array");
  process.exit(1);
}

const LIST_PATH = `${prefix}/events`;
const ITEM_PREFIX = `${LIST_PATH}/`;

/** Kopia glęboka, żeby mutacje testu nie przepisały zestawu startowego. */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

let events = clone(seed);

/** Rosnie bez konca; `entries` bywa przyciete od poczatku, kursor nie. */
let sequence = 0;
let entries = [];

function record(request, path) {
  sequence += 1;
  entries.push({
    seq: sequence,
    method: request.method,
    path,
    userAgent: request.headers["user-agent"] ?? null,
  });

  if (entries.length > REQUEST_LOG_LIMIT) {
    entries = entries.slice(-REQUEST_LOG_LIMIT);
  }
}

/** Zapisy nowsze niz `since`; `oldest` mowi, czy kursor nie wypadl juz z bufora. */
function read_entries(query) {
  const since = Number.parseInt(
    new URLSearchParams(query).get("since") ?? "",
    10,
  );
  const from = Number.isFinite(since) ? since : 0;

  return {
    next: sequence,
    oldest: entries.length === 0 ? sequence : entries[0].seq,
    entries: entries.filter((entry) => entry.seq > from),
  };
}

function send(response, status, payload) {
  response.writeHead(status, JSON_HEADERS);
  response.end(payload === undefined ? "" : JSON.stringify(payload));
}

/** Blad ma koperte `{ok:false,error}` — sukces jej nie ma, tak jak errorHandlerPlugin. */
function fail(response, status, message) {
  send(response, status, { ok: false, error: message });
}

function is_authorized(request) {
  return request.headers["x-api-key"] === api_key;
}

/**
 * `null` oznacza cialo ponad limitem. Nadmiar jest dolewany do konca zamiast
 * zrywac polaczenie — inaczej klient dostaje reset socketu zamiast kodu 413.
 */
function read_body(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let over_limit = false;

    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > BODY_LIMIT_BYTES) {
        over_limit = true;
        chunks.length = 0;
        return;
      }
      chunks.push(chunk);
    });
    request.on("error", reject);
    request.on("end", () =>
      resolve(over_limit ? null : Buffer.concat(chunks).toString("utf8")),
    );
  });
}

async function read_event_body(request, response) {
  let raw;
  try {
    raw = await read_body(request);
  } catch {
    fail(response, 400, "Request body could not be read.");
    return undefined;
  }

  if (raw === null) {
    fail(response, 413, "Request body is too large.");
    return undefined;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    fail(response, 400, "Request body is not valid JSON.");
    return undefined;
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    fail(response, 400, "Request body must be a JSON object.");
    return undefined;
  }

  return parsed;
}

function index_of(id) {
  return events.findIndex((event) => event.id === id);
}

async function handle_create(request, response) {
  const body = await read_event_body(request, response);
  if (!body) return;

  if (typeof body.id !== "string" || body.id.length === 0) {
    fail(response, 400, "Event id is required.");
    return;
  }
  if (index_of(body.id) !== -1) {
    fail(response, 409, `Event "${body.id}" already exists.`);
    return;
  }

  events.push(clone(body));
  send(response, 201, body);
}

/** PATCH scala cialo z zapisanym wydarzeniem — pol pominietych w ciele nie kasuje. */
async function handle_update(request, response, id) {
  const position = index_of(id);
  if (position === -1) {
    fail(response, 404, `Event "${id}" not found.`);
    return;
  }

  const body = await read_event_body(request, response);
  if (!body) return;

  const next_id =
    typeof body.id === "string" && body.id.length > 0 ? body.id : id;
  if (next_id !== id && index_of(next_id) !== -1) {
    fail(response, 409, `Event "${next_id}" already exists.`);
    return;
  }

  const updated = { ...events[position], ...clone(body), id: next_id };

  events[position] = updated;
  send(response, 200, updated);
}

function handle_delete(response, id) {
  const position = index_of(id);
  if (position === -1) {
    fail(response, 404, `Event "${id}" not found.`);
    return;
  }

  const [removed] = events.splice(position, 1);
  send(response, 200, removed);
}

async function route(request, response, path, query) {
  if (path === REQUESTS_PATH) {
    send(response, 200, read_entries(query));
    return;
  }

  if (path === HEALTH_PATH) {
    send(response, 200, { status: "ok", events: events.length });
    return;
  }

  if (path === RESET_PATH) {
    if (request.method !== "POST") {
      fail(response, 405, "Reset accepts POST only.");
      return;
    }
    events = clone(seed);
    send(response, 200, { ok: true, events: events.length });
    return;
  }

  if (path === LIST_PATH) {
    if (request.method === "GET") {
      // Goła tablica, bez koperty — kontrakt routera backend-api.
      send(response, 200, events);
      return;
    }
    if (request.method === "POST") {
      if (!is_authorized(request)) {
        fail(response, 401, "Missing or invalid X-API-Key.");
        return;
      }
      await handle_create(request, response);
      return;
    }
    fail(response, 405, `Method ${request.method} not allowed on ${path}.`);
    return;
  }

  if (path.startsWith(ITEM_PREFIX)) {
    const id = decodeURIComponent(path.slice(ITEM_PREFIX.length));

    if (id.length === 0 || id.includes("/")) {
      fail(response, 404, "Not found.");
      return;
    }

    if (request.method === "GET") {
      const event = events.find((candidate) => candidate.id === id);
      if (!event) {
        fail(response, 404, `Event "${id}" not found.`);
        return;
      }
      send(response, 200, event);
      return;
    }

    if (!is_authorized(request)) {
      fail(response, 401, "Missing or invalid X-API-Key.");
      return;
    }

    if (request.method === "PATCH") {
      await handle_update(request, response, id);
      return;
    }
    // Backend nie ma trasy PUT: aktualizacja scala patcha z dokumentem z bazy.
    // Cichy alias o semantyce patcha przepuscilby klienta, ktory na produkcji dostanie 404.
    if (request.method === "PUT") {
      fail(
        response,
        405,
        "Events are updated with PATCH; the API has no PUT route.",
      );
      return;
    }
    if (request.method === "DELETE") {
      handle_delete(response, id);
      return;
    }

    fail(response, 405, `Method ${request.method} not allowed on ${path}.`);
    return;
  }

  fail(response, 404, "Not found.");
}

const server = createServer((request, response) => {
  const [path, query = ""] = (request.url ?? "/").split("?");

  // Tylko trasy modulu: health-check webServera i odpyty samego podgladu to nie ruch aplikacji.
  if (path === LIST_PATH || path.startsWith(ITEM_PREFIX)) {
    record(request, path);
  }

  route(request, response, path, query).catch((error) => {
    console.error("[events-fixture] request failed", error);
    if (!response.headersSent) {
      fail(response, 500, "Fixture failure.");
      return;
    }
    response.end();
  });
});

server.on("error", (error) => {
  const detail =
    error.code === "EADDRINUSE"
      ? `port ${port} is already in use`
      : error.message;
  console.error(
    `[events-fixture] cannot listen on ${host}:${port} — ${detail}`,
  );
  process.exit(1);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}

server.listen(port, host, () => {
  console.log(
    `[events-fixture] http://${host}:${port}${LIST_PATH} (${events.length} events)`,
  );
});
