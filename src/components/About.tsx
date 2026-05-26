import { cn } from "../lib/utils";
import { SectionHeader } from "./ui";
import { useScrollAnimation } from "../hooks";

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
      aria-hidden="true"
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
      aria-hidden="true"
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
      aria-hidden="true"
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

function ClockIcon() {
  return (
    <svg
      className="w-7 h-7 md:w-8 md:h-8"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Clock face */}
      <circle cx="16" cy="16" r="11" />
      {/* Hour hand pointing up */}
      <line x1="16" y1="16" x2="16" y2="9" />
      {/* Minute hand pointing right */}
      <line x1="16" y1="16" x2="21" y2="16" />
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
  {
    title: "Two Decades",
    description: "Founded in 2002, working with blockchain since 2013 — over two decades of engineering excellence.",
    icon: <ClockIcon />,
  },
];

export function About() {
  const { ref: section_ref, is_visible: section_visible } = useScrollAnimation<HTMLElement>();

  return (
    <section
      ref={section_ref}
      id="about"
      className="relative min-h-screen flex items-center py-12 md:py-24 lg:py-32 px-4"
    >
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center">
          {/* Left column - Text content */}
          <div>
            <SectionHeader
              eyebrow="About Us"
              title="Software Development"
              accent="Done Right"
              description="Founded in 2002, we are a software development company based in Dabrowa Gornicza, Poland. Since 2013 we have been deeply involved in blockchain, while continuing to build complete products, complex frameworks, and reusable libraries that power businesses worldwide."
              isVisible={section_visible}
              align="left"
              className="mb-4 md:mb-6"
              descriptionClassName="text-base-content/70"
            />

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
      </div>
    </section>
  );
}
