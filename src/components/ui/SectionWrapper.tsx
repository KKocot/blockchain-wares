import { cn } from "../../lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

export function SectionWrapper({
  children,
  className,
  maxWidth = "max-w-6xl",
}: SectionWrapperProps) {
  return (
    <div className={cn(maxWidth, "mx-auto w-full relative z-10", className)}>
      {children}
    </div>
  );
}
