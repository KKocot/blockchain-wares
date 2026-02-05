import { useEffect, useRef, useState } from "react";

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook for scroll-triggered animations using IntersectionObserver
 * Returns ref to attach to element and isVisible state
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {}
) {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [is_visible, set_is_visible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Fallback for browsers without IntersectionObserver (IE11, older browsers)
    if (!('IntersectionObserver' in window)) {
      set_is_visible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          set_is_visible(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          set_is_visible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    // Check if element is already in view on mount (fixes Astro client:visible issue)
    const rect = element.getBoundingClientRect();
    const is_in_viewport = rect.top < window.innerHeight && rect.bottom > 0;
    if (is_in_viewport) {
      set_is_visible(true);
      if (triggerOnce) {
        observer.disconnect();
      }
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, is_visible };
}

/**
 * Simplified hook that just returns className to add
 */
export function useAnimateOnScroll<T extends HTMLElement = HTMLDivElement>(
  animation_class: string = "fade-up",
  options: UseScrollAnimationOptions = {}
) {
  const { ref, is_visible } = useScrollAnimation<T>(options);
  const class_name = `${animation_class}${is_visible ? " is-visible" : ""}`;
  return { ref, class_name, is_visible };
}
