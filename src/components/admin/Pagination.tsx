import { cn } from "../../lib/utils";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  type LogPage,
} from "../../lib/logs/types";
import type { HiddenField } from "./LogsFilters";
import { BUTTON_CLASS, BUTTON_DISABLED_CLASS, SELECT_CLASS } from "./styles";

interface PaginationProps {
  page: LogPage | null;
  error: string | null;
  pageHref: (page: number) => string;
  action: string;
  /** Filtry i sortowanie — zmiana rozmiaru strony nie moze ich zgubic. */
  hidden: readonly HiddenField[];
}

const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

const ERROR_SUMMARY = "Nie udało się wczytać wyników.";
const UNAVAILABLE_SUMMARY = "Dane niedostępne";
const EMPTY_SUMMARY = "Brak wyników";

let number_formatter: Intl.NumberFormat | null = null;

function format_number(value: number): string {
  number_formatter ??= new Intl.NumberFormat("pl-PL");
  return number_formatter.format(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function build_page_sizes(current: number): number[] {
  const sizes = new Set<number>(
    PAGE_SIZE_OPTIONS.filter((size) => size <= MAX_PAGE_SIZE),
  );
  sizes.add(clamp(current, 1, MAX_PAGE_SIZE));
  return [...sizes].sort((a, b) => a - b);
}

function StepLink({
  href,
  enabled,
  label,
  glyph,
  glyphFirst,
}: {
  href: string;
  enabled: boolean;
  label: string;
  glyph: string;
  glyphFirst: boolean;
}) {
  const content = glyphFirst ? (
    <>
      <span aria-hidden="true">{glyph}</span>
      {label}
    </>
  ) : (
    <>
      {label}
      <span aria-hidden="true">{glyph}</span>
    </>
  );

  if (!enabled) {
    return (
      <span aria-disabled="true" className={cn(BUTTON_DISABLED_CLASS, "gap-1")}>
        {content}
      </span>
    );
  }

  return (
    <a href={href} rel={glyphFirst ? "prev" : "next"} className={cn(BUTTON_CLASS, "gap-1")}>
      {content}
    </a>
  );
}

export function Pagination({
  page,
  error,
  pageHref,
  action,
  hidden,
}: PaginationProps) {
  const total = page?.total ?? 0;
  const total_pages = page?.totalPages ?? 0;
  const current = page?.page ?? 1;
  const page_size = clamp(
    page?.pageSize ?? DEFAULT_PAGE_SIZE,
    1,
    MAX_PAGE_SIZE,
  );
  const has_results = page !== null && total_pages > 0 && total > 0;
  const has_error = error !== null;

  const from = has_results ? Math.min((current - 1) * page_size + 1, total) : 0;
  const to = has_results ? Math.min(current * page_size, total) : 0;

  // Trzy rozlaczne stany: blad zrodla, brak odpowiedzi zrodla i pusty wynik filtra.
  const summary = has_error
    ? ERROR_SUMMARY
    : page === null
      ? UNAVAILABLE_SUMMARY
      : has_results
        ? `${format_number(from)}–${format_number(to)} z ${format_number(total)} ${total === 1 ? "wyniku" : "wyników"}`
        : EMPTY_SUMMARY;

  return (
    <nav
      aria-label="Paginacja wyników"
      className="flex flex-col gap-3 rounded-md border border-base-300 bg-base-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p
        className={cn(
          "text-sm",
          has_error ? "text-error" : "text-base-content/60",
        )}
      >
        {summary}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <form
          method="get"
          action={action}
          className="flex items-center gap-2"
          aria-label="Rozmiar strony"
        >
          {hidden.map((field) => (
            <input
              key={field.name}
              type="hidden"
              name={field.name}
              value={field.value}
            />
          ))}
          <label
            htmlFor="admin-page-size"
            className="text-xs font-medium tracking-wide text-base-content/60 uppercase"
          >
            Na stronie
          </label>
          <select
            id="admin-page-size"
            name="pageSize"
            defaultValue={String(page_size)}
            className={SELECT_CLASS}
          >
            {build_page_sizes(page_size).map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <button type="submit" className={BUTTON_CLASS}>
            Ustaw
          </button>
        </form>

        <div className="flex items-center gap-2">
          <StepLink
            href={pageHref(current - 1)}
            enabled={has_results && current > 1}
            label="Poprzednia"
            glyph="‹"
            glyphFirst
          />

          <span className="min-w-[8rem] text-center text-sm text-base-content/60">
            {has_results
              ? `Strona ${format_number(current)} z ${format_number(total_pages)}`
              : "—"}
          </span>

          <StepLink
            href={pageHref(current + 1)}
            enabled={has_results && current < total_pages}
            label="Następna"
            glyph="›"
            glyphFirst={false}
          />
        </div>
      </div>
    </nav>
  );
}
