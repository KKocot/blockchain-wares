import { expect, test } from "@playwright/test";
import { read_form_body, type FormBodyResult } from "../src/lib/api/form_body";

/**
 * Czytanie ciała formularza jest czystą funkcją na `Request`, więc — jak
 * `nginx_parser.spec.ts` — spec chodzi bez przeglądarki, na wstrzykniętym limicie
 * zamiast na produkcyjnych 64 KiB.
 */
const FORM_TYPE = "application/x-www-form-urlencoded";
const TARGET_URL = "http://spec.invalid/admin/events";

interface RequestOptions {
  /** `null` = nagłówka w ogóle nie ma. */
  content_type?: string | null;
  content_length?: string;
}

function post(
  body: string | ReadableStream<Uint8Array> | null,
  options: RequestOptions = {},
): Request {
  const headers = new Headers();
  const content_type =
    options.content_type === undefined ? FORM_TYPE : options.content_type;
  if (content_type !== null) headers.set("content-type", content_type);
  if (options.content_length !== undefined) {
    headers.set("content-length", options.content_length);
  }

  // `duplex` jest w Node wymagany przy ciele strumieniowym, a nie ma go w `RequestInit`.
  const init = {
    method: "POST",
    headers,
    body,
    duplex: "half",
  } as unknown as RequestInit;

  return new Request(TARGET_URL, init);
}

function fields_of(result: FormBodyResult): URLSearchParams {
  if (!result.ok) {
    throw new Error(`Oczekiwano przyjęcia ciała, wróciło: ${result.reason}`);
  }
  return result.fields;
}

interface StreamProbe {
  stream: ReadableStream<Uint8Array>;
  /** Ile kawałków źródło zdążyło oddać — rośnie dopiero, gdy czytelnik po nie sięgnie. */
  pulled: () => number;
  cancelled: () => boolean;
}

function chunked_body(chunks: readonly Uint8Array[]): StreamProbe {
  let pulled = 0;
  let cancelled = false;

  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      const chunk = chunks[pulled];
      if (chunk === undefined) {
        controller.close();
        return;
      }
      pulled += 1;
      controller.enqueue(chunk);
    },
    cancel() {
      cancelled = true;
    },
  });

  return { stream, pulled: () => pulled, cancelled: () => cancelled };
}

