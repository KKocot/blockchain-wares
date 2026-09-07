import { cn } from "../../lib/utils";
import {
  get_event_days,
  get_event_name,
  get_event_path,
  group_events_by_status,
  type EventStatus,
  type TradeFairEvent,
} from "../events-data";
import {
  get_status_badge_label,
  STATUS_BADGE_CLASS,
  STATUS_THEME,
  TOPIC_PILL_CLASS,
} from "../event-theme";
import { BUTTON_CLASS, CARD_CLASS } from "./styles";

/** Panel mowi po polsku; kolor i ksztalt badge'a zostaja te same, co na stronie. */
const STATUS_LABEL: Record<EventStatus, string> = {
  ongoing: "Trwa",
  upcoming: "Nadchodzi",
  past: "Zakończone",
  undated: "Bez terminu",
};

const STATUS_ORDER: readonly EventStatus[] = [
  "ongoing",
  "upcoming",
  "past",
  "undated",
];

const KIND_LABEL = {
  workshop: "Warsztat",
  conference: "Konferencja",
} as const;

const DANGER_BUTTON_CLASS =
  "inline-flex items-center rounded-md border border-error/40 bg-error/10 px-3 py-1.5 text-sm font-medium text-error transition-colors duration-150 hover:border-error/70 hover:bg-error/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-error";

const CELL_CLASS = "border-b border-base-300/60 px-3 py-3 align-top";

/** Szkic bywa zapisany bez terminu i bez miejsca — pusta komorka nie mowi o tym nic. */
const EMPTY_CLASS = "text-base-content/40";
const EMPTY_DATE = "bez terminu";
const EMPTY_PLACE = "bez miejsca";

const HEAD_CELL_CLASS =
  "border-b border-base-300 px-3 py-2 text-xs font-semibold tracking-wide text-base-content/60 uppercase";

interface RowAction {
  href: string;
  label: string;
  className: string;
}

function StatusBadge({
  event,
  status,
}: {
  event: TradeFairEvent;
  status: EventStatus;
}) {
  const theme = STATUS_THEME[status];

  return (
    <span
      className={cn(STATUS_BADGE_CLASS, theme.badge)}
      title={`Na stronie: ${get_status_badge_label(event, status)}`}
    >
      <span
        aria-hidden="true"
        className={cn("h-1.5 w-1.5 rounded-full", theme.dot)}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}

function EventCell({
  event,
  status,
}: {
  event: TradeFairEvent;
  status: EventStatus;
}) {
  const theme = STATUS_THEME[status];
  const kind = event.kind ?? "conference";

  return (
    <div className="min-w-0 space-y-1">
      <p className="font-medium break-words">{get_event_name(event)}</p>
      <p className="admin-mono text-xs break-all text-base-content/60">
        {event.id}
      </p>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className={cn(TOPIC_PILL_CLASS, theme.topic)}>
          {KIND_LABEL[kind]}
        </span>
        {event.edition !== undefined && (
          <span className="text-xs text-base-content/60">{event.edition}</span>
        )}
      </div>
    </div>
  );
}

/** Daty ISO, nie sformatowany zakres: w panelu liczy sie jednoznacznosc, nie ozdoba. */
function DateCell({ event }: { event: TradeFairEvent }) {
  const schedule = event.schedule;
  const zone = schedule?.utcOffset ?? event.utcOffset;
  const days = get_event_days(event);

  return (
    <div className="space-y-1">
      <p className="admin-mono text-xs whitespace-nowrap">
        {days === null ? (
          <span className={EMPTY_CLASS}>{EMPTY_DATE}</span>
        ) : (
          `${days.start}${days.end === days.start ? "" : ` → ${days.end}`}`
        )}
      </p>

      {schedule !== undefined && (
        <p className="admin-mono text-xs whitespace-nowrap text-base-content/60">
          {schedule.startTime}–{schedule.endTime} {schedule.timeZoneLabel}
        </p>
      )}

      {zone !== undefined && (
        <p className="admin-mono text-xs text-base-content/60">UTC {zone}</p>
      )}
    </div>
  );
}

function PlaceCell({ event }: { event: TradeFairEvent }) {
  const place = [event.city, event.country].filter(
    (part): part is string => part !== undefined,
  );
  // Nazwa obiektu bywa nieznana, gdy znamy juz sale — pusty wiersz nie mowilby nic
  const venue = [event.venue?.name, event.venue?.room]
    .filter((part): part is string => part !== undefined)
    .join(" · ");

  return (
    <div className="min-w-0 space-y-1">
      <p className="break-words">
        {place.length === 0 ? (
          <span className={EMPTY_CLASS}>{EMPTY_PLACE}</span>
        ) : (
          place.join(", ")
        )}{" "}
        <span className="admin-mono text-xs text-base-content/60">
          {event.countryCode}
        </span>
      </p>

      {venue === "" ? null : (
        <p className="text-xs break-words text-base-content/60">{venue}</p>
      )}
    </div>
  );
}

/** Nazwa wydarzenia w kazdej akcji — bez niej lista linkow „Edytuj" jest nie do rozroznienia. */
function ActionsCell({
  event,
  actions,
}: {
  event: TradeFairEvent;
  actions: readonly RowAction[];
}) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      {actions.map((action) => (
        <a key={action.label} href={action.href} className={action.className}>
          {action.label}
          <span className="sr-only"> — {get_event_name(event)}</span>
        </a>
      ))}
    </div>
  );
}

