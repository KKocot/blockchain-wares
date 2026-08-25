/** Wspolne klasy panelu admina — jedno zrodlo prawdy dla kontrolek i kart. */

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
