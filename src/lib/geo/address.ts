export interface IpAddress {
  family: 4 | 6;
  /** IPv4: caly adres jako uint32. IPv6: gorne 48 bitow, czyli numer bloku /48. */
  key: number;
}

const IPV4_GROUP_PATTERN = /^\d{1,3}$/;
const IPV6_GROUP_PATTERN = /^[0-9a-fA-F]{1,4}$/;

/**
 * Adresy, ktorych nie ma sensu geolokalizowac: prywatne, loopback, link-local, CGNAT,
 * pule dokumentacyjne, multicast i rezerwa. Zbior danych mapuje je na `ZZ`, ale filtr
 * tutaj nie zalezy od tego, co akurat przyjdzie w kolejnym wydaniu DB-IP.
 */
const RESERVED_V4: readonly (readonly [number, number])[] = [
  [0x00000000, 8],
  [0x0a000000, 8],
  [0x64400000, 10],
  [0x7f000000, 8],
  [0xa9fe0000, 16],
  [0xac100000, 12],
  [0xc0000000, 24],
  [0xc0000200, 24],
  [0xc0a80000, 16],
  [0xc6120000, 15],
  [0xc6336400, 24],
  [0xcb007100, 24],
  [0xe0000000, 4],
  [0xf0000000, 4],
];

/** RIR-y przydzielaja wylacznie z 2000::/3 — reszta to ULA, link-local, multicast. */
const V6_GLOBAL_UNICAST_MASK = 0xe000;
const V6_GLOBAL_UNICAST_PREFIX = 0x2000;
const V6_DOCUMENTATION_KEY = 0x20010db8;

function parse_ipv4(value: string): number | null {
  const parts = value.split(".");
  if (parts.length !== 4) {
    return null;
  }
  let result = 0;
  for (const part of parts) {
    if (!IPV4_GROUP_PATTERN.test(part)) {
      return null;
    }
    const byte = Number(part);
    if (byte > 255) {
      return null;
    }
    result = result * 256 + byte;
  }
  return result;
}

function is_reserved_v4(address: number): boolean {
  return RESERVED_V4.some(
    ([network, prefix]) =>
      address >>> (32 - prefix) === network >>> (32 - prefix),
  );
}

/** Koncowka w zapisie kropkowym (`::ffff:8.8.8.8`) rozwija sie na dwie grupy. */
function to_groups(chunk: string): number[] | null {
  if (chunk === "") {
    return [];
  }
  const parts = chunk.split(":");
  const groups: number[] = [];
  for (const [index, part] of parts.entries()) {
    if (part.includes(".")) {
      const embedded = index === parts.length - 1 ? parse_ipv4(part) : null;
      if (embedded === null) {
        return null;
      }
      groups.push(Math.floor(embedded / 65536), embedded % 65536);
      continue;
    }
    if (!IPV6_GROUP_PATTERN.test(part)) {
      return null;
    }
    groups.push(Number.parseInt(part, 16));
  }
  return groups;
}

function parse_ipv6(value: string): number[] | null {
  const halves = value.split("::");
  if (halves.length > 2) {
    return null;
  }
  const left = to_groups(halves[0]);
  const right = halves.length === 2 ? to_groups(halves[1]) : [];
  if (left === null || right === null) {
    return null;
  }

  if (halves.length === 1) {
    return left.length === 8 ? left : null;
  }
  const fill = 8 - left.length - right.length;
  return fill < 1
    ? null
    : [...left, ...new Array<number>(fill).fill(0), ...right];
}

/** `::ffff:8.8.8.8` i historyczne `::8.8.8.8` to adresy IPv4 w przebraniu. */
function to_mapped_v4(groups: number[]): number | null {
  for (let index = 0; index < 5; index += 1) {
    if (groups[index] !== 0) {
      return null;
    }
  }
  if (groups[5] !== 0xffff && groups[5] !== 0) {
    return null;
  }
  const address = groups[6] * 65536 + groups[7];
  return address === 0 || address === 1 ? null : address;
}

function to_v4_address(address: number): IpAddress | null {
  return is_reserved_v4(address) ? null : { family: 4, key: address };
}

/**
 * Zwraca `null` dla wszystkiego, czego nie da sie sensownie zgeolokalizowac: smieci,
 * adresow prywatnych, loopbacku i pul dokumentacyjnych. Nigdy nie rzuca.
 */
export function parse_ip_address(value: string): IpAddress | null {
  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }

  if (!trimmed.includes(":")) {
    const address = parse_ipv4(trimmed);
    return address === null ? null : to_v4_address(address);
  }

  // Zone id (`fe80::1%eth0`) nie niesie informacji o lokalizacji.
  const zone = trimmed.indexOf("%");
  const groups = parse_ipv6(zone === -1 ? trimmed : trimmed.slice(0, zone));
  if (groups === null) {
    return null;
  }

  const mapped = to_mapped_v4(groups);
  if (mapped !== null) {
    return to_v4_address(mapped);
  }

  if ((groups[0] & V6_GLOBAL_UNICAST_MASK) !== V6_GLOBAL_UNICAST_PREFIX) {
    return null;
  }
  const key = (groups[0] * 65536 + groups[1]) * 65536 + groups[2];
  if (Math.floor(key / 65536) === V6_DOCUMENTATION_KEY) {
    return null;
  }
  return { family: 6, key };
}
