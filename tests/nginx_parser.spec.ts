import { expect, test } from "@playwright/test";
import { parse_nginx_log } from "../src/lib/logs/nginx_parser";
import { render_access_log } from "./fixtures/access_log";

/**
 * Budżet rekordów jest zabezpieczeniem przed OOM, więc degradację sprawdzamy na
 * wstrzykniętej, małej wartości — fixture z ponad 500 000 linii nie dałby się
 * utrzymać. Log jest ten sam, którym karmiony jest panel w testach E2E.
 */
const LOG = render_access_log(new Date("2026-01-15T12:00:00.000Z"));
const SOURCE_LINES = LOG.trimEnd().split("\n").length;
const SMALL_BUDGET = 5;

test.describe("parse_nginx_log — budżet rekordów", () => {
  test("plik mieszczący się w budżecie wraca w całości", () => {
    const result = parse_nginx_log(LOG);

    expect(result.truncated).toBe(false);
    expect(result.records.length).toBeGreaterThan(SMALL_BUDGET);
    expect(result.sourceLines).toBe(SOURCE_LINES);
    expect(result.readLines).toBe(SOURCE_LINES);
    expect(result.readLines).toBe(result.records.length + result.skippedLines);
  });

  test("plik dokładnie na budżet nie zgłasza obcięcia", () => {
    const full = parse_nginx_log(LOG);
    // Fixture nie ma linii do pominięcia, więc budżet = liczba rekordów to
    // dokładnie przypadek graniczny „plik równy budżetowi”.
    expect(full.skippedLines).toBe(0);

    const result = parse_nginx_log(LOG, full.records.length);

    expect(result.truncated).toBe(false);
    expect(result.records).toHaveLength(full.records.length);
  });

  test("po wyczerpaniu budżetu zostają najnowsze wpisy", () => {
    const full = parse_nginx_log(LOG);
    const result = parse_nginx_log(LOG, SMALL_BUDGET);

    expect(result.truncated).toBe(true);
    expect(result.records).toHaveLength(SMALL_BUDGET);
    expect(result.records.map((record) => record.id)).toEqual(
      full.records.slice(-SMALL_BUDGET).map((record) => record.id),
    );
    // Mianownik adnotacji w panelu opisuje całe źródło, nie zachowany wycinek.
    expect(result.sourceLines).toBe(SOURCE_LINES);
    expect(result.readLines).toBe(SMALL_BUDGET);
  });

  test("pusty plik nie zgłasza obcięcia", () => {
    const result = parse_nginx_log("", SMALL_BUDGET);

    expect(result.records).toHaveLength(0);
    expect(result.sourceLines).toBe(0);
    expect(result.readLines).toBe(0);
    expect(result.truncated).toBe(false);
  });
});
