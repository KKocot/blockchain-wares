import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "../lib/utils";
import type { Transition } from "framer-motion";

/**
 * Team section component
 * Displays team photo with scroll-triggered animations
 * Features:
 * - Large centered team photo
 * - Subtle border with glow effect
 * - Hover zoom animation
 * - Rounded corners
 * - Scroll-triggered fade-in and scale animations
 */
export function Team() {
  const section_ref = useRef<HTMLDivElement>(null);
  const is_in_view = useInView(section_ref, { once: true, amount: 0.3 });

  const transition: Transition = {
    duration: 0.6,
    ease: [0.6, -0.05, 0.01, 0.99] as [number, number, number, number],
  };

  const fade_in_scale = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition,
    },
  };

  return (
    <section
      id="team"
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
            Who We Are
          </motion.span>

          <motion.h2
            className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 md:mb-6 drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={is_in_view ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ ...transition, delay: 0.1 }}
          >
            Our{" "}
            <span className="text-secondary drop-shadow-[0_0_30px_rgba(56,189,248,0.3)]">
              Team
            </span>
          </motion.h2>

          <motion.p
            className="text-base md:text-lg text-base-content/70 leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={is_in_view ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ ...transition, delay: 0.2 }}
          >
            A dedicated team of engineers and developers passionate about
            building cutting-edge solutions in blockchain technology and
            high-performance software.
          </motion.p>
        </div>

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
          initial="hidden"
          animate={is_in_view ? "visible" : "hidden"}
          variants={fade_in_scale}
        >
          <div className="relative overflow-hidden rounded-xl">
            <div className="relative aspect-video md:aspect-[16/9] lg:aspect-[21/9] overflow-hidden bg-base-100/50">
              <img
                src="/assets/img/team.jpeg"
                alt="BlockchainWares Team"
                className={cn(
                  "w-full h-full object-cover",
                  "transition-transform duration-700 ease-out",
                  "group-hover:scale-105"
                )}
                onError={(e) => {
                  const target = e.target;
                  if (target instanceof HTMLImageElement) {
                    target.style.display = "none";
                    const placeholder = target.nextElementSibling;
                    if (placeholder instanceof HTMLElement) {
                      placeholder.style.display = "flex";
                    }
                  }
                }}
              />
              <div
                className={cn(
                  "hidden absolute inset-0",
                  "items-center justify-center",
                  "bg-base-100/50"
                )}
              >
                <div className="text-center px-4">
                  <p className="text-base-content/70 text-lg">
                    Team photo coming soon
                  </p>
                </div>
              </div>
            </div>
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
      </div>
    </section>
  );
}
