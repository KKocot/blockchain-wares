import { readFile } from "node:fs/promises";
import { createServer } from "node:http";

/**
 * Lokalne źródło logów dla testów — zastępuje zdalny endpoint właściciela.
 * Plik generuje `global_setup.ts` (timestampy względne wobec startu runnera),
 * więc odczyt jest przy każdym żądaniu, nie przy starcie serwera.
 */

const LOG_PATH = "/access.log";
const HEALTH_PATH = "/health";
const TEXT_HEADERS = {
  "content-type": "text/plain; charset=utf-8",
  "cache-control": "no-store",
};

const file = process.env.LOG_FIXTURE_FILE;
const host = process.env.LOG_FIXTURE_HOST ?? "127.0.0.1";
const port = Number(process.env.LOG_FIXTURE_PORT ?? "4322");

if (!file) {
  console.error("[log-fixture] LOG_FIXTURE_FILE is required");
  process.exit(1);
}

function send(response, status, body) {
  response.writeHead(status, TEXT_HEADERS);
  response.end(body);
}

const server = createServer((request, response) => {
  const path = (request.url ?? "/").split("?")[0];

  if (path === HEALTH_PATH) {
    send(response, 200, "ok\n");
    return;
  }
  if (path !== LOG_PATH) {
    send(response, 404, "not found\n");
    return;
  }

  readFile(file, "utf8").then(
    (text) => send(response, 200, text),
    // Serwer wstaje przed globalSetup, więc brak pliku to jeszcze nie awaria.
    () => send(response, 503, "log fixture not generated yet\n"),
  );
});

server.listen(port, host, () => {
  console.log(`[log-fixture] http://${host}:${port}${LOG_PATH}`);
});
