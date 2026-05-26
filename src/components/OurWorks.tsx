import { useState, useCallback, useMemo } from "react";
import { cn } from "../lib/utils";
import { SectionHeader, SectionWrapper } from "./ui";
import { useScrollAnimation, useAutoRotate } from "../hooks";
import { SECTIONS } from "./our-works-data";
import { SectionNav, ContentPanel, MobileTabs } from "./our-works";

/**
 * Unified "What We Do" section — single integrated UI.
 *
 * One header, sticky sidebar (desktop) / horizontal tabs (mobile), content panel
 * with expertise badges woven into each section as metadata. No separate
 * expertise grid block — competencies are surfaced organically inside the
 * portfolio.
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
      id="what-we-do"
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
