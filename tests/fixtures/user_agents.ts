/**
 * User-Agenty logu fixture'u pogrupowane tak, jak dzieli je panel: każda rodzina
 * odpowiada dokładnie jednej fladze `exclude*`. Reguły dopasowania i etykiety
 * przeglądarek pochodzą z `src/lib/logs/user_agent.ts` — zmiana `BOT_RULES` musi
 * przejść też tutaj, inaczej liczniki kategorii przestaną się zgadzać.
 */

export const CHROME_WIN =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36";
export const SAFARI_MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15";
export const FIREFOX_LINUX =
  "Mozilla/5.0 (X11; Linux x86_64; rv:135.0) Gecko/20100101 Firefox/135.0";
export const SAFARI_IOS =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1";
export const EDGE_WIN =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0";

export const GOOGLEBOT_UA =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
export const BINGBOT_UA =
  "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)";
export const DUCKDUCKBOT_UA =
  "Mozilla/5.0 (compatible; DuckDuckBot-Https/1.1; +https://duckduckgo.com/duckduckbot)";

export const AHREFS_UA =
  "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)";
export const SEMRUSH_UA =
  "Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot/)";
export const FACEBOOK_UA =
  "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";

export const PYTHON_UA = "python-requests/2.32.3";
export const CURL_UA = "curl/8.7.1";
/** Health-checki serwera lecą Wgetem — to nadal kategoria `script`, tyle że z loopbacku. */
export const WGET_UA = "Wget/1.21.4";

export const HEADLESS_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/131.0.6778.87 Safari/537.36";

/** Zapis nginx-a: cudzysłów jako `\x22`, nie jako znak dosłowny. */
export const HOSTILE_UA_RAW =
  "e2e-scanner \\x22quoted\\x22 <script>alert(1)</script>";
/** Ta sama wartość po odkodowaniu `\x22` — dokładnie tak ma wylądować w DOM jako TEKST. */
export const HOSTILE_UA = 'e2e-scanner "quoted" <script>alert(1)</script>';

/** Brak nagłówka User-Agent w logu nginx. */
export const NO_UA = "-";

/** Nagłówek wysłany jako pusty string: nginx zapisuje `""`, panel traktuje jak brak UA. */
export const EMPTY_UA = "";

/** Etykieta `parse_user_agent` dla UA bez dopasowania — i dla braku UA. */
export const UNKNOWN_BROWSER = "Unknown";
export const HOSTILE_BROWSER = UNKNOWN_BROWSER;
export const BOT_BROWSER = "python-requests";
export const INTERNAL_BROWSER = "Wget";

/** Kategorie ruchu nie-ludzkiego — po jednej na flagę `exclude*` panelu. */
export type TrafficCategory =
  | "crawler"
  | "seo"
  | "script"
  | "headless"
  | "unknownUa"
  | "noUa";

/**
 * UA spoza tej mapy jest ruchem ludzkim. Mapa jest źródłem liczników kategorii,
 * więc każdy nowy UA w logu musi tu trafić albo świadomie zostać uznany za człowieka.
 */
export const CATEGORY_BY_UA: ReadonlyMap<string, TrafficCategory> = new Map([
  [GOOGLEBOT_UA, "crawler"],
  [BINGBOT_UA, "crawler"],
  [DUCKDUCKBOT_UA, "crawler"],
  [AHREFS_UA, "seo"],
  [SEMRUSH_UA, "seo"],
  [FACEBOOK_UA, "seo"],
  [PYTHON_UA, "script"],
  [CURL_UA, "script"],
  [WGET_UA, "script"],
  [HEADLESS_UA, "headless"],
  [HOSTILE_UA_RAW, "unknownUa"],
  [NO_UA, "noUa"],
  [EMPTY_UA, "noUa"],
] as const);
