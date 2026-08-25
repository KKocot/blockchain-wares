/**
 * Syntetyczny log nginx w formacie panelu:
 * `$remote_addr - $remote_user [$time_local] "$request" $status $bytes "$referer" "$user_agent" "$xff" "$accept_language"`.
 *
 * Testy nie mogą uderzać w prawdziwe źródło logów, więc cały zbiór jest tutaj.
 * Adresy pochodzą wyłącznie z pul dokumentacyjnych RFC 5737 (192.0.2.0/24,
 * 198.51.100.0/24, 203.0.113.0/24) — żaden nie należy do realnego hosta.
 */

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

const CHROME_WIN =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36";
const SAFARI_MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Safari/605.1.15";
const FIREFOX_LINUX =
  "Mozilla/5.0 (X11; Linux x86_64; rv:135.0) Gecko/20100101 Firefox/135.0";
const SAFARI_IOS =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1";
const EDGE_WIN =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0";

export const INTERNAL_IP = "127.0.0.1";
export const INTERNAL_PATH = "/healthz";
export const INTERNAL_UA = "Wget/1.21.4";
/** Etykieta, jaką `parse_user_agent` nadaje health-checkom. */
export const INTERNAL_BROWSER = "Wget";

/** Wpis, w którym nagłówek X-Forwarded-For celowo kłamie o adresie klienta. */
export const SPOOFED_XFF_PATH = "/kariera";
export const SPOOFED_XFF_REMOTE_ADDR = "198.51.100.23";
export const SPOOFED_XFF_HEADER_IP = "203.0.113.200";

/** Fragment występujący wyłącznie we wpisie skanera — używany jako filtr w teście XSS. */
export const HOSTILE_MARKER = "<script>alert(1)</script>";
export const HOSTILE_PATH = "/wp-login.php";
const HOSTILE_UA_RAW = "e2e-scanner \\x22quoted\\x22 <script>alert(1)</script>";
const HOSTILE_REFERRER_RAW =
  "http://198.51.100.9/<script>alert(1)</script>?q=\\x22x\\x22";
/** Te same wartości po odkodowaniu `\x22` — dokładnie tak mają wylądować w DOM jako TEKST. */
export const HOSTILE_UA = 'e2e-scanner "quoted" <script>alert(1)</script>';
export const HOSTILE_REFERRER =
  'http://198.51.100.9/<script>alert(1)</script>?q="x"';
/** Skaner nie pasuje do żadnej reguły `parse_user_agent`. */
export const HOSTILE_BROWSER = "Unknown";

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
const SCANNER_UA = "python-requests/2.32.3";

const ENTRIES: readonly LogEntry[] = [
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
    ua: SCANNER_UA,
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
    ua: SCANNER_UA,
    xff: "-",
    lang: "-",
  },
  {
    ip: SCANNER_IP,
    minutes_ago: 972,
    method: "GET",
    target: "/phpmyadmin/index.php",
    status: 404,
    bytes: 564,
    referrer: "-",
    ua: SCANNER_UA,
    xff: "-",
    lang: "-",
  },
  {
    ip: "203.0.113.66",
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
      ua: INTERNAL_UA,
      xff: "-",
      lang: "-",
    }),
  ),
];

const PUBLIC_ENTRIES = ENTRIES.filter((entry) => entry.ip !== INTERNAL_IP);

/** Panel domyślnie odfiltrowuje loopback, więc to jest „Żądania łącznie” na czystym `/admin`. */
export const PUBLIC_TOTAL = PUBLIC_ENTRIES.length;
export const INTERNAL_TOTAL = ENTRIES.length - PUBLIC_TOTAL;
export const PUBLIC_UNIQUE_IPS = new Set(PUBLIC_ENTRIES.map((e) => e.ip)).size;
export const NOT_FOUND_TOTAL = PUBLIC_ENTRIES.filter(
  (entry) => entry.status === 404,
).length;

/** Skrajne ścieżki po posortowaniu kolumny „Ścieżka” (bez ruchu wewnętrznego). */
export const LOWEST_PATH = "/";
export const HIGHEST_PATH = HOSTILE_PATH;
/** Najniższa ścieżka wśród samych 404 — pierwszy wiersz przy `?status=404&sort=path&dir=asc`. */
export const LOWEST_NOT_FOUND_PATH = "/old-oferta";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const MINUTE_MILLIS = 60_000;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** strftime nginx-a: `25/Aug/2026:10:14:04 +0000`. */
function format_time(at: Date): string {
  const date = `${pad(at.getUTCDate())}/${MONTHS[at.getUTCMonth()]}/${at.getUTCFullYear()}`;
  const clock = `${pad(at.getUTCHours())}:${pad(at.getUTCMinutes())}:${pad(at.getUTCSeconds())}`;
  return `${date}:${clock} +0000`;
}

function format_line(entry: LogEntry, now: Date): string {
  const at = new Date(now.getTime() - entry.minutes_ago * MINUTE_MILLIS);
  const request = `${entry.method} ${entry.target} HTTP/1.1`;
  return (
    `${entry.ip} - - [${format_time(at)}] "${request}" ${entry.status} ${entry.bytes} ` +
    `"${entry.referrer}" "${entry.ua}" "${entry.xff}" "${entry.lang}"`
  );
}

/** Najstarsze linie na górze — plik rośnie jak prawdziwy log, bez rotacji. */
export function render_access_log(now: Date): string {
  const lines = [...ENTRIES]
    .sort((left, right) => right.minutes_ago - left.minutes_ago)
    .map((entry) => format_line(entry, now));
  return `${lines.join("\n")}\n`;
}
