import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { useScrollAnimation } from "../hooks";

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const STATS: Stat[] = [
  { value: 10, suffix: "+", label: "Years of Experience" },
  { value: 30, suffix: "+", label: "Projects Delivered" },
  { value: 25, suffix: "+", label: "Engineers" },
];

interface ValueProp {
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Minimal inline SVG icons
function ScaleIcon() {
  return (
    <svg
      className="w-7 h-7 md:w-8 md:h-8"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Three arrows expanding outward from center */}
      <path d="M16 22 L16 10" />
      <path d="M12 14 L16 10 L20 14" />
      <path d="M10 22 L10 16" />
      <path d="M7 19 L10 16 L13 19" />
      <path d="M22 22 L22 16" />
      <path d="M19 19 L22 16 L25 19" />
      {/* Baseline */}
      <path d="M6 26 L26 26" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      className="w-7 h-7 md:w-8 md:h-8"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Shield outline */}
      <path d="M16 3 L27 8 L27 16 C27 22.5 22 27 16 29 C10 27 5 22.5 5 16 L5 8 Z" />
      {/* Checkmark */}
      <path d="M11 16 L14.5 19.5 L21 13" />
    </svg>
  );
}

function ExpertiseIcon() {
  return (
    <svg
      className="w-7 h-7 md:w-8 md:h-8"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Lightbulb outline */}
      <path d="M12 28 L20 28" />
      <path d="M13 25 L19 25" />
      <path d="M13 25 C13 22 10 20 10 15 C10 11 12.5 7 16 5 C19.5 7 22 11 22 15 C22 20 19 22 19 25" />
      {/* Filament rays */}
      <path d="M14 15 L16 13 L18 15" />
    </svg>
  );
}

const VALUE_PROPS: ValueProp[] = [
  {
    title: "Built to Scale",
    description: "Architecture designed for growth, handling thousands of transactions per second.",
    icon: <ScaleIcon />,
  },
  {
    title: "Battle-Tested",
    description: "Production-proven solutions powering enterprise systems worldwide.",
    icon: <ShieldIcon />,
  },
  {
    title: "Deep Expertise",
    description: "25+ engineers including security specialists in blockchain, EDA, databases, and complex engineering challenges.",
    icon: <ExpertiseIcon />,
  },
];

function useAnimatedCounter(value: number, is_in_view: boolean) {
  const [display_value, set_display_value] = useState(0);

  useEffect(() => {
    if (!is_in_view) return;

    const duration = 2000; // 2s
    const start_time = performance.now();
    let animation_frame: number;

    const animate_count = (current_time: number) => {
      const elapsed = current_time - start_time;
      const progress = Math.min(elapsed / duration, 1);

      // easeOut cubic (matching Framer Motion's easeOut)
      const eased = 1 - Math.pow(1 - progress, 3);
      set_display_value(Math.round(value * eased));

      if (progress < 1) {
        animation_frame = requestAnimationFrame(animate_count);
      }
    };

    animation_frame = requestAnimationFrame(animate_count);

    return () => {
      if (animation_frame) {
        cancelAnimationFrame(animation_frame);
      }
    };
  }, [is_in_view, value]);

  return display_value;
}

function StatCard({ stat, index, is_in_view }: { stat: Stat; index: number; is_in_view: boolean }) {
  const display_value = useAnimatedCounter(stat.value, is_in_view);

  return (
    <div className={cn(
      "relative",
      "scale-in",
      `stagger-${index + 1}`,
      is_in_view && "is-visible"
    )}>
      <div className={cn(
        "relative z-10 p-4 md:p-6 rounded-xl md:rounded-2xl",
        "bg-base-200/30 backdrop-blur-sm",
        "border border-white/5",
        "shadow-lg shadow-black/20",
        "transition-shadow duration-300",
        "hover:shadow-card-hover"
      )}>
        <div className="text-2xl md:text-4xl lg:text-5xl font-bold text-secondary mb-1 md:mb-2">
          {display_value}{stat.suffix}
        </div>
        <div className="text-[10px] md:text-sm text-base-content/60 uppercase tracking-wider">
          {stat.label}
        </div>
      </div>
    </div>
  );
}

export function About() {
  const { ref: section_ref, is_visible: section_visible } = useScrollAnimation<HTMLElement>();
  const { ref: stats_ref, is_visible: stats_visible } = useScrollAnimation<HTMLDivElement>();

  return (
    <section
      ref={section_ref}
      id="about"
      className="relative min-h-screen flex items-center py-12 md:py-24 lg:py-32 px-4"
    >
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center mb-10 md:mb-20">
          {/* Left column - Text content */}
          <div>
            <span
              className={cn(
                "text-secondary font-medium tracking-wider uppercase text-xs md:text-sm block mb-2 md:mb-4",
                "fade-up",
                section_visible && "is-visible"
              )}
            >
              About Us
            </span>

            <h2
              className={cn(
                "text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 md:mb-6 drop-shadow-lg",
                "fade-up stagger-1",
                section_visible && "is-visible"
              )}
            >
              Software Development{" "}
              <span className="text-secondary">Done Right</span>
            </h2>

            <p
              className={cn(
                "text-base md:text-lg text-base-content/70 leading-relaxed mb-4 md:mb-6",
                "fade-up stagger-2",
                section_visible && "is-visible"
              )}
            >
              We are a software development company based in Dabrowa Gornicza, Poland.
              We specialize in building complete products, complex frameworks, and
              reusable libraries that power businesses worldwide.
            </p>

            <p
              className={cn(
                "text-sm md:text-base text-base-content/60 leading-relaxed mb-6 md:mb-8",
                "fade-up stagger-3",
                section_visible && "is-visible"
              )}
            >
              From blockchain solutions to database optimization, we tackle the most
              demanding engineering challenges with precision and expertise.
            </p>

          </div>

          {/* Right column - Value propositions */}
          <div className="space-y-3 md:space-y-4">
            {VALUE_PROPS.map((prop, index) => (
              <div
                key={prop.title}
                className={cn(
                  "relative p-4 md:p-6 rounded-xl md:rounded-2xl",
                  "bg-base-200/30 backdrop-blur-sm",
                  "border border-white/5",
                  "shadow-lg shadow-black/20",
                  "transition-shadow duration-300",
                  "hover:shadow-card-hover",
                  "fade-right",
                  `stagger-${index + 1}`,
                  section_visible && "is-visible"
                )}
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <div className={cn(
                    "flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl",
                    "bg-secondary/10 text-secondary",
                    "flex items-center justify-center",
                    "shadow-md"
                  )}>
                    {prop.icon}
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-semibold mb-0.5 md:mb-1">
                      {prop.title}
                    </h3>
                    <p className="text-xs md:text-sm text-base-content/60">
                      {prop.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats section */}
        <div ref={stats_ref} className="relative">
          {/* Divider line - hidden on mobile */}
          <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />

          <div className="pt-8 md:pt-16">
            <div className="grid grid-cols-3 gap-3 md:gap-6">
              {STATS.map((stat, index) => (
                <StatCard
                  key={stat.label}
                  stat={stat}
                  index={index}
                  is_in_view={stats_visible}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
