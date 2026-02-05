import { useState, useEffect } from "react";
import { cn } from "../lib/utils";

interface NavItem {
  label: string;
  href: string;
}

const nav_items: NavItem[] = [
  { label: "About", href: "#about" },
  { label: "Expertise", href: "#expertise" },
  { label: "Works", href: "#works" },
  { label: "Team", href: "#team" },
  { label: "Career", href: "#career" },
  { label: "Contact", href: "#contact" },
];

/**
 * Responsive navigation component with sticky behavior and mobile menu
 * Features:
 * - Desktop: horizontal menu with logo, links, LinkedIn icon, and CTA
 * - Mobile: hamburger menu with animated drawer
 * - Backdrop blur on scroll
 * - Active section highlighting via Intersection Observer
 * - CSS-based animations (no external animation library)
 */
export function Navigation() {
  const [is_open, set_is_open] = useState(false);
  const [is_scrolled, set_is_scrolled] = useState(false);
  const [active_section, set_active_section] = useState<string>("");

  // Combined scroll handler with throttle (performance optimization)
  useEffect(() => {
    let ticking = false;
    const section_ids = nav_items.map((item) => item.href.replace("#", ""));

    // Use named function stored in ref to ensure same reference in cleanup
    const handle_scroll_impl = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Update backdrop blur state
          set_is_scrolled(window.scrollY > 20);

          // Update active section
          const scroll_position = window.scrollY + 100;
          for (let i = section_ids.length - 1; i >= 0; i--) {
            const element = document.getElementById(section_ids[i]);
            if (element && element.offsetTop <= scroll_position) {
              set_active_section(`#${section_ids[i]}`);
              ticking = false;
              return;
            }
          }
          set_active_section("");
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial call
    handle_scroll_impl();

    // Use passive listener for better scroll performance
    window.addEventListener("scroll", handle_scroll_impl, { passive: true });
    return () => window.removeEventListener("scroll", handle_scroll_impl);
  }, []);

  // Close menu on navigation
  const handle_nav_click = () => {
    set_is_open(false);
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (is_open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Cleanup function to restore scroll on unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [is_open]);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out",
        is_scrolled
          ? "bg-base-100/80 backdrop-blur-md border-b border-base-300 shadow-md"
          : "bg-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-2 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
          >
            <img
              src="/assets/img/blockchainwares.svg"
              alt=""
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-base-content">
              BlockchainWares
            </span>
          </a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {nav_items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-sm font-medium py-1 transition-colors duration-200",
                  "after:absolute after:left-0 after:bottom-0 after:h-0.5 after:bg-secondary after:transition-all after:duration-300",
                  active_section === item.href
                    ? "text-secondary after:w-full"
                    : "text-base-content hover:text-secondary after:w-0 hover:after:w-full"
                )}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => set_is_open(!is_open)}
            className="md:hidden p-2 text-base-content hover:text-secondary transition-all duration-150 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded-lg"
            aria-label={is_open ? "Close menu" : "Open menu"}
            aria-expanded={is_open}
          >
            <HamburgerIcon is_open={is_open} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <>
        {/* Backdrop */}
        <div
          className={cn(
            "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300",
            is_open ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => set_is_open(false)}
        />

        {/* Drawer */}
        <div
          className={cn(
            "fixed top-0 right-0 bottom-0 w-full sm:w-80 bg-base-100 border-l border-base-300 z-50 overflow-y-auto",
            "transform transition-transform duration-300 ease-out",
            is_open ? "translate-x-0" : "translate-x-full"
          )}
        >
              <div className="p-6">
                {/* Close Button */}
                <div className="flex justify-end mb-8">
                  <button
                    onClick={() => set_is_open(false)}
                    className="p-2 text-base-content hover:text-secondary transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
                    aria-label="Close menu"
                  >
                    <CloseIcon />
                  </button>
                </div>

                {/* Mobile Nav Items */}
                <div className="space-y-4">
                  {nav_items.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={handle_nav_click}
                      className={cn(
                        "block text-lg font-medium transition-colors py-2 border-l-2",
                        active_section === item.href
                          ? "text-secondary border-secondary pl-3"
                          : "text-base-content hover:text-secondary border-transparent pl-3"
                      )}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </>
    </nav>
  );
}

/**
 * Simple hamburger menu icon (no animation)
 */
function HamburgerIcon({ is_open }: { is_open: boolean }) {
  if (is_open) {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    );
  }

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

/**
 * Close icon for mobile menu
 */
function CloseIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