export interface EventsTableProps {
  events: readonly TradeFairEvent[];
  /** Chwila liczenia statusu — strona podaje ja raz, zeby wiersze nie rozjechaly sie w czasie. */
  now: Date;
  createHref: string;
  editHref: (event: TradeFairEvent) => string;
  /** Strona potwierdzenia usuniecia; bez JS-a nie ma `confirm()`, wiec pyta osobny widok. */
  deleteHref: (event: TradeFairEvent) => string;
}

/**
 * Lista wydarzen panelu, renderowana wylacznie na serwerze. Kolejnosc bierze sie
 * z `group_events_by_status`: trwajace, nadchodzace, na koncu archiwum.
 */
export function EventsTable({
  events,
  now,
  createHref,
  editHref,
  deleteHref,
}: EventsTableProps) {
  if (events.length === 0) {
    return (
      <section className={cn(CARD_CLASS, "space-y-3 text-center")}>
        <h2 className="text-sm font-semibold">Brak wydarzeń</h2>
        <p className="mx-auto max-w-prose text-xs text-base-content/60">
          Lista jest pusta, więc sekcja „Markets” i baner na stronie głównej nie
          pokazują niczego. Dodaj pierwsze wydarzenie, żeby się pojawiły.
        </p>
        <a href={createHref} className={cn(BUTTON_CLASS, "mx-auto")}>
          Dodaj wydarzenie
        </a>
      </section>
    );
  }

  const groups = group_events_by_status(now, [...events]);
  const rows = STATUS_ORDER.flatMap((status) =>
    groups[status].map((event) => ({ event, status })),
  );

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-base-content/60">
          {STATUS_ORDER.map(
            (status) => `${STATUS_LABEL[status]}: ${groups[status].length}`,
          ).join(" · ")}
        </p>

        <a href={createHref} className={BUTTON_CLASS}>
          Dodaj wydarzenie
        </a>
      </div>

      <div className="overflow-hidden rounded-md border border-base-300 bg-base-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              Wydarzenia w panelu: status, nazwa z identyfikatorem, termin,
              miejsce oraz odnośniki do podglądu, edycji i usunięcia. Kolejność
              jest stała — najpierw trwające, potem nadchodzące, na końcu
              zakończone.
            </caption>

            <thead className="bg-base-200">
              <tr>
                <th scope="col" className={HEAD_CELL_CLASS}>
                  Status
                </th>
                <th scope="col" className={HEAD_CELL_CLASS}>
                  Wydarzenie
                </th>
                <th scope="col" className={HEAD_CELL_CLASS}>
                  Termin
                </th>
                <th scope="col" className={HEAD_CELL_CLASS}>
                  Miejsce
                </th>
                <th scope="col" className={cn(HEAD_CELL_CLASS, "text-right")}>
                  Akcje
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map(({ event, status }) => (
                <tr key={event.id} className="last:[&>td]:border-b-0">
                  <td className={CELL_CLASS}>
                    <StatusBadge event={event} status={status} />
                  </td>
                  <td className={cn(CELL_CLASS, "max-w-[20rem]")}>
                    <EventCell event={event} status={status} />
                  </td>
                  <td className={CELL_CLASS}>
                    <DateCell event={event} />
                  </td>
                  <td className={cn(CELL_CLASS, "max-w-[16rem]")}>
                    <PlaceCell event={event} />
                  </td>
                  <td className={CELL_CLASS}>
                    <ActionsCell
                      event={event}
                      actions={[
                        {
                          href: get_event_path(event),
                          label: "Podgląd",
                          className: BUTTON_CLASS,
                        },
                        {
                          href: editHref(event),
                          label: "Edytuj",
                          className: BUTTON_CLASS,
                        },
                        {
                          href: deleteHref(event),
                          label: "Usuń",
                          className: DANGER_BUTTON_CLASS,
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
