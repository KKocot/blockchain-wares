/** Formatowanie wspolne dla kart statystyk — jeden formatter na proces. */

let integer_formatter: Intl.NumberFormat | null = null;

export function format_integer(value: number): string {
  integer_formatter ??= new Intl.NumberFormat("pl-PL");
  return integer_formatter.format(value);
}

/** Szerokosc paska tla w procentach; minimum 2%, zeby jedno trafienie bylo widoczne. */
export function bar_width(count: number, max_count: number): number {
  if (max_count <= 0 || count <= 0) {
    return 0;
  }
  return Math.max(2, Math.min(100, (count / max_count) * 100));
}

/** 1 trafienie / 2 trafienia / 5 trafien — reguly liczby mnogiej sa nieregularne. */
export function hits_label(count: number): string {
  if (count === 1) {
    return "trafienie";
  }
  const rest = count % 10;
  const teens = count % 100;
  return rest >= 2 && rest <= 4 && (teens < 12 || teens > 14)
    ? "trafienia"
    : "trafień";
}
