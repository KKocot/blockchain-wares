import { Fragment, type ReactNode } from "react";
import type { EventFormErrorCode } from "../../lib/events/form_mapping";
import { cn } from "../../lib/utils";
import { EventIcon } from "../event-icons";
import { ICON_KEYS } from "../event-types";
import { CODE_TEXT, field_id } from "./event_form_fields";
import {
  slot_address,
  slot_input_name,
  type SlotFieldSpec,
  type SlotGroupName,
  type SlotGroupSpec,
} from "./event_form_groups";
import { GroupLegend, input_type, type FieldCodes } from "./EventFormField";
import {
  CHIP_EMPTY_CLASS,
  CHIP_FILLED_CLASS,
  ERROR_CONTROL_CLASS,
  FIELD_CLASS,
  GHOST_BUTTON_CLASS,
  GHOST_BUTTON_FULL_CLASS,
  ICON_BOX_CLASS,
  ROW_CLASS,
  SELECT_CONTROL_CLASS,
  SLOT_CLASS,
  SLOT_EMPTY_CLASS,
  SLOT_ERROR_CLASS,
  SLOT_FILLED_CLASS,
  TONE_EDGE_CLASS,
  TONE_TEXT_CLASS,
} from "./styles";

function sentence(text: string): string {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

/** CSS injected inline by admin event pages — definicje w `styles.ts` (limit 500 linii). */
export { ICON_PREVIEW_CSS, SLOT_ADD_FULL_CSS } from "./styles";

function IconPreview({ value }: { value: string }) {
  return (
    <span
      data-icon-preview
      aria-hidden="true"
      className={cn(
        ICON_BOX_CLASS,
        value === ""
          ? "border-dashed border-base-300 text-base-content/40"
          : "border-info/40 bg-info/10 text-info",
      )}
    >
      <span
        data-icon=""
        data-current={value === "" ? "" : undefined}
        className={cn("items-center justify-center", value !== "" && "hidden")}
      >
        <span className="size-1.5 rounded-full bg-current" />
      </span>

      {ICON_KEYS.map((key) => (
        <span
          key={key}
          data-icon={key}
          data-current={value === key ? "" : undefined}
          className={cn(
            "items-center justify-center",
            value !== key && "hidden",
          )}
        >
          <EventIcon icon={key} width={18} height={18} />
        </span>
      ))}
    </span>
  );
}

interface SlotFieldProps {
  group: SlotGroupSpec;
  index: number;
  field: SlotFieldSpec;
  value: string;
  hintId: string;
  /** Komunikat wiersza jest wspólny dla obu pól — opisuje każde z nich, nie tylko winne. */
  errorId: string | null;
  invalid: boolean;
  className: string;
  /** Pole glowne bierze etykiete z numeru slotu — drugi `<label>` dublowalby nazwe. */
  labelled: boolean;
}

function SlotField({
  group,
  index,
  field,
  value,
  hintId,
  errorId,
  invalid,
  className,
  labelled,
}: SlotFieldProps) {
  const id = field_id(slot_address(group.name, index, field.key));
  const name = slot_input_name(group.name, index, field.key);
  const described = errorId === null ? hintId : `${errorId} ${hintId}`;

  return (
    <>
      {labelled && (
        <label htmlFor={id} className="sr-only">
          {`${field.label} ${index + 1}`}
        </label>
      )}

      {field.kind === "select" ? (
        <select
          id={id}
          name={name}
          defaultValue={value}
          aria-describedby={described}
          aria-invalid={invalid}
          className={cn(
            SELECT_CONTROL_CLASS,
            className,
            invalid && ERROR_CONTROL_CLASS,
          )}
        >
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={name}
          type={input_type(field.kind)}
          inputMode={field.kind === "url" ? "url" : undefined}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          defaultValue={value}
          aria-describedby={described}
          aria-invalid={invalid}
          className={cn(
            FIELD_CLASS,
            field.mono === true && "admin-mono text-xs",
            className,
            invalid && ERROR_CONTROL_CLASS,
          )}
        />
      )}
    </>
  );
}

/** Wartosci slotu: `klucz pola -> wartosc`. Slot jednopolowy trzyma je pod pustym kluczem. */
type SlotRow = Record<string, string>;

const PRIMARY_KEY = "";

/** Klasy kontrolek slotu, po jednej na pole grupy — uklad zalezy od tego, ile ich jest. */
const SLOT_FIELD_CLASS: Record<SlotGroupName, readonly string[]> = {
  badges: ["min-w-0 flex-1"],
  facts: ["w-36 shrink-0", "w-full min-w-0 sm:w-auto sm:flex-1"],
  topics: ["w-full min-w-0 border-0 bg-transparent px-0 py-0 text-current"],
  links: [
    "min-w-0 flex-1 sm:w-40 sm:flex-none",
    "w-full min-w-0 sm:w-auto sm:flex-1",
  ],
};

function key_of(field: SlotFieldSpec): string {
  return field.key ?? PRIMARY_KEY;
}

function group_values(
  group: SlotGroupSpec,
  values: URLSearchParams | null,
): readonly SlotRow[] {
  if (group.name === "topics") return topic_rows(group, values);

  const rows: SlotRow[] = Array.from({ length: group.max }, () => ({}));
  if (values === null) return rows;

  for (let index = 0; index < group.max; index += 1) {
    for (const field of group.fields) {
      const raw = values.get(slot_input_name(group.name, index, field.key));
      if (raw !== null && raw !== "") rows[index][key_of(field)] = raw;
    }
  }

  return rows;
}

/**
 * Tematy ida wlasna sciezka: N inputow o tej samej nazwie, a przy edycji przychodza
 * jednym ciagiem po przecinku — dokladnie tak, jak zapisuje je `to_event_form_fields`.
 * Nadmiar ponad `group.max` NIE jest tu obcinany: `read_topics()` juz odrzucil taki
 * zapis bledem, wiec ucinanie w renderze zgubiloby wpisany temat po cichu drugi raz.
 * Wiersze rosna wtedy ponad `group.max`, zeby autor zobaczyl caly wpisany zestaw.
 */
function topic_rows(
  group: SlotGroupSpec,
  values: URLSearchParams | null,
): readonly SlotRow[] {
  const topics =
    values === null
      ? []
      : values
          .getAll("topics")
          .flatMap((entry) => entry.split(","))
          .map((entry) => entry.trim())
          .filter((entry) => entry.length > 0);

  const rows: SlotRow[] = Array.from(
    { length: Math.max(group.max, topics.length) },
    () => ({}),
  );
  topics.forEach((topic, index) => {
    rows[index][PRIMARY_KEY] = topic;
  });

  return rows;
}

/** Slot liczy sie jako wypelniony po polu glownym — sama ikona faktu nie jest trescia. */
function is_filled(group: SlotGroupSpec, row: SlotRow): boolean {
  return (row[key_of(group.fields[group.fields.length - 1])] ?? "") !== "";
}

export interface SlotGroupProps {
  group: SlotGroupSpec;
  values: URLSearchParams | null;
  codes: FieldCodes;
  /** Pole pelnowymiarowe nad lista, poza limitem grupy (dzis: `url` nad linkami). */
  lead?: ReactNode;
}

/**
 * Grupa powtarzalnych pol. Wszystkie sloty sa zawsze w DOM i zawsze w wysylce — skrypt
 * `data-slot-*` steruje wylacznie atrybutem `hidden`, ktory pola z formularza nie wyjmuje.
 */
export function SlotGroup({ group, values, codes, lead }: SlotGroupProps) {
  const rows = group_values(group, values);
  const filled = rows.filter((row) => is_filled(group, row)).length;
  const hint_id = `${group.name}-hint`;
  const complete = filled >= group.max;
  /** Blad calej grupy (dzis: nadmiar tematow) — bez indeksu, wiec `slot_failure()` go nie widzi. */
  const group_error = codes.get(group.name);

  return (
    <fieldset
      id={field_id(group.name)}
      data-slot-group={group.name}
      data-slot-max={group.max}
      className={ROW_CLASS}
    >
      <GroupLegend title={group.legend} tone={group.tone}>
        <span
          data-slot-counter
          className={cn(
            "text-xs font-normal",
            filled > 0 ? TONE_TEXT_CLASS[group.tone] : "text-base-content/40",
          )}
        >
          {filled} z {group.max}
        </span>
      </GroupLegend>

      <p id={hint_id} className="mt-1 text-xs text-base-content/60">
        {group.hint}
      </p>

      {group_error !== undefined && (
        <p className="mt-1 text-xs font-medium text-error">
          {CODE_TEXT[group_error]}
        </p>
      )}

      {lead !== undefined && <div className="mt-3">{lead}</div>}

      <ul
        role="list"
        className={cn(
          "mt-3",
          group.name === "topics" ? "flex flex-wrap gap-2" : "space-y-2",
        )}
      >
        {rows.map((row, index) => (
          <SlotItem
            key={index}
            group={group}
            index={index}
            row={row}
            codes={codes}
            hintId={hint_id}
          />
        ))}
      </ul>

      <button
        type="button"
        data-slot-add={group.name}
        data-full={complete ? "" : undefined}
        aria-disabled={complete ? true : undefined}
        hidden
        className={cn(
          complete ? GHOST_BUTTON_FULL_CLASS : GHOST_BUTTON_CLASS,
          "mt-2 w-full sm:w-auto",
        )}
      >
        {complete ? (
          `Komplet — ${group.max} z ${group.max}`
        ) : (
          <>
            <span aria-hidden="true">+</span> Dodaj {group.noun}
          </>
        )}
      </button>

      <p data-slot-live role="status" aria-live="polite" className="sr-only" />
    </fieldset>
  );
}

interface SlotItemProps {
  group: SlotGroupSpec;
  index: number;
  row: SlotRow;
  codes: FieldCodes;
  hintId: string;
}

interface SlotFailure {
  id: string;
  code: EventFormErrorCode;
}

/** Pierwszy błąd wiersza wraz z kotwicą pola, które go niesie — tam prowadzi podsumowanie. */
function slot_failure(
  group: SlotGroupSpec,
  index: number,
  codes: FieldCodes,
): SlotFailure | null {
  for (const field of group.fields) {
    const address = slot_address(group.name, index, field.key);
    const code = codes.get(address);
    if (code !== undefined) return { id: `${field_id(address)}-error`, code };
  }

  return null;
}

function SlotItem({ group, index, row, codes, hintId }: SlotItemProps) {
  const number = index + 1;
  const chips = group.name === "topics";
  const last = group.fields.length - 1;
  const failure = slot_failure(group, index, codes);
  const invalid = failure !== null;
  const filled = is_filled(group, row);
  const clear_label = `Wyczyść ${group.noun} ${number}`;

  const controls = group.fields.map((field, position) => {
    const value = row[key_of(field)] ?? "";

    return (
      <Fragment key={position}>
        <SlotField
          group={group}
          index={index}
          field={field}
          value={value}
          hintId={hintId}
          errorId={failure?.id ?? null}
          invalid={invalid}
          className={SLOT_FIELD_CLASS[group.name][position]}
          labelled={chips || position !== last}
        />

        {group.name === "facts" && position === 0 && (
          <IconPreview value={value} />
        )}
      </Fragment>
    );
  });

  if (chips) {
    return (
      <li
        data-slot-index={index}
        className={cn(
          "flex min-w-0 basis-full items-center gap-1.5 rounded-full border py-1 pr-1 pl-3 transition-colors duration-150 motion-reduce:transition-none sm:basis-[calc(50%-0.25rem)]",
          invalid
            ? SLOT_ERROR_CLASS
            : filled
              ? CHIP_FILLED_CLASS
              : CHIP_EMPTY_CLASS,
        )}
      >
        {controls}
        <RemoveButton group={group.name} label={clear_label} round />
      </li>
    );
  }

  return (
    <li
      data-slot-index={index}
      data-icon-slot={group.name === "facts" ? "" : undefined}
      className={cn(
        SLOT_CLASS,
        "flex flex-wrap items-center gap-2",
        invalid
          ? SLOT_ERROR_CLASS
          : filled
            ? SLOT_FILLED_CLASS
            : SLOT_EMPTY_CLASS,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "w-1 self-stretch rounded-full",
          last > 0 && "hidden sm:block",
          invalid
            ? "bg-error"
            : filled
              ? TONE_EDGE_CLASS[group.tone]
              : "opacity-0",
        )}
      />

      <label
        htmlFor={field_id(
          slot_address(group.name, index, group.fields[last].key),
        )}
        className="w-4 shrink-0 text-center"
      >
        <span
          aria-hidden="true"
          className={cn(
            "admin-mono text-[11px]",
            invalid ? "text-error" : "text-base-content/40",
          )}
        >
          {number}
        </span>
        <span className="sr-only">{`${sentence(group.noun)} ${number}`}</span>
      </label>

      {controls}

      <RemoveButton group={group.name} label={clear_label} />

      {failure !== null && (
        <p id={failure.id} className="w-full text-xs font-medium text-error">
          {CODE_TEXT[failure.code]}
        </p>
      )}
    </li>
  );
}

/** Wezel slotu zostaje w DOM — znika sama wartosc, stad „Wyczysc", nie „Usun". */
function RemoveButton({
  group,
  label,
  round = false,
}: {
  group: string;
  label: string;
  round?: boolean;
}) {
  return (
    <button
      type="button"
      data-slot-remove={group}
      hidden
      aria-label={label}
      className={cn(
        GHOST_BUTTON_CLASS,
        round
          ? "size-6 min-h-6 min-w-6 shrink-0 rounded-full px-0"
          : "shrink-0",
      )}
    >
      <span aria-hidden="true">×</span>
    </button>
  );
}
