export { lookup_country } from "./lookup";
export { GEOIP_RELEASE } from "./dataset";

/**
 * CC BY 4.0 wymaga, zeby ekran korzystajacy z tych danych linkowal do zrodla.
 * Panel `/admin` renderuje to w stopce; pelny tekst licencji jest w CREDITS.md.
 */
export const GEOIP_ATTRIBUTION = {
  text: "IP Geolocation by DB-IP",
  url: "https://db-ip.com",
  license: "CC BY 4.0",
} as const;
