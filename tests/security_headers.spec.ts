import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import {
  DOCUMENT_SECURITY_HEADERS,
  NOSNIFF_HEADER,
  type SecurityHeader,
} from "../src/lib/net/security_headers";

/**
 * Naglowki bezpieczenstwa maja dwa zrodla: `src/lib/net/security_headers.ts` (przez
 * middleware) i regule dla stron w `vercel.json`. Oba zostaja — `vercel.json` jako
 * jedyne dosiega prerenderowanego `/404` i plikow statycznych, middleware jako jedyne
 * dziala lokalnie. Dwa naglowki CSP nie sumuja sie, wiec rozjazd nie wywala niczego
 * glosno, tylko cicho zwezaja polityke do czesci wspolnej. Spec chodzi bez
 * przegladarki, wzorem `nginx_parser.spec.ts` — porownuje wartosci, nie odpowiedzi.
 */
const VERCEL_CONFIG_PATH = fileURLToPath(
  new URL("../vercel.json", import.meta.url),
);

/** Regula 1: wszystko poza `/api` i `/admin`, czyli strony i pliki statyczne. */
const PAGES_RULE_SOURCE = "/((?!api/|api$|admin/|admin$).*)";

interface VercelOnlyHeader {
  readonly name: string;
  readonly reason: string;
}

/**
 * Naglowki celowo obecne wylacznie w `vercel.json`. Spec pilnuje obu kierunkow: musza
 * byc w regule i nie moga pojawic sie w module — inaczej lista wyjatkow po cichu
 * zdezaktualizowalaby sie i przestala cokolwiek chronic.
 */
const VERCEL_ONLY_HEADERS: readonly VercelOnlyHeader[] = [
  {
    name: "Strict-Transport-Security",
    reason:
      "TLS terminuje Vercel; middleware odpowiada ta sama trescia po http (dev, testy), wiec wymuszanie HTTPS nalezy do krawedzi",
  },
];

const POLICY_HEADERS: readonly SecurityHeader[] = [
  ...DOCUMENT_SECURITY_HEADERS,
  NOSNIFF_HEADER,
];

function is_record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Wczytuje naglowki reguly dla stron z `vercel.json`. Plik jest danymi, wiec czytamy go
 * parserem JSON — nigdy regexpem po tekscie zrodla.
 */
function read_pages_rule_headers(): SecurityHeader[] {
  const parsed: unknown = JSON.parse(readFileSync(VERCEL_CONFIG_PATH, "utf8"));
  if (!is_record(parsed) || !Array.isArray(parsed.headers)) {
    throw new Error("vercel.json: brak tablicy `headers`");
  }

  const rule = parsed.headers.find(
    (entry: unknown): entry is Record<string, unknown> =>
      is_record(entry) && entry.source === PAGES_RULE_SOURCE,
  );
  if (rule === undefined || !Array.isArray(rule.headers)) {
    throw new Error(
      `vercel.json: brak reguly o source "${PAGES_RULE_SOURCE}" z tablica \`headers\``,
    );
  }

  return rule.headers.map((entry: unknown): SecurityHeader => {
    if (
      !is_record(entry) ||
      typeof entry.key !== "string" ||
      typeof entry.value !== "string"
    ) {
      throw new Error("vercel.json: wpis naglowka bez `key`/`value`");
    }
    return { name: entry.key, value: entry.value };
  });
}

/** Nazwy naglowkow sa case-insensitive, wiec zestawiamy je po wersji malymi literami. */
function by_name(headers: readonly SecurityHeader[]): Map<string, string> {
  return new Map(
    headers.map((header) => [header.name.toLowerCase(), header.value]),
  );
}

function pick(
  source: ReadonlyMap<string, string>,
  names: Iterable<string>,
): Record<string, string> {
  const picked: Record<string, string> = {};
  for (const name of names) {
    const value = source.get(name);
    if (value !== undefined) {
      picked[name] = value;
    }
  }
  return picked;
}

const vercel_headers = read_pages_rule_headers();
const vercel_by_name = by_name(vercel_headers);
const policy_by_name = by_name(POLICY_HEADERS);
const exception_names = VERCEL_ONLY_HEADERS.map((header) =>
  header.name.toLowerCase(),
);

test.describe("naglowki bezpieczenstwa — spojnosc modulu i vercel.json", () => {
  test("zadne ze zrodel nie dubluje nazwy naglowka", () => {
    expect(vercel_by_name.size).toBe(vercel_headers.length);
    expect(policy_by_name.size).toBe(POLICY_HEADERS.length);
  });

  test("kazdy naglowek modulu ma w vercel.json te sama wartosc", () => {
    // Porownanie calych map, nie kluczy po kolei: lapie zarowno inna wartosc,
    // jak i naglowek, ktory z `vercel.json` wypadl.
    expect(pick(vercel_by_name, policy_by_name.keys())).toEqual(
      Object.fromEntries(policy_by_name),
    );
  });

  test("vercel.json nie ma naglowka spoza modulu i listy wyjatkow", () => {
    const unexpected = [...vercel_by_name.keys()].filter(
      (name) => !policy_by_name.has(name) && !exception_names.includes(name),
    );

    expect(unexpected).toEqual([]);
  });

  test("wyjatki sa w vercel.json i nie ma ich w module", () => {
    for (const { name, reason } of VERCEL_ONLY_HEADERS) {
      const key = name.toLowerCase();

      expect(vercel_by_name.has(key), `${name}: ${reason}`).toBe(true);
      // Gdyby naglowek trafil do middleware, wyjatek przestaje byc wyjatkiem —
      // wtedy nalezy usunac go z listy, a nie zostawic martwy wpis.
      expect(policy_by_name.has(key), `${name}: ${reason}`).toBe(false);
    }
  });
});
