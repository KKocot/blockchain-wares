import {
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  Info,
  MapPin,
  Mic,
  SquareParking,
  Ticket,
  UtensilsCrossed,
  Users,
  Wifi,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import { cn } from "../lib/utils";
import { type IconKey } from "./event-types";

/**
 * One icon per preset key from `event-types.ts`, exhaustive by type so an `IconKey`
 * added without an entry here fails the build instead of rendering nothing. Consumed by
 * the public fact strip and by the admin icon-select preview alike — no page context.
 */
export const EVENT_ICONS: Record<IconKey, LucideIcon> = {
  calendar: Calendar,
  clock: Clock,
  location: MapPin,
  building: Building2,
  ticket: Ticket,
  speaker: Mic,
  attendees: Users,
  catering: UtensilsCrossed,
  parking: SquareParking,
  wifi: Wifi,
  info: Info,
  "external-link": ExternalLink,
};

interface EventIconProps extends LucideProps {
  icon: IconKey;
}

/** Preset icon at the stroke weight of the card's hand-drawn siblings — 14px, 2px stroke */
export function EventIcon({ icon, className, ...props }: EventIconProps) {
  const Icon = EVENT_ICONS[icon];

  return (
    <Icon
      width={14}
      height={14}
      strokeWidth={2}
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    />
  );
}
