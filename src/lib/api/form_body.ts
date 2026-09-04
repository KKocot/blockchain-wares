const FORM_MEDIA_TYPE = "application/x-www-form-urlencoded";

/**
 * Domyslny limit dla formularzy panelu. Opis wydarzenia i lista tematow jada
 * percent-encoded, wiec kazdy bajt polskiego tekstu puchnie do trzech znakow
 * `%XX` — 64 KiB miesci okolo 10 tys. znakow prozy plus reszte pol. Logowanie
 * zostaje przy swoich 4096 B, bo haslo takiego zapasu nie potrzebuje.
 */
export const MAX_FORM_BODY_BYTES = 64 * 1024;

/** Kody sa URL-safe — endpoint moze wpisac je wprost w `?error=` przy 303. */
export type FormBodyRejection =
  | "unsupported_media_type"
  | "too_large"
  | "empty";

export type FormBodyResult =
  | { ok: true; fields: URLSearchParams }
  | { ok: false; reason: FormBodyRejection };

/**
 * Czyta tresc formularza POST i zwraca sparsowane pola. Nadmiarowa tresc konczy
 * sie odrzuceniem calego zadania, nigdy obcieciem — zapisany opis wydarzenia
 * urwany w polowie zdania wygladalby jak dane, a nie jak blad.
 *
 * Pole powtorzone w formularzu (`topics`) czytaj przez `fields.getAll()`.
 */
export async function read_form_body(
  request: Request,
  max_bytes: number = MAX_FORM_BODY_BYTES,
): Promise<FormBodyResult> {
  if (!is_form_media_type(request.headers.get("content-type"))) {
    return { ok: false, reason: "unsupported_media_type" };
  }
  if (exceeds_declared_length(request, max_bytes)) {
    return { ok: false, reason: "too_large" };
  }

  const body = request.body;
  if (body === null) return { ok: false, reason: "empty" };

  const bytes = await read_limited_bytes(body, max_bytes);
  if (bytes === null) return { ok: false, reason: "too_large" };
  if (bytes.byteLength === 0) return { ok: false, reason: "empty" };

  // Limit jest w bajtach, wiec dekodujemy dopiero po zliczeniu — znak spoza ASCII
  // zajmuje wiecej niz jedna pozycje i liczenie po znakach przepusciloby wiecej.
  const text = new TextDecoder().decode(bytes);
  return { ok: true, fields: new URLSearchParams(text) };
}

/** `application/x-www-form-urlencoded` z dowolnymi parametrami (`; charset=utf-8`). */
function is_form_media_type(header: string | null): boolean {
  if (header === null) return false;

  const [media_type = ""] = header.split(";");
  return media_type.trim().toLowerCase() === FORM_MEDIA_TYPE;
}

/**
 * Tani short-circuit, zanim ruszymy strumien. Naglowek podaje klient i moze
 * klamac w obie strony, wiec rozstrzyga i tak licznik przeczytanych bajtow.
 */
function exceeds_declared_length(request: Request, max_bytes: number): boolean {
  const declared = Number(request.headers.get("content-length"));
  return Number.isFinite(declared) && declared > max_bytes;
}

/** `null` = przekroczony limit; strumien zostaje wtedy zamkniety bez doczytywania. */
async function read_limited_bytes(
  body: ReadableStream<Uint8Array>,
  max_bytes: number,
): Promise<Uint8Array | null> {
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value === undefined) continue;

    size += value.byteLength;
    if (size > max_bytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }

  return merge_chunks(chunks, size);
}

function merge_chunks(chunks: readonly Uint8Array[], size: number): Uint8Array {
  const merged = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return merged;
}
