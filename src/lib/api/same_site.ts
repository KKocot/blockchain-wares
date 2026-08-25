import { get_site_origin } from "../env";

/**
 * W devie kanonicznym originem jest domena produkcyjna, wiec bez tej listy
 * logowanie z `npm run dev` i testy E2E dostawalyby 403. Vite podmienia
 * `import.meta.env.DEV` na `false` przy buildzie, wiec w obrazie produkcyjnym
 * ta sciezka w ogole nie istnieje.
 */
const DEV_ORIGIN_HOSTNAMES: ReadonlySet<string> = new Set([
  "localhost",
  "127.0.0.1",
  "[::1]",
]);

/**
 * Odsiewa cross-site POST-y do endpointow zmieniajacych sesje. Porownanie idzie
 * do originu z konfiguracji, nigdy do `Host`/`X-Forwarded-Host` z zadania —
 * te naglowki kontroluje ten sam klient, ktory przysyla `Origin`.
 */
export function is_same_site_request(request: Request): boolean {
  const source =
    request.headers.get("origin") ?? request.headers.get("referer");
  // Brak obu naglowkow = klient nieprzegladarkowy (curl, healthcheck). Przegladarka
  // przy POST zawsze dokleja Origin, wiec takie zadanie nie jest wektorem CSRF —
  // odrzucanie go zablokowaloby tylko wywolania z konsoli i monitoringu.
  if (source === null) return true;

  let origin: URL;
  try {
    origin = new URL(source);
  } catch {
    // Tu wpada m.in. `Origin: null` (sandboxowana ramka, redirect cross-origin).
    return false;
  }
  if (origin.protocol !== "https:" && origin.protocol !== "http:") return false;

  if (is_dev_runtime() && DEV_ORIGIN_HOSTNAMES.has(origin.hostname)) {
    return true;
  }

  return (
    `${origin.protocol}//${origin.host}`.toLowerCase() === get_site_origin()
  );
}

function is_dev_runtime(): boolean {
  const meta_env = import.meta.env as unknown as
    | Record<string, unknown>
    | undefined;
  return meta_env?.DEV === true && meta_env?.PROD === false;
}
