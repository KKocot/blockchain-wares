import type { ReactNode } from "react";
import { SECTIONS } from "./our-works/sections";

export { SECTIONS };

/** Short URL aliases for tab deep-links: `/?docs` and `/?tab=docs` both open Documentation. */
export const SECTION_SLUGS = [
  "core",
  "hive",
  "sdk",
  "ufa",
  "eos",
  "docs",
  "eda",
  "data",
] as const;

export type SectionSlug = (typeof SECTION_SLUGS)[number];

const SLUG_SET: ReadonlySet<string> = new Set(SECTION_SLUGS);

export function is_section_slug(value: string): value is SectionSlug {
  return SLUG_SET.has(value);
}

export interface Deployment {
  label?: string; // np. "Blog", "Wallet" — opcjonalnie (przy single deployment zwykle pomijane)
  url: string;
}

export interface Project {
  title: string;
  description: string;
  deployments?: Deployment[]; // 1+ live deployments
}

export interface ProjectSection {
  id: string;
  /** Deep-link alias, unique across SECTIONS — enforced by build_id_by_slug(). */
  slug: SectionSlug;
  title: string;
  subtitle: string;
  description: string;
  /**
   * Expertise areas applied in this section.
   * Maps to `id` keys from `EXPERTISE_BY_ID` (see `expertise-data.ts`).
   * Rendered as chip/pill badges at the top of each section.
   */
  expertise_ids: string[];
  /**
   * Optional custom hero icon. When provided, overrides the default icon
   * derived from the first entry in `expertise_ids`.
   */
  custom_icon?: ReactNode;
  projects: Project[];
}

/**
 * Prerendering `/` evaluates this module, so a duplicated alias fails the build
 * instead of silently letting the first section win.
 */
function build_id_by_slug(): ReadonlyMap<SectionSlug, string> {
  const by_slug = new Map<SectionSlug, string>();
  for (const section of SECTIONS) {
    const taken = by_slug.get(section.slug);
    if (taken !== undefined) {
      throw new Error(
        `Duplicate section slug "${section.slug}": "${taken}" and "${section.id}"`,
      );
    }
    by_slug.set(section.slug, section.id);
  }
  return by_slug;
}

const ID_BY_SLUG = build_id_by_slug();

export function section_id_from_slug(value: string): string | null {
  if (!is_section_slug(value)) return null;
  return ID_BY_SLUG.get(value) ?? null;
}

export function section_slug_from_id(id: string): SectionSlug | null {
  return SECTIONS.find((section) => section.id === id)?.slug ?? null;
}
