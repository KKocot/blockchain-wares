import { createHmac, timingSafeEqual } from "node:crypto";
import type { AstroCookieSetOptions } from "astro";
import { get_session_not_before } from "../env";

export const SESSION_COOKIE_NAME = "bw_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const SESSION_PAYLOAD_VERSION = 1;

const CLOCK_DRIFT_TOLERANCE_MS = 60 * 1000;

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: resolve_secure_flag(),
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
} as const satisfies AstroCookieSetOptions;

type SessionPayload = {
  v: number;
  iat: number;
  exp: number;
};

export function create_session_token(secret: string): string {
  const issued_at = Date.now();
  const payload: SessionPayload = {
    v: SESSION_PAYLOAD_VERSION,
    iat: issued_at,
    exp: issued_at + SESSION_MAX_AGE_SECONDS * 1000,
  };
  const encoded_payload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  return `${encoded_payload}.${sign(encoded_payload, secret)}`;
}

export function verify_session_token(
  token: string | null,
  secret: string,
): boolean {
  try {
    if (token === null || token.length === 0 || secret.length === 0)
      return false;

    const separator = token.indexOf(".");
    if (separator <= 0 || separator === token.length - 1) return false;

    const encoded_payload = token.slice(0, separator);
    const signature = token.slice(separator + 1);
    if (!signatures_match(signature, sign(encoded_payload, secret)))
      return false;

    const payload: unknown = JSON.parse(
      Buffer.from(encoded_payload, "base64url").toString("utf8"),
    );
    if (!is_session_payload(payload)) return false;
    if (payload.v !== SESSION_PAYLOAD_VERSION) return false;

    const now = Date.now();
    if (payload.iat > now + CLOCK_DRIFT_TOLERANCE_MS) return false;
    if (payload.exp <= now) return false;

    const not_before = get_session_not_before();
    if (not_before !== null && payload.iat < not_before) return false;

    return true;
  } catch {
    return false;
  }
}

function resolve_secure_flag(): boolean {
  // Safari po cichu odrzuca ciasteczka Secure na http://localhost, wiec w devie
  // je zdejmujemy — ale tylko gdy tryb dev jest jednoznaczny. Inaczej: secure.
  const meta_env = import.meta.env as unknown as
    | Record<string, unknown>
    | undefined;
  return meta_env?.PROD === false && meta_env?.DEV === true ? false : true;
}

function sign(encoded_payload: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(encoded_payload)
    .digest("base64url");
}

function signatures_match(provided: string, expected: string): boolean {
  const provided_bytes = Buffer.from(provided, "utf8");
  const expected_bytes = Buffer.from(expected, "utf8");
  if (provided_bytes.length !== expected_bytes.length) return false;
  return timingSafeEqual(provided_bytes, expected_bytes);
}

function is_session_payload(value: unknown): value is SessionPayload {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    is_finite_number(record.v) &&
    is_finite_number(record.iat) &&
    is_finite_number(record.exp)
  );
}

function is_finite_number(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
