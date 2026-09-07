/**
 * Tozsamosc tej aplikacji w zadaniach WYCHODZACYCH (odwrotnie niz
 * `src/lib/logs/user_agent.ts`, ktory klasyfikuje naglowki przychodzace).
 *
 * Bez tego naglowka undici wysyla zadanie SSR bez `User-Agent`, a WAF przed wlasnym
 * API punktuje to jako bota i odrzuca 403 — zanim ruch dojdzie do Traefika. UA jest
 * uczciwy, nie udaje przegladarki: fingerprint TLS i tak zdradziłby podszycie,
 * a analityka backendu ma widziec ten ruch jako nasz wlasny.
 */

/**
 * Kanoniczny origin serwisu — musi zgadzac sie z `site` w `astro.config.mjs`
 * (`tests/ssr_user_agent.spec.ts` pilnuje rozjazdu). Wpisany na sztywno, bo modul
 * czytaja spece bez runtime'u Astro; ten sam kompromis ma `FALLBACK_ORIGIN` w env.ts.
 */
export const SSR_USER_AGENT_ORIGIN = "https://blockchainwares.com.pl";

/**
 * Jedno zrodlo dla odczytu (`src/lib/events/source.ts`) i zapisu
 * (`src/lib/events/mutations.ts`) — rozjazd rozbilby ruch SSR na dwa zrodla,
 * ktorych nie da sie po stronie backendu zliczyc razem ani wspolnie odblokowac.
 */
export const SSR_USER_AGENT = `BlockchainWaresSSR/1.0 (+${SSR_USER_AGENT_ORIGIN})`;
