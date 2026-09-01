/** Rozwijanie kodow ISO krajow — wspoldzielone przez tabele logow i karte krajow. */

const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/;

let region_names: Intl.DisplayNames | null = null;
let region_names_resolved = false;

function region_names_once(): Intl.DisplayNames | null {
  if (!region_names_resolved) {
    region_names_resolved = true;
    try {
      region_names = new Intl.DisplayNames(["pl"], { type: "region" });
    } catch {
      region_names = null;
    }
  }
  return region_names;
}

/** Polska nazwa kraju dla kodu ISO 3166-1 alpha-2; `null` gdy kodu nie da sie rozwinac. */
export function country_name(code: string): string | null {
  // `of` rzuca dla kodu spoza formatu regionu, a dla nieznanego regionu oddaje
  // sam kod — panel nie moze na tym ani pasc, ani pokazywac kodu dwa razy.
  const normalized = code.trim().toUpperCase();
  if (!COUNTRY_CODE_PATTERN.test(normalized)) {
    return null;
  }
  try {
    const resolved = region_names_once()?.of(normalized);
    return resolved === undefined || resolved === normalized ? null : resolved;
  } catch {
    return null;
  }
}
