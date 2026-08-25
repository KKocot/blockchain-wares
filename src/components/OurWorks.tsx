import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { cn } from "../lib/utils";
import { SectionHeader, SectionWrapper } from "./ui";
import { useScrollAnimation, useAutoRotate } from "../hooks";
import {
  SECTIONS,
  is_section_slug,
  section_id_from_slug,
  section_slug_from_id,
  type SectionSlug,
} from "./our-works-data";
import { SectionNav, ContentPanel, MobileTabs } from "./our-works";

const SECTION_ANCHOR_ID = "what-we-do";
/** Navigation.tsx renders a fixed h-16 bar — keep the section heading below it. */
const NAV_OFFSET_PX = 64;
/** Above this the page was scrolled by the user, so a deep-link jump would fight them. */
const FRESH_LOAD_SCROLL_PX = 8;
const SPLASH_WAIT_TIMEOUT_MS = 4000;

/** Reads `?tab=docs`, falling back to a bare `?docs`; keys carrying a value are ignored. */
function read_tab_slug(search: string): string | null {
  const params = new URLSearchParams(search);
  const named = params.get("tab");
  if (named) return named;
  for (const [key, value] of params) {
    if (value === "") return key;
  }
  return null;
}

/** Keeps unrelated params, drops a stale bare alias, writes the canonical `?tab=`. */
function build_tab_url(slug: SectionSlug): string {
  const url = new URL(window.location.href);
  for (const key of [...url.searchParams.keys()]) {
    if (is_section_slug(key)) url.searchParams.delete(key);
  }
  url.searchParams.set("tab", slug);
  return `${url.pathname}${url.search}${url.hash}`;
}

function scroll_to_section(element: HTMLElement): void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top =
    element.getBoundingClientRect().top + window.scrollY - NAV_OFFSET_PX;
  window.scrollTo({
    top: Math.max(top, 0),
    behavior: reduced ? "instant" : "smooth",
  });
}

/**
 * The splash screen in index.astro locks `<html>` overflow for ~2.5s;
 * scrolling while it holds the lock is a no-op.
 */
function when_scroll_unlocked(run: () => void): () => void {
  const is_locked = () => document.documentElement.style.overflow === "hidden";
  if (!is_locked()) {
    run();
    return () => {};
  }

  const observer = new MutationObserver(() => {
    if (!is_locked()) finish();
  });
  const timeout_id = setTimeout(finish, SPLASH_WAIT_TIMEOUT_MS);

  function finish(): void {
    observer.disconnect();
    clearTimeout(timeout_id);
    run();
  }

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["style"],
  });

  return () => {
    observer.disconnect();
    clearTimeout(timeout_id);
  };
}

/**
 * The island is `client:visible`, so the effect below cannot run before the user
 * reaches the section. This module ships in the shared island chunk that the
 * `client:load` navigation pulls at page load, so the jump can happen up front
 * and hydration catches up once the section is on screen.
 */
function bootstrap_deep_link_scroll(): void {
  if (typeof window === "undefined") return;

  const slug = read_tab_slug(window.location.search);
  if (slug === null || section_id_from_slug(slug) === null) return;

  const element = document.getElementById(SECTION_ANCHOR_ID);
  if (!element || window.scrollY > FRESH_LOAD_SCROLL_PX) return;

  when_scroll_unlocked(() => scroll_to_section(element));
}

bootstrap_deep_link_scroll();

/**
 * Unified "What We Do" section — single integrated UI.
 *
 * One header, sticky sidebar (desktop) / horizontal tabs (mobile), content panel
 * with expertise badges woven into each section as metadata. No separate
 * expertise grid block — competencies are surfaced organically inside the
 * portfolio.
 *
 * Auto-rotates through sections with a progress bar indicator. A `?tab=` or bare
 * `?slug` query opens that section directly and cancels the rotation.
 */
export function OurWorks() {
  const { ref, is_visible } = useScrollAnimation<HTMLElement>();
  const [active_id, set_active_id] = useState<string>(SECTIONS[0]?.id ?? "");
  const deep_link_handled = useRef(false);

  const active_index = useMemo(
    () => SECTIONS.findIndex((s) => s.id === active_id),
    [active_id]
  );

  const handle_index_change = useCallback((index: number) => {
    const section = SECTIONS[index];
    if (section) set_active_id(section.id);
  }, []);

  const { is_auto_playing, progress_key, handle_user_select } = useAutoRotate({
    count: SECTIONS.length,
    active_index,
    on_change: handle_index_change,
  });

  const handle_select = useCallback(
    (id: string) => {
      const index = SECTIONS.findIndex((s) => s.id === id);
      if (index === -1) return;
      handle_user_select(index);

      const slug = section_slug_from_id(id);
      if (slug) {
        window.history.replaceState(
          window.history.state,
          "",
          build_tab_url(slug)
        );
      }
    },
    [handle_user_select]
  );

  // Query string is only available client-side — the page itself stays prerendered.
  useEffect(() => {
    if (deep_link_handled.current) return;
    deep_link_handled.current = true;

    const slug = read_tab_slug(window.location.search);
    if (slug === null) return;
    const target_id = section_id_from_slug(slug);
    if (target_id === null) return;
    const index = SECTIONS.findIndex((section) => section.id === target_id);
    if (index === -1) return;

    // Same path as a click: opens the tab and stops auto-rotation for good.
    handle_user_select(index);

    const element = ref.current;
    if (!element || window.scrollY > FRESH_LOAD_SCROLL_PX) return;
    return when_scroll_unlocked(() => scroll_to_section(element));
  }, [handle_user_select, ref]);

  return (
    <section
      ref={ref}
      id={SECTION_ANCHOR_ID}
      className={cn(
        "relative py-16 md:py-24 lg:py-32 px-4",
        is_visible && "is-visible"
      )}
    >
      <SectionWrapper maxWidth="max-w-7xl">
          <SectionHeader
            eyebrow="Our Expertise"
            title="What"
            accent="We Do"
            description="End-to-end engineering across blockchain, EDA, data, and frontend — shipped in production for partners worldwide."
            isVisible={is_visible}
            className="mb-12 md:mb-16"
          />

          {/* Mobile tabs — visible below md */}
          <div className="md:hidden mb-6">
            <MobileTabs
              sections={SECTIONS}
              active_id={active_id}
              on_select={handle_select}
              is_auto_playing={is_auto_playing}
              progress_key={progress_key}
            />
          </div>

          {/* Two-panel layout — desktop */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-10 max-w-6xl mx-auto">
            {/* Left sidebar — hidden on mobile, sticky on desktop */}
            <aside className="hidden md:block md:w-[35%] lg:w-[32%] shrink-0">
              <div className="sticky top-24">
                <SectionNav
                  sections={SECTIONS}
                  active_id={active_id}
                  on_select={handle_select}
                  is_auto_playing={is_auto_playing}
                  progress_key={progress_key}
                />
              </div>
            </aside>

            {/* Right content panel */}
            <div className="flex-1 min-w-0">
              <ContentPanel sections={SECTIONS} active_id={active_id} />
            </div>
          </div>
      </SectionWrapper>
    </section>
  );
}
