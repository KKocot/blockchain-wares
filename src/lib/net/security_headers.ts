/**
 * Polityka naglowkow bezpieczenstwa aplikacji. Modul jest celowo wolny od zaleznosci
 * od `astro:*` — poza middleware czyta go spec porownujacy te wartosci z regula
 * dla stron w `vercel.json`. Oba zrodla musza zostac: `vercel.json` jako jedyne
 * dosiega prerenderowanego `/404`, plikow statycznych i ustawia HSTS, middleware
 * jako jedyne dziala lokalnie i w testach. Dwa naglowki CSP nie sumuja sie —
 * obowiazuje ich czesc wspolna, wiec rozjazd cicho rozluznia polityke.
 */
export interface SecurityHeader {
  readonly name: string;
  readonly value: string;
}

/**
 * Zgadywanie typu po tresci szkodzi kazdej odpowiedzi — XML sitemapy i text/plain jej
 * galezi awaryjnej tak samo jak HTML-owi, wiec ten naglowek idzie bez warunku.
 */
export const NOSNIFF_HEADER: SecurityHeader = {
  name: "X-Content-Type-Options",
  value: "nosniff",
};

/** Dotycza wylacznie dokumentu — na odpowiedzi innej niz HTML nie maja czego chronic. */
export const DOCUMENT_SECURITY_HEADERS: readonly SecurityHeader[] = [
  { name: "X-Frame-Options", value: "DENY" },
  { name: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Egzekwowane sa tylko dyrektywy, ktore nie moga zablokowac zasobu strony.
  {
    name: "Content-Security-Policy",
    value:
      "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
  },
  // Reszta polityki idzie w Report-Only: landing ma inline handler `onload` przy
  // preloadzie fontow i skrypty is:inline, wiec egzekwowany script-src wywalilby
  // strone. Przelaczyc na egzekwowanie dopiero po usunieciu inline'ow.
  {
    name: "Content-Security-Policy-Report-Only",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self'",
      "frame-src https://maps.google.com https://www.google.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];
