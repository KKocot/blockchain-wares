import type { APIContext } from "astro";
import { client_ip_key } from "../net/client_ip";

// OGRANICZENIE: licznik zyje w pamieci procesu. Restart kontenera kasuje limity,
// a przy skalowaniu do wielu instancji kazda liczy proby osobno (efektywny limit
// = MAX_ATTEMPTS * liczba instancji). Dla jednego kontenera to wystarcza; przy
// skalowaniu trzeba przeniesc licznik do wspoldzielonego magazynu (Redis).

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_TRACKED_KEYS = 10_000;
const SWEEP_INTERVAL_MS = 60 * 1000;

export type RateLimitVerdict =
  | { allowed: true; remaining: number }
  | { allowed: false; retry_after_seconds: number };

// Kolejnosc iteracji Mapy = kolejnosc wstawiania, a kazde uzycie klucza wstawia go
// ponownie na koniec — mapa dziala wiec jak lista LRU i eksmisja przy przepelnieniu
// zabiera wpisy najdawniej uzywane (z pominieciem zablokowanych, patrz evict_oldest).
const attempts_by_key = new Map<string, number[]>();
let last_sweep_at = 0;

export function consume_login_attempt(
  key: string,
  now: number = Date.now(),
): RateLimitVerdict {
  sweep_expired(now);

  const recent = within_window(attempts_by_key.get(key), now);
  const oldest = recent[0];

  if (recent.length >= MAX_ATTEMPTS && oldest !== undefined) {
    // Zablokowanej proby nie zapisujemy — inaczej dobijanie sie do zamknietych
    // drzwi przesuwalo by okno w nieskonczonosc i blokada nigdy by nie wygasla.
    touch(key, recent);
    return {
      allowed: false,
      retry_after_seconds: Math.max(
        1,
        Math.ceil((oldest + WINDOW_MS - now) / 1000),
      ),
    };
  }

  recent.push(now);
  touch(key, recent);
  return { allowed: true, remaining: MAX_ATTEMPTS - recent.length };
}

/** Po udanym logowaniu zerujemy licznik, zeby literowki nie blokowaly wlasciciela. */
export function reset_login_attempts(key: string): void {
  attempts_by_key.delete(key);
}

/** Klucz limitu: adres IP klienta widziany przez zaufane proxy — ten sam, ktory trafia do logow. */
export function login_client_key(context: APIContext): string {
  return client_ip_key(context);
}

function touch(key: string, attempts: number[]): void {
  attempts_by_key.delete(key);
  attempts_by_key.set(key, attempts);
}

function within_window(attempts: number[] | undefined, now: number): number[] {
  if (attempts === undefined) return [];
  // Lista nigdy nie przekracza MAX_ATTEMPTS elementow, wiec filtrowanie jest tanie.
  return attempts.filter((timestamp) => now - timestamp < WINDOW_MS);
}

function sweep_expired(now: number): void {
  const overflowing = attempts_by_key.size > MAX_TRACKED_KEYS;
  if (!overflowing && now - last_sweep_at < SWEEP_INTERVAL_MS) return;
  last_sweep_at = now;

  for (const [key, attempts] of attempts_by_key) {
    const newest = attempts[attempts.length - 1];
    if (newest === undefined || now - newest >= WINDOW_MS) {
      attempts_by_key.delete(key);
    }
  }

  if (attempts_by_key.size <= MAX_TRACKED_KEYS) return;
  // Najpierw eksmisja wpisow niezablokowanych: inaczej zalanie mapy unikalnymi IP
  // wypchneloby kubelek atakujacego i wyzerowalo jego limit.
  evict_oldest(now, true);
  evict_oldest(now, false);
}

function evict_oldest(now: number, spare_blocked: boolean): void {
  for (const [key, attempts] of attempts_by_key) {
    if (attempts_by_key.size <= MAX_TRACKED_KEYS) return;
    if (spare_blocked && within_window(attempts, now).length >= MAX_ATTEMPTS) {
      continue;
    }
    attempts_by_key.delete(key);
  }
}
