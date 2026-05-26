import { cn } from "../lib/utils";
import { Button, SectionHeader, SectionWrapper } from "./ui";
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
      className="relative min-h-screen flex items-center py-16 md:py-24 lg:py-32 px-4"
    >
      <SectionWrapper>
        <SectionHeader
          eyebrow="We're Hiring"
          title="Join Our"
          accent="Team"
          description="We're constantly looking for ambitious developers willing to take on tough cases in productive environment. At the moment we have opened positions for:"
          isVisible={is_visible}
          className="mb-12 md:mb-16"
        />

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
      </SectionWrapper>
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
        "relative flex flex-col p-6 md:p-8 rounded-[32px] md:rounded-[40px] w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]",
        "bg-base-200/30 backdrop-blur-sm",
        "border border-white/5",
        "shadow-card",
        "transition-shadow duration-300",
        "hover:shadow-card-hover",
        "fade-up",
        `stagger-${index + 3}`,
        is_visible && "is-visible"
      )}
    >
      <div className="relative z-20 flex-1">
        <h3 className="text-xl md:text-2xl font-bold mb-3">
          {title}
        </h3>

        <p className="text-sm md:text-base text-base-content/80 leading-relaxed mb-6">
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
    </div>
  );
}
