import { cn } from "../../lib/utils";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  isVisible: boolean;
  align?: "center" | "left";
  className?: string;
  descriptionClassName?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  accent,
  description,
  isVisible,
  align = "center",
  className,
  descriptionClassName,
}: SectionHeaderProps) {
  const is_centered = align === "center";

  return (
    <div className={cn(is_centered && "text-center", className)}>
      <span
        className={cn(
          "text-secondary font-medium tracking-wider uppercase text-xs md:text-sm block mb-2 md:mb-4",
          "fade-up",
          isVisible && "is-visible"
        )}
      >
        {eyebrow}
      </span>

      <h2
        className={cn(
          "text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 md:mb-6 drop-shadow-lg",
          "fade-up stagger-1",
          isVisible && "is-visible"
        )}
      >
        {title} <span className="text-secondary">{accent}</span>
      </h2>

      <p
        className={cn(
          "text-base md:text-lg text-base-content/80 leading-relaxed",
          is_centered && "max-w-2xl mx-auto",
          "fade-up stagger-2",
          isVisible && "is-visible",
          descriptionClassName
        )}
      >
        {description}
      </p>
    </div>
  );
}
