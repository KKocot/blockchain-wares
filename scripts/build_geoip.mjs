#!/usr/bin/env node
/**
 * Generuje `src/lib/geo/dataset.ts` — offline'owa mapa zakresow IP -> kod kraju.
 *
 * Zrodlo: DB-IP IP to Country Lite (https://db-ip.com/db/download/ip-to-country-lite),
 * licencja CC BY 4.0 — redystrybucja w publicznym repo jest dozwolona pod warunkiem
 * atrybucji (patrz CREDITS.md). Wydania wychodza 1. dnia kazdego miesiaca.
 *
 * Uruchamiany RECZNIE, nie w `npm run build`:
 *
 *   node scripts/build_geoip.mjs                     # najnowsze wydanie z db-ip.com
 *   node scripts/build_geoip.mjs --release=2026-08   # konkretny miesiac
 *   node scripts/build_geoip.mjs --input=plik.csv.gz # archiwalna kopia z dysku
 *
 * Format artefaktu (base64 jednego bloba, dekodowany raz przy starcie aplikacji):
 *
 *   naglowek: 4 x uint32 LE — count4, count6, bytes4, bytes6
 *   sekcja 4: `count4` varintow (delty posortowanych poczatkow zakresow, uint32)
 *             + `count4` bajtow indeksu kraju
 *   sekcja 6: to samo dla IPv6, gdzie kluczem sa GORNE 48 BITOW adresu
 *
 * Koniec zakresu wynika z poczatku nastepnego, dlatego dziury w danych dostaja jawny
 * wpis z indeksem 0 (`nieznany`). Indeks 0 to takze `ZZ` z DB-IP.
 *
 * IPv6 obcinamy do /48: pelna precyzja to ~0.7 MB bloba wiecej (~1 MB po base64), a /48
 * to najmniejszy blok, jaki RIR-y przydzielaja pojedynczej lokalizacji — 99% wierszy jest
 * grubszych, reszta wpada do juz pokrytego bloku i dziedziczy jego kraj. Klucz /48 miesci
 * sie w double bez straty precyzji, wiec runtime obywa sie bez BigInt.
 */
import { createWriteStream } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_PATH = join(ROOT, "src", "lib", "geo", "dataset.ts");
const DOWNLOAD_BASE = "https://download.db-ip.com/free";
const CACHE_DIR = join(tmpdir(), "blockchainwares-geoip");

const UNKNOWN_CODE = "ZZ";
const UNKNOWN_INDEX = 0;
const MAX_COUNTRIES = 256;

const V4_MAX = 0xffffffff;
/** Tylko global unicast (2000::/3) — poza nim nie ma zrodel ruchu, wiec i danych. */
const V6_MIN_KEY = 0x200000000000;
const V6_MAX_KEY = 0x3fffffffffff;

function read_flag(name) {
  const prefix = `--${name}=`;
  const argument = process.argv.find((value) => value.startsWith(prefix));
  return argument === undefined ? null : argument.slice(prefix.length);
}

/** Wydanie z 1. dnia biezacego miesiaca bywa jeszcze niedostepne — cofamy sie o miesiac. */
function release_candidates() {
  const explicit = read_flag("release");
  if (explicit !== null) {
    return [explicit];
  }
  const now = new Date();
  return [0, 1].map((back) => {
    const at = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back),
    );
    return `${at.getUTCFullYear()}-${String(at.getUTCMonth() + 1).padStart(2, "0")}`;
  });
}

async function file_exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function download(release) {
  const url = `${DOWNLOAD_BASE}/dbip-country-lite-${release}.csv.gz`;
  const target = join(CACHE_DIR, `dbip-country-lite-${release}.csv.gz`);
  if (await file_exists(target)) {
    console.log(`cache: ${target}`);
    return target;
  }

  const response = await fetch(url);
  if (!response.ok || response.body === null) {
    throw new Error(`HTTP ${response.status} dla ${url}`);
  }
  await mkdir(CACHE_DIR, { recursive: true });
  await pipeline(Readable.fromWeb(response.body), createWriteStream(target));
  console.log(`pobrano: ${url}`);
  return target;
}

