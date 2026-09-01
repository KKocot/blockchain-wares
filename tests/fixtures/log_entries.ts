/**
 * Surowe wpisy syntetycznego logu nginx. Liczniki, których oczekują testy, liczy
 * `access_log.ts` — tutaj jest wyłącznie zbiór danych.
 *
 * Ruch odwiedzających pochodzi z pul dokumentacyjnych RFC 5737 (192.0.2.0/24,
 * 198.51.100.0/24, 203.0.113.0/24) — żaden adres nie należy do realnego hosta.
 * Osobny blok GEO_SOURCES używa adresów publicznej infrastruktury, bo pule
 * dokumentacyjne nie mają w zbiorze DB-IP przypisanego kraju.
 *
 * Każda z sześciu kategorii ruchu nie-ludzkiego ma własne adresy IP — dzięki temu
 * test pojedynczej flagi `exclude*` może sprawdzić, że zniknęła dokładnie ta jedna
 * kategoria, a pozostałe zostały nietknięte.
 */

import {
  AHREFS_UA,
  BINGBOT_UA,
  CHROME_WIN,
  CURL_UA,
  DUCKDUCKBOT_UA,
  EDGE_WIN,
  FACEBOOK_UA,
  FIREFOX_LINUX,
  GOOGLEBOT_UA,
  HEADLESS_UA,
  HOSTILE_UA_RAW,
  EMPTY_UA,
  NO_UA,
  PYTHON_UA,
  SAFARI_IOS,
  SAFARI_MAC,
  SEMRUSH_UA,
  WGET_UA,
} from "./user_agents";

export interface LogEntry {
  ip: string;
  /** Przesunięcie względem chwili generowania — inaczej dane zestarzałyby się i testy zaczęłyby padać. */
  minutes_ago: number;
  method: string;
  /** Ścieżka razem z query, tak jak w linii requestu. */
  target: string;
  status: number;
  bytes: number;
  referrer: string;
  /** Zapis nginx-a: cudzysłów jako `\x22`, nie jako znak dosłowny. */
  ua: string;
  xff: string;
  lang: string;
}

export const INTERNAL_IP = "127.0.0.1";
export const INTERNAL_PATH = "/healthz";

/** Wpis, w którym nagłówek X-Forwarded-For celowo kłamie o adresie klienta. */
export const SPOOFED_XFF_PATH = "/kariera";
export const SPOOFED_XFF_REMOTE_ADDR = "198.51.100.23";
export const SPOOFED_XFF_HEADER_IP = "203.0.113.200";

/** Fragment występujący wyłącznie we wpisie skanera — używany jako filtr w teście XSS. */
export const HOSTILE_MARKER = "<script>alert(1)</script>";
export const HOSTILE_PATH = "/wp-login.php";
export const HOSTILE_IP = "203.0.113.66";
const HOSTILE_REFERRER_RAW =
  "http://198.51.100.9/<script>alert(1)</script>?q=\\x22x\\x22";
/** Ta sama wartość po odkodowaniu `\x22` — dokładnie tak ma wylądować w DOM jako TEKST. */
export const HOSTILE_REFERRER =
  'http://198.51.100.9/<script>alert(1)</script>?q="x"';

/** Wpis bez User-Agenta (`-` w logu nginx): `is_bot` go nie łapie, `browser` to `Unknown`. */
export const NO_UA_PATH = "/oferta";
export const NO_UA_IP = "198.51.100.90";

/** Ten sam brak UA, tyle że wysłany jako pusty string — nie może wpaść do „UA nierozpoznany”. */
export const EMPTY_UA_PATH = "/polityka-prywatnosci";
export const EMPTY_UA_IP = "198.51.100.91";

/** Ścieżka wyłączna dla skanera — pozwala zawęzić tabelę do samego bota. */
export const BOT_PATH = "/phpmyadmin/index.php";

interface Visitor {
  ip: string;
  ua: string;
  lang: string;
}

