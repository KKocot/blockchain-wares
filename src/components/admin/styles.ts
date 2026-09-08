/** Wspolne klasy panelu admina — jedno zrodlo prawdy dla kontrolek i kart. */

import { ICON_KEYS } from "../event-types";

export const BUTTON_CLASS =
  "inline-flex items-center rounded-md border border-base-300 bg-base-200 px-3 py-1.5 text-sm font-medium transition-colors duration-150 hover:border-secondary/50 hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-base-300 disabled:hover:text-base-content";

/** Wariant dla `<span>` udajacego wylaczony przycisk — linku nie da sie `disabled`. */
export const BUTTON_DISABLED_CLASS =
  "inline-flex cursor-not-allowed items-center rounded-md border border-base-300 bg-base-200 px-3 py-1.5 text-sm font-medium text-base-content/40";

export const FIELD_CLASS =
  "w-full rounded-md border border-base-300 bg-base-200 px-3 py-2 text-sm text-base-content transition-colors duration-150 placeholder:text-base-content/40 hover:border-base-content/20 focus-visible:border-secondary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:cursor-not-allowed disabled:opacity-60";

export const SELECT_CLASS =
  "rounded-md border border-base-300 bg-base-200 px-2 py-1.5 text-sm transition-colors duration-150 hover:border-secondary/50 focus-visible:border-secondary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

export const LABEL_CLASS =
  "mb-1 block text-xs font-medium tracking-wide text-base-content/60 uppercase";

export const CARD_CLASS = "rounded-md border border-base-300 bg-base-100 p-4";

/** Kontrolka `select` w formularzu: `SELECT_CLASS` jest skrojony pod pasek narzedziowy. */
export const SELECT_CONTROL_CLASS =
  "w-full rounded-md border border-base-300 bg-base-200 px-3 py-2 text-sm text-base-content transition-colors duration-150 hover:border-base-content/20 focus-visible:border-secondary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

export const ERROR_CONTROL_CLASS =
  "border-error/60 focus-visible:border-error focus-visible:outline-error";

export const SUBMIT_CLASS =
  "inline-flex items-center rounded-md border border-secondary/40 bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary transition-colors duration-150 hover:border-secondary/60 hover:bg-secondary/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

/** Pionowy pasek przy etykiecie grupy — ten sam znak, co w `TrafficFilters`. */
export const RAIL_CLASS = "h-3 w-0.5 shrink-0 rounded-full";

export const GROUP_LABEL_CLASS = "text-xs font-semibold tracking-wide uppercase";

/** Wiersz karty formularza; odstepy pionowe robi `divide-y` rodzica. */
export const ROW_CLASS = "px-4 py-4 sm:px-5";

export const SLOT_CLASS =
  "rounded-md border bg-base-200/40 p-2 transition-colors duration-150 motion-reduce:transition-none";

export const SLOT_EMPTY_CLASS = "border-dashed border-base-300";

export const SLOT_FILLED_CLASS = "border-base-300";

export const SLOT_ERROR_CLASS = "border-error/60";

export const ICON_BOX_CLASS =
  "flex size-9 shrink-0 items-center justify-center rounded-md border";

/** Przyciski „+" i „×" slotow — mniejsze od `BUTTON_CLASS`, ten sam jezyk. */
export const GHOST_BUTTON_CLASS =
  "inline-flex min-h-8 min-w-8 items-center justify-center gap-1 rounded-md border border-base-300 bg-base-200 px-2 text-xs font-medium transition-colors duration-150 hover:border-secondary/50 hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary motion-reduce:transition-none";

/** Wariant „komplet": `aria-disabled`, nie `disabled` — przycisk zostaje w kolejnosci Tab. */
export const GHOST_BUTTON_FULL_CLASS =
  "inline-flex min-h-8 min-w-8 cursor-not-allowed items-center justify-center gap-1 rounded-md border border-base-300 bg-base-200 px-2 text-xs font-medium text-base-content/40";

export const ACTION_BAR_CLASS =
  "sticky bottom-0 z-20 -mx-4 mt-4 flex flex-wrap items-center gap-3 border-t border-base-300 bg-base-100/95 px-4 py-3 backdrop-blur-sm supports-[backdrop-filter]:bg-base-100/80 sm:-mx-5 sm:px-5";

/** Barwa grupy niesie hierarchie zamiast kolejnego stopnia przezroczystosci bieli. */
export const TONE_TEXT_CLASS = {
  secondary: "text-secondary",
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
} as const;

export const TONE_RAIL_CLASS = {
  secondary: "bg-secondary",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
} as const;

/** Lewa krawedz wypelnionego slotu. */
export const TONE_EDGE_CLASS = {
  secondary: "bg-secondary/70",
  info: "bg-info/70",
  success: "bg-success/70",
  warning: "bg-warning/70",
} as const;

/** Wypelniony chip tematu — barwa, nie przezroczystosc tekstu. */
export const CHIP_FILLED_CLASS = "border-success/50 bg-success/10 text-success";

export const CHIP_EMPTY_CLASS = "border-dashed border-base-300";

/**
 * Podglad ikony przelacza sie bez JS: wszystkie warianty siedza w DOM, a regula
 * `:has(option:checked)` odslania wybrany. Bez `:has()` zostaje stan z serwera.
 * Pusty klucz to pozycja „bez ikony" — adresowalna tak samo jak reszta presetu.
 */
export const ICON_PREVIEW_CSS = [
  "[data-icon-preview] > [data-icon]{display:none}",
  "[data-icon-preview] > [data-icon][data-current]{display:flex}",
  "@supports selector(:has(*)){",
  "[data-icon-slot]:has(option:checked) [data-icon-preview] > [data-icon]{display:none}",
  ...["", ...ICON_KEYS].map(
    (key) =>
      `[data-icon-slot]:has(option[value="${key}"]:checked) [data-icon-preview] > [data-icon="${key}"]{display:flex}`,
  ),
  "}",
].join("\n");

/**
 * `admin_slots.ts` przelacza `data-full` na przycisku "+" bez re-renderu Reacta, wiec
 * klasy Tailwind wypisane przy SSR nie nadazaja za pozniejszym dodaniem/wyczyszczeniem
 * slotu. Selektor atrybutowy `button[data-slot-add][data-full]` (specyficznosc 0,2,1)
 * bije `hover:*:hover` (0,2,0) niezaleznie od kolejnosci arkuszy — bez `disabled`, wiec
 * przycisk zostaje w kolejnosci Tab.
 */
export const SLOT_ADD_FULL_CSS = [
  "button[data-slot-add][data-full]{cursor:not-allowed;color:color-mix(in oklab,var(--color-base-content) 40%,transparent)}",
  "button[data-slot-add][data-full]:hover{border-color:var(--color-base-300);color:color-mix(in oklab,var(--color-base-content) 40%,transparent)}",
].join("\n");
