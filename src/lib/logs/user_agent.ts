/** Cztery rodziny ruchu nie-ludzkiego, ktore panel filtruje osobno. */
export type BotCategory = "crawler" | "seo" | "script" | "headless";

export interface UserAgentInfo {
  browser: string;
  os: string;
  is_bot: boolean;
  bot_category: BotCategory | null;
}

const UNKNOWN = "Unknown";

type Rule = readonly [RegExp, string];
type BotRule = readonly [RegExp, string, BotCategory];

const BOT_RULES: readonly BotRule[] = [
  [/googlebot/i, "Googlebot", "crawler"],
  [/bingbot/i, "Bingbot", "crawler"],
  [/yandex/i, "YandexBot", "crawler"],
  [/duckduckbot/i, "DuckDuckBot", "crawler"],
  [/baiduspider/i, "Baiduspider", "crawler"],
  [/ahrefs/i, "AhrefsBot", "seo"],
  [/semrush/i, "SemrushBot", "seo"],
  [/facebookexternalhit/i, "facebookexternalhit", "seo"],
  [/python-requests/i, "python-requests", "script"],
  [/(?:^|\s)curl\//i, "curl", "script"],
  [/(?:^|\s)wget\//i, "Wget", "script"],
  [/headless/i, "Headless", "headless"],
];

const BROWSER_RULES: readonly Rule[] = [
  [/\bedg(?:e|a|ios)?\//i, "Edge"],
  [/\b(?:opr|opios)\/|\bopera\b/i, "Opera"],
  [/\bsamsungbrowser\//i, "Samsung Internet"],
  [/\b(?:firefox|fxios)\//i, "Firefox"],
  [/\b(?:chrome|chromium|crios)\//i, "Chrome"],
  [/\bsafari\//i, "Safari"],
];

const OS_RULES: readonly Rule[] = [
  [/windows/i, "Windows"],
  [/android/i, "Android"],
  [/iphone|ipad|ipod|\bios\b/i, "iOS"],
  [/mac os x|macintosh/i, "macOS"],
  [/linux|x11|\bcros\b/i, "Linux"],
];

function match_first(rules: readonly Rule[], ua: string): string | null {
  for (const [pattern, label] of rules) {
    if (pattern.test(ua)) {
      return label;
    }
  }
  return null;
}

function match_bot(ua: string): BotRule | null {
  for (const rule of BOT_RULES) {
    if (rule[0].test(ua)) {
      return rule;
    }
  }
  return null;
}

/** Pusty i bialy naglowek znaczy tyle samo co jego brak — filtry panelu czytaja stad. */
export function is_missing_user_agent(ua: string | null): boolean {
  return ua === null || ua.trim() === "";
}

export function parse_user_agent(header: string | null): UserAgentInfo {
  const ua = header ?? "";
  if (is_missing_user_agent(ua)) {
    return { browser: UNKNOWN, os: UNKNOWN, is_bot: false, bot_category: null };
  }

  const os = match_first(OS_RULES, ua) ?? UNKNOWN;
  const bot = match_bot(ua);
  if (bot !== null) {
    return { browser: bot[1], os, is_bot: true, bot_category: bot[2] };
  }

  const browser = match_first(BROWSER_RULES, ua) ?? UNKNOWN;
  return { browser, os, is_bot: false, bot_category: null };
}