const VISITORS: readonly Visitor[] = [
  { ip: "192.0.2.11", ua: CHROME_WIN, lang: "pl-PL,pl;q=0.9,en-US;q=0.8" },
  { ip: "192.0.2.42", ua: SAFARI_MAC, lang: "en-US,en;q=0.9" },
  { ip: "198.51.100.7", ua: FIREFOX_LINUX, lang: "de-DE,de;q=0.8" },
  { ip: "198.51.100.64", ua: SAFARI_IOS, lang: "pl-PL,pl;q=0.9" },
  { ip: "203.0.113.5", ua: EDGE_WIN, lang: "en-GB,en;q=0.7" },
];

export interface GeoSource {
  ip: string;
  /** Kod ISO 3166-1 alpha-2, jaki `lookup_country` zwraca dla tego adresu. */
  country: string;
  /** Ścieżka wyłączna dla tego adresu — pozwala zawęzić tabelę filtrem „Ścieżka”. */
  path: string;
  hits: number;
  ua: string;
  lang: string;
}

/**
 * Publiczna infrastruktura: resolwery DNS i węzły ISP. To nie są adresy
 * odwiedzających, tylko powszechnie znane hosty, których kraj jest stały —
 * bez nich kolumna „Kraj” i karta krajów mierzyłyby wyłącznie ścieżkę `null`.
 * Kody zweryfikowane na `src/lib/geo/lookup.ts`.
 */
export const GEO_IPV4: GeoSource = {
  ip: "8.8.8.8",
  country: "US",
  path: "/o-nas",
  hits: 3,
  ua: CHROME_WIN,
  lang: "en-US,en;q=0.9",
};

/** Log nginx zapisuje IPv6 dosłownie, więc mapowanie musi działać i na dwukropkach. */
export const GEO_IPV6: GeoSource = {
  ip: "2a00:1450:401b:804::200e",
  country: "PL",
  path: "/kontakt",
  hits: 2,
  ua: SAFARI_MAC,
  lang: "pl-PL,pl;q=0.9",
};

export const GEO_SOURCES: readonly GeoSource[] = [
  GEO_IPV4,
  GEO_IPV6,
  {
    ip: "1.1.1.1",
    country: "AU",
    path: "/uslugi",
    hits: 2,
    ua: EDGE_WIN,
    lang: "en-AU,en;q=0.9",
  },
  {
    ip: "212.77.98.9",
    country: "PL",
    path: "/",
    hits: 3,
    ua: FIREFOX_LINUX,
    lang: "pl-PL,pl;q=0.9",
  },
  {
    ip: "2001:4860:4860::8888",
    country: "CA",
    path: "/nasz-zespol",
    hits: 2,
    ua: SAFARI_IOS,
    lang: "en-CA,en;q=0.9",
  },
];

const REFERRERS: readonly string[] = [
  "-",
  "https://www.google.com/",
  "https://hive.io/",
  "-",
  "https://www.linkedin.com/company/blockchainwares/",
];

interface ViewsSpec {
  count: number;
  from_minutes: number;
  step_minutes: number;
  target: (index: number) => string;
  status?: number;
  bytes?: number;
}

/** Ruch przeglądarkowy: profile odwiedzających i referrery rotują deterministycznie. */
function page_views(spec: ViewsSpec): LogEntry[] {
  return Array.from({ length: spec.count }, (_, index) => {
    const visitor = VISITORS[index % VISITORS.length];
    return {
      ip: visitor.ip,
      minutes_ago: spec.from_minutes - index * spec.step_minutes,
      method: "GET",
      target: spec.target(index),
      status: spec.status ?? 200,
      bytes: spec.bytes ?? 14_320 + index * 7,
      referrer: REFERRERS[index % REFERRERS.length],
      ua: visitor.ua,
      xff: "-",
      lang: visitor.lang,
    };
  });
}

