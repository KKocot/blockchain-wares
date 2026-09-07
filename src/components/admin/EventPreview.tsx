import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils";
import {
  get_event_status,
  get_promoted_events,
  parse_iso_day,
  to_iso_day,
  type EventStatus,
  type TradeFairEvent,
} from "../events-data";
import { EventBanner } from "../EventBanner";
import { EventCard } from "../EventCard";
import { EventDetail } from "../EventDetail";
import {
  FORM_SCOPE,
  read_event_form,
  type EventFormError,
} from "../../lib/events/form_mapping";
import { EVENT_FORM_ID, FIELD_LABELS } from "./event_form_fields";
import { BUTTON_CLASS } from "./styles";

/**
 * Szkic bez `id` nie jest jeszcze `TradeFairEvent`, a przy tworzeniu slug nadaje backend
 * — podglad podstawia wlasny, zeby dalo sie zbudowac adres, ktorego i tak nie da sie kliknac.
 */
const PREVIEW_ID = "podglad";

/** Tyle wydarzen promuje baner na stronie glownej. */
const PROMOTED_LIMIT = 2;

export type PreviewVariant = "mini" | "card" | "detail";

interface VariantSpec {
  id: PreviewVariant;
  label: string;
  hint: string;
}

const VARIANTS: readonly VariantSpec[] = [
  {
    id: "mini",
    label: "Baner",
    hint: "Wpis w banerze na stronie głównej.",
  },
  {
    id: "card",
    label: "Karta",
    hint: "Kafel na liście /markets.",
  },
  {
    id: "detail",
    label: "Strona",
    hint: "Strona /markets/<id> — bez nawigacji i stopki serwisu.",
  },
];

/**
 * Baner promuje tylko to, co trwa albo dopiero będzie — reszta znika z niego bez śladu,
 * więc pusty wariant „mini” musi powiedzieć, dlaczego jest pusty.
 */
const MINI_SKIPPED: Record<"undated" | "past", string> = {
  undated:
    "Wydarzenie bez daty nie trafia do banera: baner odpowiada na pytanie „gdzie nas spotkać”, a wpis bez terminu nie ma na nie odpowiedzi. Uzupełnij „Data od”, żeby zobaczyć ten wariant.",
  past: "Wydarzenie, które już się odbyło, nie trafia do banera — promowane są tylko trwające i nadchodzące.",
};

const MINI_COMPETITION =
  "Baner pokazuje najwyżej dwa najbliższe wydarzenia — wcześniejsze wpisy mogą wyprzedzić to na stronie głównej.";

/** Panel ma font systemowy i mniejszą bazę; scena wraca do typografii landingu. */
const STAGE_STYLE: CSSProperties = {
  fontFamily: '"Quicksand", system-ui, -apple-system, sans-serif',
  fontSize: "1rem",
  lineHeight: 1.6,
};

const TAB_CLASS =
  "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";
const TAB_ACTIVE = "border-secondary/50 bg-secondary/15 text-secondary";
const TAB_IDLE =
  "border-base-300 bg-base-200 text-base-content/70 hover:border-secondary/40 hover:text-secondary";
const NOTE_CLASS = "mb-2 text-xs leading-relaxed text-base-content/70";

export interface EventPreviewProps {
  /**
   * Wartości startowe jako query string. Bez nich pierwszy render (serwerowy) nie miałby
   * czego pokazać, a przy edycji podgląd mrugałby od pustego szkicu do zapisanego rekordu.
   */
  initialFields?: string;
  /** Dzień serwera (`YYYY-MM-DD`); po mount podgląd przechodzi na zegar przeglądarki. */
  todayIso: string;
}

/**
 * Podgląd wydarzenia w trzech wariantach prezentacji serwisu, składany z wartości
 * formularza obok. Jedyna wyspa panelu: czyta DOM formularza i nie wysyła żadnego
 * żądania — zapis zostaje natywnym POST-em, a bez JavaScriptu znika sam podgląd.
 */
