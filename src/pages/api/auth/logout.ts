import type { APIRoute } from "astro";
import {
  is_same_site_request,
  json_error,
  server_error,
} from "../../../lib/api";
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "../../../lib/auth";

export const prerender = false;

const LOGIN_PATH = "/admin/login";

export const POST: APIRoute = ({ cookies, request }) => {
  try {
    if (!is_same_site_request(request)) {
      return json_error(403, "Żądanie z obcej domeny.");
    }

    // path musi byc identyczny jak przy ustawianiu — przy innym przegladarka
    // skasuje inne ciasteczko, a sesyjne przezyje wylogowanie.
    cookies.delete(SESSION_COOKIE_NAME, {
      path: SESSION_COOKIE_OPTIONS.path,
      httpOnly: SESSION_COOKIE_OPTIONS.httpOnly,
      secure: SESSION_COOKIE_OPTIONS.secure,
      sameSite: SESSION_COOKIE_OPTIONS.sameSite,
    });

    // Bez wzgledu na to, czy sesja byla — wylogowanie jest idempotentne.
    return new Response(null, {
      status: 302,
      headers: { Location: LOGIN_PATH, "Cache-Control": "no-store" },
    });
  } catch (error) {
    return server_error("api/auth/logout", error, "Błąd serwera.");
  }
};

export const ALL: APIRoute = () =>
  json_error(405, "Metoda niedozwolona.", { Allow: "POST" });
