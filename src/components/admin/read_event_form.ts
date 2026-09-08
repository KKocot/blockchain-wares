/**
 * Odczyt formularza wydarzenia dla podglądu: zebranie DOM do `URLSearchParams` i oddanie
 * ich mapperowi zapisu. Podgląd celowo nie ma własnego mapowania — drugie rozjechałoby się
 * z zapisem po pierwszej zmianie pola i pokazywałoby co innego, niż idzie do API.
 */
export { read_event_form } from "../../lib/events/form_mapping";

/** `FormData` zwraca też pliki; formularz wydarzenia ma same pola tekstowe. */
export function collect_fields(form: HTMLFormElement): URLSearchParams {
  const fields = new URLSearchParams();

  for (const [name, value] of new FormData(form).entries()) {
    if (typeof value === "string") fields.append(name, value);
  }

  return fields;
}
