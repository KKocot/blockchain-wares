import { cn } from "../../lib/utils";
import {
  FORM_SCOPE,
  type EventFormErrorCode,
  type EventFormErrorField,
  type EventFormField,
} from "../../lib/events/form_mapping";
import {
  ADMISSION_GROUP,
  CODE_TEXT,
  collect_errors,
  FALLBACK_TEXT,
  field_id,
  FIELD_LABELS,
  FORM_TEXT,
  GROUPS,
  REGISTRATION_FIELD,
  REGISTRATION_LABEL,
  type FieldKind,
  type FieldSpec,
} from "./event_form_fields";
import { BUTTON_CLASS, CARD_CLASS, FIELD_CLASS, LABEL_CLASS } from "./styles";

const ERROR_CONTROL_CLASS =
  "border-error/60 focus-visible:border-error focus-visible:outline-error";

/** `SELECT_CLASS` jest skrojony pod pasek narzedziowy; w formularzu musi trzymac siatke. */
const SELECT_CONTROL_CLASS =
  "w-full rounded-md border border-base-300 bg-base-200 px-3 py-2 text-sm text-base-content transition-colors duration-150 hover:border-base-content/20 focus-visible:border-secondary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

const SUBMIT_CLASS =
  "inline-flex items-center rounded-md border border-secondary/40 bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary transition-colors duration-150 hover:border-secondary/60 hover:bg-secondary/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

function input_type(kind: FieldKind | undefined): string {
  return kind === "date" || kind === "time" || kind === "url" ? kind : "text";
}

function describe(...ids: readonly (string | null)[]): string | undefined {
  const used = ids.filter((id): id is string => id !== null);
  return used.length === 0 ? undefined : used.join(" ");
}

/** Podpowiedz zalezna od trybu: slug z nazwy powstaje wylacznie przy tworzeniu. */
function field_hint(
  spec: FieldSpec,
  mode: EventFormProps["mode"],
): string | undefined {
  const extra = mode === "create" ? spec.createHint : undefined;
  if (extra === undefined) return spec.hint;

  return spec.hint === undefined ? extra : `${spec.hint} ${extra}`;
}

interface FormFieldProps {
  spec: FieldSpec;
  hint: string | undefined;
  value: string;
  code: EventFormErrorCode | null;
  /** Identyfikator jest kluczem adresu `/markets/<id>` — przy edycji tylko do odczytu. */
  locked: boolean;
}

