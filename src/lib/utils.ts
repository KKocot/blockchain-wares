import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge to resolve conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Anything `JSON.stringify` round-trips losslessly. Excludes `undefined` on purpose:
 *  `JSON.stringify(undefined)` returns `undefined`, not a string, and would throw below. */
export type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | readonly JsonLdValue[]
  | { readonly [key: string]: JsonLdValue };

/**
 * Serializes a Schema.org graph for `<script type="application/ld+json">`.
 *
 * Escapes `<`, `>` and `&` as `\uXXXX`. This is XSS defense, not formatting: an
 * unescaped `</script>` in any string field (page title, event description, and
 * other attacker- or CMS-influenced data) closes the script element early and the
 * rest of the payload is parsed as HTML. Do not "simplify" this away — the escapes
 * stay valid JSON, so consumers still read the original characters after parsing.
 */
export function to_json_ld(data: JsonLdValue): string {
  return JSON.stringify(data).replace(
    /[<>&]/g,
    (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
}
