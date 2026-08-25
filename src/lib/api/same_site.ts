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
 * Hosty biezacego deploymentu, bez schematu — wstrzykuje je Vercel, wiec sa
 * niepodrabialne przez klienta, inaczej niz `Host`/`X-Forwarded-Host`.
 */
const PLATFORM_HOST_VARIABLES = [
  "VERCEL_URL",
  "VERCEL_BRANCH_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
] as const;

/**
 * Odsiewa cross-site POST-y do endpointow zmieniajacych sesje. Porownanie idzie
 * do originu z konfiguracji, nigdy do `Host`/`X-Forwarded-Host` z zadania —
 * te naglowki kontroluje ten sam klient, ktory przysyla `Origin`.
 */
export function is_same_site_request(request: Request): boolean {
  if (is_cross_site_fetch(request)) return false;

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

  return trusted_origins().has(
    `${origin.protocol}//${origin.host}`.toLowerCase(),
  );
}

/**
 * Druga bariera CSRF: formularz z obcej domeny wysyla `Sec-Fetch-Site: cross-site`.
 * Brak naglowka (curl, healthcheck) przepuszczamy — ocene przejmuje guard na `Origin`.
 */
function is_cross_site_fetch(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  return site !== null && site !== "same-origin" && site !== "none";
}

/**
 * Kanoniczny origin plus adresy biezacego deploymentu. Bez tych drugich logowanie
 * pod `*.vercel.app` (podglad, deploy bez przepietego DNS) konczy sie wlasnym 403.
 */
function trusted_origins(): ReadonlySet<string> {
  const origins = new Set([get_site_origin()]);
  for (const variable of PLATFORM_HOST_VARIABLES) {
    const origin = platform_origin(process.env[variable]);
    if (origin !== null) origins.add(origin);
  }
  return origins;
}

/** Vercel podaje sam host, bez schematu — jego domeny chodza wylacznie po https. */
function platform_origin(host: string | undefined): string | null {
  const trimmed = host?.trim();
  if (trimmed === undefined || trimmed.length === 0) return null;

  try {
    const url = new URL(`https://${trimmed}`);
    return url.host.length === 0
      ? null
      : `${url.protocol}//${url.host}`.toLowerCase();
  } catch {
    return null;
  }
}

function is_dev_runtime(): boolean {
  const meta_env = import.meta.env as unknown as
    | Record<string, unknown>
    | undefined;
  return meta_env?.DEV === true && meta_env?.PROD === false;
}
