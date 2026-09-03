import {
  get_event_end_datetime,
  get_event_start_datetime,
  get_venue_map_url,
  type TradeFairEvent,
} from "./events-data";

/** Canonical page a visitor is sent to — we run no ticketing of our own */
const MARKETS_PATH = "/markets";

interface PostalAddressSchema {
  "@type": "PostalAddress";
  streetAddress?: string;
  postalCode?: string;
  addressLocality: string;
  addressCountry: string;
}

interface PlaceSchema {
  "@type": "Place";
  name: string;
  /** Map link, not the venue's own page — that is what `url` would mean here */
  hasMap?: string;
  address: PostalAddressSchema;
}

interface OfferSchema {
  "@type": "Offer";
  price: string;
  priceCurrency: string;
  availability: string;
  url: string;
  validFrom: string;
}

interface OrganizationSchema {
  "@type": "Organization";
  name: string;
  url: string;
}

export interface EventSchema {
  "@context": "https://schema.org";
  "@type": "Event";
  name: string;
  description: string;
  image: string;
  startDate: string;
  endDate: string;
  eventStatus: string;
  eventAttendanceMode: string;
  /** Stated next to a zero-priced `Offer` — Google reads the flag, not the price */
  isAccessibleForFree?: boolean;
  url?: string;
  offers?: OfferSchema;
  location: PlaceSchema;
  organizer: OrganizationSchema;
}

function build_offer_schema(
  event: TradeFairEvent,
  site: URL | string | undefined,
): OfferSchema | undefined {
  if (!event.admission) {
    return undefined;
  }

  return {
    "@type": "Offer",
    price: event.admission.price,
    priceCurrency: event.admission.priceCurrency,
    availability: "https://schema.org/InStock",
    url: new URL(MARKETS_PATH, site).href,
    validFrom: event.admission.validFrom,
  };
}

/** schema.org Event for a single entry of `EVENTS`, dates taken from the shared helpers */
export function build_event_schema(
  event: TradeFairEvent,
  site: URL | string | undefined,
): EventSchema {
  const offers = build_offer_schema(event, site);
  const is_free =
    event.admission !== undefined && Number(event.admission.price) === 0;
  const map_url = get_venue_map_url(event);

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.description,
    image: new URL(event.image, site).href,
    startDate: get_event_start_datetime(event),
    endDate: get_event_end_datetime(event),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(is_free ? { isAccessibleForFree: true } : {}),
    ...(event.url ? { url: event.url } : {}),
    ...(offers ? { offers } : {}),
    location: {
      "@type": "Place",
      name: event.venue?.name ?? event.city,
      ...(map_url ? { hasMap: map_url } : {}),
      address: {
        "@type": "PostalAddress",
        ...(event.venue?.streetAddress
          ? { streetAddress: event.venue.streetAddress }
          : {}),
        ...(event.venue?.postalCode
          ? { postalCode: event.venue.postalCode }
          : {}),
        addressLocality: event.city,
        addressCountry: event.countryCode,
      },
    },
    organizer: {
      "@type": "Organization",
      name: event.organizer.name,
      url: event.organizer.url,
    },
  };
}

/** `</script>` inside any event field would break out of the JSON-LD block */
export function to_json_ld(data: unknown): string {
  return JSON.stringify(data).replace(
    /[<>&]/g,
    (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
}
