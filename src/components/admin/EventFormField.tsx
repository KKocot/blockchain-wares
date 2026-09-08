import type { ReactNode } from "react";
import type { EventFormErrorCode } from "../../lib/events/form_mapping";
import { cn } from "../../lib/utils";
import { CODE_TEXT, field_id, type FieldKind } from "./event_form_fields";
import type { EditorField, GroupTone } from "./event_form_groups";
import {
  ERROR_CONTROL_CLASS,
  FIELD_CLASS,
  GROUP_LABEL_CLASS,
  LABEL_CLASS,
  RAIL_CLASS,
  SELECT_CONTROL_CLASS,
  TONE_RAIL_CLASS,
  TONE_TEXT_CLASS,
} from "./styles";

/**
 * Pojedyncze pole formularza wydarzenia i etykieta grupy — czesci wspolne karty
 * podstawowej, grup powtarzalnych i sekcji „Zaawansowane". Modul nie zna zadnej z nich,
 * zeby te trzy mogly importowac go bez cyklu.
 */

export type FormMode = "create" | "edit";

/** Kody bledow adresowane sciezka pola, takze slotu (`badges.0`, `facts.0.label`). */
export type FieldCodes = ReadonlyMap<string, EventFormErrorCode>;

export function input_type(kind: FieldKind | undefined): string {
  return kind === "date" || kind === "time" || kind === "url" ? kind : "text";
}

/** Podpowiedz zalezna od trybu: slug z nazwy powstaje wylacznie przy tworzeniu. */
export function field_hint(
  spec: EditorField,
  mode: FormMode,
): string | undefined {
  const extra = mode === "create" ? spec.createHint : undefined;
  if (extra === undefined) return spec.hint;

  return spec.hint === undefined ? extra : `${spec.hint} ${extra}`;
}

/** Pasek + etykieta w barwie grupy — ten sam znak, co bloki `TrafficFilters`. */
export function GroupLegend({
  title,
  tone,
  children,
}: {
  title: string;
  tone: GroupTone;
  children?: ReactNode;
}) {
  return (
    <legend className="flex flex-wrap items-center gap-2">
      <span
        aria-hidden="true"
        className={cn(RAIL_CLASS, TONE_RAIL_CLASS[tone])}
      />
      <span className={cn(GROUP_LABEL_CLASS, TONE_TEXT_CLASS[tone])}>
        {title}
      </span>
      {children}
    </legend>
  );
}

export interface FormFieldProps {
  spec: EditorField;
  hint: string | undefined;
  value: string;
  code: EventFormErrorCode | null;
  /** Identyfikator jest kluczem adresu `/markets/<id>` — przy edycji tylko do odczytu. */
  locked?: boolean;
}

export function FormField({
  spec,
  hint,
  value,
  code,
  locked = false,
}: FormFieldProps) {
  const id = field_id(spec.name);
  const hint_id = hint === undefined ? null : `${id}-hint`;
  const error_id = code === null ? null : `${id}-error`;
  const invalid = code !== null;
  const described =
    [error_id, hint_id].filter((entry) => entry !== null).join(" ") ||
    undefined;
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
