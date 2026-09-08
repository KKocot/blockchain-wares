import { cn } from "../../lib/utils";
import {
  FORM_SCOPE,
  type EventFormErrorCode,
  type EventFormErrorField,
} from "../../lib/events/form_mapping";
import {
  CODE_TEXT,
  collect_errors,
  EVENT_FORM_ID,
  FALLBACK_TEXT,
  field_id,
  FIELD_LABELS,
  FORM_TEXT,
} from "./event_form_fields";
import {
  PRIMARY_ROWS,
  SLOT_GROUP_BY_NAME,
  type PrimaryFieldsRow,
  type SlotGroupName,
  type SlotGroupSpec,
} from "./event_form_groups";
import { SlotGroup } from "./EventFieldSlots";
import {
  field_hint,
  FormField,
  GroupLegend,
  type FieldCodes,
  type FormMode,
} from "./EventFormField";
import { EventFormAdvanced } from "./EventFormAdvanced";
import {
  ACTION_BAR_CLASS,
  BUTTON_CLASS,
  CARD_CLASS,
  ROW_CLASS,
  SUBMIT_CLASS,
} from "./styles";

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

interface FieldsRowProps {
  row: PrimaryFieldsRow;
  mode: FormMode;
  values: URLSearchParams | null;
  codes: FieldCodes;
}

/**
 * Wiersz karty z polami zwyklymi. Tytul wiersza jest nazwa grupy, nie pola — zadne
 * z pol nie powtarza go swoja etykieta, wiec `<legend>` niczego czytnikowi nie dubluje.
 */
function FieldsRow({ row, mode, values, codes }: FieldsRowProps) {
  const value_of = (field: string): string => values?.get(field) ?? "";

  return (
    <fieldset className={ROW_CLASS}>
      <GroupLegend title={row.title} tone="secondary" />

      {row.hint !== undefined && (
        <p className="mt-1 text-xs text-base-content/60">{row.hint}</p>
      )}

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {row.fields.map((field) => (
          <FormField
            key={field.name}
            spec={field}
            hint={field_hint(field, mode)}
            value={value_of(field.name)}
            code={codes.get(field.name) ?? null}
          />
        ))}
      </div>

      {row.secondary !== undefined && (
        <div className="mt-3 grid grid-cols-1 gap-3 border-t border-base-300/60 pt-3 sm:grid-cols-2">
          {row.secondary.map((field) => (
            <FormField
              key={field.name}
              spec={field}
              hint={field_hint(field, mode)}
              value={value_of(field.name)}
              code={codes.get(field.name) ?? null}
              locked={mode === "edit" && field.name === "id"}
            />
          ))}
        </div>
      )}
    </fieldset>
  );
}

function slot_spec(name: SlotGroupName): SlotGroupSpec {
  const group = SLOT_GROUP_BY_NAME.get(name);
  if (group === undefined) {
    throw new Error(`EventForm: brak opisu grupy slotów "${name}".`);
  }

  return group;
}

export interface EventFormProps {
  /** `edit` blokuje identyfikator i zmienia teksty — reszta kontraktu jest wspolna. */
  mode: FormMode;
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
  const codes: FieldCodes = new Map<string, EventFormErrorCode>(found);
  const unmatched = errors.length > 0 && found.size === 0;
  const has_errors = found.size > 0 || unmatched || message !== null;

  return (
    <form
      id={EVENT_FORM_ID}
      method="post"
      action={action}
      autoComplete="off"
      aria-label={mode === "edit" ? "Edycja wydarzenia" : "Nowe wydarzenie"}
      className="space-y-4"
    >
      {has_errors && (
        <ErrorSummary errors={found} message={message} unmatched={unmatched} />
      )}

      <div className={cn(CARD_CLASS, "divide-y divide-base-300/60 p-0")}>
        {PRIMARY_ROWS.map((row) =>
          row.kind === "slot-group" ? (
            <SlotGroup
              key={row.group}
              group={slot_spec(row.group)}
              values={values}
              codes={codes}
              lead={
                row.leadField === undefined ? undefined : (
                  <FormField
                    spec={row.leadField}
                    hint={field_hint(row.leadField, mode)}
                    value={values?.get(row.leadField.name) ?? ""}
                    code={codes.get(row.leadField.name) ?? null}
                  />
                )
              }
            />
          ) : (
            <FieldsRow
              key={row.title}
              row={row}
              mode={mode}
              values={values}
              codes={codes}
            />
          ),
        )}
      </div>

      <EventFormAdvanced mode={mode} values={values} codes={codes} />

      <p className="text-xs text-base-content/60">
        {mode === "edit"
          ? "Żadne pole nie jest wymagane, ale puste kasuje dotychczasową wartość. Identyfikatora nie da się zmienić — nowy adres zerwałby linki."
          : "Żadne pole nie jest wymagane — pusty formularz zapisze szkic do uzupełnienia później."}
      </p>

      <div className={ACTION_BAR_CLASS}>
        <button type="submit" className={SUBMIT_CLASS}>
          {mode === "edit" ? "Zapisz zmiany" : "Dodaj wydarzenie"}
        </button>

        <a href={cancelHref} className={BUTTON_CLASS}>
          Anuluj
        </a>
      </div>
    </form>
  );
}
