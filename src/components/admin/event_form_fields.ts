import {
  FORM_SCOPE,
  is_field_error,
  type EventFormErrorCode,
  type EventFormErrorField,
  type EventFormField,
  type SlotFormField,
} from "../../lib/events/form_mapping";
import {
  MAX_EVENT_BADGES,
  MAX_EVENT_FACTS,
  MAX_EVENT_LINKS,
} from "../event-types";

/**
 * Kotwica formularza wydarzenia w DOM — podglad czyta z niego wartosci przez
 * `document.getElementById`, bo stoi obok formularza, a nie w jego drzewie Reacta.
 */
export const EVENT_FORM_ID = "event-form";

export type FieldKind =
  | "text"
  | "date"
  | "time"
  | "url"
  | "textarea"
  | "select";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldSpec {
  name: EventFormField;
  label: string;
  /** Brak = zwykly `text`. */
  kind?: FieldKind;
  hint?: string;
  /** Zdanie doklejane do `hint` tylko w formularzu tworzenia. */
  createHint?: string;
  placeholder?: string;
  options?: readonly FieldOption[];
  /** Kolumny stalej szerokosci (kody, offsety) czytaja sie tylko monospace. */
  mono?: boolean;
  /** Pole na calej szerokosci siatki grupy. */
  full?: boolean;
}

export interface FieldGroup {
  title: string;
  hint?: string;
  fields: readonly FieldSpec[];
}

const KIND_OPTIONS = [
  { value: "", label: "— domyślnie (konferencja) —" },
  { value: "conference", label: "Konferencja (jedziemy)" },
  { value: "workshop", label: "Warsztat (prowadzimy)" },
] as const;

/**
 * Katalog pol formularza. Emituje KAZDE pole kontraktu, takze puste — inaczej edycja
 * nie umialaby skasowac wartosci opcjonalnej (puste = kasuj, nieobecne = bez zmian).
 * `as const` istnieje wylacznie dla `UndeclaredEventFormField`; renderowanie chodzi
 * po szerszym `GROUPS`, bo na krotce literalow nie ma nawet `group.hint`.
 */
