import { cn } from "../../lib/utils";
import {
  field_id,
  REGISTRATION_FIELD,
  REGISTRATION_LABEL,
} from "./event_form_fields";
import {
  ADVANCED_FIELD_COUNT,
  ADVANCED_GROUPS,
  type EditorField,
} from "./event_form_groups";
import {
  field_hint,
  FormField,
  type FieldCodes,
  type FormMode,
} from "./EventFormField";
import { GROUP_LABEL_CLASS, RAIL_CLASS, ROW_CLASS } from "./styles";

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

const ADVANCED_FIELDS: readonly EditorField[] = ADVANCED_GROUPS.flatMap(
  (group) => group.fields,
);

export interface EventFormAdvancedProps {
  mode: FormMode;
  values: URLSearchParams | null;
  codes: FieldCodes;
}

/**
 * Schowek na pola, ktore rzadko sie rusza. Natywny `<details>` daje klawiature i
 * `aria-expanded` bez linijki skryptu, a otwarcie przy bledzie musi zapasc na serwerze:
 * bez tego link z podsumowania bledow prowadzilby w niewidoczne pole.
 */
export function EventFormAdvanced({
  mode,
  values,
  codes,
}: EventFormAdvancedProps) {
  const value_of = (field: string): string => values?.get(field) ?? "";
  const filled =
    ADVANCED_FIELDS.filter((field) => value_of(field.name) !== "").length +
    (value_of(REGISTRATION_FIELD) === "" ? 0 : 1);
  const faulty = [
    ...ADVANCED_FIELDS.map((field) => field.name),
    REGISTRATION_FIELD,
  ].some((name) => codes.has(name));

  return (
    <details
      data-advanced
      open={faulty}
      className="group rounded-md border border-base-300 bg-base-100"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md px-4 py-3 text-sm font-semibold transition-colors duration-150 hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className="inline-block transition-transform duration-150 group-open:rotate-90 motion-reduce:transition-none"
        >
          ›
        </span>
        Zaawansowane
        <span
          className={cn(
            "ml-auto text-xs font-normal",
            filled > 0 ? "text-secondary" : "text-base-content/40",
          )}
        >
          {filled} z {ADVANCED_FIELD_COUNT} wypełnionych
        </span>
      </summary>

      <div className="divide-y divide-base-300/60 border-t border-base-300">
        {ADVANCED_GROUPS.map((group) => (
          <fieldset key={group.title} className={ROW_CLASS}>
            <legend className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={cn(RAIL_CLASS, "bg-base-content/30")}
              />
              <span className={cn(GROUP_LABEL_CLASS, "text-base-content")}>
                {group.title}
              </span>
            </legend>

            {group.hint !== undefined && (
              <p className="mt-1 text-xs text-base-content/60">{group.hint}</p>
            )}

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {group.fields.map((field) => (
                <FormField
                  key={field.name}
                  spec={field}
                  hint={field_hint(field, mode)}
                  value={value_of(field.name)}
                  code={codes.get(field.name) ?? null}
                />
              ))}

              {group.registration === true && (
                <RegistrationField
                  checked={value_of(REGISTRATION_FIELD) !== ""}
                />
              )}
            </div>
          </fieldset>
        ))}
      </div>
    </details>
  );
}
