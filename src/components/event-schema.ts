import {
  get_event_end_datetime,
  get_event_name,
  get_event_start_datetime,
  get_venue_map_url,
  MARKETS_PATH,
  type TradeFairEvent,
} from "./events-data";

interface PostalAddressSchema {
  "@type": "PostalAddress";
  streetAddress?: string;
  postalCode?: string;
  addressLocality?: string;
  addressCountry?: string;
}

interface PlaceSchema {
  "@type": "Place";
  name?: string;
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
  description?: string;
  /** Absent for an image we cannot resolve — schema.org treats it as recommended, not required */
  image?: string;
  startDate: string;
  endDate: string;
  eventStatus: string;
  eventAttendanceMode: string;
  /** Stated next to a zero-priced `Offer` — Google reads the flag, not the price */
  isAccessibleForFree?: boolean;
  url?: string;
  offers?: OfferSchema;
  /** Dropped whole for a draft that names neither a venue, a city nor a country */
  location?: PlaceSchema;
  organizer?: OrganizationSchema;
}

/**
 * Where the event happens, `undefined` while nothing about the place is known —
 * a `Place` carrying only its `@type` describes nothing and reads as broken markup.
 */
function build_location_schema(event: TradeFairEvent): PlaceSchema | undefined {
  const name = event.venue?.name ?? event.city;
  const map_url = get_venue_map_url(event);
  const address: PostalAddressSchema = {
    "@type": "PostalAddress",
    ...(event.venue?.streetAddress
      ? { streetAddress: event.venue.streetAddress }
      : {}),
    ...(event.venue?.postalCode ? { postalCode: event.venue.postalCode } : {}),
    ...(event.city ? { addressLocality: event.city } : {}),
    ...(event.countryCode ? { addressCountry: event.countryCode } : {}),
  };

  if (name === undefined && Object.keys(address).length === 1) {
    return undefined;
  }

  return {
    "@type": "Place",
    ...(name ? { name } : {}),
    ...(map_url ? { hasMap: map_url } : {}),
    address,
  };
}

function build_offer_schema(
  event: TradeFairEvent,
  site: URL | string | undefined,
  offer_path: string,
): OfferSchema | undefined {
  if (!event.admission) {
    return undefined;
  }

  return {
    "@type": "Offer",
    price: event.admission.price,
    priceCurrency: event.admission.priceCurrency,
    availability: "https://schema.org/InStock",
    url: new URL(offer_path, site).href,
    validFrom: event.admission.validFrom,
  };
}

/**
 * Absolute URL of the event image. The parser already drops a source `new URL()` chokes on,
 * so this is the second lock, and it holds for the same reason: one unusable picture must
 * not turn the listing and every detail page into a 500.
 */
function build_image_url(
  event: TradeFairEvent,
  site: URL | string | undefined,
): string | undefined {
  if (event.image === undefined) return undefined;

  try {
    return new URL(event.image, site).href;
  } catch {
    return undefined;
  }
}

/**
 * schema.org Event for a single event, dates taken from the shared helpers.
 * `offer_path` is where the offer sends a visitor: the listing by default, the event's
 * own page when the schema is emitted from it — we run no ticketing of our own.
 *
 * `null` for a draft with no date: `startDate` is the one property schema.org requires
 * of an Event, and markup Google rejects is worse than a page with no markup at all.
 * Callers must skip the `<script>` tag entirely rather than emit an empty one.
 */
export function build_event_schema(
  event: TradeFairEvent,
  site: URL | string | undefined,
  offer_path: string = MARKETS_PATH,
): EventSchema | null {
  const startDate = get_event_start_datetime(event);
  const endDate = get_event_end_datetime(event);

  if (startDate === undefined || endDate === undefined) {
    return null;
  }

  const offers = build_offer_schema(event, site, offer_path);
  const is_free =
    event.admission !== undefined && Number(event.admission.price) === 0;
  const location = build_location_schema(event);
  const image = build_image_url(event, site);

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: get_event_name(event),
    ...(event.description ? { description: event.description } : {}),
    ...(image ? { image } : {}),
    startDate,
    endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(is_free ? { isAccessibleForFree: true } : {}),
    ...(event.url ? { url: event.url } : {}),
    ...(offers ? { offers } : {}),
    ...(location ? { location } : {}),
    ...(event.organizer
      ? {
          organizer: {
            "@type": "Organization" as const,
            name: event.organizer.name,
            url: event.organizer.url,
          },
        }
      : {}),
  };
}

/** `</script>` inside any event field would break out of the JSON-LD block */
export function to_json_ld(data: unknown): string {
  return JSON.stringify(data).replace(
    /[<>&]/g,
    (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
}