function FormField({ spec, hint, value, code, locked }: FormFieldProps) {
  const id = field_id(spec.name);
  const hint_id = hint === undefined ? null : `${id}-hint`;
  const error_id = code === null ? null : `${id}-error`;
  const described = describe(error_id, hint_id);
  const invalid = code !== null;
  const control = cn(
    spec.kind === "select" ? SELECT_CONTROL_CLASS : FIELD_CLASS,
    spec.mono === true && "admin-mono",
    (spec.kind === "date" || spec.kind === "time") &&
      "admin-mono [color-scheme:dark]",
    invalid && ERROR_CONTROL_CLASS,
  );

  return (
    <div className={cn("min-w-0", spec.full === true && "sm:col-span-2")}>
      <label htmlFor={id} className={LABEL_CLASS}>
        {spec.label}
      </label>

      {spec.kind === "select" ? (
        <select
          id={id}
          name={spec.name}
          defaultValue={value}
          aria-invalid={invalid}
          aria-describedby={described}
          className={control}
        >
          {(spec.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : spec.kind === "textarea" ? (
        <textarea
          id={id}
          name={spec.name}
          rows={6}
          defaultValue={value}
          aria-invalid={invalid}
          aria-describedby={described}
          className={control}
        />
      ) : (
        <input
          id={id}
          name={spec.name}
          type={input_type(spec.kind)}
          readOnly={locked}
          placeholder={spec.placeholder}
          defaultValue={value}
          aria-invalid={invalid}
          aria-describedby={described}
          className={cn(control, locked && "opacity-70")}
        />
      )}

      {error_id !== null && code !== null && (
        <p id={error_id} className="mt-1 text-xs font-medium text-error">
          {CODE_TEXT[code]}
        </p>
      )}

      {hint_id !== null && (
        <p id={hint_id} className="mt-1 text-xs text-base-content/60">
          {hint}
        </p>
      )}
    </div>
  );
}

/** Niezaznaczony checkbox nie wysyla nazwy w ogole — hidden trzyma ja zawsze obecna. */
function RegistrationField({ checked }: { checked: boolean }) {
  const id = field_id(REGISTRATION_FIELD);
  const hint_id = `${id}-hint`;

  return (
    <div className="sm:col-span-2">
      <div className="flex items-start gap-3 rounded-md border border-base-300 bg-base-200/50 p-3">
        <input type="hidden" name={REGISTRATION_FIELD} value="" />
        <input
          id={id}
          name={REGISTRATION_FIELD}
          type="checkbox"
          defaultChecked={checked}
          aria-describedby={hint_id}
          className="mt-0.5 size-4 shrink-0 accent-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        />
        <div className="min-w-0">
          <label htmlFor={id} className="text-sm font-medium">
            {REGISTRATION_LABEL}
          </label>
          <p id={hint_id} className="mt-0.5 text-xs text-base-content/60">
            Liczy się dopiero razem z ceną, walutą i datą obowiązywania — sam
            nie tworzy warunków wstępu.
          </p>
        </div>
      </div>
    </div>
  );
}

interface ErrorSummaryProps {
  errors: ReadonlyMap<EventFormErrorField, EventFormErrorCode>;
  message: string | null;
  /** Kod bledu spoza kontraktu: zadnego pola nie da sie podswietlic. */
  unmatched: boolean;
}

function ErrorSummary({ errors, message, unmatched }: ErrorSummaryProps) {
  const scope_code = errors.get(FORM_SCOPE) ?? null;
  const fields = [...errors].filter(([field]) => field !== FORM_SCOPE);

  return (
    <div
      role="alert"
      className="rounded-md border border-error/50 bg-error/10 p-4"
    >
      <h2 className="text-sm font-semibold text-error">
        Nie zapisano — popraw zaznaczone pola
      </h2>

      {message !== null && <p className="mt-2 text-xs text-error">{message}</p>}

      {scope_code !== null && (
        <p className="mt-2 text-xs text-error">{FORM_TEXT[scope_code]}</p>
      )}

      {unmatched && <p className="mt-2 text-xs text-error">{FALLBACK_TEXT}</p>}

      {fields.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-error">
          {fields.map(([field, code]) => (
            <li key={field}>
              <a
                href={`#${field_id(field)}`}
                className="font-medium underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error"
              >
                {FIELD_LABELS.get(field) ?? field}
              </a>
              {` — ${CODE_TEXT[code]}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export interface EventFormProps {
  /** `edit` blokuje identyfikator i zmienia teksty — reszta kontraktu jest wspolna. */
  mode: "create" | "edit";
  /** Endpoint POST panelu — formularz jest natywny, wiec adres idzie prosto do przegladarki. */
  action: string;
  /**
   * Wartosci pol: przy edycji `to_event_form_fields(event)`, a po bledzie walidacji
   * to, co uzytkownik wyslal. Bez JS-a tylko serwer moze mu wpisane dane oddac.
   */
  values?: URLSearchParams | null;
  /** Kody z `?error=` w formacie `<pole>.<required|invalid>`, np. `venue.name.required`. */
  errors?: readonly string[];
  /** Komunikat spoza walidacji pol: zajety identyfikator, awaria API zapisu. */
  message?: string | null;
  cancelHref: string;
}

/**
 * Formularz wydarzenia dla obu trybow, renderowany wylacznie na serwerze: bez
 * hydracji i bez handlerow — panel nie wysyla z przegladarki zadnego zadania.
 */
export function EventForm({
  mode,
  action,
  values = null,
  errors = [],
  message = null,
  cancelHref,
}: EventFormProps) {
  const found = collect_errors(errors);
  const unmatched = errors.length > 0 && found.size === 0;
  const has_errors = found.size > 0 || unmatched || message !== null;
  const value_of = (field: EventFormField): string => values?.get(field) ?? "";

  return (
    <form
      method="post"
      action={action}
      autoComplete="off"
      aria-label={mode === "edit" ? "Edycja wydarzenia" : "Nowe wydarzenie"}
      className="space-y-5"
    >
      {has_errors && (
        <ErrorSummary errors={found} message={message} unmatched={unmatched} />
      )}

      {GROUPS.map((group) => (
        <fieldset key={group.title} className={cn(CARD_CLASS, "space-y-4")}>
          <legend className="px-1 text-sm font-semibold">{group.title}</legend>

          {group.hint !== undefined && (
            <p className="text-xs text-base-content/60">{group.hint}</p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {group.fields.map((spec) => (
              <FormField
                key={spec.name}
                spec={spec}
                hint={field_hint(spec, mode)}
                value={value_of(spec.name)}
                code={found.get(spec.name) ?? null}
                locked={mode === "edit" && spec.name === "id"}
              />
            ))}

            {group.title === ADMISSION_GROUP && (
              <RegistrationField
                checked={value_of(REGISTRATION_FIELD) !== ""}
              />
            )}
          </div>
        </fieldset>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className={SUBMIT_CLASS}>
          {mode === "edit" ? "Zapisz zmiany" : "Dodaj wydarzenie"}
        </button>

        <a href={cancelHref} className={BUTTON_CLASS}>
          Anuluj
        </a>

        <p className="text-xs text-base-content/60">
          {mode === "edit"
            ? "Żadne pole nie jest wymagane, ale puste kasuje dotychczasową wartość. Identyfikatora nie da się zmienić — nowy adres zerwałby linki."
            : "Żadne pole nie jest wymagane — pusty formularz zapisze szkic do uzupełnienia później."}
        </p>
      </div>
    </form>
  );
}
