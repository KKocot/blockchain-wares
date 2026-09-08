import type { EventFormField } from "../../lib/events/form_mapping";
import {
  ICON_KEYS,
  MAX_EVENT_BADGES,
  MAX_EVENT_FACTS,
  MAX_EVENT_LINKS,
  MAX_EVENT_TOPICS,
  type IconKey,
} from "../event-types";
import {
  ADMISSION_GROUP,
  FIELD_SPEC_BY_NAME,
  type FieldKind,
  type FieldOption,
} from "./event_form_fields";

/**
 * Przegrupowanie katalogu z `event_form_fields.ts` na dwie widocznosci formularza
 * ("od razu" i "Zaawansowane") plus opis czterech grup powtarzalnych (badges/facts/
 * links/topics). Te grupy nie sa `EventFormField` z katalogu — to sloty o zmiennej
 * liczbie wpisow, czytane jako `SlotFormField` w `form_mapping.ts` i renderowane przez
 * `EventFieldSlots.tsx`. `GROUPS` w `event_form_fields.ts` zostaje bez zmian, bo
 * `EventForm.tsx` i testy Playwright dalej po nim chodza.
 */

/**
 * Pole katalogu, ktorego backing property jeszcze nie jest czescia `EventFormField`
 * (np. `venue.note`) — inaczej niz `FieldSpec`, ktorego `name` jest wezszym typem.
 * Ksztalt jest celowo identyczny z `FieldSpec` poza tym jednym polem.
 */
export interface EditorField {
  name: string;
  label: string;
  kind?: FieldKind;
  hint?: string;
  createHint?: string;
  placeholder?: string;
  options?: readonly FieldOption[];
  mono?: boolean;
  full?: boolean;
}

/** Reuzycie etykiety/hinta/placeholdera z `event_form_fields.ts` zamiast ich kopii. */
function from_catalogue(name: EventFormField): EditorField {
  const spec = FIELD_SPEC_BY_NAME.get(name);
  if (spec === undefined) {
    throw new Error(`event_form_groups: brak specyfikacji pola "${name}".`);
  }

  const { name: spec_name, ...rest } = spec;
  return { name: spec_name, ...rest };
}

/** Nowe pole spoza dzisiejszego kontraktu — patrz `EventVenue.note` w `event-types.ts`. */
const VENUE_NOTE_FIELD: EditorField = {
  name: "venue.note",
  label: "Przypis pod lokalizacją",
  full: true,
  placeholder: "np. wejście od podwórza",
  hint: "Nie steruje linkiem do mapy ani JSON-LD — tylko dla czytelnika.",
};

export interface PrimaryFieldsRow {
  kind: "fields";
  title: string;
  hint?: string;
  fields: readonly EditorField[];
  /** Pola pomniejszone pod glownym, np. `id` + `kind` pod `name`. */
  secondary?: readonly EditorField[];
}

export interface PrimarySlotRow {
  kind: "slot-group";
  title: string;
  group: SlotGroupName;
  /** Pole pelnowymiarowe nad lista slotow, poza jej limitem (np. `url` nad `links`). */
  leadField?: EditorField;
}

export type PrimaryRow = PrimaryFieldsRow | PrimarySlotRow;

export type SlotGroupName = "badges" | "facts" | "links" | "topics";
export type GroupTone = "secondary" | "info" | "success" | "warning";

/**
 * Jedno pole w slocie. `key` odroznia pola w slocie dwupolowym (facts: icon/label,
 * links: label/url); slot jednopolowy (badges, topics) go nie ma.
 */
export interface SlotFieldSpec {
  key?: string;
  label: string;
  kind?: FieldKind;
  placeholder?: string;
  maxLength?: number;
  options?: readonly FieldOption[];
  mono?: boolean;
}

export interface SlotGroupSpec {
  name: SlotGroupName;
  legend: string;
  hint: string;
  max: number;
  tone: GroupTone;
  /** Rzeczownik w mianowniku l.poj. do tekstow przycisku/licznika, np. "wyróżnik". */
  noun: string;
  fields: readonly SlotFieldSpec[];
}

