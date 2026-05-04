import { cn } from "../lib/utils";
import { CometEffect } from "./ui";
import { useScrollAnimation } from "../hooks";

interface ContactInfo {
  label: string;
  value: string;
  link?: string;
  icon: string;
}

const LINKEDIN_URL = "https://www.linkedin.com/company/blockchainwares/";

const CONTACT_DATA: ContactInfo[] = [
  {
    label: "Email",
    value: "contact@blockchainwares.pl",
    link: "mailto:contact@blockchainwares.pl",
    icon: "✉️",
  },
  {
    label: "Address",
    value: "Graniczna 34B/U11, 41-303 Dąbrowa Górnicza",
    icon: "📍",
  },
  {
    label: "LinkedIn",
    value: "BlockchainWares",
    link: LINKEDIN_URL,
    icon: "linkedin",
  },
];

/**
 * Contact section component
 * Features:
 * - Two-column layout (contact info + map)
 * - Responsive design
 * - Google Maps embed
 */
export function Contact() {
  const { ref, is_visible } = useScrollAnimation<HTMLElement>();

  return (
    <section
      ref={ref}
      id="contact"
      className="relative min-h-screen flex items-center py-16 md:py-24 lg:py-32 px-4"
    >
      <div className="w-full">
      <div className="max-w-6xl mx-auto w-full relative z-10">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16">
          <span className={cn(
            "text-secondary font-medium tracking-wider uppercase text-xs md:text-sm block mb-2 md:mb-4",
            "fade-up",
            is_visible && "is-visible"
          )}>
            Contact Us
          </span>

          <h2 className={cn(
            "text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 md:mb-6 drop-shadow-lg",
            "fade-up stagger-1",
            is_visible && "is-visible"
          )}>
            Get In{" "}
            <span className="text-secondary">
              Touch
            </span>
          </h2>

          <p className={cn(
            "text-base md:text-lg text-base-content/80 leading-relaxed max-w-2xl mx-auto",
            "fade-up stagger-2",
            is_visible && "is-visible"
          )}>
            Have a project in mind? We'd love to hear from you.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            className={cn(
              "relative p-4 md:p-6 rounded-[28px] md:rounded-[36px]",
              "bg-base-200/30 backdrop-blur-sm",
              "border border-white/5",
              "shadow-card",
              "transition-shadow duration-300",
              "hover:shadow-card-hover",
              "fade-left stagger-3",
              is_visible && "is-visible"
            )}
          >
            <CometEffect />
            <h3 className="text-xl md:text-2xl font-bold mb-3">
              Contact Information
            </h3>
            <p className="text-sm md:text-base text-base-content/80 leading-relaxed mb-6">
              Ready to start your next project? Reach out to us and let's
              discuss how we can help you achieve your goals.
            </p>
            <div className="space-y-4">
              {CONTACT_DATA.map((item) => (
                <ContactItem key={item.label} {...item} />
              ))}
            </div>
          </div>

          <div
            className={cn(
              "relative p-4 md:p-6 rounded-[28px] md:rounded-[36px]",
              "bg-base-200/30 backdrop-blur-sm",
              "border border-white/5",
              "shadow-card",
              "transition-shadow duration-300",
              "hover:shadow-card-hover",
              "fade-right stagger-4",
              is_visible && "is-visible"
            )}
          >
            <CometEffect />
            <div className="h-[350px] rounded-xl overflow-hidden bg-base-100/50 relative z-10">
              <iframe
                src="https://maps.google.com/maps?width=520&height=400&hl=en&q=Graniczna%2034B/U11%20D%C4%85browa%20G%C3%B3rnicza+(BlockchainWares)&t=&z=15&ie=UTF8&iwloc=B&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                title="BlockchainWares Location"
              />
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}

/**
 * Individual contact information item
 */
function LinkedInIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-base-content/80"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function ContactItem({ label, value, link, icon }: ContactInfo) {
  const content = (
    <div
      className={cn(
        "flex items-center gap-4 p-3 rounded-xl",
        "bg-base-100/30 border border-white/5",
        "shadow-sm",
        "transition-shadow duration-300",
        link && "hover:shadow-card-hover cursor-pointer"
      )}
    >
      <div className="text-2xl flex-shrink-0">
        {icon === "linkedin" ? <LinkedInIcon /> : icon}
      </div>

      <div className="space-y-1">
        <p className="text-xs text-base-content/70 font-semibold uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm text-base-content/80 leading-relaxed">
          {value}
        </p>
      </div>
    </div>
  );

  if (link) {
    const is_external = link.startsWith("http");
    return (
      <a
        href={link}
        className="block"
        {...(is_external && { target: "_blank", rel: "noopener noreferrer" })}
      >
        {content}
      </a>
    );
  }

  return content;
}
