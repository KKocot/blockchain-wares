import { cn } from "../lib/utils";
import { SectionHeader } from "./ui";
import { useScrollAnimation } from "../hooks";

interface ValueProp {
  title: string;
  description: string;
}

const VALUE_PROPS: ValueProp[] = [
  {
    title: "Built to Scale",
    description: "Architecture designed for growth, handling thousands of transactions per second.",
  },
  {
    title: "Battle-Tested",
    description: "Production-proven solutions powering enterprise systems worldwide.",
  },
  {
    title: "Deep Expertise",
    description: "25+ engineers including security specialists in blockchain, EDA, databases, and complex engineering challenges.",
  },
  {
    title: "Two Decades",
    description: "Founded in 2002, working with blockchain since 2013 — over two decades of engineering excellence.",
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
          </div>

          {/* Right column - Value propositions */}
          <div>
            {VALUE_PROPS.map((prop, index) => (
              <div
                key={prop.title}
                className={cn(
                  "flex items-start gap-4 md:gap-6 py-5 md:py-6",
                  index < VALUE_PROPS.length - 1 && "border-b border-white/5",
                  "fade-right",
                  `stagger-${index + 1}`,
                  section_visible && "is-visible"
                )}
              >
                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-0.5 md:mb-1">
                    {prop.title}
                  </h3>
                  <p className="text-xs md:text-sm text-base-content/60">
                    {prop.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
