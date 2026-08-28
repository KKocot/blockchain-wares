import { cn } from "../../lib/utils";
import { CARD_CLASS } from "./styles";

interface TrafficToggleProps {
  /** Stan flagi `excludeBots` z biezacego zapytania. */
  active: boolean;
  /** Adres odwracajacy flage — panel nie ma JS-a, wiec przelacznik jest linkiem. */
  href: string;
}

const LABEL_ID = "admin-traffic-toggle-label";
const HINT_ID = "admin-traffic-toggle-hint";

const TRACK_CLASS =
  "inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-150 motion-reduce:transition-none";

const THUMB_CLASS =
  "block size-4 rounded-full transition duration-150 motion-reduce:transition-none";

export function TrafficToggle({ active, href }: TrafficToggleProps) {
  return (
    <a
      href={href}
      role="switch"
      aria-checked={active}
      aria-labelledby={LABEL_ID}
      aria-describedby={HINT_ID}
      className={cn(
        CARD_CLASS,
        "flex items-center gap-3 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary motion-reduce:transition-none",
        active
          ? "border-secondary/50 bg-secondary/10 hover:border-secondary"
          : "hover:border-secondary/50",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          TRACK_CLASS,
          active
            ? "border-secondary bg-secondary"
            : "border-base-300 bg-base-200",
        )}
      >
        <span
          className={cn(
            THUMB_CLASS,
            active
              ? "translate-x-[1.375rem] bg-base-100"
              : "translate-x-0.5 bg-base-content/70",
          )}
        />
      </span>

      <span className="min-w-0">
        <span
          id={LABEL_ID}
          className="block text-sm font-medium text-base-content"
        >
          Ukryj boty i nierozpoznany ruch
        </span>
        <span id={HINT_ID} className="block text-xs text-base-content/60">
          Dotyczy kafelków, wykresu i tabeli.
        </span>
      </span>
    </a>
  );
}
