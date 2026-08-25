import { parse_ip_address } from "./address";
import { find_country } from "./ranges";

/**
 * Kod ISO 3166-1 alpha-2 dla adresu z logu, albo `null` gdy adresu nie da sie zmapowac
 * (smiec, adres prywatny, loopback, zakres spoza zbioru). Nigdy nie rzuca.
 */
export function lookup_country(ip: string | null): string | null {
  if (ip === null) {
    return null;
  }
  const address = parse_ip_address(ip);
  if (address === null) {
    return null;
  }
  return find_country(address.family, address.key);
}
