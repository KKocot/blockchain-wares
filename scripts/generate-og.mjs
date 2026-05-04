/**
 * Generate OG image (1200x630) and Apple Touch Icon (180x180)
 * Uses sharp to render SVG to PNG.
 *
 * Usage: node scripts/generate-og.mjs
 */

import sharp from "sharp";
import { writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Theme colors from global.css
const COLORS = {
  base100: "#13141f", // oklch(12% 0.042 264.695) -> rgb(19,20,31)
  base200: "#232536", // oklch(20% 0.042 265.755) -> rgb(35,37,54)
  base300: "#303249", // oklch(27% 0.041 260.031)
  accent: "#4EB4FF", // oklch(71% 0.143 215.221) -> rgb(78,180,255)
  white: "#FFFFFF",
};

// Logo path data from blockchainwares.svg (3 hexagonal cubes)
const LOGO_PATHS = `
  <path d="M279.821,53.892 L280.041,161.35 L187.324,215.471 L95.222,161.992 L95,53.697 L187.324,0 L279.821,53.892 Z M124,55.4245884 L187.82302,94.1626305 L251.646039,55.4245884 L187.753367,18 L124,55.4245884 Z M194.410644,185.257007 L259.870283,149.353672 L258.233664,74.7122942 L193.876683,111.332677 L194.410644,185.257007 Z M110.548129,74.7122942 L108.91151,149.353672 L174.371148,185.257007 L174.835456,111.212035 L110.548129,74.7122942 Z"/>
  <path d="M184.821,218.892 L185.041,326.35 L92.324,380.471 L0.222,326.992 L0,218.697 L92.324,165 L184.821,218.892 Z M29,220.424588 L92.8230196,259.162631 L156.646039,220.424588 L92.7533667,183 L29,220.424588 Z M99.4106443,350.257007 L164.870283,314.353672 L163.233664,239.712294 L98.8766834,276.332677 L99.4106443,350.257007 Z M15.5481286,239.712294 L13.9115098,314.353672 L79.3711482,350.257007 L79.8354562,276.212035 L15.5481286,239.712294 Z"/>
  <path d="M374.821,218.892 L375.041,326.35 L282.324,380.471 L190.222,326.992 L190,218.697 L282.324,165 L374.821,218.892 Z M219,220.424588 L282.82302,259.162631 L346.646039,220.424588 L282.753367,183 L219,220.424588 Z M289.410644,350.257007 L354.870283,314.353672 L353.233664,239.712294 L288.876683,276.332677 L289.410644,350.257007 Z M205.548129,239.712294 L203.91151,314.353672 L269.371148,350.257007 L269.835456,276.212035 L205.548129,239.712294 Z"/>
`;

// --- OG Image 1200x630 ---

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.base100}"/>
      <stop offset="50%" style="stop-color:${COLORS.base200}"/>
      <stop offset="100%" style="stop-color:${COLORS.base300}"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Subtle grid pattern -->
  <defs>
    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="${COLORS.accent}" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#grid)" opacity="0.04"/>

  <!-- Logo (centered, scaled) -->
  <g transform="translate(412, 80) scale(1.0)" fill="${COLORS.white}" filter="url(#glow)">
    ${LOGO_PATHS}
  </g>

  <!-- Company Name -->
  <text x="600" y="520" text-anchor="middle" fill="${COLORS.white}" font-family="sans-serif" font-size="58" font-weight="700" letter-spacing="1">
    BlockchainWares
  </text>

  <!-- Tagline -->
  <text x="600" y="575" text-anchor="middle" fill="${COLORS.accent}" font-family="sans-serif" font-size="24" font-weight="500">
    Blockchain &amp; Enterprise Software Development
  </text>
</svg>`;

// --- Apple Touch Icon 180x180 ---

const appleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <defs>
    <linearGradient id="bg-icon" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${COLORS.base100}"/>
      <stop offset="100%" style="stop-color:${COLORS.base200}"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="180" height="180" rx="36" fill="url(#bg-icon)"/>

  <!-- Logo centered and scaled to fit 180x180 with padding -->
  <g transform="translate(27, 20) scale(0.335)" fill="${COLORS.accent}">
    ${LOGO_PATHS}
  </g>
</svg>`;

// Generate PNGs
async function main() {
  console.log("Generating OG image (1200x630)...");
  const ogBuffer = Buffer.from(ogSvg);
  await sharp(ogBuffer)
    .resize(1200, 630)
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(resolve(ROOT, "public/assets/img/og-image.png"));
  console.log("  -> public/assets/img/og-image.png");

  console.log("Generating Apple Touch Icon (180x180)...");
  const appleBuffer = Buffer.from(appleSvg);
  await sharp(appleBuffer)
    .resize(180, 180)
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(resolve(ROOT, "public/apple-touch-icon.png"));
  console.log("  -> public/apple-touch-icon.png");

  console.log("Done!");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
