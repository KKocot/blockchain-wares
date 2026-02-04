import { motion, AnimatePresence } from "framer-motion";
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
 * - Framer Motion animations
 */
export function Navigation() {
  const [is_open, set_is_open] = useState(false);
  const [is_scrolled, set_is_scrolled] = useState(false);
  const [active_section, set_active_section] = useState<string>("");

  // Handle scroll effect for backdrop blur
  useEffect(() => {
    const handle_scroll = () => {
      set_is_scrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handle_scroll);
    return () => window.removeEventListener("scroll", handle_scroll);
  }, []);

  // Track active section based on scroll position
  useEffect(() => {
    const handle_scroll = () => {
      const section_ids = nav_items.map((item) => item.href.replace("#", ""));
      const scroll_position = window.scrollY + 100;

      for (let i = section_ids.length - 1; i >= 0; i--) {
        const element = document.getElementById(section_ids[i]);
        if (element && element.offsetTop <= scroll_position) {
          set_active_section(`#${section_ids[i]}`);
          return;
        }
      }
      set_active_section("");
    };

    handle_scroll();
    window.addEventListener("scroll", handle_scroll);
    return () => window.removeEventListener("scroll", handle_scroll);
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
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
        is_scrolled
          ? "bg-base-100/80 backdrop-blur-md border-b border-base-300"
          : "bg-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.a
            href="#"
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <img
              src="/assets/img/blockchainwares.svg"
              alt=""
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-base-content">
              BlockchainWares
            </span>
          </motion.a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {nav_items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-all duration-200 py-1 border-b-2",
                  active_section === item.href
                    ? "text-secondary border-secondary"
                    : "text-base-content hover:text-secondary border-transparent"
                )}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => set_is_open(!is_open)}
            className="md:hidden p-2 text-base-content hover:text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded-lg"
            aria-label={is_open ? "Close menu" : "Open menu"}
            aria-expanded={is_open}
          >
            <HamburgerIcon is_open={is_open} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {is_open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => set_is_open(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-80 bg-base-100 border-l border-base-300 z-50 overflow-y-auto"
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
                <motion.div
                  className="space-y-4"
                  variants={{
                    open: {
                      transition: { staggerChildren: 0.07, delayChildren: 0.1 },
                    },
                  }}
                  initial="closed"
                  animate="open"
                >
                  {nav_items.map((item, index) => (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      onClick={handle_nav_click}
                      className={cn(
                        "block text-lg font-medium transition-colors py-2 border-l-2",
                        active_section === item.href
                          ? "text-secondary border-secondary pl-3"
                          : "text-base-content hover:text-secondary border-transparent pl-3"
                      )}
                      variants={{
                        open: { opacity: 1, x: 0 },
                        closed: { opacity: 0, x: 20 },
                      }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      {item.label}
                    </motion.a>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/**
 * Animated hamburger menu icon
 */
function HamburgerIcon({ is_open }: { is_open: boolean }) {
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
      <motion.line
        x1="3"
        y1="6"
        x2="21"
        y2="6"
        animate={is_open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.2 }}
        style={{ originX: "50%", originY: "50%" }}
      />
      <motion.line
        x1="3"
        y1="12"
        x2="21"
        y2="12"
        animate={is_open ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
      <motion.line
        x1="3"
        y1="18"
        x2="21"
        y2="18"
        animate={is_open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.2 }}
        style={{ originX: "50%", originY: "50%" }}
      />
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
