/** Zegar panelu: jedna strefa i jeden format dla zdania o świeżości danych. */

/**
 * Strefa wlasciciela panelu, nie renderera. Na Vercelu serwer chodzi w UTC, wiec
 * bez tego godzina pobrania danych wyglada jak lokalna, przesunieta o 1-2 h —
 * akurat w zdaniu, ktorego cala funkcja to powiedziec, jak stare sa dane. Skrot
 * strefy zostaje w wyniku, zeby godzina nie wymagala zaufania do konfiguracji hosta.
 */
const PANEL_TIME_ZONE = "Europe/Warsaw";

const clock_formatter = new Intl.DateTimeFormat("pl-PL", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: PANEL_TIME_ZONE,
  timeZoneName: "short",
});

/** `null` = wartosc nie jest data; wolajacy decyduje, co napisac zamiast godziny. */
export function format_panel_clock(iso: string): string | null {
  const millis = Date.parse(iso);
  return Number.isNaN(millis) ? null : clock_formatter.format(millis);
}
