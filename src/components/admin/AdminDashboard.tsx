import { GEOIP_ATTRIBUTION } from "../../lib/geo";
import type {
  LogPage,
  LogQuery,
  LogStatBucket,
  LogStats,
  SortField,
} from "../../lib/logs/types";
import { cn } from "../../lib/utils";
import { LogsFilters, type HiddenField } from "./LogsFilters";
import { LogsTable, country_name } from "./LogsTable";
import { Pagination } from "./Pagination";
import { RequestsChart } from "./RequestsChart";
import { StatsCards } from "./StatsCards";
import { TopListCard } from "./TopListCard";
import { BUTTON_CLASS } from "./styles";

export interface DataFreshness {
  /** ISO chwili renderu strony. */
  generatedAt: string;
  /** ISO ostatniego udanego pobrania ze zrodla; null gdy cache jest pusty. */
  fetchedAt: string | null;
  stale: boolean;
}

interface AdminDashboardProps {
  query: LogQuery;
  page: LogPage | null;
  stats: LogStats | null;
  /** Twarda awaria: nie ma czego pokazac. */
  error: string | null;
  /** Miekka awaria: dane sa, ale pochodza z cache'u sprzed nieudanego odswiezenia. */
  warning: string | null;
  freshness: DataFreshness;
  refreshHref: string;
  filtersAction: string;
  resetHref: string;
  filterHidden: readonly HiddenField[];
  pageSizeHidden: readonly HiddenField[];
  sortHref: (field: SortField) => string;
  pageHref: (page: number) => string;
}

const MINUTE_MILLIS = 60_000;
const HOUR_MILLIS = 3_600_000;
const DAY_MILLIS = 86_400_000;

const clock_formatter = new Intl.DateTimeFormat("pl-PL", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function format_clock(iso: string): string | null {
  const millis = Date.parse(iso);
  return Number.isNaN(millis) ? null : clock_formatter.format(millis);
}

function format_age(from_iso: string, to_iso: string): string | null {
  const from = Date.parse(from_iso);
  const to = Date.parse(to_iso);
  if (Number.isNaN(from) || Number.isNaN(to)) {
    return null;
  }
  const delta = Math.max(0, to - from);
  if (delta < MINUTE_MILLIS) {
    return "przed chwilą";
  }
  if (delta < HOUR_MILLIS) {
    return `${Math.floor(delta / MINUTE_MILLIS)} min temu`;
  }
  if (delta < DAY_MILLIS) {
    return `${Math.floor(delta / HOUR_MILLIS)} godz. temu`;
  }
  return `${Math.floor(delta / DAY_MILLIS)} dni temu`;
}

function freshness_label(freshness: DataFreshness): string {
  if (freshness.fetchedAt === null) {
    return "Ze źródła nie pobrano dotąd żadnych danych.";
  }
  const clock = format_clock(freshness.fetchedAt);
  if (clock === null) {
    return "Wiek danych nieznany.";
  }
  const age = format_age(freshness.fetchedAt, freshness.generatedAt);
  const suffix = freshness.stale ? " Dane są przeterminowane." : "";
  return age === null
    ? `Dane z ${clock}.${suffix}`
    : `Dane z ${clock} — ${age}.${suffix}`;
}

const UNKNOWN_COUNTRY = "Nieznany kraj";

const ATTRIBUTION_LINK_CLASS =
  "rounded-sm underline underline-offset-2 transition-colors duration-150 hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

/**
 * CC BY 4.0 wymaga atrybucji na ekranie korzystajacym z danych — tekst i link
 * musza zostac w oryginalnym brzmieniu i byc widoczne bez interakcji.
 */
function GeoAttribution() {
  return (
    <footer className="border-t border-base-300 pt-3 text-xs text-base-content/60">
      <p>
        Dane o krajach pochodzą ze zbioru DB-IP IP to Country Lite —{" "}
        <a
          href={GEOIP_ATTRIBUTION.url}
          target="_blank"
          rel="noopener noreferrer"
          className={ATTRIBUTION_LINK_CLASS}
        >
          {GEOIP_ATTRIBUTION.text}
        </a>
        , licencja {GEOIP_ATTRIBUTION.license}.
      </p>
    </footer>
  );
}

/** W karcie jest miejsce na pelna nazwe — surowy kod ISO zostaje juz tylko w tabeli. */
function country_buckets(stats: LogStats | null): LogStatBucket[] {
  return (stats?.topCountries ?? []).map(({ label, count }) => ({
    label: country_name(label) ?? UNKNOWN_COUNTRY,
    count,
  }));
}

const NOTICE_TONES = {
  error: {
    wrapper: "border-error/40 bg-error/10",
    text: "text-error",
    meta: "text-error/80",
    action:
      "rounded-md border border-error/40 bg-error/10 px-3 py-1.5 text-sm font-semibold text-error transition-colors duration-150 hover:bg-error/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error",
  },
  warning: {
    wrapper: "border-warning/40 bg-warning/10",
    text: "text-warning",
    meta: "text-warning/80",
    action:
      "rounded-md border border-warning/40 bg-warning/10 px-3 py-1.5 text-sm font-semibold text-warning transition-colors duration-150 hover:bg-warning/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warning",
  },
} as const;

function Notice({
  tone,
  message,
  freshness,
  refreshHref,
}: {
  tone: keyof typeof NOTICE_TONES;
  message: string;
  freshness: DataFreshness;
  refreshHref: string;
}) {
  const style = NOTICE_TONES[tone];
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-md border px-4 py-3",
        style.wrapper,
      )}
    >
      <div>
        <p className={cn("text-sm", style.text)}>{message}</p>
        <p className={cn("admin-tnum mt-0.5 text-xs", style.meta)}>
          {freshness_label(freshness)}
        </p>
      </div>
      <a href={refreshHref} className={style.action}>
        Ponów próbę
      </a>
    </div>
  );
}

