import { useState, useEffect, useRef } from "react";
import { cn } from "../lib/utils";

/** Anchor pointing at a section of the landing page — driven by scroll-spy */
interface SectionAnchor {
  label: string;
  /** Hash of the target section, e.g. "#about" */
  href: `#${string}`;
}

/** Link pointing at a standalone page — never part of scroll-spy */
interface PageLink {
  label: string;
  /** Absolute path, e.g. "/markets" */
  href: string;
}

const section_anchors: SectionAnchor[] = [
  { label: "About", href: "#about" },
  { label: "What We Do", href: "#what-we-do" },
  { label: "Team", href: "#team" },
  { label: "Career", href: "#career" },
  { label: "Contact", href: "#contact" },
];

const page_links: PageLink[] = [{ label: "Markets", href: "/markets" }];

/** Removes trailing slashes so "/markets/" and "/markets" compare equal */
function normalize_path(path: string): string {
  return path.replace(/\/+$/, "") || "/";
}

/**
 * Anchors point at sections of the landing page — from a subpage they need
 * the "/" prefix to jump back home first. Page links are absolute already
 * and never go through here.
 */
function resolve_href(hash: `#${string}`, is_home: boolean): string {
  return is_home ? hash : `/${hash}`;
}

interface NavigationProps {
  /** Current page path — pass Astro.url.pathname on subpages */
  currentPath?: string;
}

/**
 * Responsive navigation component with sticky behavior and mobile menu
 * Features:
 * - Desktop: logo, section anchors, separator, page links (Markets)
 * - Mobile: hamburger menu with animated drawer, same two-group split
 * - Backdrop blur on scroll
 * - Active section highlighting via scroll-spy (section anchors only)
 * - Page links are highlighted from currentPath and carry aria-current="page"
 * - CSS-based animations (no external animation library)
 */
export function Navigation({ currentPath = "/" }: NavigationProps) {
  const current_path = normalize_path(currentPath);
  const is_home = current_path === "/";
  const [is_open, set_is_open] = useState(false);
  const [is_scrolled, set_is_scrolled] = useState(false);
  const [active_section, set_active_section] = useState<string>("");
  const menu_button_ref = useRef<HTMLButtonElement>(null);
  const drawer_ref = useRef<HTMLDivElement>(null);
  const was_open_ref = useRef(false);

  // Combined scroll handler with throttle (performance optimization)
  useEffect(() => {
    let ticking = false;
    // Only section anchors map to sections of the landing page
    const section_ids = section_anchors.map((item) => item.href.slice(1));

    // Use named function stored in ref to ensure same reference in cleanup
    const handle_scroll_impl = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Update backdrop blur state
          set_is_scrolled(window.scrollY > 20);

          // Section spy only applies to the landing page
          if (!is_home) {
            ticking = false;
            return;
          }

          // Update active section - only if scrolled past hero
          const scroll_position = window.scrollY + 150;
          const hero_height = window.innerHeight * 0.7;

          if (scroll_position < hero_height) {
            set_active_section("");
            ticking = false;
            return;
          }

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
  }, [is_home]);

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

  // The closed drawer is `inert`, so the browser drops focus to <body> when it
  // closes — hand focus back to the trigger so keyboard users keep their place
  useEffect(() => {
    if (is_open) {
      was_open_ref.current = true;
      return;
    }
    if (!was_open_ref.current) return;
    was_open_ref.current = false;

    const active = document.activeElement;
    const lost_focus =
      active === null ||
      active === document.body ||
      drawer_ref.current?.contains(active) === true;
    if (lost_focus) menu_button_ref.current?.focus();
  }, [is_open]);

  // Prefix match, so a page's own subpages keep its link lit; "/" only ever matches itself
  const is_page_active = (href: string) => {
    const target = normalize_path(href);

    return current_path === target || current_path.startsWith(`${target}/`);
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out",
          is_scrolled
            ? "bg-base-100/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            : "bg-transparent",
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <a
              href={is_home ? "#" : "/"}
              className="flex items-center gap-2 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
            >
              <img
                src="/assets/img/blockchainwares.svg"
                alt="BlockchainWares logo"
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-base-content">
                BlockchainWares
              </span>
            </a>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center">
              {/* Group 1 — anchors to landing page sections */}
              <div className="flex items-center gap-0.5 lg:gap-4">
                {section_anchors.map((item) => (
                  <DesktopAnchorLink
                    key={item.href}
                    label={item.label}
                    href={resolve_href(item.href, is_home)}
                    is_active={is_home && active_section === item.href}
                  />
                ))}
              </div>

              {/* Divider between sections and standalone pages */}
              <span
                aria-hidden="true"
                className="mx-2 lg:mx-4 h-5 w-px bg-gradient-to-b from-transparent via-secondary/50 to-transparent"
              />

              {/* Group 2 — standalone pages */}
              <div className="flex items-center gap-2">
                {page_links.map((item) => (
                  <DesktopPageLink
                    key={item.href}
                    label={item.label}
                    href={item.href}
                    is_active={is_page_active(item.href)}
                  />
                ))}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              ref={menu_button_ref}
              onClick={() => set_is_open(!is_open)}
              className="md:hidden p-2 text-base-content hover:text-secondary transition-all duration-150 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary rounded-lg"
              aria-label={is_open ? "Close menu" : "Open menu"}
              aria-expanded={is_open}
            >
              <HamburgerIcon is_open={is_open} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Backdrop — sibling of nav, not child */}
      <div
        aria-hidden="true"
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300",
          is_open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => set_is_open(false)}
      />

      {/* Mobile Menu Drawer — sibling of nav, not child.
          `inert` when closed keeps the off-screen links out of the tab order and
          out of the accessibility tree; it does not block the slide-out
          transition, which runs on the `translate` property. */}
      <div
        ref={drawer_ref}
        inert={!is_open}
        className={cn(
          "fixed top-0 right-0 bottom-0 w-full sm:w-80 bg-base-100 border-l border-base-300 z-[70] overflow-y-auto",
          "transform transition-transform duration-300 ease-out",
          is_open ? "translate-x-0" : "translate-x-full",
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
              <HamburgerIcon is_open={true} />
            </button>
          </div>

          {/* Group 1 — anchors to landing page sections */}
          <div className="space-y-4">
            {section_anchors.map((item) => (
              <MobileAnchorLink
                key={item.href}
                label={item.label}
                href={resolve_href(item.href, is_home)}
                is_active={is_home && active_section === item.href}
                on_click={handle_nav_click}
              />
            ))}
          </div>

          {/* Divider between sections and standalone pages */}
          <div
            aria-hidden="true"
            className="my-5 h-px bg-gradient-to-r from-secondary/50 via-secondary/15 to-transparent"
          />

          {/* Group 2 — standalone pages */}
          <div className="space-y-3">
            {page_links.map((item) => (
              <MobilePageLink
                key={item.href}
                label={item.label}
                href={item.href}
                is_active={is_page_active(item.href)}
                on_click={handle_nav_click}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

interface NavLinkProps {
  label: string;
  /** Already resolved href — ready to be used as-is */
  href: string;
  is_active: boolean;
}

interface MobileNavLinkProps extends NavLinkProps {
  on_click: () => void;
}

/** Small rotated square used as the accent marker of page links */
function AccentDiamond({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("block size-1.5 rounded-[1px] bg-current", className)}
    />
  );
}

/** Desktop pill link pointing at a section of the landing page */
function DesktopAnchorLink({ label, href, is_active }: NavLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "relative text-sm font-semibold px-3 lg:px-4 py-2 rounded-full transition-all duration-300",
        is_active ? "text-white" : "text-neutral-300 hover:text-white",
      )}
    >
      {/* Glow blob behind active link */}
      <span
        className={cn(
          "absolute inset-0 rounded-full bg-secondary/20 blur-md transition-all duration-500",
          is_active ? "opacity-100 scale-110" : "opacity-0 scale-75",
        )}
      />
      {/* Subtle background pill */}
      <span
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-300",
          is_active ? "bg-secondary/30" : "bg-transparent hover:bg-white/5",
        )}
      />
      {/* Text */}
      <span className="relative z-10">{label}</span>
    </a>
  );
}

