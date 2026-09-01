import { useId } from "react";
import { cn } from "../../lib/utils";

/** Rodzina kolorow przelacznika — niesie znaczenie grupy, nie tylko dekoracje. */
export type SwitchTone = "secondary" | "warning" | "info";

interface ToneStyle {
  on: string;
  off: string;
  track: string;
  outline: string;
  text: string;
}

const TONE_STYLES: Readonly<Record<SwitchTone, ToneStyle>> = {
  secondary: {
    on: "border-secondary/60 bg-secondary/10 hover:border-secondary",
    off: "border-base-300 bg-base-200/50 hover:border-secondary/40",
    track: "border-secondary bg-secondary",
    outline: "focus-visible:outline-secondary",
    text: "text-secondary",
  },
  warning: {
    on: "border-warning/60 bg-warning/10 hover:border-warning",
    off: "border-base-300 bg-base-200/50 hover:border-warning/40",
    track: "border-warning bg-warning",
    outline: "focus-visible:outline-warning",
    text: "text-warning",
  },
  info: {
    on: "border-info/60 bg-info/10 hover:border-info",
    off: "border-base-300 bg-base-200/50 hover:border-info/40",
    track: "border-info bg-info",
    outline: "focus-visible:outline-info",
    text: "text-info",
  },
};

const TRACK_CLASS =
  "inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-150 motion-reduce:transition-none";

const THUMB_CLASS =
  "block size-3.5 rounded-full transition duration-150 motion-reduce:transition-none";

const FOCUS_CLASS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors duration-150 motion-reduce:transition-none";

interface SwitchLinkProps {
  /** Adres odwracajacy flage — panel nie ma JS-a, wiec przelacznik jest linkiem. */
  href: string;
  /** `true` = kategoria widoczna w statystykach. Polaryzacja jest wspolna dla wszystkich. */
  checked: boolean;
  label: string;
  /** Zawsze powiazany przez `aria-describedby`; w wariancie `inline` tylko dla czytnika. */
  description: string;
  tone?: SwitchTone;
  /** `card` = kafelek z widocznym opisem, `inline` = kompaktowy przelacznik w naglowku. */
  variant?: "card" | "inline";
}

function Track({ checked, tone }: { checked: boolean; tone: SwitchTone }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        TRACK_CLASS,
        checked
          ? TONE_STYLES[tone].track
          : "border-base-300 bg-base-200 group-hover:border-base-content/30",
      )}
    >
      <span
        className={cn(
          THUMB_CLASS,
          checked
            ? "translate-x-[1.125rem] bg-base-100"
            : "translate-x-0.5 bg-base-content/60",
        )}
      />
    </span>
  );
}

export function SwitchLink({
  href,
  checked,
  label,
  description,
  tone = "secondary",
  variant = "card",
}: SwitchLinkProps) {
  const label_id = useId();
  const hint_id = useId();
  const style = TONE_STYLES[tone];

  if (variant === "inline") {
    return (
      <a
        href={href}
        role="switch"
        aria-checked={checked}
        aria-labelledby={label_id}
        aria-describedby={hint_id}
        className={cn(
          // WCAG 2.5.8: sam track ma 20px wysokosci, wiec cel dotykowy podnosi
          // padding, a ujemny margines trzyma wysokosc naglowka karty bez zmian.
          "group -my-1 inline-flex min-h-7 shrink-0 items-center gap-2 rounded-md px-2 py-1",
          FOCUS_CLASS,
          style.outline,
        )}
      >
        <Track checked={checked} tone={tone} />
        <span
          id={label_id}
          className={cn(
            "text-xs font-medium",
            checked ? style.text : "text-base-content/70",
          )}
        >
          {label}
        </span>
        <span id={hint_id} className="sr-only">
          {description}
        </span>
      </a>
    );
  }

  return (
    <a
      href={href}
      role="switch"
      aria-checked={checked}
      aria-labelledby={label_id}
      aria-describedby={hint_id}
      className={cn(
        "group flex items-start gap-3 rounded-md border p-3",
        FOCUS_CLASS,
        style.outline,
        checked ? style.on : style.off,
      )}
    >
      <span className="mt-0.5">
        <Track checked={checked} tone={tone} />
      </span>

      <span className="min-w-0">
        <span
          id={label_id}
          className="block text-sm font-medium text-base-content"
        >
          {label}
        </span>
        <span
          id={hint_id}
          className="mt-0.5 block text-xs break-words text-base-content/60"
        >
          {description}
        </span>
      </span>
    </a>
  );
}
