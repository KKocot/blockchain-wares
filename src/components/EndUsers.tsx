import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * EndUsers section component
 * Features:
 * - Industry leaders who used EDA tools
 * - Infinite scroll carousel (marquee effect)
 * - Pause on hover
 * - Gradient fade edges
 * - Responsive layout
 */
export function EndUsers() {
  const [is_mounted, set_is_mounted] = useState(false);

  useEffect(() => {
    set_is_mounted(true);
  }, []);

  const end_users = [
    "AT&T",
    "Atmel",
    "Fujitsu",
    "Hewlett-Packard",
    "IBM Corporation",
    "Intel Corporation",
    "Lexmark International Inc.",
    "Motorola",
    "NASA",
    "Phoenix Technologies",
    "Texas Instruments",
    "US Government",
  ];

  const duplicated_users = [...end_users, ...end_users];

  const fade_in_up = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <section
      id="end-users"
      className="relative py-24 px-4 overflow-hidden bg-base-100"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 bg-secondary blur-3xl"
          style={{ transform: "translate(-50%, -50%)" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
            {...fade_in_up}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Trusted By{" "}
            <span className="text-secondary">Industry Leaders</span>
          </motion.h2>
          <motion.p
            className="text-base md:text-lg text-base-content/70 max-w-2xl mx-auto"
            {...fade_in_up}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Our EDA tools and software solutions have been deployed by Fortune
            500 companies, government agencies, and technology pioneers worldwide
          </motion.p>
        </motion.div>

        {/* Infinite scroll carousel */}
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-r from-base-100 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-l from-base-100 to-transparent z-10" />

          {/* Carousel container */}
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-8 md:gap-12"
              animate={
                is_mounted
                  ? {
                      x: [0, -50 + "%"],
                    }
                  : {}
              }
              transition={{
                x: {
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
              whileHover={{
                animationPlayState: "paused",
              }}
              style={{
                width: "fit-content",
              }}
            >
              {/* Using index as key is acceptable here for carousel duplication */}
              {duplicated_users.map((company, index) => (
                <div
                  key={`${company}-${index}`}
                  className="flex-shrink-0 px-6 py-8 min-w-[200px] md:min-w-[280px]"
                >
                  <div className="text-center group cursor-default">
                    <p className="text-xl md:text-2xl lg:text-3xl font-bold text-base-content opacity-60 group-hover:opacity-100 group-hover:text-secondary transition-all duration-300 whitespace-nowrap">
                      {company}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Footer note */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p className="text-sm text-base-content/70 italic">
            Legacy clients from our EDA tools era (1990s-2000s)
          </p>
        </motion.div>
      </div>
    </section>
  );
}
