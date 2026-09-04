import type { TradeFairEvent } from "../../components/events-data";

/**
 * Co poszlo nie tak przy ostatniej probie odswiezenia. Panel rozroznia po tym awarie
 * po stronie ops (`unreachable`, `timeout`, `http_status`) od naszego bledu
 * (`malformed_payload`, `misconfigured`) — komunikat sam tego nie niesie.
 */
export type EventsSourceErrorKind =
  | "timeout"
  | "unreachable"
  | "http_status"
  | "malformed_payload"
  | "misconfigured";

export interface EventsSourceError {
  kind: EventsSourceErrorKind;
  message: string;
}

/** Ostatnia udana odpowiedz API w pamieci procesu. */
export interface EventsCacheEntry {
  events: TradeFairEvent[];
  fetchedAt: number;
  /** Ile rekordow odrzucila walidacja ksztaltu — mianownik ostrzezenia w panelu. */
  rejected: number;
  /**
   * Wpis uniewazniony po zapisie: dane zostaja jako fallback na wypadek awarii API,
   * ale kazde wywolanie idzie po swieze. `fetchedAt` zostaje prawdziwe, zeby panel
   * nie pokazywal wieku liczonego od epoki.
   */
  expired: boolean;
}

export interface EventsSourceStatus {
  /** ISO ostatniego UDANEGO pobrania; null gdy cache jest pusty. */
  fetchedAt: string | null;
  ageMillis: number | null;
  /** Dane przeterminowane wzgledem TTL — widac po nieudanym odswiezeniu. */
  stale: boolean;
  /** Ostatnia nieudana proba; dane w snapshocie sa wtedy z cache. */
  error: EventsSourceError | null;
  events: number;
  rejected: number;
}

export interface EventsSnapshot {
  events: TradeFairEvent[];
  status: EventsSourceStatus;
}

export interface LoadEventsOptions {
  /** Pomija TTL — po zapisie w panelu albo przy recznym odswiezeniu. */
  force?: boolean;
}