/** Po kilka wejść na adres, żeby karta krajów miała czym różnicować słupki. */
function geo_views(): LogEntry[] {
  return GEO_SOURCES.flatMap((source, source_index) =>
    Array.from(
      { length: source.hits },
      (_, hit): LogEntry => ({
        ip: source.ip,
        minutes_ago: 4800 - source_index * 140 - hit * 37,
        method: "GET",
        target: source.path,
        status: 200,
        bytes: 13_880 + hit * 11,
        referrer: REFERRERS[(source_index + hit) % REFERRERS.length],
        ua: source.ua,
        xff: "-",
        lang: source.lang,
      }),
    ),
  );
}

interface BotSpec {
  ip: string;
  ua: string;
  from_minutes: number;
  targets: readonly string[];
}

/** Ruch nie-ludzki: jedno źródło = jeden adres i jeden UA, po wpisie na każdy cel. */
function bot_views(spec: BotSpec): LogEntry[] {
  return spec.targets.map(
    (target, index): LogEntry => ({
      ip: spec.ip,
      minutes_ago: spec.from_minutes - index * 47,
      method: "GET",
      target,
      status: 200,
      bytes: 9_120 + index * 13,
      referrer: "-",
      ua: spec.ua,
      xff: "-",
      lang: "-",
    }),
  );
}

const HOME_TARGETS = [
  "/",
  "/",
  "/?utm_source=newsletter",
  "/",
  "/?tab=eda",
  "/",
  "/?docs",
];

const MARKETS_TARGETS = [
  "/markets",
  "/markets?tab=hive",
  "/markets",
  "/markets?utm_source=newsletter&utm_medium=email",
];

const SCANNER_IP = "203.0.113.99";
const CRAWLER_IPS = ["203.0.113.10", "203.0.113.11", "203.0.113.12"] as const;
const SEO_IPS = ["198.51.100.80", "198.51.100.81", "198.51.100.82"] as const;
const CURL_IP = "192.0.2.77";
const HEADLESS_IP = "192.0.2.88";

