import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import type {
  LogPage,
  RequestLog,
  SortDir,
  SortField,
} from "../../lib/logs/types";

interface LogsTableProps {
  page: LogPage | null;
  sort: SortField;
  dir: SortDir;
  sortHref: (field: SortField) => string;
}

interface ColumnDef {
  id: string;
  label: string;
  sort: SortField | null;
  cell: (log: RequestLog) => ReactNode;
}

let timestamp_formatter: Intl.DateTimeFormat | null = null;

function format_timestamp(value: string): string {
  const millis = Date.parse(value);
  if (Number.isNaN(millis)) {
    return value;
  }
  timestamp_formatter ??= new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return timestamp_formatter.format(millis);
}

function EmptyValue() {
  return (
    <span className="text-base-content/60" title="Brak wartości">
      —
    </span>
  );
}

function TextValue({
  value,
  className,
}: {
  value: string | null;
  className?: string;
}) {
  if (value === null || value.trim() === "") {
    return <EmptyValue />;
  }
  return (
    <span className={cn("block truncate", className)} title={value}>
      {value}
    </span>
  );
}

interface StatusStyle {
  tone: string;
  description: string;
}

const STATUS_STYLES: Readonly<Record<number, StatusStyle>> = {
  1: {
    tone: "border-info/40 bg-info/10 text-info",
    description: "Informacyjny (1xx)",
  },
  2: {
    tone: "border-success/40 bg-success/10 text-success",
    description: "Sukces (2xx)",
  },
  3: {
    tone: "border-info/40 bg-info/10 text-info",
    description: "Przekierowanie (3xx)",
  },
  4: {
    tone: "border-warning/40 bg-warning/10 text-warning",
    description: "Błąd żądania (4xx)",
  },
  5: {
    tone: "border-error/40 bg-error/10 text-error",
    description: "Błąd serwera (5xx)",
  },
};

const UNKNOWN_STATUS: StatusStyle = {
  tone: "border-base-300 bg-base-200 text-base-content/60",
  description: "Nieznany kod odpowiedzi",
};

/** Kod liczbowy zostaje widoczny obok koloru — sam odcien nie moze niesc klasy odpowiedzi. */
function StatusValue({ status }: { status: number }) {
  if (!Number.isFinite(status) || status <= 0) {
    return <EmptyValue />;
  }
  const style = STATUS_STYLES[Math.floor(status / 100)] ?? UNKNOWN_STATUS;
  return (
    <span
      title={style.description}
      className={cn(
        "admin-mono inline-flex rounded-md border px-1.5 py-0.5 text-xs font-semibold",
        style.tone,
      )}
    >
      {status}
    </span>
  );
}

/** GET to tlo panelu — reszta metod ma byc czytelna na pierwszy rzut oka. */
function MethodValue({ method }: { method: string }) {
  const normalized = method.trim().toUpperCase();
  if (normalized === "") {
    return <EmptyValue />;
  }
  return (
    <span
      className={cn(
        "admin-mono text-xs font-semibold tracking-wide",
        normalized === "GET" ? "text-base-content/60" : "text-base-content",
      )}
    >
      {normalized}
    </span>
  );
}

