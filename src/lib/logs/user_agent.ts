export interface UserAgentInfo {
  browser: string;
  os: string;
  is_bot: boolean;
}

const UNKNOWN = "Unknown";

type Rule = readonly [RegExp, string];

const BOT_RULES: readonly Rule[] = [
  [/googlebot/i, "Googlebot"],
  [/bingbot/i, "Bingbot"],
  [/yandex/i, "YandexBot"],
  [/duckduckbot/i, "DuckDuckBot"],
  [/baiduspider/i, "Baiduspider"],
  [/ahrefs/i, "AhrefsBot"],
  [/semrush/i, "SemrushBot"],
  [/facebookexternalhit/i, "facebookexternalhit"],
  [/python-requests/i, "python-requests"],
  [/(?:^|\s)curl\//i, "curl"],
  [/(?:^|\s)wget\//i, "Wget"],
  [/headless/i, "Headless"],
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

export function parse_user_agent(ua: string | null): UserAgentInfo {
  if (ua === null || ua.trim() === "") {
    return { browser: UNKNOWN, os: UNKNOWN, is_bot: false };
  }

  const os = match_first(OS_RULES, ua) ?? UNKNOWN;
  const bot = match_first(BOT_RULES, ua);
  if (bot !== null) {
    return { browser: bot, os, is_bot: true };
  }

  const browser = match_first(BROWSER_RULES, ua) ?? UNKNOWN;
  return { browser, os, is_bot: false };
}