export const ENTRIES: readonly LogEntry[] = [
  ...page_views({
    count: 26,
    from_minutes: 5400,
    step_minutes: 213,
    target: (index) => HOME_TARGETS[index % HOME_TARGETS.length],
  }),
  ...page_views({
    count: 16,
    from_minutes: 5200,
    step_minutes: 330,
    target: (index) => MARKETS_TARGETS[index % MARKETS_TARGETS.length],
  }),
  ...page_views({
    count: 3,
    from_minutes: 4100,
    step_minutes: 900,
    target: () => "/sitemap-index.xml",
    bytes: 1180,
  }),
  ...page_views({
    count: 2,
    from_minutes: 3300,
    step_minutes: 700,
    target: () => "/markets/",
    status: 301,
    bytes: 178,
  }),
  ...geo_views(),
  ...bot_views({
    ip: CRAWLER_IPS[0],
    ua: GOOGLEBOT_UA,
    from_minutes: 3600,
    targets: ["/", "/markets", "/sitemap-index.xml"],
  }),
  ...bot_views({
    ip: CRAWLER_IPS[1],
    ua: BINGBOT_UA,
    from_minutes: 3400,
    targets: ["/", "/robots.txt"],
  }),
  ...bot_views({
    ip: CRAWLER_IPS[2],
    ua: DUCKDUCKBOT_UA,
    from_minutes: 3200,
    targets: ["/robots.txt"],
  }),
  ...bot_views({
    ip: SEO_IPS[0],
    ua: AHREFS_UA,
    from_minutes: 3000,
    targets: ["/", "/markets"],
  }),
  ...bot_views({
    ip: SEO_IPS[1],
    ua: SEMRUSH_UA,
    from_minutes: 2900,
    targets: ["/markets"],
  }),
  ...bot_views({
    ip: SEO_IPS[2],
    ua: FACEBOOK_UA,
    from_minutes: 2800,
    targets: ["/"],
  }),
  ...bot_views({
    ip: HEADLESS_IP,
    ua: HEADLESS_UA,
    from_minutes: 2700,
    targets: ["/", "/markets"],
  }),
  ...bot_views({
    ip: CURL_IP,
    ua: CURL_UA,
    from_minutes: 2500,
    targets: ["/", "/sitemap-index.xml"],
  }),
  {
    ip: SPOOFED_XFF_REMOTE_ADDR,
    minutes_ago: 2600,
    method: "GET",
    target: SPOOFED_XFF_PATH,
    status: 200,
    bytes: 15_004,
    referrer: "https://www.google.com/",
    ua: CHROME_WIN,
    xff: `${SPOOFED_XFF_HEADER_IP}, ${SPOOFED_XFF_REMOTE_ADDR}`,
    lang: "pl-PL,pl;q=0.9",
  },
  {
    ip: "192.0.2.42",
    minutes_ago: 1900,
    method: "GET",
    target: "/markets?filter=all",
    status: 500,
    bytes: 512,
    referrer: "-",
    ua: SAFARI_MAC,
    xff: "-",
    lang: "en-US,en;q=0.9",
  },
  {
    ip: "198.51.100.7",
    minutes_ago: 1240,
    method: "GET",
    target: "/",
    status: 500,
    bytes: 512,
    referrer: "-",
    ua: FIREFOX_LINUX,
    xff: "-",
    lang: "de-DE,de;q=0.8",
  },
  {
    ip: "192.0.2.11",
    minutes_ago: 3040,
    method: "GET",
    target: "/old-oferta",
    status: 404,
    bytes: 564,
    referrer: "https://www.google.com/",
    ua: CHROME_WIN,
    xff: "-",
    lang: "pl-PL,pl;q=0.9,en-US;q=0.8",
  },
  {
    ip: SCANNER_IP,
    minutes_ago: 980,
    method: "GET",
    target: HOSTILE_PATH,
    status: 404,
    bytes: 564,
    referrer: "-",
    ua: PYTHON_UA,
    xff: "-",
    lang: "-",
  },
  {
    ip: SCANNER_IP,
    minutes_ago: 976,
    method: "POST",
    target: "/wp-admin/setup-config.php",
    status: 404,
    bytes: 564,
    referrer: "-",
    ua: PYTHON_UA,
    xff: "-",
    lang: "-",
  },
  {
    ip: SCANNER_IP,
    minutes_ago: 972,
    method: "GET",
    target: BOT_PATH,
    status: 404,
    bytes: 564,
    referrer: "-",
    ua: PYTHON_UA,
    xff: "-",
    lang: "-",
  },
  {
    ip: HOSTILE_IP,
    minutes_ago: 640,
    method: "GET",
    target: HOSTILE_PATH,
    status: 404,
    bytes: 564,
    referrer: HOSTILE_REFERRER_RAW,
    ua: HOSTILE_UA_RAW,
    xff: "-",
    lang: "-",
  },
  {
    ip: NO_UA_IP,
    minutes_ago: 1500,
    method: "GET",
    target: NO_UA_PATH,
    status: 200,
    bytes: 12_402,
    referrer: "-",
    ua: NO_UA,
    xff: "-",
    lang: "-",
  },
  {
    ip: EMPTY_UA_IP,
    minutes_ago: 1460,
    method: "GET",
    target: EMPTY_UA_PATH,
    status: 200,
    bytes: 11_204,
    referrer: "-",
    ua: EMPTY_UA,
    xff: "-",
    lang: "-",
  },
  ...Array.from(
    { length: 8 },
    (_, index): LogEntry => ({
      ip: INTERNAL_IP,
      minutes_ago: 700 - index * 30,
      method: "GET",
      target: INTERNAL_PATH,
      status: 200,
      bytes: 2,
      referrer: "-",
      ua: WGET_UA,
      xff: "-",
      lang: "-",
    }),
  ),
];