const CATALOGUE = [
  {
    title: "Podstawowe",
    fields: [
      {
        name: "id",
        label: "Identyfikator",
        mono: true,
        placeholder: "ebc-2026-barcelona",
        hint: "Małe litery, cyfry i myślniki — buduje adres /markets/<id>.",
        createHint: "Puste = powstanie z nazwy wydarzenia.",
      },
      { name: "name", label: "Nazwa", full: true },
      { name: "shortName", label: "Nazwa skrócona", placeholder: "EBC 2026" },
      { name: "edition", label: "Edycja", placeholder: "EBC12" },
      {
        name: "kind",
        label: "Rodzaj",
        kind: "select",
        options: KIND_OPTIONS,
        hint: "Warsztat przełącza teksty na stronie z „jedziemy” na „prowadzimy”.",
      },
    ],
  },
  {
    title: "Termin",
    hint: "Każde pole niezależne — sama godzina otwarcia też jest informacją. Wszystkie puste = wydarzenie bez godzin.",
    fields: [
      { name: "startDate", label: "Data od", kind: "date" },
      {
        name: "endDate",
        label: "Data do",
        kind: "date",
        hint: "Dla wydarzenia jednodniowego ta sama co „Data od”.",
      },
      {
        name: "utcOffset",
        label: "Strefa wydarzenia",
        placeholder: "+02:00",
        mono: true,
        hint: "Bez niej doba wydarzenia liczy się w strefie serwera, a status skacze wokół północy.",
      },
      { name: "schedule.startTime", label: "Godzina od", kind: "time" },
      { name: "schedule.endTime", label: "Godzina do", kind: "time" },
      {
        name: "schedule.utcOffset",
        label: "Strefa harmonogramu",
        placeholder: "+02:00",
        mono: true,
      },
      {
        name: "schedule.timeZoneLabel",
        label: "Nazwa strefy",
        placeholder: "CEST",
        hint: "Widoczna dla czytelnika obok godzin.",
      },
    ],
  },
  {
    title: "Miejsce",
    hint: "Każde pole niezależne. Wszystkie puste = wydarzenie bez obiektu.",
    fields: [
      {
        name: "city",
        label: "Miasto",
        placeholder: "Barcelona",
      },
      { name: "country", label: "Kraj", placeholder: "Spain" },
      {
        name: "countryCode",
        label: "Kod kraju",
        mono: true,
        placeholder: "ES",
        hint: "Dwie wielkie litery, ISO 3166-1 alpha-2.",
      },
      {
        name: "venue.name",
        label: "Nazwa obiektu",
        full: true,
        placeholder: "Fira de Barcelona",
      },
      {
        name: "venue.streetAddress",
        label: "Ulica i numer",
        placeholder: "Carrer de Cristóbal de Moura, 49",
        hint: "Link do mapy powstaje z tego adresu i miasta — nie z nazwy obiektu ani z jego strony.",
      },
      {
        name: "venue.postalCode",
        label: "Kod pocztowy",
        mono: true,
        placeholder: "08019",
      },
      {
        name: "venue.room",
        label: "Sala lub piętro",
        full: true,
        placeholder: "Meeting Room 0.5+0.6, ground floor",
        hint: "Sala wewnątrz obiektu. Sama, bez nazwy budynku, też jest całą wiedzą o miejscu.",
      },
      {
        name: "venue.url",
        label: "Strona obiektu",
        kind: "url",
        full: true,
        placeholder: "https://",
        hint: "Prowadzi do budynku, nie do wydarzenia. Bez nazwy obiektu karta pokaże sam adres strony.",
      },
    ],
  },
  {
    title: "Wstęp",
    hint: "Sam znacznik rejestracji nie tworzy warunków wstępu. Pozostałe trzy pola puste = brak warunków.",
    fields: [
      {
        name: "admission.price",
        label: "Cena",
        mono: true,
        placeholder: "0",
        hint: "Liczba dziesiętna, „0” znaczy wstęp wolny.",
      },
      {
        name: "admission.priceCurrency",
        label: "Waluta",
        mono: true,
        placeholder: "EUR",
        hint: "Trzy wielkie litery, ISO 4217.",
      },
      {
        name: "admission.validFrom",
        label: "Obowiązuje od",
        kind: "date",
        hint: "Dzień, w którym ogłosiliśmy warunki.",
      },
    ],
  },
  {
    title: "Organizator",
    hint: "Nazwa i strona są niezależne — sama nazwa też nazywa organizatora.",
    fields: [
      { name: "organizer.name", label: "Nazwa organizatora" },
      {
        name: "organizer.url",
        label: "Strona organizatora",
        kind: "url",
        placeholder: "https://",
      },
      {
        name: "url",
        label: "Strona wydarzenia",
        kind: "url",
        full: true,
        placeholder: "https://",
        hint: "Puste = karta pokaże dojazd do obiektu zamiast linku do wydarzenia.",
      },
    ],
  },
  {
    title: "Treść",
    fields: [
      {
        name: "image",
        label: "Obraz",
        full: true,
        placeholder: "/assets/img/events/ebc-2026.jpg",
        hint: "Ścieżka od korzenia serwisu albo pełny URL — trafia do JSON-LD.",
      },
      {
        name: "topics",
        label: "Tematy",
        full: true,
        placeholder: "Hive, blockchain, EDA",
        hint: "Lista po przecinku. Temat z przecinkiem w nazwie jest niezapisywalny — zostanie rozbity na dwa.",
      },
      {
        name: "description",
        label: "Opis",
        kind: "textarea",
        full: true,
      },
    ],
  },
] as const satisfies readonly FieldGroup[];

export const GROUPS: readonly FieldGroup[] = CATALOGUE;

/** Grupa, do ktorej doklada sie checkbox wstepu — jedyne pole spoza `GROUPS`. */
export const ADMISSION_GROUP = "Wstęp";

/**
 * Checkbox stoi poza katalogiem: niezaznaczony nie wysyla nazwy w ogole, wiec
 * towarzyszy mu hidden i wlasny layout. Literal, nie `EventFormField` — inaczej
 * `Exclude` nizej skasowalby cala unie i przestal czegokolwiek pilnowac.
 */
export const REGISTRATION_FIELD =
  "admission.requiresRegistration" as const satisfies EventFormField;
export const REGISTRATION_LABEL = "Wymagana rejestracja";

/** Pominiete pole to cicha regresja kasowania przy edycji, wiec pilnuje go typ. */
type AssertNever<T extends never> = T;
export type UndeclaredEventFormField = AssertNever<
  Exclude<
    EventFormField,
    | (typeof CATALOGUE)[number]["fields"][number]["name"]
    | typeof REGISTRATION_FIELD
  >
>;

const FIELD_SPECS: readonly FieldSpec[] = GROUPS.flatMap(
  (group) => group.fields,
);

/** Lookup dla `event_form_groups.ts` — przegrupowanie katalogu czyta specyfikacje
 *  pol stad zamiast duplikowac etykiety/hinty/placeholdery drugi raz. */
export const FIELD_SPEC_BY_NAME: ReadonlyMap<EventFormField, FieldSpec> =
  new Map(FIELD_SPECS.map((spec) => [spec.name, spec] as const));

