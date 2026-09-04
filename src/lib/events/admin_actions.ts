import {
  MAX_FORM_BODY_BYTES,
  is_same_site_request,
  read_form_body,
  type FormBodyRejection,
} from "../api";
import {
  FORM_SCOPE,
  format_event_form_error,
  read_event_form,
  read_event_patch,
  type EventFormError,
  type EventFormField,
} from "./form_mapping";
import {
  create_event,
  delete_event,
  update_event,
  type EventMutationFailure,
} from "./mutations";

/** Lista wydarzen w panelu — cel kazdego udanego zapisu i `cancelHref` obu formularzy. */
export const ADMIN_EVENTS_PATH = "/admin/events";

/**
 * Kasowanie potwierdza osobna strona, a nie `confirm()`, wiec jedynym sladem zgody jest to
 * pole. Bez niego samo trafienie POST-em w adres kasowaniem nie jest.
 */
export const DELETE_CONFIRM_FIELD = "confirm";
export const DELETE_CONFIRM_VALUE = "delete";

/** Co sie udalo — jedyne, co przezywa redirect 303 na liste. */
export type EventActionKind = "created" | "updated" | "deleted";

/**
 * Co uzytkownik ma z tym zrobic. Kod z `mutations.ts` mowi, co poszlo nie tak; to mowi,
 * jaki ruch ma sens — rozdzial jest cala trescia obslugi nieudanego zapisu:
 * `validation` (dane do poprawy), `conflict` (nie pasuja do stanu bazy), `retry` (na pewno
 * nie zapisano), `refresh` (zapis mogl przejsc — ponowienie na slepo daje duplikat albo 409),
 * `config` (blad wdrozenia, formularz bez winy), `request` (zadanie nie do obsluzenia).
 */
export type EventActionProblem =
  | "validation"
  | "conflict"
  | "retry"
  | "refresh"
  | "config"
  | "request";

export interface EventActionNotice {
  kind: EventActionKind;
  id: string;
}

export interface EventActionAccepted {
  ok: true;
  notice: EventActionNotice;
  /** Gotowa sciezka do `Astro.redirect(result.redirect, 303)`. */
  redirect: string;
}

/**
 * Komplet wejscia dla `EventForm`: `values`, `errors` i `message` ida w propsy jeden do
 * jednego, bez przekierowania — 28 pol z opisem nie zmiesciloby sie w query stringu.
 * `status` idzie do `Astro.response.status`, zeby odpowiedz nie udawala udanego zapisu.
 */
export interface EventActionRejected {
  ok: false;
  problem: EventActionProblem;
  status: number;
  /** `null` = ciala nie przeczytano; strona edycji wypelnia wtedy formularz zapisanym rekordem. */
  values: URLSearchParams | null;
  /** Kody `<pole>.<required|invalid>` — format `format_event_form_error()`. */
  errors: readonly string[];
  message: string | null;
}

export type EventActionResult = EventActionAccepted | EventActionRejected;

/** Kasowanie wysyla jedno pole zgody — 64 KiB otwieraloby powierzchnie bez powodu. */
const DELETE_BODY_BYTES = 4096;

const NOTICE_KIND_PARAM = "done";
const NOTICE_EVENT_PARAM = "event";

/** Guard prezentacyjny, nie regula ksztaltu `id` (ta zyje w `parse_event.ts`) — parametr
 *  wraca z adresu, ktory da sie przepisac recznie. */
const NOTICE_ID_SHAPE = /^[a-z0-9-]{1,64}$/;

const CHECKBOX_ON = "on";

/**
 * Checkbox jedzie z ukrytym blizniakiem tej samej nazwy (`EventForm`), wiec w ciele sa dwie
 * wartosci: `""` i `"on"`. `get()` oddaje pierwsza — bez normalizacji zaznaczona zgoda
 * gasla przy kazdym powrocie formularza z bledem.
 */
const CHECKBOX_FIELDS = [
  "admission.requiresRegistration",
] as const satisfies readonly EventFormField[];

export async function create_event_from_form(
  request: Request,
): Promise<EventActionResult> {
  const body = await accept_submission(request, "create");
  if (!body.ok) return body.rejection;

  const form = read_event_form(body.fields);
  if (!form.ok) return field_errors(body.values, form.errors);

  const written = await create_event(form.event);
  return written.ok
    ? accepted("created", written.event.id)
    : mutation_rejection(written, body.values, "create");
}

/**
 * `id` bierze sie z trasy, nie z ciala. Formularz edycji wysyla to pole mimo `readOnly`, wiec
 * sama jego obecnosc niczego nie znaczy — zgodna wartosc odpada z patcha jako pozorna zmiana.
 * Rozjazd konczy sie odmowa: nowy slug zerwalby `/markets/<id>`.
 */