function utf8(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

test.describe("read_form_body — typ zawartości", () => {
  test("brak Content-Type odpada", async () => {
    const result = await read_form_body(post("a=1", { content_type: null }));

    expect(result).toEqual({ ok: false, reason: "unsupported_media_type" });
  });

  test("text/plain odpada", async () => {
    const result = await read_form_body(
      post("a=1", { content_type: "text/plain" }),
    );

    expect(result).toEqual({ ok: false, reason: "unsupported_media_type" });
  });

  test("typ z doklejonym ogonem nie podszyje się pod formularz", async () => {
    const result = await read_form_body(
      post("a=1", { content_type: `${FORM_TYPE}X` }),
    );

    expect(result).toEqual({ ok: false, reason: "unsupported_media_type" });
  });

  test("parametr charset przechodzi", async () => {
    const result = await read_form_body(
      post("a=1", { content_type: `${FORM_TYPE}; charset=UTF-8` }),
    );

    expect(fields_of(result).get("a")).toBe("1");
  });

  test("wielkość liter w typie nie ma znaczenia", async () => {
    const result = await read_form_body(
      post("a=1", {
        content_type: "APPLICATION/X-WWW-FORM-URLENCODED; CHARSET=UTF-8",
      }),
    );

    expect(fields_of(result).get("a")).toBe("1");
  });
});

test.describe("read_form_body — limit bajtów", () => {
  test("ciało dokładnie na limit przechodzi", async () => {
    const body = "name=aaaaaaaaaa";

    const result = await read_form_body(post(body), body.length);

    expect(fields_of(result).get("name")).toBe("aaaaaaaaaa");
  });

  test("ciało o bajt za duże odpada", async () => {
    const body = "name=aaaaaaaaaa";

    const result = await read_form_body(post(body), body.length - 1);

    expect(result).toEqual({ ok: false, reason: "too_large" });
  });

  test("przekroczenie limitu to błąd, nie ciche obcięcie treści", async () => {
    // Obcięcie dałoby tu poprawnie sparsowane, ale urwane w połowie zdania pole —
    // zapisane wydarzenie wyglądałoby wtedy jak dane, a nie jak odrzucone żądanie.
    const body = `description=${"A".repeat(200)}`;

    const result = await read_form_body(post(body), 50);

    expect(result).toEqual({ ok: false, reason: "too_large" });
    expect("fields" in result).toBe(false);
  });

  test("Content-Length zaniżony nie omija limitu", async () => {
    const body = `description=${"A".repeat(200)}`;

    const result = await read_form_body(
      post(body, { content_length: "5" }),
      50,
    );

    expect(result).toEqual({ ok: false, reason: "too_large" });
  });

  test("Content-Length ponad limit odrzuca bez czytania ciała", async () => {
    const request = post("a=1", { content_length: "999999" });

    const result = await read_form_body(request, 50);

    // Deklaracja rozstrzyga tylko w stronę odrzucenia: żądanie pada, zanim ruszy
    // strumień, więc mały zapas na kłamiącym kliencie kosztuje odmowę, nie obcięcie.
    expect(result).toEqual({ ok: false, reason: "too_large" });
    expect(request.bodyUsed).toBe(false);
  });

  test("limit liczy bajty, nie znaki", async () => {
    const body = `name=${"€".repeat(10)}`;

    expect(body.length).toBe(15);
    expect(utf8(body).byteLength).toBe(35);

    const over = await read_form_body(post(body), 20);
    const exact = await read_form_body(post(body), 35);

    expect(over).toEqual({ ok: false, reason: "too_large" });
    expect(fields_of(exact).get("name")).toBe("€".repeat(10));
  });

  test("znak wielobajtowy rozcięty między kawałkami dekoduje się w całości", async () => {
    const euro = utf8("€");
    const probe = chunked_body([
      utf8("name="),
      euro.slice(0, 1),
      euro.slice(1),
    ]);

    const result = await read_form_body(post(probe.stream), 64);

    expect(fields_of(result).get("name")).toBe("€");
  });

  test("przekroczenie w trakcie strumienia zamyka źródło", async () => {
    const probe = chunked_body([
      utf8(`description=${"A".repeat(40)}`),
      utf8("B".repeat(40)),
      utf8("C".repeat(40)),
    ]);

    const result = await read_form_body(post(probe.stream), 60);

    expect(result).toEqual({ ok: false, reason: "too_large" });
    expect(probe.cancelled()).toBe(true);
    expect(probe.pulled()).toBeLessThan(3);
  });
});

test.describe("read_form_body — puste ciało", () => {
  test("żądanie bez ciała to `empty`", async () => {
    const result = await read_form_body(post(null));

    expect(result).toEqual({ ok: false, reason: "empty" });
  });

  test("ciało zerowej długości to `empty`", async () => {
    const result = await read_form_body(post(""));

    expect(result).toEqual({ ok: false, reason: "empty" });
  });
});

test.describe("read_form_body — pola", () => {
  test("pole powtórzone wraca przez getAll", async () => {
    const result = await read_form_body(
      post("topics=Blockchain&topics=EDA&topics=Databases"),
    );
    const fields = fields_of(result);

    expect(fields.getAll("topics")).toEqual(["Blockchain", "EDA", "Databases"]);
    // `get()` widzi tylko pierwsze wystąpienie — stąd `getAll` przy `topics`.
    expect(fields.get("topics")).toBe("Blockchain");
  });

  test("wartość percent-encoded jest dekodowana", async () => {
    const result = await read_form_body(
      post("city=%C5%81%C3%B3d%C5%BA&name=Fixture+%26+Co"),
    );
    const fields = fields_of(result);

    expect(fields.get("city")).toBe("Łódź");
    expect(fields.get("name")).toBe("Fixture & Co");
  });
});
