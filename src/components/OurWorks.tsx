import { useState, useCallback, useMemo } from "react";
import { cn } from "../lib/utils";
import { useScrollAnimation, useAutoRotate } from "../hooks";
import { SECTIONS } from "./our-works-data";
import { SectionNav, ContentPanel, MobileTabs } from "./our-works";

/**
 * Our Works section — two-panel layout
 *
 * Desktop: sticky sidebar navigation (left ~35%) + content panel (right ~65%)
 * Mobile: horizontal scroll tabs + stacked content below
 *
 * Auto-rotates through sections with a progress bar indicator.
 */
export function OurWorks() {
  const { ref, is_visible } = useScrollAnimation<HTMLElement>();
  const [active_id, set_active_id] = useState<string>(SECTIONS[0]?.id ?? "");

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
      if (index !== -1) handle_user_select(index);
    },
    [handle_user_select]
  );

  return (
    <section
      ref={ref}
      id="works"
      className="relative min-h-screen flex items-center py-16 md:py-24 lg:py-32 px-4"
    >
      <div className="w-full">
      <div className="relative z-10 max-w-6xl mx-auto w-full">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16">
          <span
            className={cn(
              "text-secondary font-medium tracking-wider uppercase text-xs md:text-sm block mb-2 md:mb-4",
              "fade-up",
              is_visible && "is-visible"
            )}
          >
            Portfolio
          </span>

          <h2
            className={cn(
              "text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 md:mb-6 drop-shadow-lg",
              "fade-up stagger-1",
              is_visible && "is-visible"
            )}
          >
            Our{" "}
            <span className="text-secondary">Works</span>
          </h2>

          <p
            className={cn(
              "text-base md:text-lg text-base-content/70 leading-relaxed max-w-2xl mx-auto",
              "fade-up stagger-2",
              is_visible && "is-visible"
            )}
          >
            Explore our portfolio of cutting-edge projects across blockchain,
            EDA, engineering, and database technologies.
          </p>
        </div>

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
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-10">
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
      </div>
      </div>
    </section>
  );
}
