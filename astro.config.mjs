// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://blockchainwares.com.pl",
  output: "server",
  adapter: vercel(),

  // Wbudowany checkOrigin porownuje Origin z `Astro.url`, a ten na Vercelu wychodzi
  // jako `https://localhost` (Astro ufa Host dopiero przez security.allowedDomains).
  // Ochrone CSRF trzyma is_same_site_request() — porownuje do originu z konfiguracji.
  security: { checkOrigin: false },
  integrations: [react(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});
