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
      className="py-20 px-4 md:py-32 bg-base-100"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={is_in_view ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={transition}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h2>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Have a project in mind? We'd love to hear from you.
          </p>
        </motion.div>

        {/* Content Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          variants={container_variants}
          initial="hidden"
          animate={is_in_view ? "visible" : "hidden"}
        >
          <motion.div className="space-y-6" variants={item_variants}>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              <p className="text-base-content/70 leading-relaxed mb-8">
                Ready to start your next project? Reach out to us and let's
                discuss how we can help you achieve your goals.
              </p>
              <div className="space-y-6">
                {CONTACT_DATA.map((item) => (
                  <ContactItem key={item.label} {...item} />
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div variants={item_variants}>
            <div
              className={cn(
                "h-[400px] rounded-2xl overflow-hidden",
                "bg-base-300 border border-base-300"
              )}
            >
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
        "group flex items-start gap-4 p-4 rounded-xl",
        "transition-all duration-300",
        link && "hover:bg-base-300 cursor-pointer hover:scale-[1.02]"
      )}
    >
      <div
        className={cn(
          "text-3xl flex-shrink-0",
          "transition-transform duration-300",
          link && "group-hover:scale-110"
        )}
      >
        {icon}
      </div>

      <div className="space-y-1">
        <p className="text-sm text-base-content/70 font-semibold uppercase tracking-wider">
          {label}
        </p>
        <p
          className={cn(
            "text-base-content leading-relaxed",
            link && "group-hover:text-secondary transition-colors"
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
