import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "../lib/utils";
import type { Transition } from "framer-motion";

interface ContactInfo {
  label: string;
  value: string;
  link?: string;
  icon: string;
}

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
];

/**
 * Contact section component
 * Features:
 * - Two-column layout (contact info + map)
 * - Responsive design
 * - Scroll-triggered animations
 * - Google Maps embed placeholder
 */
export function Contact() {
  const section_ref = useRef<HTMLDivElement>(null);
  const is_in_view = useInView(section_ref, { once: true, amount: 0.2 });

  const transition: Transition = {
    duration: 0.6,
    ease: [0.6, -0.05, 0.01, 0.99] as [number, number, number, number],
  };

  const container_variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const item_variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition,
    },
  };

  return (
    <section
      id="contact"
      ref={section_ref}
      className="relative py-16 md:py-24 lg:py-32 px-4 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.span
            className="text-secondary font-medium tracking-wider uppercase text-xs md:text-sm block mb-2 md:mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={is_in_view ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
            transition={transition}
          >
            Contact Us
          </motion.span>

          <motion.h2
            className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 md:mb-6 drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={is_in_view ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ ...transition, delay: 0.1 }}
          >
            Get In{" "}
            <span className="text-secondary drop-shadow-[0_0_30px_rgba(56,189,248,0.3)]">
              Touch
            </span>
          </motion.h2>

          <motion.p
            className="text-base md:text-lg text-base-content/70 leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={is_in_view ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ ...transition, delay: 0.2 }}
          >
            Have a project in mind? We'd love to hear from you.
          </motion.p>
        </div>

        {/* Content Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={container_variants}
          initial="hidden"
          animate={is_in_view ? "visible" : "hidden"}
        >
          <motion.div
            className={cn(
              "group relative p-4 md:p-6 rounded-2xl",
              "bg-base-200/30 backdrop-blur-sm",
              "border border-white/5",
              "shadow-lg shadow-black/20",
              "transition-all duration-300",
              "hover:bg-base-200/50 hover:border-secondary/20",
              "hover:shadow-xl hover:shadow-secondary/10"
            )}
            variants={item_variants}
          >
            <h3 className={cn(
              "text-xl md:text-2xl font-bold mb-3",
              "transition-colors duration-300",
              "group-hover:text-secondary"
            )}>
              Contact Information
            </h3>
            <p className="text-sm md:text-base text-base-content/60 leading-relaxed mb-6">
              Ready to start your next project? Reach out to us and let's
              discuss how we can help you achieve your goals.
            </p>
            <div className="space-y-4">
              {CONTACT_DATA.map((item) => (
                <ContactItem key={item.label} {...item} />
              ))}
            </div>

            {/* Accent line */}
            <div
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 rounded-full",
                "bg-secondary transition-all duration-300",
                "group-hover:h-1/3"
              )}
            />
          </motion.div>

          <motion.div
            className={cn(
              "group relative p-4 md:p-6 rounded-2xl",
              "bg-base-200/30 backdrop-blur-sm",
              "border border-white/5",
              "shadow-lg shadow-black/20",
              "transition-all duration-300",
              "hover:bg-base-200/50 hover:border-secondary/20",
              "hover:shadow-xl hover:shadow-secondary/10"
            )}
            variants={item_variants}
          >
            <div className="h-[350px] rounded-xl overflow-hidden bg-base-100/50">
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

            {/* Accent line */}
            <div
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 rounded-full",
                "bg-secondary transition-all duration-300",
                "group-hover:h-1/3"
              )}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Individual contact information item
 */
function ContactItem({ label, value, link, icon }: ContactInfo) {
  const content = (
    <div
      className={cn(
        "group/item flex items-start gap-4 p-3 rounded-xl",
        "bg-base-100/30 border border-white/5",
        "transition-all duration-300",
        link && "hover:bg-base-100/50 hover:border-secondary/20 cursor-pointer"
      )}
    >
      <div
        className={cn(
          "text-2xl flex-shrink-0",
          "transition-transform duration-300",
          link && "group-hover/item:scale-110"
        )}
      >
        {icon}
      </div>

      <div className="space-y-1">
        <p className="text-xs text-base-content/50 font-semibold uppercase tracking-wider">
          {label}
        </p>
        <p
          className={cn(
            "text-sm text-base-content/80 leading-relaxed",
            link && "group-hover/item:text-secondary transition-colors"
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );

  if (link) {
    return (
      <a href={link} className="block">
        {content}
      </a>
    );
  }

  return content;
}
