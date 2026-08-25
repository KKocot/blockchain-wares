import type { LogDayBucket } from "../../lib/logs/types";
import { CARD_CLASS } from "./styles";

interface RequestsChartProps {
  buckets: LogDayBucket[];
}

const VIEW_WIDTH = 800;
const VIEW_HEIGHT = 200;
const PLOT_TOP = 8;
const BASELINE_Y = 192;
const PLOT_HEIGHT = BASELINE_Y - PLOT_TOP;
const MIN_BAR_HEIGHT = 2;

const integer_formatter = new Intl.NumberFormat("pl-PL");
const short_date_formatter = new Intl.DateTimeFormat("pl-PL", {
  day: "2-digit",
  month: "2-digit",
});
const long_date_formatter = new Intl.DateTimeFormat("pl-PL", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function format_date(iso_date: string, formatter: Intl.DateTimeFormat): string {
  const parsed = new Date(`${iso_date}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? iso_date : formatter.format(parsed);
}

export function RequestsChart({ buckets }: RequestsChartProps) {
  const first = buckets.at(0);
  const last = buckets.at(-1);

  if (!first || !last) {
    return (
      <section className={CARD_CLASS}>
        <h2 className="text-sm font-semibold text-base-content">
          Ruch dzienny
        </h2>
        <p className="mt-3 py-2 text-sm text-base-content/60">
          Brak danych do wykreślenia w tym zakresie.
        </p>
      </section>
    );
  }

  const max_count = buckets.reduce(
    (acc, bucket) => Math.max(acc, bucket.count),
    0,
  );
  // Caly szereg moze byc zerowy (dni bez ruchu) — bez tego dzielimy przez zero.
  const scale_max = max_count > 0 ? max_count : 1;
  const total_count = buckets.reduce((acc, bucket) => acc + bucket.count, 0);
  const peak = buckets.find((bucket) => bucket.count === max_count);

  const slot_width = VIEW_WIDTH / buckets.length;
  const bar_width = Math.max(1, slot_width * 0.68);

  const range_label = `od ${format_date(first.date, long_date_formatter)} do ${format_date(last.date, long_date_formatter)}`;
  const peak_label =
    max_count > 0 && peak
      ? `Szczyt: ${integer_formatter.format(max_count)} żądań dnia ${format_date(peak.date, long_date_formatter)}.`
      : "Brak żądań w tym okresie.";
  const aria_label = `Wykres słupkowy dziennej liczby żądań ${range_label}. ${peak_label} Łącznie ${integer_formatter.format(total_count)} żądań.`;

  return (
    <section className={CARD_CLASS}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="text-sm font-semibold text-base-content">
          Ruch dzienny
        </h2>
        <p className="admin-tnum text-xs text-base-content/60">
          {`Maks. ${integer_formatter.format(max_count)} / dzień · łącznie ${integer_formatter.format(total_count)}`}
        </p>
      </div>

      <svg
        role="img"
        aria-label={aria_label}
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="mt-3 h-auto w-full text-secondary"
      >
        <line
          x1={0}
          y1={BASELINE_Y}
          x2={VIEW_WIDTH}
          y2={BASELINE_Y}
          stroke="currentColor"
          strokeWidth={1}
          className="text-base-300"
        />

        {buckets.map((bucket, index) => {
          const raw_height = (bucket.count / scale_max) * PLOT_HEIGHT;
          const height =
            bucket.count > 0 ? Math.max(MIN_BAR_HEIGHT, raw_height) : 0;
          const slot_x = index * slot_width;
          const bar_x = slot_x + (slot_width - bar_width) / 2;

          return (
            <g
              key={bucket.date}
              className="opacity-80 transition-opacity duration-150 hover:opacity-100 motion-reduce:transition-none"
            >
              <title>
                {`${format_date(bucket.date, long_date_formatter)}: ${integer_formatter.format(bucket.count)} żądań`}
              </title>
              <rect
                x={slot_x}
                y={PLOT_TOP}
                width={slot_width}
                height={PLOT_HEIGHT}
                fill="transparent"
              />
              {height > 0 && (
                <rect
                  x={bar_x}
                  y={BASELINE_Y - height}
                  width={bar_width}
                  height={height}
                  rx={Math.min(2, bar_width / 2)}
                  fill="currentColor"
                />
              )}
            </g>
          );
        })}
      </svg>

      <div className="admin-mono mt-2 flex items-center justify-between text-xs text-base-content/60">
        <span>{format_date(first.date, short_date_formatter)}</span>
        <span>{format_date(last.date, short_date_formatter)}</span>
      </div>

      {max_count === 0 && (
        <p className="mt-2 text-xs text-base-content/60">
          Brak ruchu w wybranym okresie — wszystkie dni mają 0 żądań.
        </p>
      )}
    </section>
  );
}
