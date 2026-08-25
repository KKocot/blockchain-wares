const JSON_HEADERS: Readonly<Record<string, string>> = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  // Bez nosniff przegladarka moze zgadnac typ tresci logow (np. HTML) i wykonac ja
  // w kontekscie strony. Middleware ustawia ten sam naglowek dla HTML.
  "X-Content-Type-Options": "nosniff",
};

export function json_response(
  body: unknown,
  status: number,
  headers: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...headers },
  });
}

export function json_error(
  status: number,
  message: string,
  headers: Record<string, string> = {},
): Response {
  return json_response({ error: message }, status, headers);
}

export function no_content(): Response {
  return new Response(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
}

/** Loguje sama przyczyne — tresc zadania niesie haslo i naglowki klienta. */
export function server_error(
  route: string,
  error: unknown,
  message: string,
): Response {
  console.error(
    `[${route}] request failed:`,
    error instanceof Error ? error.message : "unknown error",
  );
  return json_error(500, message);
}
