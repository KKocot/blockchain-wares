# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Opis projektu

Strona internetowa dla firmy BlockchainWares - software development company z Dąbrowy Górniczej, specjalizującej się w blockchain, EDA, engineering i bazach danych.

## Komendy

```bash
npm run dev                        # Dev server na localhost:4321
npm run build                      # Build produkcyjny do .vercel/output/ (adapter @astrojs/vercel)
npm run preview                    # Podgląd builda
npm test                           # Playwright E2E, 33 testy (w tym admin.spec.ts)
node scripts/hash_password.mjs     # Generuje ADMIN_PASSWORD_HASH z hasła podanego interaktywnie
npx tsc --noEmit                   # Type check
```

## Tech Stack

- **Astro 5** w trybie **SSR** (`output: "server"`, `@astrojs/vercel@9` adapter) + **React 19** (client:load dla interaktywnych sekcji)
- **Tailwind CSS 4** z **DaisyUI 5** (custom theme "blockchainwares")
- **Framer Motion 12** (animacje sekcji)
- **TypeScript** (strict mode via astro/tsconfigs/strict)

## Deploy

Vercel, autodeploy z gita. Build wychodzi do `.vercel/output/` (adapter `@astrojs/vercel`), nie `dist/server/entry.mjs`.

`Dockerfile` i `compose.yml` zostają w repo jako alternatywa dla VPS, ale są NIESPÓJNE z obecnym adapterem — `CMD`/`HEALTHCHECK` wskazują na `dist/server/entry.mjs`, który przy `@astrojs/vercel` w ogóle nie powstaje (Dockerfile ma na to komentarz ostrzegawczy). Powrót na VPS wymaga najpierw cofnięcia adaptera na `@astrojs/node`.

## Architektura

Full-stack SSR (Astro + React Islands). Strony marketingowe (`index.astro`, `markets.astro`) mają `prerender = true` — middleware **nie wykonuje się** dla stron prerenderowanych, dlatego ich nagłówki bezpieczeństwa (CSP, X-Frame-Options, HSTS, ...) są ustawione w `vercel.json`, nie w middleware.

- `src/layouts/Layout.astro` - bazowy layout landingu z SEO, Open Graph, fontami (Quicksand)
- `src/layouts/AdminLayout.astro` - osobny layout panelu admina (noindex, font systemowy, `rounded-md`)
- `src/pages/index.astro`, `src/pages/markets.astro` - strony publiczne (prerenderowane), importują sekcje z `src/components/`
- `src/components/` - sekcje strony jako React komponenty z Framer Motion
- `src/components/ui/` - reużywalne komponenty UI (Button, etc.)
- `src/components/our-works-data.ts` - dane sekcji "What We Do" + deep-linki do tabów: `?docs`, `?sdk`, `?core`, `?hive`, `?ufa`, `?eos`, `?eda`, `?data` (i `?tab=<alias>`). Duplikat aliasu **wywala build** celowo (`build_id_by_slug()`). Deep-link zatrzymuje auto-rotate i scrolluje do `#what-we-do-content` (treść kategorii pod navbarem), nie do nagłówka sekcji
- `src/components/admin/` - dashboard panelu (kafelki, wykres, top-N, tabela z sortowaniem/filtrowaniem/paginacją i deep-linkami przez query string), renderowany serwerowo
- `src/lib/utils.ts` - helper `cn()` do mergowania klas Tailwind
- `src/middleware.ts` - na requestach do stron dynamicznych: guard sesji dla `/admin/*` i `/api/admin/*`, nagłówki bezpieczeństwa. Nie loguje już ruchu
- `src/lib/logs/` - dane ruchu pochodzą ze **zdalnego pliku logu nginx** (`LOG_SOURCE_URL`), pobieranego serwerowo, cache'owanego w pamięci (`source.ts`, TTL `LOG_SOURCE_TTL_SECONDS`) i parsowanego (`nginx_parser.ts`, format `combined` + dwa dodatkowe cytowane pola: X-Forwarded-For i Accept-Language). `LogSourceRepository` jest **READ-ONLY** (bez `insert`) — własne logowanie w middleware, mocki i implementacja in-memory zostały usunięte
  - **Pułapka**: pole `ip` bierze się z `$remote_addr`, NIE z X-Forwarded-For — ten nagłówek jest sterowalny przez klienta
  - Ruch z loopbacku (health-checki, ~40% wpisów) jest domyślnie odfiltrowany; przełącznik `includeInternal` go pokazuje
- `src/lib/auth/` - jeden admin, hasło jako hash scrypt w zmiennej środowiskowej, sesja jako podpisane HMAC ciasteczko `bw_session` (TTL 7 dni)
- `src/pages/api/auth/*` - logowanie/wylogowanie, obsługiwane przez natywne formularze POST
- `src/pages/admin/*` - strony panelu (`/admin`, `/admin/login`)

**Panel admina jest czysto serwerowy — to wymóg właściciela, nie detal implementacyjny.** Zero requestów z przeglądarki: dane pobiera frontmatter `src/pages/admin/index.astro`, filtry to `<form method="get">`, sortowanie i paginacja to linki, logowanie/wylogowanie to natywne formularze POST. Endpointy `/api/admin/logs`, `/api/admin/stats` i hook `use_admin_logs` zostały usunięte. Panel działa przy wyłączonym JavaScripcie — nie dodawać `fetch`/`XHR` przy kolejnych zmianach.

Sekcje strony głównej (w kolejności): Navigation, Hero, OurWorks (What We Do + Portfolio), Services, EndUsers, Team, Career, Contact, Footer

## Zmienne środowiskowe

Wymagane w runtime (nie na etapie builda) — bez nich `get_auth_config()`/`get_log_source_url()` rzuca i aplikacja nie startuje:

- `ADMIN_PASSWORD_HASH` - hash hasła admina, generowany przez `node scripts/hash_password.mjs`
- `AUTH_SECRET` - sekret do podpisu ciasteczka sesji, min. 32 znaki
- `LOG_SOURCE_URL` - URL zdalnego logu nginx. Ścieżka zawiera token — to sekret, nigdy w kodzie/repo

Opcjonalne:

- `LOG_SOURCE_TTL_SECONDS` - jak długo pobrany log żyje w cache procesu, w sekundach (domyślnie 300)
- `SESSION_NOT_BEFORE` - kill-switch unieważniający wszystkie sesje bez rotacji `AUTH_SECRET`
- `SITE_ORIGIN` - kanoniczny origin dla guardu CSRF; brak = `site` z `astro.config.mjs`

Nigdy nie wpisywać realnych wartości tych zmiennych do repo/dokumentacji.

## Testy

`npm test` (Playwright, 33 testy) korzysta z lokalnego fixture logu (`tests/fixtures/`) — nie uderza w prawdziwy `LOG_SOURCE_URL`. Projekt `chromium-no-js` weryfikuje, że panel admina działa bez JavaScriptu; osobny test pilnuje, że z panelu nie wychodzi żaden request XHR/fetch.

## DaisyUI Theme

Custom theme "blockchainwares" zdefiniowany w `src/styles/global.css` - dark mode z oklch colors. Używaj klas DaisyUI (`bg-base-100`, `text-base-content`, `btn-primary`, etc.).

## Konwencje

- Komponenty React: `PascalCase.tsx`
- Utils: `snake_case.ts`
- TypeScript strict, zero `any`
- Max 500 linii na plik
- Export komponentów przez barrel files (`index.ts`)
