import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const ALGORITHM_TAG = "scrypt";
// Separator ":" zamiast "$" — Docker Compose interpoluje $N w wartosciach z .env
// i po cichu zjadlby parametry kosztu. ":" nie wystepuje w alfabecie base64.
const FIELD_SEPARATOR = ":";
const SCRYPT_N = 65536;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const MAX_KEY_LENGTH = 128;
const MAX_PASSWORD_LENGTH = 256;
const MAX_SCRYPT_N = 1 << 20;
const MAX_SCRYPT_R = 32;
const MAX_SCRYPT_P = 16;
const MAX_SCRYPT_MEMORY_BYTES = 512 * 1024 * 1024;
const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

type ScryptParams = {
  N: number;
  r: number;
  p: number;
};

type StoredHash = {
  N: number;
  r: number;
  p: number;
  salt: Buffer;
  key: Buffer;
};

export async function hash_password(plain: string): Promise<string> {
  if (plain.length > MAX_PASSWORD_LENGTH) {
    throw new Error(
      `Password is too long: at most ${MAX_PASSWORD_LENGTH} characters are allowed.`,
    );
  }

  const salt = randomBytes(SALT_LENGTH);
  const key = await derive_key(plain, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
  return [
    ALGORITHM_TAG,
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("base64"),
    key.toString("base64"),
  ].join(FIELD_SEPARATOR);
}

export async function verify_password(
  plain: string,
  stored: string,
): Promise<boolean> {
  if (typeof plain !== "string" || plain.length > MAX_PASSWORD_LENGTH)
    return false;

  const parsed = parse_stored_hash(stored);
  if (parsed === null) return false;

  try {
    // keylen brany z zapisanego hasha - bufory zawsze rownej dlugosci, wiec
    // timingSafeEqual nie rzuca i nie ma szybkiej sciezki na roznicy dlugosci.
    const key = await derive_key(plain, parsed.salt, parsed.key.length, {
      N: parsed.N,
      r: parsed.r,
      p: parsed.p,
    });
    return timingSafeEqual(key, parsed.key);
  } catch {
    return false;
  }
}

function derive_key(
  plain: string,
  salt: Buffer,
  keylen: number,
  params: ScryptParams,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // maxmem jawnie — domyslne 32 MB w Node nie mieszczy N >= 2^15.
    const options = { ...params, maxmem: scrypt_memory_bytes(params) };
    scrypt(plain, salt, keylen, options, (error, key) => {
      if (error !== null) reject(error);
      else resolve(key);
    });
  });
}

function scrypt_memory_bytes(params: ScryptParams): number {
  return 2 * (128 * params.N * params.r + 128 * params.r * params.p);
}

function parse_stored_hash(stored: string): StoredHash | null {
  if (typeof stored !== "string" || stored.length === 0) return null;

  const parts = stored.split(FIELD_SEPARATOR);
  if (parts.length !== 6) return null;

  const [tag, raw_n, raw_r, raw_p, raw_salt, raw_key] = parts;
  if (tag !== ALGORITHM_TAG) return null;

  const N = parse_positive_int(raw_n, MAX_SCRYPT_N);
  const r = parse_positive_int(raw_r, MAX_SCRYPT_R);
  const p = parse_positive_int(raw_p, MAX_SCRYPT_P);
  if (N === null || r === null || p === null) return null;
  if (scrypt_memory_bytes({ N, r, p }) > MAX_SCRYPT_MEMORY_BYTES) return null;

  const salt = decode_base64(raw_salt);
  const key = decode_base64(raw_key);
  if (salt === null || key === null) return null;
  if (salt.length === 0 || key.length === 0 || key.length > MAX_KEY_LENGTH)
    return null;

  return { N, r, p, salt, key };
}

function parse_positive_int(
  value: string | undefined,
  max: number,
): number | null {
  if (value === undefined || !/^\d+$/.test(value)) return null;
  const parsed = Number.parseInt(value, 10);
  return parsed >= 1 && parsed <= max ? parsed : null;
}

function decode_base64(value: string | undefined): Buffer | null {
  if (value === undefined || !BASE64_PATTERN.test(value)) return null;
  return Buffer.from(value, "base64");
}
