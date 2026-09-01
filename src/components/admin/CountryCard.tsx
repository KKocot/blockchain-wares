import { useId } from "react";
import type { CountryIpBucket } from "../../lib/logs/types";
import { cn } from "../../lib/utils";
import { country_name } from "./country_name";
import { bar_width, format_integer, hits_label } from "./stats_format";
import { SwitchLink } from "./SwitchLink";
import { CARD_CLASS } from "./styles";

interface CountryCardProps {
  buckets: CountryIpBucket[];
  /** Stan `showCountryIps` — czysto prezentacyjny, nie zwezaja zbioru danych. */
  showIps: boolean;
  toggleHref: string;
}

const UNRESOLVED_LABEL = "Nieprzypisane (brak w GeoIP)";
const EMPTY_LABEL = "Brak danych o krajach w tym zakresie.";
const NO_IPS_LABEL = "Brak adresów IP w tym zakresie.";
const TOGGLE_HINT =
  "Rozwija listę adresów IP pod każdym krajem. Nie zmienia zbioru danych.";

function bucket_label(country: string | null): string {
  if (country === null) {
    return UNRESOLVED_LABEL;
  }
  return country_name(country) ?? country;
}

function IpList({
  bucket,
  unresolved,
}: {
  bucket: CountryIpBucket;
  unresolved: boolean;
}) {
  return (
    <ul
      className={cn(
        "mt-1 mb-2 ml-2 space-y-1 border-l pl-3",
        unresolved ? "border-warning/40" : "border-secondary/30",
      )}
    >
      {bucket.ips.length === 0 && (
        <li className="text-xs text-base-content/50">{NO_IPS_LABEL}</li>
      )}

      {bucket.ips.map((entry) => (
        <li
          key={entry.ip}
          className="flex items-baseline justify-between gap-3"
        >
          <span
            className="admin-mono min-w-0 truncate text-xs text-base-content/75"
            title={entry.ip}
          >
            {entry.ip}
          </span>
          <span
            className={cn(
              "admin-mono shrink-0 text-xs font-medium",
              unresolved ? "text-warning" : "text-secondary",
            )}
          >
            {format_integer(entry.count)}
          </span>
        </li>
      ))}

      {bucket.hiddenIps > 0 && (
        <li className="admin-tnum text-xs text-base-content/50">
          +{format_integer(bucket.hiddenIps)} więcej IP ·{" "}
          {format_integer(bucket.hiddenHits)} {hits_label(bucket.hiddenHits)}
        </li>
      )}
    </ul>
  );
}

export function CountryCard({ buckets, showIps, toggleHref }: CountryCardProps) {
  const heading_id = useId();
  const max_count = buckets.reduce(
    (acc, bucket) => Math.max(acc, bucket.total),
    0,
  );

  return (
    <section aria-labelledby={heading_id} className={CARD_CLASS}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h2 id={heading_id} className="text-sm font-semibold text-base-content">
          Kraje
        </h2>
        <SwitchLink
          href={toggleHref}
          checked={showIps}
          label="Pokaż IP"
          description={TOGGLE_HINT}
          variant="inline"
        />
      </div>

      {buckets.length === 0 ? (
        <p className="mt-3 py-2 text-sm text-base-content/60">{EMPTY_LABEL}</p>
      ) : (
        <ol className="mt-3 space-y-1.5">
          {buckets.map((bucket) => {
            const unresolved = bucket.country === null;
            const label = bucket_label(bucket.country);

            return (
              <li key={bucket.country ?? "__unresolved"}>
                <div className="relative flex items-center justify-between gap-3 overflow-hidden rounded-md px-2 py-1.5">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-md",
                      unresolved ? "bg-warning/15" : "bg-secondary/15",
                    )}
                    style={{ width: `${bar_width(bucket.total, max_count)}%` }}
                  />
                  <span
                    className={cn(
                      "relative min-w-0 flex-1 truncate text-sm",
                      unresolved
                        ? "font-medium text-warning"
                        : "text-base-content",
                    )}
                    title={label}
                  >
                    {label}
                  </span>
                  <span
                    className={cn(
                      "admin-tnum relative shrink-0 text-sm font-medium",
                      unresolved ? "text-warning" : "text-base-content/80",
                    )}
                  >
                    {format_integer(bucket.total)}
                  </span>
                </div>

                {showIps && (
                  <IpList bucket={bucket} unresolved={unresolved} />
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
