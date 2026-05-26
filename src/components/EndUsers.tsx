import { cn } from "../lib/utils";
import { SectionHeader, SectionWrapper } from "./ui";
import { useScrollAnimation } from "../hooks";
import { companies } from "./end-users-data";

export function EndUsers() {
  const { ref, is_visible } = useScrollAnimation<HTMLElement>();

  return (
    <section
      ref={ref}
      id="end-users"
      className="relative min-h-screen flex items-center py-16 md:py-24 lg:py-32 px-4"
    >
      <SectionWrapper>
          <SectionHeader
            eyebrow="Our Clients"
            title="Trusted By"
            accent="Industry Leaders"
            description="Our EDA tools and software solutions have been deployed by Fortune 500 companies, government agencies, and technology pioneers worldwide"
            isVisible={is_visible}
            className="mb-12 md:mb-16"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
            {companies.map((company, index) => {
              const card = (
                <div
                  className={cn(
                    "flex flex-col items-center justify-center gap-2",
                    "h-24 md:h-28",
                    "bg-base-200/50 backdrop-blur-sm",
                    "border border-white/10 rounded-xl",
                    "transition-all duration-300",
                    "hover:border-secondary/20 hover:bg-base-200/50",
                    "scale-in",
                    `stagger-${3 + Math.min(index, 3)}`,
                    is_visible && "is-visible"
                  )}
                >
                  {company.logoFile ? (
                    <>
                      <img
                        src={`/assets/logos/${company.logoFile}`}
                        alt={company.name}
                        className="h-6 md:h-8 w-auto opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                      />
                      <span className="text-xs md:text-sm text-base-content/90 group-hover:text-secondary/80 transition-colors duration-300">
                        {company.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm md:text-base font-semibold text-base-content/80 group-hover:text-secondary transition-colors duration-300">
                      {company.name}
                    </span>
                  )}
                </div>
              );

              return company.url ? (
                <a
                  key={company.name}
                  href={company.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  {card}
                </a>
              ) : (
                <div key={company.name} className="group">
                  {card}
                </div>
              );
            })}
          </div>

          <div
            className={cn(
              "text-center mt-12",
              "fade-up stagger-4",
              is_visible && "is-visible"
            )}
          >
            <p className="text-sm text-base-content/80 italic">
              Clients from our EDA tools era and blockchain ecosystem
            </p>
          </div>
      </SectionWrapper>
    </section>
  );
}