/** Nazwy pol formularza — strona odsiewa nimi wlasne parametry z query po bledzie. */
export const EVENT_FORM_FIELDS: readonly EventFormField[] = [
  ...FIELD_SPECS.map((spec) => spec.name),
  REGISTRATION_FIELD,
];

interface SlotLabelSpec {
  max: number;
  fields: readonly {
    address: (index: number) => SlotFormField;
    label: string;
  }[];
}

/**
 * Etykiety pól slotów jako literały, nie import z `event_form_groups.ts`: tamten moduł
 * czyta `FIELD_SPEC_BY_NAME` stąd, więc import w drugą stronę zamknąłby cykl.
 */
const SLOT_LABELS: readonly SlotLabelSpec[] = [
  {
    max: MAX_EVENT_BADGES,
    fields: [{ address: (index) => `badges.${index}`, label: "Wyróżnik" }],
  },
  {
    max: MAX_EVENT_FACTS,
    fields: [
      { address: (index) => `facts.${index}.icon`, label: "Ikona faktu" },
      { address: (index) => `facts.${index}.label`, label: "Treść faktu" },
    ],
  },
  {
    max: MAX_EVENT_LINKS,
    fields: [
      { address: (index) => `links.${index}.label`, label: "Etykieta linku" },
      { address: (index) => `links.${index}.url`, label: "Adres linku" },
    ],
  },
];

/** `links.2.url` -> „Adres linku 3": bez numeru podsumowanie wskazuje sześć takich samych pól. */
function slot_labels(): readonly [SlotFormField, string][] {
  const entries: [SlotFormField, string][] = [
    ["venue.note", "Przypis pod lokalizacją"],
  ];

  for (const group of SLOT_LABELS) {
    for (let index = 0; index < group.max; index += 1) {
      for (const field of group.fields) {
        entries.push([field.address(index), `${field.label} ${index + 1}`]);
      }
    }
  }

  return entries;
}

const SLOT_FIELDS = slot_labels();

export const FIELD_LABELS = new Map<EventFormErrorField, string>([
  ...FIELD_SPECS.map((spec): [EventFormErrorField, string] => [
    spec.name,
    spec.label,
  ]),
  [REGISTRATION_FIELD, REGISTRATION_LABEL],
  ...SLOT_FIELDS,
]);

/**
 * `required` przychodzi wyłącznie z niepełnej pary slotu (fakt bez ikony, link bez
 * adresu) — pojedyncze pole formularza obowiązkowe nie jest.
 */
export const CODE_TEXT: Record<EventFormErrorCode, string> = {
  required: "Uzupełnij to pole.",
  invalid: "Wartość ma niewłaściwy format.",
};

export const FORM_TEXT: Record<EventFormErrorCode, string> = {
  required: "Formularz nie zawierał żadnej wartości do zapisania.",
  invalid:
    "Z podanych pól nie da się złożyć wydarzenia — sprawdź daty, adres obrazu i formaty pozostałych wartości.",
};

/** Kod bledu spoza kontraktu — lepszy niz czerwona ramka bez slowa wyjasnienia. */
export const FALLBACK_TEXT =
  "Zapis odrzucony — sprawdź wartości i spróbuj ponownie.";

/**
 * Parametr jest `string`, nie `EventFormErrorField` — `slot_address()` składa adres
 * slotu z nazwy grupy i indeksu, więc jego wynik jest typowany szerzej niż katalog pól.
 */
export function field_id(field: string): string {
  return `event-field-${field.replaceAll(".", "-")}`;
}

/** `venue.name.required` + `venue.name` -> `required`; inny prefiks -> `null`. */
function code_for(
  code: string,
  field: EventFormErrorField,
): EventFormErrorCode | null {
  if (!is_field_error(code, field)) {
    return null;
  }

  const suffix = code.slice(field.length + 1);
  return suffix === "required" || suffix === "invalid" ? suffix : null;
}

/** Sloty stoją poza `EVENT_FORM_FIELDS`, a błąd bez wpisu tutaj nie podświetli żadnego pola. */
const ERROR_FIELDS: readonly EventFormErrorField[] = [
  ...EVENT_FORM_FIELDS,
  ...SLOT_FIELDS.map(([field]) => field),
  FORM_SCOPE,
];

/** Kody z `?error=` rozlozone na pola — pierwszy kod na pole wygrywa. */
export function collect_errors(
  codes: readonly string[],
): Map<EventFormErrorField, EventFormErrorCode> {
  const found = new Map<EventFormErrorField, EventFormErrorCode>();

  for (const code of codes) {
    for (const field of ERROR_FIELDS) {
      const parsed = code_for(code, field);
      if (parsed !== null && !found.has(field)) {
        found.set(field, parsed);
      }
    }
  }

  return found;
}
