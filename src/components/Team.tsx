import { cn } from "../lib/utils";
import { CometEffect } from "./ui";
import { useScrollAnimation } from "../hooks";

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
  const { ref, is_visible } = useScrollAnimation<HTMLElement>();

  return (
    <section
      ref={ref}
      id="team"
      className="relative min-h-screen flex items-center py-16 md:py-24 lg:py-32 px-4"
    >
      <div className="w-full">
      <div className="max-w-6xl mx-auto w-full relative z-10">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16">
          <span
            className={cn(
              "text-secondary font-medium tracking-wider uppercase text-xs md:text-sm block mb-2 md:mb-4",
              "fade-up",
              is_visible && "is-visible"
            )}
          >
            Who We Are
          </span>

          <h2
            className={cn(
              "text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 md:mb-6 drop-shadow-lg",
              "fade-up stagger-1",
              is_visible && "is-visible"
            )}
          >
            Our{" "}
            <span className="text-secondary">
              Team
            </span>
          </h2>

          <p
            className={cn(
              "text-base md:text-lg text-base-content/80 leading-relaxed max-w-2xl mx-auto",
              "fade-up stagger-2",
              is_visible && "is-visible"
            )}
          >
            A dedicated team of engineers and developers passionate about
            building cutting-edge solutions in blockchain technology and
            high-performance software.
          </p>
        </div>

        <div
          className={cn(
            "relative p-4 md:p-6 rounded-2xl",
            "bg-base-200/30 backdrop-blur-sm",
            "border border-white/5",
            "shadow-card",
            "transition-shadow duration-300",
            "hover:shadow-card-hover",
            "scale-in stagger-3",
            is_visible && "is-visible"
          )}
        >
          <CometEffect />
          <div className="relative overflow-hidden rounded-xl z-10">
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
                  className="w-full h-full object-cover"
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
                  <p className="text-base-content/80 text-lg">
                    Team photo coming soon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