async function load_source() {
  const input = read_flag("input");
  if (input !== null) {
    return { release: read_flag("release") ?? "local", path: resolve(input) };
  }

  const failures = [];
  for (const release of release_candidates()) {
    try {
      return { release, path: await download(release) };
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }
  throw new Error(`Nie udalo sie pobrac zbioru:\n  ${failures.join("\n  ")}`);
}

function parse_ipv4(value) {
  const parts = value.split(".");
  if (parts.length !== 4) {
    return null;
  }
  let result = 0;
  for (const part of parts) {
    const byte = Number(part);
    if (!Number.isInteger(byte) || byte < 0 || byte > 255) {
      return null;
    }
    result = result * 256 + byte;
  }
  return result;
}

function ipv6_words(chunk) {
  if (chunk === "") {
    return [];
  }
  const parts = chunk.split(":");
  const words = [];
  for (const [index, part] of parts.entries()) {
    if (part.includes(".")) {
      const embedded = index === parts.length - 1 ? parse_ipv4(part) : null;
      if (embedded === null) {
        return null;
      }
      words.push(Math.floor(embedded / 65536), embedded % 65536);
      continue;
    }
    if (!/^[0-9a-fA-F]{1,4}$/.test(part)) {
      return null;
    }
    words.push(Number.parseInt(part, 16));
  }
  return words;
}

/** Gorne 48 bitow adresu, czyli numer bloku /48 — klucz zbioru danych dla IPv6. */
function ipv6_key(value) {
  const halves = value.split("::");
  if (halves.length > 2) {
    return null;
  }
  const left = ipv6_words(halves[0]);
  const right = halves.length === 2 ? ipv6_words(halves[1]) : [];
  if (left === null || right === null) {
    return null;
  }

  let groups;
  if (halves.length === 1) {
    groups = left;
  } else {
    const fill = 8 - left.length - right.length;
    if (fill < 1) {
      return null;
    }
    groups = [...left, ...new Array(fill).fill(0), ...right];
  }
  if (groups.length !== 8) {
    return null;
  }
  return (groups[0] * 65536 + groups[1]) * 65536 + groups[2];
}

function parse_csv(text) {
  const rows4 = [];
  const rows6 = [];
  const index_by_code = new Map([[UNKNOWN_CODE, UNKNOWN_INDEX]]);
  const codes = [UNKNOWN_CODE];

  for (const line of text.split("\n")) {
    if (line === "") {
      continue;
    }
    const [start, end, raw_code] = line.split(",");
    if (start === undefined || end === undefined || raw_code === undefined) {
      throw new Error(`Nieoczekiwany wiersz CSV: ${line.slice(0, 60)}`);
    }
    const code = raw_code.trim().toUpperCase();
    let code_index = index_by_code.get(code);
    if (code_index === undefined) {
      code_index = codes.length;
      codes.push(code);
      index_by_code.set(code, code_index);
    }

    if (start.includes(":")) {
      const from = ipv6_key(start);
      const to = ipv6_key(end);
      if (from === null || to === null) {
        throw new Error(`Nieparsowalny zakres IPv6: ${line.slice(0, 60)}`);
      }
      rows6.push([from, to, code_index]);
    } else {
      const from = parse_ipv4(start);
      const to = parse_ipv4(end);
      if (from === null || to === null) {
        throw new Error(`Nieparsowalny zakres IPv4: ${line.slice(0, 60)}`);
      }
      rows4.push([from, to, code_index]);
    }
  }

  if (codes.length > MAX_COUNTRIES) {
    throw new Error(`${codes.length} kodow krajow nie zmiesci sie w bajcie.`);
  }
  return { rows4, rows6, codes };
}

/**
 * Zamienia zakresy w posortowana liste granic: wpis `[start, kraj]` obowiazuje az do
 * nastepnego startu. Wiersze drobniejsze niz rozdzielczosc klucza (IPv6 /48) wpadaja do
 * juz pokrytego bloku i sa pomijane — kraj pierwszego z nich wygrywa.
 */
function to_boundaries(rows, min_key, max_key) {
  const sorted = [...rows].sort((left, right) => left[0] - right[0]);
  const starts = [];
  const country_indices = [];
  let cursor = min_key;
  let current = UNKNOWN_INDEX;
  let dropped = 0;

  const push = (start, code_index) => {
    starts.push(start);
    country_indices.push(code_index);
    current = code_index;
  };

  for (const [from, to, code_index] of sorted) {
    if (to < min_key || from > max_key) {
      continue;
    }
    const start = Math.max(from, min_key);
    const end = Math.min(to, max_key);
    if (end < cursor) {
      dropped += 1;
      continue;
    }
    if (start < cursor) {
      dropped += 1;
      cursor = end + 1;
      continue;
    }
    if (start > cursor && current !== UNKNOWN_INDEX) {
      push(cursor, UNKNOWN_INDEX);
    }
    if (code_index !== current) {
      push(start, code_index);
    }
    cursor = end + 1;
  }

  if (cursor <= max_key && current !== UNKNOWN_INDEX) {
    push(cursor, UNKNOWN_INDEX);
  }
  return { starts, country_indices, dropped };
}

class ByteWriter {
  constructor(capacity) {
    this.bytes = new Uint8Array(capacity);
    this.length = 0;
  }

  push(byte) {
    if (this.length === this.bytes.length) {
      const grown = new Uint8Array(this.bytes.length * 2);
      grown.set(this.bytes);
      this.bytes = grown;
    }
    this.bytes[this.length] = byte;
    this.length += 1;
  }

  /** LEB128 na doublach — klucze IPv6 przekraczaja 32 bity, wiec bez operatorow bitowych. */
  varint(value) {
    let rest = value;
    while (rest >= 128) {
      this.push((rest % 128) + 128);
      rest = Math.floor(rest / 128);
    }
    this.push(rest);
  }

  view() {
    return this.bytes.subarray(0, this.length);
  }
}

function encode_deltas(starts) {
  const writer = new ByteWriter(starts.length * 2 + 16);
  let previous = 0;
  for (const start of starts) {
    writer.varint(start - previous);
    previous = start;
  }
  return writer.view();
}

function build_blob(table4, table6) {
  const deltas4 = encode_deltas(table4.starts);
  const deltas6 = encode_deltas(table6.starts);
  const header = new Uint8Array(16);
  new DataView(header.buffer).setUint32(0, table4.starts.length, true);
  new DataView(header.buffer).setUint32(4, table6.starts.length, true);
  new DataView(header.buffer).setUint32(8, deltas4.length, true);
  new DataView(header.buffer).setUint32(12, deltas6.length, true);

  const sections = [
    header,
    deltas4,
    Uint8Array.from(table4.country_indices),
    deltas6,
    Uint8Array.from(table6.country_indices),
  ];
  const blob = new Uint8Array(
    sections.reduce((total, section) => total + section.length, 0),
  );
  let offset = 0;
  for (const section of sections) {
    blob.set(section, offset);
    offset += section.length;
  }
  return blob;
}

function render_module(release, codes, base64) {
  return `// WYGENEROWANY PLIK — nie edytuj recznie.
// Zrodlo: DB-IP IP to Country Lite ${release} (CC BY 4.0), https://db-ip.com — patrz CREDITS.md.
// Odswiezenie: node scripts/build_geoip.mjs
// Format bloba opisany w scripts/build_geoip.mjs.

export const GEOIP_RELEASE = ${JSON.stringify(release)};

/** Kod kraju pod indeksem i to \`slice(i * 2, i * 2 + 2)\`; indeks 0 znaczy "nieznany". */
export const GEOIP_COUNTRY_CODES =
  ${JSON.stringify(codes.join(""))};

export const GEOIP_RANGES_BASE64 =
  ${JSON.stringify(base64)};
`;
}

async function main() {
  const { release, path } = await load_source();
  const raw = await readFile(path);
  const text = (path.endsWith(".gz") ? gunzipSync(raw) : raw).toString("utf8");

  const { rows4, rows6, codes } = parse_csv(text);
  const table4 = to_boundaries(rows4, 0, V4_MAX);
  const table6 = to_boundaries(rows6, V6_MIN_KEY, V6_MAX_KEY);

  const blob = build_blob(table4, table6);
  const base64 = Buffer.from(blob).toString("base64");
  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, render_module(release, codes, base64), "utf8");

  const kb = (bytes) => `${(bytes / 1024).toFixed(0)} kB`;
  console.log(`wydanie:        ${release}`);
  console.log(`kraje:          ${codes.length}`);
  console.log(
    `IPv4:           ${rows4.length} wierszy -> ${table4.starts.length} granic (pominietych ${table4.dropped})`,
  );
  console.log(
    `IPv6 (/48):     ${rows6.length} wierszy -> ${table6.starts.length} granic (pominietych ${table6.dropped})`,
  );
  console.log(`blob:           ${kb(blob.length)}`);
  console.log(`base64:         ${kb(base64.length)}`);
  console.log(`zapisano:       ${OUTPUT_PATH}`);
}

await main();
