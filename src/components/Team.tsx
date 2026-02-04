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

  const fade_in_up = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { ...transition, delay: 0.2 },
    },
  };

  return (
    <section
      id="team"
      ref={section_ref}
      className="py-20 px-4 md:py-32 bg-base-100"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          animate={is_in_view ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition,
            },
          }}
        >
          <h2 className="text-4xl md:text-5xl font-bold">Our Team</h2>
        </motion.div>

        <motion.div
          className="relative"
          initial="hidden"
          animate={is_in_view ? "visible" : "hidden"}
          variants={fade_in_scale}
        >
          <div
            className={cn(
              "group relative overflow-hidden rounded-3xl",
              "border-2 border-base-300",
              "transition-all duration-500",
              "hover:border-secondary/60",
              "hover:shadow-2xl hover:shadow-secondary/30"
            )}
          >
            <div className="relative aspect-video md:aspect-[16/9] lg:aspect-[21/9] overflow-hidden bg-base-300">
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
                  "bg-gradient-to-br from-base-300 to-base-200"
                )}
              >
                <div className="text-center px-4">
                  <div className="text-6xl mb-4 opacity-30">👥</div>
                  <p className="text-base-content/70 text-lg">
                    Team photo coming soon
                  </p>
                </div>
              </div>
            </div>

            <div
              className={cn(
                "absolute inset-0 rounded-3xl opacity-0",
                "bg-gradient-to-br from-secondary/5 via-transparent to-secondary/5",
                "transition-opacity duration-500",
                "group-hover:opacity-100",
                "pointer-events-none"
              )}
            />
          </div>
        </motion.div>

        <motion.div
          className="text-center mt-8"
          initial="hidden"
          animate={is_in_view ? "visible" : "hidden"}
          variants={fade_in_up}
        >
          <p className="text-base-content/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            A dedicated team of engineers and developers passionate about
            building cutting-edge solutions in blockchain technology and
            high-performance software.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
