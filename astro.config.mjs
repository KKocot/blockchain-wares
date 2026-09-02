// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

// Panel admina jest noindex (AdminLayout.astro) — sitemap nie moze go reklamowac.
const SITEMAP_EXCLUDED = /^\/(admin(\/|$)|404\/?$)/;

// https://astro.build/config
export default defineConfig({
  site: "https://blockchainwares.com.pl",
  output: "server",

  // Pobranie calego logu ma na siebie 60 s (FETCH_TIMEOUT_MS w src/lib/logs/source.ts),
  // a Vercel ubija funkcje po `maxDuration` — bez tego zapasu na parsowanie i render
  // timeout fetcha nigdy by nie zadzialal. 90 s miesci sie w limicie kazdego planu.
  adapter: vercel({ maxDuration: 90 }),

  // Wbudowany checkOrigin porownuje Origin z `Astro.url`, a ten na Vercelu wychodzi
  // jako `https://localhost` (Astro ufa Host dopiero przez security.allowedDomains).
  // Ochrone CSRF trzyma is_same_site_request() — porownuje do originu z konfiguracji.
  security: { checkOrigin: false },
  integrations: [
    react(),
    sitemap({
      filter: (page) => !SITEMAP_EXCLUDED.test(new URL(page).pathname),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