export function EventPreview({
  initialFields = "",
  todayIso,
}: EventPreviewProps) {
  const [fields, set_fields] = useState(
    () => new URLSearchParams(initialFields),
  );
  const [now, set_now] = useState(() => parse_iso_day(todayIso));
  const [variant, set_variant] = useState<PreviewVariant>("card");
  const [open, set_open] = useState(true);
  // Do hydracji przełącznik jeszcze nie działa, a bez JS-a nie zadziała nigdy —
  // atrybut niżej odróżnia jeden stan od drugiego zamiast zgadywania po wyglądzie.
  const [live, set_live] = useState(false);

  useEffect(() => {
    set_live(true);
    // Zegar przeglądarki dopiero po mount: inaczej render serwera i hydracja
    // rozjeżdżają się na granicy doby, tak samo jak w banerze na stronie głównej.
    set_now(new Date());

    const form = document.getElementById(EVENT_FORM_ID);
    if (!(form instanceof HTMLFormElement)) return;

    const read = (): void => set_fields(collect_fields(form));
    read();
    form.addEventListener("input", read);
    form.addEventListener("change", read);

    return () => {
      form.removeEventListener("input", read);
      form.removeEventListener("change", read);
    };
  }, []);

  const parsed = useMemo(() => read_event_form(fields), [fields]);

  // Wpisywany `https://` czy kod kraju są przez chwilę niepoprawne — podgląd zostaje
  // wtedy na ostatnim stanie, który dało się złożyć, zamiast znikać co drugi znak.
  const last_valid = useRef<TradeFairEvent | null>(null);
  const fresh = parsed.ok ? to_preview_event(parsed.event) : null;
  if (fresh !== null) last_valid.current = fresh;

  const event = fresh ?? last_valid.current;
  const rejected = parsed.ok ? [] : parsed.errors;
  const active = VARIANTS.find((spec) => spec.id === variant) ?? VARIANTS[0];

  return (
    <section
      data-event-preview={live ? "live" : "static"}
      aria-label="Podgląd wydarzenia"
      className="sticky top-14 z-30 mb-5 rounded-md border border-base-300 bg-base-200 shadow-lg"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-base-300 px-4 py-2.5">
        <h2 className="text-sm font-semibold">Podgląd</h2>

        <div
          role="group"
          aria-label="Wariant podglądu"
          className="flex flex-wrap gap-1"
        >
          {VARIANTS.map((spec) => (
            <button
              key={spec.id}
              type="button"
              aria-pressed={spec.id === variant}
              onClick={() => set_variant(spec.id)}
              className={cn(
                TAB_CLASS,
                spec.id === variant ? TAB_ACTIVE : TAB_IDLE,
              )}
            >
              {spec.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          aria-expanded={open}
          onClick={() => set_open(!open)}
          className={cn(BUTTON_CLASS, "ml-auto")}
        >
          {open ? "Zwiń" : "Rozwiń"}
        </button>
      </div>

      {open && (
        <div className="px-4 py-3">
          <p className={NOTE_CLASS}>{active.hint}</p>

          {rejected.length > 0 && <RejectedNote errors={rejected} />}

          {event === null ? (
            <p className={NOTE_CLASS}>
              Z wpisanych wartości nie da się jeszcze złożyć wydarzenia.
            </p>
          ) : (
            <Stage variant={variant} event={event} now={now} />
          )}
        </div>
      )}
    </section>
  );
}

interface StageProps {
  variant: PreviewVariant;
  event: TradeFairEvent;
  now: Date;
}

/**
 * Prawdziwe komponenty serwisu, nie atrapy. Scena jest `inert`: podgląd nie ma odbierać
 * fokusu 28 polom ani wyprowadzać z formularza kliknięciem w link do wydarzenia.
 */
function Stage({ variant, event, now }: StageProps) {
  const status = get_event_status(event, now);
  const promoted =
    get_promoted_events(now, PROMOTED_LIMIT, [event]).length > 0;
  const note =
    variant !== "mini"
      ? null
      : promoted
        ? MINI_COMPETITION
        : MINI_SKIPPED[status === "past" ? "past" : "undated"];

  return (
    <>
      {note !== null && <p className={NOTE_CLASS}>{note}</p>}

      <div className="max-h-[65vh] overflow-y-auto rounded-md border border-base-300 bg-base-100">
        <div
          inert
          data-preview-stage={variant}
          style={STAGE_STYLE}
          className="pointer-events-none select-none"
        >
          {render_variant(variant, event, status, now, promoted)}
        </div>
      </div>
    </>
  );
}

function render_variant(
  variant: PreviewVariant,
  event: TradeFairEvent,
  status: EventStatus,
  now: Date,
  promoted: boolean,
): ReactNode {
  if (variant === "mini") {
    return promoted ? (
      <EventBanner events={[event]} todayIso={to_iso_day(now)} />
    ) : null;
  }

  if (variant === "card") {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <EventCard event={event} status={status} />
      </div>
    );
  }

  // Powiązane wydarzenia pochodzą z listy, nie z formularza — podgląd ich nie zgaduje.
  return (
    <EventDetail event={event} status={status} related={[]} container="div" />
  );
}

function RejectedNote({ errors }: { errors: readonly EventFormError[] }) {
  const names = [...new Set(errors.map(describe_field))].join(", ");

  return (
    <p role="status" className={cn(NOTE_CLASS, "text-warning")}>
      Podgląd stoi na ostatnim poprawnym stanie — do poprawki: {names}.
    </p>
  );
}

function describe_field(error: EventFormError): string {
  return error.field === FORM_SCOPE
    ? "cały formularz"
    : (FIELD_LABELS.get(error.field) ?? error.field);
}

/** `FormData` zwraca też pliki; formularz wydarzenia ma same pola tekstowe. */
function collect_fields(form: HTMLFormElement): URLSearchParams {
  const fields = new URLSearchParams();

  for (const [name, value] of new FormData(form).entries()) {
    if (typeof value === "string") fields.append(name, value);
  }

  return fields;
}

function to_preview_event(draft: Partial<TradeFairEvent>): TradeFairEvent {
  return { ...draft, id: draft.id ?? PREVIEW_ID };
}