export async function update_event_from_form(
  request: Request,
  id: string,
): Promise<EventActionResult> {
  const body = await accept_submission(request, "update");
  if (!body.ok) return body.rejection;

  const form = read_event_patch(body.fields);
  if (!form.ok) return field_errors(body.values, form.errors);

  const { id: submitted_id, ...patch } = form.patch;
  if (submitted_id !== undefined && submitted_id !== id) {
    return {
      ok: false,
      problem: "validation",
      status: 422,
      values: body.values,
      errors: [format_event_form_error({ field: "id", code: "invalid" })],
      message:
        "Identyfikatora nie da się zmienić — nowy adres zerwałby wszystkie linki do tego wydarzenia. Zamiast tego dodaj nowe wydarzenie.",
    };
  }

  if (Object.keys(patch).length === 0) {
    return field_errors(body.values, [{ field: FORM_SCOPE, code: "required" }]);
  }

  const written = await update_event(id, patch);
  return written.ok
    ? accepted("updated", written.event.id)
    : mutation_rejection(written, body.values, "update");
}

/** Zgoda przychodzi z osobnej strony potwierdzenia, ale sprawdzana jest tutaj. */
export async function delete_event_from_form(
  request: Request,
  id: string,
): Promise<EventActionResult> {
  const body = await accept_submission(request, "delete");
  if (!body.ok) return body.rejection;

  if (body.fields.get(DELETE_CONFIRM_FIELD) !== DELETE_CONFIRM_VALUE) {
    return request_rejection(
      400,
      "Usunięcie nie zostało potwierdzone, więc nic nie zostało usunięte. Użyj przycisku potwierdzenia na tej stronie.",
    );
  }

  const written = await delete_event(id);
  return written.ok
    ? accepted("deleted", written.event.id)
    : mutation_rejection(written, body.values, "delete");
}

/**
 * Po 303 zostaje wylacznie adres, wiec co sie udalo wraca dwoma krotkimi parametrami.
 * Nierozpoznana wartosc jest ignorowana: `?done=` da sie dopisac recznie, a nie ma z tego
 * powstac komunikat o zapisie, ktorego nie bylo.
 */
export function read_event_notice(
  params: URLSearchParams,
): EventActionNotice | null {
  const kind = params.get(NOTICE_KIND_PARAM);
  if (kind !== "created" && kind !== "updated" && kind !== "deleted") {
    return null;
  }

  const id = params.get(NOTICE_EVENT_PARAM) ?? "";
  return NOTICE_ID_SHAPE.test(id) ? { kind, id } : null;
}

type Submission =
  | { ok: true; fields: URLSearchParams; values: URLSearchParams }
  | { ok: false; rejection: EventActionRejected };

/** CSRF przed czytaniem ciala: sesja chroni przed obcym uzytkownikiem, nie przed obca
 *  strona POST-ujaca przegladarka zalogowanego. */
async function accept_submission(
  request: Request,
  action: MutationAction,
): Promise<Submission> {
  // GET i tak konczy sie na braku content-type; bramka jest dla stron panelu, ktore wolaja
  // te funkcje z frontmatteru renderowanego takze na GET.
  if (request.method !== "POST") {
    return {
      ok: false,
      rejection: request_rejection(
        405,
        "Formularz trzeba wysłać metodą POST — samo otwarcie tego adresu niczego nie zapisuje.",
      ),
    };
  }

  if (!is_same_site_request(request)) {
    return {
      ok: false,
      rejection: request_rejection(
        403,
        "To żądanie nie przyszło z panelu, więc nic nie zostało zapisane. Otwórz formularz ponownie i wyślij go jeszcze raz.",
      ),
    };
  }

  const max_bytes =
    action === "delete" ? DELETE_BODY_BYTES : MAX_FORM_BODY_BYTES;
  const body = await read_form_body(request, max_bytes);
  if (!body.ok) {
    return {
      ok: false,
      rejection: body_rejection(body.reason, max_bytes, action),
    };
  }

  return {
    ok: true,
    fields: body.fields,
    values: preserve_submitted_values(body.fields),
  };
}

/** Kopia jest wlasna, zeby odczyt pol i prezentacja nie dzielily jednego obiektu. */
function preserve_submitted_values(fields: URLSearchParams): URLSearchParams {
  const values = new URLSearchParams(fields);

  for (const field of CHECKBOX_FIELDS) {
    const checked = fields
      .getAll(field)
      .some((entry) => entry.trim().length > 0);
    values.set(field, checked ? CHECKBOX_ON : "");
  }

  return values;
}

/**
 * `id` z rekordu oddanego przez API, nie z trasy: `build_event_path()` przyjmuje slug po
 * `trim()`, wiec `id` z bialym znakiem zapisuje poprawny rekord, ale nie przeszedlby przez
 * `read_event_notice()` — potwierdzenie zniknieloby po redirekcie bez sladu.
 */
function accepted(kind: EventActionKind, id: string): EventActionAccepted {
  const params = new URLSearchParams({
    [NOTICE_KIND_PARAM]: kind,
    [NOTICE_EVENT_PARAM]: id,
  });

  return {
    ok: true,
    notice: { kind, id },
    redirect: `${ADMIN_EVENTS_PATH}?${params}`,
  };
}

