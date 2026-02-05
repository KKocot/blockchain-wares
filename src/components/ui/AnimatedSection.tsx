import { useScrollAnimation } from "../../hooks";
import { cn } from "../../lib/utils";

type AnimationType = "fade-up" | "fade-down" | "fade-left" | "fade-right" | "scale-in";

interface AnimatedSectionProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  className?: string;
}

/**
 * Wrapper component for scroll-triggered animations
 * Lightweight - uses CSS transitions with IntersectionObserver
 */
export function AnimatedSection({
  children,
  animation = "fade-up",
  delay = 0,
  className,
}: AnimatedSectionProps) {
  const { ref, is_visible } = useScrollAnimation<HTMLDivElement>();

  const delay_class = delay > 0 ? `stagger-${Math.min(delay, 6)}` : "";

  return (
    <div
      ref={ref}
      className={cn(
        animation,
        delay_class,
        is_visible && "is-visible",
        className
      )}
    >
      {children}
    </div>
  );
}

interface AnimatedChildrenProps {
  children: React.ReactNode;
  animation?: AnimationType;
  staggerDelay?: number;
  className?: string;
}

/**
 * Animates each direct child with staggered delay
 */
export function AnimatedChildren({
  children,
  animation = "fade-up",
  staggerDelay = 1,
  className,
}: AnimatedChildrenProps) {
  const { ref, is_visible } = useScrollAnimation<HTMLDivElement>();

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div
              key={index}
              className={cn(
                animation,
                `stagger-${Math.min((index + 1) * staggerDelay, 6)}`,
                is_visible && "is-visible"
              )}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
}
