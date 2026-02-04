import { cn } from "../lib/utils";

/**
 * EndUsers section component
 * Features:
 * - Industry leaders who used EDA tools
 * - Infinite scroll carousel (CSS animation - more performant)
 * - Pause on hover
 * - Gradient fade edges
 * - Responsive layout
 */
export function EndUsers() {

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
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Trusted By{" "}
            <span className="text-secondary">Industry Leaders</span>
          </h2>
          <p className="text-base md:text-lg text-base-content/70 max-w-2xl mx-auto">
            Our EDA tools and software solutions have been deployed by Fortune
            500 companies, government agencies, and technology pioneers worldwide
          </p>
        </div>

        {/* Infinite scroll carousel */}
        <div className="relative">
          {/* Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-r from-base-100 to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-l from-base-100 to-transparent z-10" />

          {/* Carousel container */}
          <div className="overflow-hidden">
            <style>
              {`
                @keyframes marquee-scroll {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }

                .marquee-container {
                  animation: marquee-scroll 30s linear infinite;
                  width: fit-content;
                }

                .marquee-container:hover {
                  animation-play-state: paused;
                }

                @media (prefers-reduced-motion: reduce) {
                  .marquee-container {
                    animation: none;
                  }
                }
              `}
            </style>
            <div className="marquee-container flex gap-8 md:gap-12">
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
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center mt-12">
          <p className="text-sm text-base-content/70 italic">
            Legacy clients from our EDA tools era (1990s-2000s)
          </p>
        </div>
      </div>
    </section>
  );
}
