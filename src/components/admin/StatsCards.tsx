import type { LogStats } from "../../lib/logs/types";
import { cn } from "../../lib/utils";
import { CARD_CLASS } from "./styles";

interface StatsCardsProps {
  stats: LogStats | null;
}

const GRID_CLASS = "grid grid-cols-1 gap-4 sm:grid-cols-3";
const EMPTY_VALUE = "—";

const integer_formatter = new Intl.NumberFormat("pl-PL");
const decimal_formatter = new Intl.NumberFormat("pl-PL", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

function format_integer(value: number): string {
  return Number.isFinite(value) ? integer_formatter.format(value) : EMPTY_VALUE;
}

function format_decimal(value: number): string {
  return Number.isFinite(value) ? decimal_formatter.format(value) : EMPTY_VALUE;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const tiles = [
    {
      key: "total",
      label: "Żądania łącznie",
      value: stats ? format_integer(stats.totalRequests) : EMPTY_VALUE,
    },
    {
      key: "ips",
      label: "Unikalne adresy IP",
      value: stats ? format_integer(stats.uniqueIps) : EMPTY_VALUE,
    },
    {
      key: "avg",
      label: "Średnio na dzień",
      value: stats ? format_decimal(stats.avgPerDay) : EMPTY_VALUE,
    },
  ];

  const is_empty = stats === null || stats.totalRequests === 0;

  return (
    <div className="space-y-2">
      <dl className={GRID_CLASS}>
        {tiles.map((tile) => (
          // flex-col-reverse: kolejnosc DOM dt->dd (poprawny <dl>), wizualnie liczba nad labelem.
          <div
            key={tile.key}
            className={cn(CARD_CLASS, "flex flex-col-reverse gap-1")}
          >
            <dt className="text-xs text-base-content/60">{tile.label}</dt>
            <dd
              className={cn(
                "admin-tnum text-2xl leading-tight font-semibold sm:text-3xl",
                stats ? "text-base-content" : "text-base-content/40",
              )}
            >
              {tile.value}
            </dd>
          </div>
        ))}
      </dl>

      {is_empty && (
        <p className="text-xs text-base-content/60">
          {stats === null
            ? "Brak danych statystycznych — nie udało się ich wczytać."
            : "Brak żądań spełniających bieżące filtry."}
        </p>
      )}
    </div>
  );
}
