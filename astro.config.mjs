// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

// Panel admina jest noindex (AdminLayout.astro) — sitemap nie moze go reklamowac.
const SITEMAP_EXCLUDED = /^\/(admin(\/|$)|404\/?$)/;

// Data deployu, liczona raz przy ladowaniu configu. mtime plikow zrodlowych odpada:
// na Vercelu `git clone` ustawia je na czas checkoutu, wiec i tak rowna sie buildowi.
const BUILD_DATE = new Date().toISOString();

// https://astro.build/config
export default defineConfig({
  site: "https://blockchainwares.com.pl",
  output: "server",
  adapter: vercel(),

  // Wbudowany checkOrigin porownuje Origin z `Astro.url`, a ten na Vercelu wychodzi
  // jako `https://localhost` (Astro ufa Host dopiero przez security.allowedDomains).
  // Ochrone CSRF trzyma is_same_site_request() — porownuje do originu z konfiguracji.
  security: { checkOrigin: false },
  integrations: [
    react(),
    sitemap({
      filter: (page) => !SITEMAP_EXCLUDED.test(new URL(page).pathname),
      // serialize dostaje juz odfiltrowany zbior — nie powtarza SITEMAP_EXCLUDED.
      serialize: (item) => ({ ...item, lastmod: BUILD_DATE }),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
