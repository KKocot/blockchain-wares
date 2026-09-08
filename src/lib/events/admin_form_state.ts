import type { FormBodyRejection } from "../api";
import {
  format_event_form_error,
  type EventFormError,
  type EventFormField,
} from "./form_mapping";
import type { EventActionRejected, MutationAction } from "./admin_actions";

/**
 * Modul wewnetrzny `admin_actions.ts`: stan formularza wracajacego do widoku po odrzuceniu
 * zapisu — odczyt wartosci z requestu i budowanie `EventActionRejected` z wpisanymi wartosciami.
 */

const CHECKBOX_ON = "on";

/**
 * Checkbox jedzie z ukrytym blizniakiem tej samej nazwy (`EventForm`), wiec w ciele sa dwie
 * wartosci: `""` i `"on"`. `get()` oddaje pierwsza — bez normalizacji zaznaczona zgoda
 * gasla przy kazdym powrocie formularza z bledem.
 */
const CHECKBOX_FIELDS = [
  "admission.requiresRegistration",
] as const satisfies readonly EventFormField[];

/** Kopia jest wlasna, zeby odczyt pol i prezentacja nie dzielily jednego obiektu. */
export function preserve_submitted_values(
  fields: URLSearchParams,
): URLSearchParams {
  const values = new URLSearchParams(fields);

  for (const field of CHECKBOX_FIELDS) {
    const checked = fields
      .getAll(field)
      .some((entry) => entry.trim().length > 0);
    values.set(field, checked ? CHECKBOX_ON : "");
  }

  return values;
}

export function field_errors(
  values: URLSearchParams,
  errors: readonly EventFormError[],
): EventActionRejected {
  return {
    ok: false,
    problem: "validation",
    status: 422,
    values,
    errors: errors.map(format_event_form_error),
    // Bez zbiorczego zdania: `EventForm` wypisuje te bledy przy samych polach.
    message: null,
  };
}

/** Odrzucone przed odczytem pol: `values` zostaje `null`, a strona wypelnia formularz tym,
 *  co ma (zapisanym rekordem albo niczym). */
export function request_rejection(
  status: number,
  message: string,
): EventActionRejected {
  return {
    ok: false,
    problem: "request",
    status,
    values: null,
    errors: [],
    message,
  };
}

export function body_rejection(
  reason: FormBodyRejection,
  max_bytes: number,
  action: MutationAction,
): EventActionRejected {
  const limit = Math.round(max_bytes / 1024);

  switch (reason) {
    case "too_large":
      // Strona potwierdzenia usuniecia nie ma pola do skrocenia, wiec tam to nie jest
      // blad danych do poprawy, tylko zadanie, ktorego panel nie mial jak wyslac.
      return action === "delete"
        ? request_rejection(
            413,
            `Żądanie usunięcia jest większe niż ${limit} KiB, które panel przyjmuje. Nic nie zostało usunięte — otwórz stronę potwierdzenia ponownie.`,
          )
        : {
            ...request_rejection(
              413,
              `Formularz jest większy niż ${limit} KiB, które panel przyjmuje, więc nic nie zostało zapisane. Skróć opis i wyślij go ponownie.`,
            ),
            problem: "validation",
          };
    case "unsupported_media_type":
      return request_rejection(
        415,
        "Formularz przyszedł w formacie, którego panel nie przyjmuje. Otwórz go ponownie i wyślij jego własnym przyciskiem.",
      );
    default:
      return request_rejection(
        400,
        "Formularz przyszedł pusty, więc nic nie zostało zapisane. Otwórz go ponownie i wyślij jeszcze raz.",
      );
  }
}
