import { cn } from "../lib/utils";

/**
 * Team section component
 * Displays team photo with scroll-triggered animations
 * Features:
 * - Large centered team photo
 * - Subtle border with glow effect
 * - Hover zoom animation
 * - Rounded corners
 * - Scroll-triggered fade-in and scale animations (CSS-based)
 */
export function Team() {
  return (
    <section
      id="team"
      className="relative py-16 md:py-24 lg:py-32 px-4 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16">
          <span
            className="text-secondary font-medium tracking-wider uppercase text-xs md:text-sm block mb-2 md:mb-4"
          >
            Who We Are
          </span>

          <h2
            className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 md:mb-6 drop-shadow-lg"
          >
            Our{" "}
            <span className="text-secondary drop-shadow-[0_0_30px_rgba(56,189,248,0.3)]">
              Team
            </span>
          </h2>

          <p
            className="text-base md:text-lg text-base-content/70 leading-relaxed max-w-2xl mx-auto"
          >
            A dedicated team of engineers and developers passionate about
            building cutting-edge solutions in blockchain technology and
            high-performance software.
          </p>
        </div>

        <div
          className={cn(
            "group relative p-4 md:p-6 rounded-2xl",
            "bg-base-200/30 backdrop-blur-sm",
            "border border-white/5",
            "shadow-card",
            "transition-all duration-300",
            "hover:bg-base-200/50 hover:border-secondary/20",
            "hover:shadow-card-hover"
          )}
        >
          <div className="relative overflow-hidden rounded-xl">
            <div className="relative aspect-video md:aspect-[16/9] lg:aspect-[21/9] overflow-hidden bg-base-100/50">
              <picture>
                <source srcSet="/assets/img/team.webp" type="image/webp" />
                <img
                  src="/assets/img/team.jpeg"
                  alt="BlockchainWares Team"
                  width={1600}
                  height={757}
                  loading="lazy"
                  decoding="async"
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
              </picture>
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
        </div>
      </div>
    </section>
  );
}
