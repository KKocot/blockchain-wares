import { cn } from "../../lib/utils";
import type { LogQuery } from "../../lib/logs/types";
import { BUTTON_CLASS, CARD_CLASS, FIELD_CLASS, LABEL_CLASS } from "./styles";

export interface HiddenField {
  name: string;
  value: string;
}

interface LogsFiltersProps {
  query: LogQuery;
  action: string;
  resetHref: string;
  /** Wszystko, czego ten formularz nie ma w polach — bez tego submit gasilby przelaczniki, sortowanie i rozmiar strony. */
  hidden: readonly HiddenField[];
}

const STATUS_SUGGESTIONS = [
  "200",
  "301",
  "304",
  "404",
  "2xx",
  "3xx",
  "4xx",
  "5xx",
];
const STATUS_LIST_ID = "admin-filter-status-options";

function iso_to_day(value: string | null): string {
  if (value === null) {
    return "";
  }
  const millis = Date.parse(value);
  if (Number.isNaN(millis)) {
    return "";
  }
  return new Date(millis).toISOString().slice(0, 10);
}

export function LogsFilters({
  query,
  action,
  resetHref,
  hidden,
}: LogsFiltersProps) {
  const date_from_day = iso_to_day(query.dateFrom);
  const date_to_day = iso_to_day(query.dateTo);

  return (
    <form
      method="get"
      action={action}
      aria-label="Filtry logów"
      className={cn(CARD_CLASS, "space-y-4")}
    >
      {hidden.map((field) => (
        <input
          key={field.name}
          type="hidden"
          name={field.name}
          value={field.value}
        />
      ))}

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Filtry</h2>
        <a href={resetHref} className={BUTTON_CLASS}>
          Wyczyść filtry
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="admin-filter-path" className={LABEL_CLASS}>
            Ścieżka
          </label>
          <input
            id="admin-filter-path"
            name="path"
            type="text"
            inputMode="url"
            autoComplete="off"
            placeholder="/kariera"
            defaultValue={query.path ?? ""}
            className={cn(FIELD_CLASS, "admin-mono")}
          />
        </div>

        <div>
          <label htmlFor="admin-filter-search" className={LABEL_CLASS}>
            Szukaj
          </label>
          <input
            id="admin-filter-search"
            name="search"
            type="search"
            autoComplete="off"
            placeholder="IP, referrer, user agent"
            defaultValue={query.search ?? ""}
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label htmlFor="admin-filter-status" className={LABEL_CLASS}>
            Status
          </label>
          <input
            id="admin-filter-status"
            name="status"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="404 lub 4xx"
            list={STATUS_LIST_ID}
            defaultValue={query.status ?? ""}
            className={cn(FIELD_CLASS, "admin-mono")}
          />
          <datalist id={STATUS_LIST_ID}>
            {STATUS_SUGGESTIONS.map((code) => (
              <option key={code} value={code} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="admin-filter-date-from" className={LABEL_CLASS}>
            Data od
          </label>
          <input
            id="admin-filter-date-from"
            name="dateFrom"
            type="date"
            max={date_to_day === "" ? undefined : date_to_day}
            defaultValue={date_from_day}
            className={cn(FIELD_CLASS, "admin-mono [color-scheme:dark]")}
          />
        </div>

        <div>
          <label htmlFor="admin-filter-date-to" className={LABEL_CLASS}>
            Data do
          </label>
          <input
            id="admin-filter-date-to"
            name="dateTo"
            type="date"
            min={date_from_day === "" ? undefined : date_from_day}
            defaultValue={date_to_day}
            className={cn(FIELD_CLASS, "admin-mono [color-scheme:dark]")}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className={BUTTON_CLASS}>
          Zastosuj filtry
        </button>
        <p className="text-xs text-base-content/60">
          Status przyjmuje kod (404) lub klasę (4xx). Zakres dat jest domknięty
          obustronnie — dzień „do” liczy się w całości, do 23:59:59.999 (UTC).
        </p>
      </div>
    </form>
  );
}
