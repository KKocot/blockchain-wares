import { cn } from "../lib/utils";
import { Button, CometEffect } from "./ui";
import { useScrollAnimation } from "../hooks";

interface JobPosition {
  title: string;
  description: string;
}

const JOB_POSITIONS: JobPosition[] = [
  {
    title: "Front-end Developer",
    description:
      "Experienced in TypeScript, React/Next.js or Vue/Nuxt, and modern frontend tooling. Build scalable web applications with cutting-edge technologies.",
  },
  {
    title: "Back-end Developer",
    description:
      "C++ or Python expertise with interest in blockchain infrastructure and high-performance systems. Work on core engine development.",
  },
  {
    title: "System Administrator",
    description:
      "Docker, CI/CD pipelines, Linux infrastructure, and DevOps automation. Maintain and optimize our deployment infrastructure.",
  },
  {
    title: "UI Designer",
    description:
      "Modern web design, component-based design systems, and user experience. Create intuitive interfaces for our applications.",
  },
  {
    title: "Any Good Engineer",
    description:
      "Having an open mind and good motivation, who would like to join us. We value talent and drive regardless of your specific specialization.",
  },
];

/**
 * Career section component
 * Displays job openings
 */
export function Career() {
  const { ref, is_visible } = useScrollAnimation<HTMLElement>();

  return (
    <section
      ref={ref}
      id="career"
      className="relative py-16 md:py-24 lg:py-32 px-4"
    >
      <div className="max-w-6xl mx-auto w-full relative z-10">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16">
          <span className={cn(
            "text-secondary font-medium tracking-wider uppercase text-xs md:text-sm block mb-2 md:mb-4",
            "fade-up",
            is_visible && "is-visible"
          )}>
            We're Hiring
          </span>

          <h2 className={cn(
            "text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 md:mb-6 drop-shadow-lg",
            "fade-up stagger-1",
            is_visible && "is-visible"
          )}>
            Join Our{" "}
            <span className="text-secondary">
              Team
            </span>
          </h2>

          <p className={cn(
            "text-base md:text-lg text-base-content/70 leading-relaxed max-w-2xl mx-auto",
            "fade-up stagger-2",
            is_visible && "is-visible"
          )}>
            We're constantly looking for ambitious developers willing to take on
            tough cases in productive environment. At the moment we have opened
            positions for:
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {JOB_POSITIONS.map((position, index) => (
            <JobPositionCard
              key={position.title}
              {...position}
              index={index}
              is_visible={is_visible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface JobPositionCardProps extends JobPosition {
  index: number;
  is_visible: boolean;
}

/**
 * Individual job position card with hover effects
 */
function JobPositionCard({
  title,
  description,
  index,
  is_visible,
}: JobPositionCardProps) {
  const handle_apply = () => {
    const contact_section = document.getElementById("contact");
    if (contact_section) {
      contact_section.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = "mailto:contact@blockchainwares.pl";
    }
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col p-6 md:p-8 rounded-2xl w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]",
        "bg-base-200/30 backdrop-blur-sm",
        "border border-white/5",
        "shadow-card",
        "transition-all duration-300",
        "hover:bg-base-200/50 hover:border-secondary/20",
        "hover:shadow-card-hover",
        "hover:-translate-y-1",
        "fade-up",
        `stagger-${index + 3}`,
        is_visible && "is-visible"
      )}
    >
      <CometEffect />
      <div className="relative z-20 flex-1">
        <h3 className={cn(
          "text-xl md:text-2xl font-bold mb-3",
          "transition-colors duration-300",
          "group-hover:text-secondary"
        )}>
          {title}
        </h3>

        <p className="text-sm md:text-base text-base-content/60 leading-relaxed mb-6">
          {description}
        </p>
      </div>

      <div className="relative z-20 mt-auto">
        <Button
          variant="outline"
          size="md"
          className="w-full"
          onClick={handle_apply}
        >
          Apply Now
        </Button>
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
  );
}