const ICON_LABELS: Record<IconKey, string> = {
  calendar: "Kalendarz",
  clock: "Zegar",
  location: "Lokalizacja",
  building: "Budynek",
  ticket: "Bilet",
  speaker: "Prelegent",
  attendees: "Uczestnicy",
  catering: "Catering",
  parking: "Parking",
  wifi: "Wi-Fi",
  info: "Informacja",
  "external-link": "Link zewnętrzny",
};

/** Preset selecta `facts.icon` — 12 kluczy z `ICON_KEYS` (event-types.ts) + „brak”. */
export const FACT_ICON_OPTIONS: readonly FieldOption[] = [
  { value: "", label: "— wybierz ikonę —" },
  ...ICON_KEYS.map((key) => ({ value: key, label: ICON_LABELS[key] })),
];

/** Re-eksport: definicja i uzasadnienie limitu siedza przy `MAX_EVENT_TOPICS` w `event-types.ts`. */
export { MAX_EVENT_TOPICS };

export const SLOT_GROUPS: readonly SlotGroupSpec[] = [
  {
    name: "badges",
    legend: "Wyróżniki",
    hint: "Krótkie etykiety nad tytułem wydarzenia. Najwyżej cztery — piąta i tak by się nie zmieściła.",
    max: MAX_EVENT_BADGES,
    tone: "secondary",
    noun: "wyróżnik",
    fields: [{ label: "Wyróżnik", maxLength: 24 }],
  },
  {
    name: "facts",
    legend: "Fakty",
    hint: "Pasek faktów pod opisem, po jednym wierszu na fakt. Najwyżej sześć.",
    max: MAX_EVENT_FACTS,
    tone: "info",
    noun: "fakt",
    fields: [
      {
        key: "icon",
        label: "Ikona faktu",
        kind: "select",
        options: FACT_ICON_OPTIONS,
      },
      {
        key: "label",
        label: "Treść faktu",
        placeholder: "np. 3 dni prelekcji",
        maxLength: 60,
      },
    ],
  },
  {
    name: "topics",
    legend: "Tematy",
    hint: "Chipsy na dole karty i strony wydarzenia. Najwyżej osiem — więcej zaczyna się zawijać.",
    max: MAX_EVENT_TOPICS,
    tone: "success",
    noun: "temat",
    fields: [{ label: "Temat", placeholder: "np. Hive", maxLength: 32 }],
  },
  {
    name: "links",
    legend: "Linki",
    hint: "Nazwane odnośniki poza własną stroną wydarzenia, np. „Program” czy „Rejestracja”. Najwyżej sześć.",
    max: MAX_EVENT_LINKS,
    tone: "warning",
    noun: "link",
    fields: [
      {
        key: "label",
        label: "Etykieta linku",
        placeholder: "Program",
        maxLength: 32,
      },
      {
        key: "url",
        label: "Adres linku",
        kind: "url",
        placeholder: "https://",
        mono: true,
      },
    ],
  },
] as const;

export const SLOT_GROUP_BY_NAME: ReadonlyMap<SlotGroupName, SlotGroupSpec> =
  new Map(SLOT_GROUPS.map((group) => [group.name, group] as const));

/**
 * `name=` wysylany w formularzu. Tematy sa jedynym wyjatkiem bez indeksu w nazwie:
 * `read_topics()` (`form_parsers.ts`) czyta `getAll("topics")` w kolejnosci DOM, wiec
 * N inputow o tej samej nazwie degraduje sie bez JS za darmo. Badges/facts/links
 * dostaja indeks wprost w nazwie i sa czytane po pozycji jako `SlotFormField`
 * (`form_mapping.ts`), nie po kolejnosci w `FormData`.
 */
export function slot_input_name(
  group: SlotGroupName,
  index: number,
  key?: string,
): string {
  if (group === "topics") return "topics";
  return key === undefined ? `${group}.${index}` : `${group}.${index}.${key}`;
}

