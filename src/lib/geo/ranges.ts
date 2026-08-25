import { GEOIP_COUNTRY_CODES, GEOIP_RANGES_BASE64 } from "./dataset";

/** Posortowane poczatki zakresow; zakres konczy sie tam, gdzie zaczyna sie nastepny. */
interface RangeTable {
  starts: Uint32Array | Float64Array;
  countries: Uint8Array;
}

interface RangeTables {
  v4: RangeTable;
  v6: RangeTable;
}

const HEADER_BYTES = 16;
const UNKNOWN_COUNTRY = 0;
const CODE_LENGTH = 2;

function decode_base64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

/**
 * LEB128 na doublach, bo klucze IPv6 (48 bitow) nie mieszcza sie w operatorach
 * bitowych. Delty sa liczone wzgledem poprzedniego poczatku zakresu.
 */
function read_deltas(
  bytes: Uint8Array,
  offset: number,
  target: Uint32Array | Float64Array,
): void {
  let cursor = offset;
  let previous = 0;
  for (let index = 0; index < target.length; index += 1) {
    let delta = 0;
    let scale = 1;
    let byte = bytes[cursor];
    cursor += 1;
    while (byte >= 128) {
      delta += (byte - 128) * scale;
      scale *= 128;
      byte = bytes[cursor];
      cursor += 1;
    }
    previous += delta + byte * scale;
    target[index] = previous;
  }
}

function build_tables(): RangeTables {
  const bytes = decode_base64(GEOIP_RANGES_BASE64);
  const header = new DataView(bytes.buffer, bytes.byteOffset, HEADER_BYTES);
  const count4 = header.getUint32(0, true);
  const count6 = header.getUint32(4, true);
  const deltas4 = header.getUint32(8, true);
  const deltas6 = header.getUint32(12, true);

  const starts4 = new Uint32Array(count4);
  const starts6 = new Float64Array(count6);
  let offset = HEADER_BYTES;
  read_deltas(bytes, offset, starts4);
  offset += deltas4;
  const countries4 = bytes.subarray(offset, offset + count4);
  offset += count4;
  read_deltas(bytes, offset, starts6);
  offset += deltas6;
  const countries6 = bytes.subarray(offset, offset + count6);

  return {
    v4: { starts: starts4, countries: countries4 },
    v6: { starts: starts6, countries: countries6 },
  };
}

// Dekodowane raz, przy ladowaniu modulu — lookup dzieje sie dla kazdej linii logu.
const TABLES: RangeTables = build_tables();

/** Ostatni zakres zaczynajacy sie nie pozniej niz `key`; -1 gdy klucz jest przed pierwszym. */
function find_range(starts: Uint32Array | Float64Array, key: number): number {
  let low = 0;
  let high = starts.length - 1;
  let found = -1;
  while (low <= high) {
    const middle = (low + high) >>> 1;
    if (starts[middle] <= key) {
      found = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return found;
}

export function find_country(family: 4 | 6, key: number): string | null {
  const table = family === 4 ? TABLES.v4 : TABLES.v6;
  const index = find_range(table.starts, key);
  if (index === -1) {
    return null;
  }
  const country = table.countries[index];
  if (country === UNKNOWN_COUNTRY) {
    return null;
  }
  return GEOIP_COUNTRY_CODES.slice(
    country * CODE_LENGTH,
    country * CODE_LENGTH + CODE_LENGTH,
  );
}
