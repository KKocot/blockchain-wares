import type { AstroCookies } from "astro";
import { SESSION_COOKIE_NAME, verify_session_token } from "../auth";
import { get_auth_config } from "../env";
import { json_error } from "./responses";

/**
 * Zwraca odpowiedz odmowna albo `null`, gdy sesja jest wazna. Endpointy `/api/admin/*`
 * wolaja to mimo identycznej kontroli w middleware: przy zmianie matchera sciezek
 * pojedynczy punkt kontroli odslonilby dane, podwojny wymaga dwoch bledow naraz.
 */
export function admin_session_guard(cookies: AstroCookies): Response | null {
  let auth_secret: string;
  try {
    auth_secret = get_auth_config().auth_secret;
  } catch {
    return json_error(500, "Server is misconfigured.");
  }

  const token = cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
  return verify_session_token(token, auth_secret)
    ? null
    : json_error(401, "Unauthorized.");
}
