import type { TradeFairEvent } from "../../components/events-data";

/**
 * Kontraktowy limit ciala mutacji (backend odpowiada 413) — sprawdzany przed wyslaniem.
 * Pesymistyczny koszt `badges`/`facts`/`links` (4/6/6 elementow, teksty do 200 znakow,
 * 4 B/znak) to ~18 KiB — zostaje ponad dwukrotny zapas do reszty pol, limit bez zmian.
 */
export const MAX_BODY_BYTES = 64 * 1024;

/**
 * Klucze opcjonalne `TradeFairEvent` — tylko te wolno skasowac `null`-em. Wyprowadzone z
 * `TradeFairEvent`, nie wypisane na sztywno: nowe opcjonalne pole (np. `badges`, `venue.note`)
 * wchodzi tu samo, bez edycji tego pliku.
 */
type OptionalEventKey = {
  [K in keyof TradeFairEvent]-?: {} extends Pick<TradeFairEvent, K> ? K : never;
}[keyof TradeFairEvent];

/** Pole pominiete zostaje bez zmian, `null` kasuje (`$unset`); wymagane nie sa nullowalne. */
export type EventPatch = Partial<Omit<TradeFairEvent, OptionalEventKey>> & {
  [K in OptionalEventKey]?: TradeFairEvent[K] | null;
};

/** Szkic do zapisu: bez `id` slug sklada backend z nazwy, a bez nazwy losuje go sam. */
export type EventDraft = Partial<TradeFairEvent>;

export function serialize(body: unknown): string | null {
  try {
    const json = JSON.stringify(body);
    return typeof json === "string" ? json : null;
  } catch {
    return null;
  }
}

/** Limit kontraktu jest w bajtach, a opis wydarzenia bywa w UTF-8 szerszy niz w znakach. */
export function byte_length(payload: string): number {
  return new TextEncoder().encode(payload).byteLength;
}
