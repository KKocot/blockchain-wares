import type { APIContext } from "astro";

// Traefik jest jedynym zaufanym proxy przed aplikacja i dopisuje adres, ktory sam
// zobaczyl, na KONIEC X-Forwarded-For. Wczesniejsze wpisy moze wstrzyknac klient.
// Dojdzie kolejny zaufany hop (np. CDN) -> zwieksz o 1.
const TRUSTED_PROXY_HOPS = 1;
const MAX_IP_LENGTH = 45;
const IP_PATTERN = /^[0-9a-f.:]+$/;
const IPV4_MAPPED_PREFIX = "::ffff:";

/** Wspolny kubelek dla klientow, ktorych adresu nie da sie ustalic — ostrzejszy, nie luzniejszy. */
export const UNKNOWN_CLIENT_IP = "unknown";

/** Adres klienta widziany przez zaufane proxy; null gdy nie da sie go ustalic. */
export function resolve_client_ip(context: APIContext): string | null {
  const forwarded = context.request.headers.get("x-forwarded-for");
  if (forwarded !== null) {
    return trusted_hop(forwarded);
  }
  return normalize_ip(read_client_address(context));
}

/** Klucz kubelka dla limiterow — nigdy pusty, zeby nierozpoznany ruch tez byl liczony. */
export function client_ip_key(context: APIContext): string {
  return resolve_client_ip(context) ?? UNKNOWN_CLIENT_IP;
}

function trusted_hop(forwarded: string): string | null {
  const hops = forwarded.split(",");
  // Hop wybieramy PRZED walidacja: odsianie niepoprawnych wpisow najpierw przesuneloby
  // wybor na hop kontrolowany przez klienta, gdy wpis proxy nie przejdzie walidacji.
  return normalize_ip(hops[hops.length - TRUSTED_PROXY_HOPS]);
}

function read_client_address(context: APIContext): string | null {
  // Adapter moze nie wspierac clientAddress — sam dostep do pola rzuca.
  try {
    return context.clientAddress;
  } catch {
    return null;
  }
}

/** Sciaga port, nawiasy IPv6 i prefiks ::ffff:; odrzuca wszystko, co nie wyglada na adres. */
function normalize_ip(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;

  let value = raw.trim().toLowerCase();

  const bracket_end = value.indexOf("]");
  if (value.startsWith("[") && bracket_end > 1) {
    value = value.slice(1, bracket_end);
  } else if (value.split(":").length === 2) {
    value = value.slice(0, value.indexOf(":"));
  }
  if (value.startsWith(IPV4_MAPPED_PREFIX)) {
    value = value.slice(IPV4_MAPPED_PREFIX.length);
  }

  if (value.length === 0 || value.length > MAX_IP_LENGTH) return null;
  return IP_PATTERN.test(value) ? value : null;
}