/** Desktop outlined link pointing at a standalone page */
function DesktopPageLink({ label, href, is_active }: NavLinkProps) {
  return (
    <a
      href={href}
      aria-current={is_active ? "page" : undefined}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full border px-3 lg:px-4 py-1.5",
        "text-sm font-semibold transition-colors duration-200",
        is_active
          ? "border-secondary/70 bg-secondary/15 text-secondary"
          : "border-secondary/30 text-secondary/85 hover:border-secondary/60 hover:bg-secondary/10 hover:text-secondary",
      )}
    >
      <AccentDiamond
        className={cn(
          "rotate-45 transition-transform duration-200",
          is_active ? "scale-125" : "group-hover:rotate-[135deg]",
        )}
      />
      {label}
    </a>
  );
}

/** Mobile drawer link pointing at a section of the landing page */
function MobileAnchorLink({
  label,
  href,
  is_active,
  on_click,
}: MobileNavLinkProps) {
  return (
    <a
      href={href}
      onClick={on_click}
      className={cn(
        "block text-lg font-medium transition-colors py-2 border-l-2 pl-3",
        is_active
          ? "text-secondary border-secondary"
          : "text-base-content hover:text-secondary border-transparent",
      )}
    >
      {label}
    </a>
  );
}

/** Mobile drawer link pointing at a standalone page */
function MobilePageLink({
  label,
  href,
  is_active,
  on_click,
}: MobileNavLinkProps) {
  return (
    <a
      href={href}
      onClick={on_click}
      aria-current={is_active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-2xl border px-3 py-2.5",
        "text-lg font-semibold transition-colors duration-200",
        is_active
          ? "border-secondary/70 bg-secondary/15 text-secondary"
          : "border-secondary/30 text-secondary/85 hover:border-secondary/60 hover:bg-secondary/10 hover:text-secondary",
      )}
    >
      <AccentDiamond className="rotate-45" />
      {label}
    </a>
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
