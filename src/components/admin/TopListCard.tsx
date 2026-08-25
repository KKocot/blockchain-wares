import { useId } from "react";
import type { LogStatBucket } from "../../lib/logs/types";
import { CARD_CLASS } from "./styles";

interface TopListCardProps {
  title: string;
  buckets: LogStatBucket[];
  emptyLabel?: string;
}

const integer_formatter = new Intl.NumberFormat("pl-PL");

function bar_width(count: number, max_count: number): number {
  if (max_count <= 0 || count <= 0) return 0;
  return Math.max(2, Math.min(100, (count / max_count) * 100));
}

export function TopListCard({
  title,
  buckets,
  emptyLabel = "Brak danych w tym zakresie.",
}: TopListCardProps) {
  const heading_id = useId();
  const max_count = buckets.reduce(
    (acc, bucket) => Math.max(acc, bucket.count),
    0,
  );

  return (
    <section aria-labelledby={heading_id} className={CARD_CLASS}>
      <h2 id={heading_id} className="text-sm font-semibold text-base-content">
        {title}
      </h2>

      {buckets.length === 0 ? (
        <p className="mt-3 py-2 text-sm text-base-content/60">{emptyLabel}</p>
      ) : (
        <ol className="mt-3 space-y-1.5">
          {buckets.map((bucket, index) => (
            <li
              key={`${index}-${bucket.label}`}
              className="relative flex items-center justify-between gap-3 overflow-hidden rounded-md px-2 py-1.5"
            >
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 rounded-md bg-secondary/15"
                style={{ width: `${bar_width(bucket.count, max_count)}%` }}
              />
              <span
                className="relative min-w-0 flex-1 truncate text-sm text-base-content"
                title={bucket.label}
              >
                {bucket.label}
              </span>
              <span className="admin-tnum relative shrink-0 text-sm font-medium text-base-content/80">
                {integer_formatter.format(bucket.count)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
