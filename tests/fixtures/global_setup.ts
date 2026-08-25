import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { LOG_FIXTURE_FILE } from "../../playwright.config";
import { render_access_log } from "./access_log";

/**
 * Log powstaje raz na uruchomienie runnera, z timestampami liczonymi od TERAZ —
 * inaczej zbiór zestarzałby się i asercje o wykresie zaczęłyby padać z czasem.
 * Serwer fixture'a (webServer) startuje wcześniej i czyta plik przy żądaniu.
 */
export default async function global_setup(): Promise<void> {
  await mkdir(dirname(LOG_FIXTURE_FILE), { recursive: true });
  await writeFile(LOG_FIXTURE_FILE, render_access_log(new Date()), "utf8");
}