/** Adres slotu do `field_id()`/testow/podgladu — zawsze indeksowany, takze dla topics. */
export function slot_address(
  group: SlotGroupName,
  index: number,
  key?: string,
): string {
  return key === undefined ? `${group}.${index}` : `${group}.${index}.${key}`;
}

export const PRIMARY_ROWS: readonly PrimaryRow[] = [
  {
    kind: "fields",
    title: "Termin",
    fields: [from_catalogue("startDate"), from_catalogue("endDate")],
  },
  { kind: "slot-group", title: "Wyróżniki", group: "badges" },
  {
    kind: "fields",
    title: "Tytuł",
    fields: [from_catalogue("name")],
    secondary: [from_catalogue("id"), from_catalogue("kind")],
  },
  {
    kind: "fields",
    title: "Miejsce",
    fields: [from_catalogue("venue.name"), from_catalogue("venue.room")],
  },
  {
    kind: "fields",
    title: "Godziny",
    hint: "Każda godzina niezależna — sama godzina otwarcia też jest informacją.",
    fields: [
      from_catalogue("schedule.startTime"),
      from_catalogue("schedule.endTime"),
    ],
  },
  {
    kind: "fields",
    title: "Lokalizacja",
    hint: "Adres zasila link do mapy, przypis pod nim jest tylko dla czytelnika — żadne z tych pól nie zależy od pozostałych.",
    fields: [
      from_catalogue("city"),
      from_catalogue("country"),
      from_catalogue("venue.streetAddress"),
      from_catalogue("venue.postalCode"),
      VENUE_NOTE_FIELD,
    ],
  },
  {
    kind: "fields",
    title: "Treść",
    fields: [from_catalogue("description")],
  },
  { kind: "slot-group", title: "Fakty", group: "facts" },
  { kind: "slot-group", title: "Tematy", group: "topics" },
  {
    kind: "slot-group",
    title: "Linki",
    group: "links",
    leadField: from_catalogue("url"),
  },
] as const;

export interface AdvancedGroup {
  title: string;
  hint?: string;
  fields: readonly EditorField[];
  /**
   * Doklejany checkbox `admission.requiresRegistration` — poza `EditorField`, bo
   * niezaznaczony nie wysyla nazwy w ogole (patrz `RegistrationField` w `EventForm.tsx`).
   */
  registration?: boolean;
}

export const ADVANCED_GROUPS: readonly AdvancedGroup[] = [
  {
    title: "Strefy i format czasu",
    fields: [
      from_catalogue("utcOffset"),
      from_catalogue("schedule.utcOffset"),
      from_catalogue("schedule.timeZoneLabel"),
    ],
  },
  {
    title: ADMISSION_GROUP,
    hint: "Sam znacznik rejestracji nie tworzy warunków wstępu. Pozostałe trzy pola puste = brak warunków.",
    fields: [
      from_catalogue("admission.price"),
      from_catalogue("admission.priceCurrency"),
      from_catalogue("admission.validFrom"),
    ],
    registration: true,
  },
  {
    title: "Organizator",
    fields: [from_catalogue("organizer.name"), from_catalogue("organizer.url")],
  },
  {
    title: "Metadane",
    fields: [
      from_catalogue("countryCode"),
      from_catalogue("image"),
      from_catalogue("edition"),
      from_catalogue("shortName"),
      from_catalogue("venue.url"),
    ],
  },
] as const;

/**
 * Suma pol Zaawansowanych (+ checkbox rejestracji) — licznik w `<summary>` ("n z X
 * wypelnionych") ma liczyc sie stad, zeby X nigdy nie rozjechal sie z faktyczna
 * liczba pol grupy.
 */
export const ADVANCED_FIELD_COUNT = ADVANCED_GROUPS.reduce(
  (total, group) =>
    total + group.fields.length + (group.registration === true ? 1 : 0),
  0,
);