function field_errors(
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
function request_rejection(
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

function body_rejection(
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

type MutationAction = "create" | "update" | "delete";

/**
 * Tresc od backendu doklejamy pod wlasnym zdaniem, nie zamiast niego: przy 500
 * `read_failure()` oddaje slowa backendu, ktore nie mowia nic o tym, czy zapis przeszedl.
 */
function mutation_rejection(
  failure: EventMutationFailure,
  values: URLSearchParams,
  action: MutationAction,
): EventActionRejected {
  const verdict = describe_mutation_failure(failure, action);
  if (verdict.problem === "config") report_config_failure(failure.code, action);

  return {
    ok: false,
    problem: verdict.problem,
    status: verdict.status,
    values,
    errors: verdict.errors,
    message: verdict.message,
  };
}

interface MutationVerdict {
  problem: EventActionProblem;
  status: number;
  errors: readonly string[];
  message: string;
}

function describe_mutation_failure(
  failure: EventMutationFailure,
  action: MutationAction,
): MutationVerdict {
  switch (failure.code) {
    case "duplicate_id":
      return {
        problem: "conflict",
        status: 409,
        // Jedyny blad zapisu wskazujacy konkretny input — reszta dotyczy calego zadania.
        errors: [format_event_form_error({ field: "id", code: "invalid" })],
        message:
          "Wydarzenie o tym identyfikatorze już istnieje. Wybierz inny identyfikator.",
      };
    case "not_found":
      return {
        problem: "conflict",
        status: 404,
        errors: [],
        message:
          "Tego wydarzenia już nie ma — mogło zostać usunięte w międzyczasie. Odśwież listę wydarzeń.",
      };
    case "rejected":
      return {
        problem: "validation",
        status: 422,
        errors: [],
        message: join_message(
          "API wydarzeń odrzuciło te dane, więc nic nie zostało zapisane.",
          failure.message,
          failure.details,
        ),
      };
    case "unauthorized":
      return {
        problem: "config",
        status: 500,
        errors: [],
        message:
          "Panel nie uwierzytelnił się w API wydarzeń, więc nic nie zostało zapisane. To błąd wdrożenia (EVENTS_API_KEY), a nie wpisanych danych — poprawianie formularza nic nie da.",
      };
    case "misconfigured":
      return {
        problem: "config",
        status: 500,
        errors: [],
        message: join_message(
          "API wydarzeń jest źle skonfigurowane, więc nic nie zostało zapisane. To wymaga poprawki wdrożenia, a nie zmiany wpisanych danych.",
          failure.message,
        ),
      };
    case "too_large":
      return {
        problem: "validation",
        status: 413,
        errors: [],
        message:
          "Wydarzenie jest większe niż przyjmuje API, więc nic nie zostało zapisane. Skróć opis i zapisz ponownie.",
      };
    case "unreachable":
      return {
        problem: "retry",
        status: 502,
        errors: [],
        message: `API wydarzeń nie odpowiada, więc ${action === "delete" ? "nic nie zostało usunięte" : "nic nie zostało zapisane"}. Spróbuj ponownie za chwilę.`,
      };
    case "uncertain":
      return {
        problem: "refresh",
        status: 504,
        errors: [],
        message: `API wydarzeń nie potwierdziło operacji, więc mogła ona mimo wszystko przejść. Odśwież listę wydarzeń, zanim spróbujesz ponownie — ponowienie na ślepo może ${blind_retry_cost(action)}.`,
      };
    case "malformed_response":
      return {
        problem: "refresh",
        status: 502,
        errors: [],
        message:
          "API wydarzeń przyjęło operację, ale odpowiedziało czymś, czego panel nie umie odczytać. Odśwież listę wydarzeń, żeby zobaczyć aktualny stan, zanim spróbujesz ponownie.",
      };
    default:
      return {
        problem: "refresh",
        status: 502,
        errors: [],
        message: join_message(
          "API wydarzeń odpowiedziało w sposób, którego panel nie rozpoznaje, więc wynik operacji jest nieznany. Odśwież listę wydarzeń, zanim spróbujesz ponownie.",
          failure.message,
        ),
      };
  }
}

function blind_retry_cost(action: MutationAction): string {
  switch (action) {
    case "create":
      return "utworzyć drugie takie samo wydarzenie";
    case "update":
      return "zgłosić konflikt na zmianie, która już weszła";
    default:
      return "zgłosić błąd o wydarzeniu, którego już nie ma";
  }
}

/** Segmenty sa etykietowane: tresc od backendu to cytat z innej warstwy, nie zdanie panelu. */
function join_message(
  lead: string,
  reported?: string,
  details?: readonly string[],
): string {
  const parts = [lead];

  if (reported !== undefined && reported.length > 0 && reported !== lead) {
    parts.push(`Szczegóły: ${reported}`);
  }
  if (details !== undefined && details.length > 0) {
    parts.push(`Zgłoszone problemy: ${details.join("; ")}`);
  }

  return parts.join(" ");
}

/** Sam kod i akcja — bez pol formularza, bez naglowkow, bez komunikatu (niesie tresc z API). */
function report_config_failure(code: string, action: MutationAction): void {
  console.error(`[admin/events] ${action} blocked by configuration: ${code}`);
}