export function AdminDashboard({
  query,
  page,
  stats,
  error,
  warning,
  freshness,
  refreshHref,
  filtersAction,
  resetHref,
  filterHidden,
  pageSizeHidden,
  sortHref,
  pageHref,
}: AdminDashboardProps) {
  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Logi ruchu</h1>
          <p className="text-sm text-base-content/60">
            Żądania zarejestrowane przez middleware — filtry i sortowanie
            zapisują się w adresie strony.
          </p>
          <p className="admin-tnum mt-1 text-xs text-base-content/60">
            {freshness_label(freshness)}
          </p>
        </div>

        <a href={refreshHref} className={BUTTON_CLASS}>
          Odśwież dane
        </a>
      </header>

      {error !== null && (
        <Notice
          tone="error"
          message={error}
          freshness={freshness}
          refreshHref={refreshHref}
        />
      )}

      {warning !== null && (
        <Notice
          tone="warning"
          message={warning}
          freshness={freshness}
          refreshHref={refreshHref}
        />
      )}

      <StatsCards stats={stats} />

      <RequestsChart buckets={stats?.byDay ?? []} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TopListCard
          title="Najczęstsze ścieżki"
          buckets={stats?.topPaths ?? []}
        />
        <TopListCard
          title="Kody odpowiedzi"
          buckets={stats?.topStatuses ?? []}
          emptyLabel="Brak kodów odpowiedzi w tym zakresie."
        />
        <TopListCard
          title="Najczęstsze źródła"
          buckets={stats?.topReferrers ?? []}
          emptyLabel="Brak referrerów w tym zakresie."
        />
        <TopListCard title="Przeglądarki" buckets={stats?.topBrowsers ?? []} />
        <TopListCard
          title="Języki przeglądarek"
          buckets={stats?.topLangs ?? []}
        />
        <TopListCard
          title="Kraje"
          buckets={country_buckets(stats)}
          emptyLabel="Brak danych o krajach w tym zakresie."
        />
      </div>

      <LogsFilters
        query={query}
        action={filtersAction}
        resetHref={resetHref}
        hidden={filterHidden}
      />

      <LogsTable
        page={page}
        sort={query.sort}
        dir={query.dir}
        sortHref={sortHref}
      />

      <Pagination
        page={page}
        error={error}
        pageHref={pageHref}
        action={filtersAction}
        hidden={pageSizeHidden}
      />

      <GeoAttribution />
    </div>
  );
}