const COLUMNS: readonly ColumnDef[] = [
  {
    id: "timestamp",
    label: "Czas",
    sort: "timestamp",
    cell: (log) => (
      <span className="admin-mono whitespace-nowrap" title={log.timestamp}>
        {format_timestamp(log.timestamp)}
      </span>
    ),
  },
  {
    id: "method",
    label: "Metoda",
    sort: "method",
    cell: (log) => <MethodValue method={log.method} />,
  },
  {
    id: "status",
    label: "Status",
    sort: "status",
    cell: (log) => <StatusValue status={log.status} />,
  },
  {
    id: "path",
    label: "Ścieżka",
    sort: "path",
    cell: (log) => <TextValue value={log.path} className="max-w-[18rem]" />,
  },
  {
    id: "query",
    label: "Query",
    sort: null,
    cell: (log) => (
      <TextValue
        value={log.query}
        className="admin-mono max-w-[12rem] text-xs"
      />
    ),
  },
  {
    id: "ip",
    label: "IP",
    sort: "ip",
    cell: (log) => (
      <TextValue value={log.ip} className="admin-mono max-w-[10rem]" />
    ),
  },
  {
    id: "lang",
    label: "Język",
    sort: "lang",
    cell: (log) => <TextValue value={log.lang} className="max-w-[8rem]" />,
  },
  {
    id: "referrer",
    label: "Referrer",
    sort: "referrer",
    cell: (log) => <TextValue value={log.referrer} className="max-w-[20rem]" />,
  },
  {
    id: "browser",
    label: "Przeglądarka",
    sort: "ua",
    cell: (log) => (
      <span
        className="block max-w-[12rem] truncate"
        title={log.ua ?? log.browser}
      >
        {log.browser}
      </span>
    ),
  },
];

function aria_sort_value(
  column_sort: SortField | null,
  sort: SortField,
  dir: SortDir,
): "ascending" | "descending" | "none" | undefined {
  if (column_sort === null) {
    return undefined;
  }
  if (column_sort !== sort) {
    return "none";
  }
  return dir === "asc" ? "ascending" : "descending";
}

function SortIndicator({ state }: { state: SortDir | null }) {
  const glyph = state === "asc" ? "↑" : state === "desc" ? "↓" : "↕";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "w-2 shrink-0 text-center transition-opacity duration-150",
        state === null
          ? "opacity-0 group-hover:opacity-60 group-focus-visible:opacity-60"
          : "text-secondary opacity-100",
      )}
    >
      {glyph}
    </span>
  );
}

function MessageRow({ title, hint }: { title: string; hint?: string }) {
  return (
    <tr>
      <td colSpan={COLUMNS.length} className="px-3 py-12 text-center">
        <p className="text-sm font-medium">{title}</p>
        {hint !== undefined && (
          <p className="mt-1 text-xs text-base-content/60">{hint}</p>
        )}
      </td>
    </tr>
  );
}

export function LogsTable({ page, sort, dir, sortHref }: LogsTableProps) {
  const items = page?.items ?? [];

  return (
    <div className="overflow-hidden rounded-md border border-base-300 bg-base-100">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[80rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            Zarejestrowane żądania: czas, metoda, status odpowiedzi, ścieżka,
            query, adres IP, język, referrer i przeglądarka. Nagłówki kolumn są
            odnośnikami zmieniającymi sortowanie.
          </caption>
          <thead className="bg-base-200">
            <tr>
              {COLUMNS.map((column) => {
                const sort_field = column.sort;
                const active = sort_field !== null && sort_field === sort;
                return (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={aria_sort_value(sort_field, sort, dir)}
                    className="border-b border-base-300 px-3 py-2 text-xs font-semibold tracking-wide text-base-content/60 uppercase"
                  >
                    {sort_field === null ? (
                      column.label
                    ) : (
                      <a
                        href={sortHref(sort_field)}
                        className="group flex items-center gap-1 rounded-md text-xs font-semibold tracking-wide uppercase transition-colors duration-150 hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                      >
                        <span className={active ? "text-secondary" : undefined}>
                          {column.label}
                        </span>
                        <SortIndicator state={active ? dir : null} />
                      </a>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-base-300">
            {page === null ? (
              <MessageRow
                title="Brak danych do wyświetlenia"
                hint="Źródło logów nie odpowiedziało — użyj przycisku „Odśwież dane”."
              />
            ) : items.length === 0 ? (
              <MessageRow
                title="Brak wyników"
                hint="Zmień zakres dat lub wyczyść filtry, aby zobaczyć więcej wpisów."
              />
            ) : (
              items.map((log) => (
                <tr
                  key={log.id}
                  className="transition-colors duration-150 hover:bg-base-200/60"
                >
                  {COLUMNS.map((column) => (
                    <td
                      key={column.id}
                      className="px-3 py-2 align-middle whitespace-nowrap"
                    >
                      {column.cell(log)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
