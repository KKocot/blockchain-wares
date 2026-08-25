#!/usr/bin/env node
import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";

// Format i parametry MUSZA sie zgadzac z src/lib/auth/password.ts.
// Separator ":" — Docker Compose zjadlby "$16384" przy interpolacji .env.
const FIELD_SEPARATOR = ":";
const COST = 65536;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;
const KEY_LENGTH = 64;
const SALT_BYTES = 16;
const MAX_PASSWORD_LENGTH = 256;

function readStdin() {
  return new Promise((resolve, reject) => {
    let buffered = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      buffered += chunk;
    });
    process.stdin.on("end", () => resolve(buffered));
    process.stdin.on("error", reject);
  });
}

function promptHidden(label) {
  return new Promise((resolve, reject) => {
    let echoEnabled = true;
    let answered = false;
    // Readline echuje wpisywane znaki do `output` — podmieniamy je na strumien,
    // ktory po wypisaniu etykiety przestaje przepuszczac cokolwiek dalej.
    const maskedOutput = new Writable({
      write(chunk, _encoding, done) {
        if (echoEnabled) process.stderr.write(chunk);
        done();
      },
    });
    const rl = createInterface({
      input: process.stdin,
      output: maskedOutput,
      terminal: true,
    });
    rl.on("error", reject);
    rl.on("close", () => {
      if (!answered) reject(new Error("Przerwano wprowadzanie hasla."));
    });
    rl.question(label, (answer) => {
      answered = true;
      rl.close();
      process.stderr.write("\n");
      resolve(answer);
    });
    echoEnabled = false;
  });
}

async function readPasswordInteractively() {
  const first = await promptHidden("Haslo: ");
  const second = await promptHidden("Powtorz haslo: ");
  if (first !== second) {
    process.stderr.write("Hasla sie roznia.\n");
    process.exit(1);
  }
  return first;
}

function hashPassword(plainPassword) {
  const salt = randomBytes(SALT_BYTES);
  const derivedKey = scryptSync(plainPassword, salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELIZATION,
    // maxmem jawnie — domyslne 32 MB w Node nie mieszczy N >= 2^15.
    maxmem: 2 * (128 * COST * BLOCK_SIZE + 128 * BLOCK_SIZE * PARALLELIZATION),
  });

  return [
    "scrypt",
    COST,
    BLOCK_SIZE,
    PARALLELIZATION,
    salt.toString("base64"),
    derivedKey.toString("base64"),
  ].join(FIELD_SEPARATOR);
}

const passwordFromArgv = process.argv[2];

if (passwordFromArgv !== undefined) {
  process.stderr.write(
    "UWAGA: haslo podane w argumencie zostaje w historii shella i w liscie procesow.\n" +
      "Domyslna sciezka to interaktywny prompt: node scripts/hash_password.mjs\n",
  );
}

let plainPassword;
if (passwordFromArgv !== undefined) {
  plainPassword = passwordFromArgv;
} else if (process.stdin.isTTY) {
  try {
    plainPassword = await readPasswordInteractively();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
} else {
  plainPassword = (await readStdin()).replace(/\r?\n$/, "");
}

if (!plainPassword) {
  process.stderr.write(
    "Uzycie:\n" +
      "  node scripts/hash_password.mjs                          (zalecane: prompt bez echa)\n" +
      "  printf '%s' 'haslo' | node scripts/hash_password.mjs     (potok / CI)\n" +
      "  node scripts/hash_password.mjs 'haslo'                   (awaryjnie, leakuje do historii)\n",
  );
  process.exit(1);
}

if (plainPassword.length > MAX_PASSWORD_LENGTH) {
  process.stderr.write(
    `Haslo jest za dlugie: maksimum ${MAX_PASSWORD_LENGTH} znakow.\n`,
  );
  process.exit(1);
}

process.stdout.write(`${hashPassword(plainPassword)}\n`);
