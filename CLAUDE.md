# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Opis projektu

Strona internetowa dla firmy BlockchainWares - software development company z Dąbrowy Górniczej, specjalizującej się w blockchain, EDA, engineering i bazach danych.

## Komendy

```bash
npm run dev                        # Dev server na localhost:4321
npm run build                      # Build produkcyjny do .vercel/output/ (adapter @astrojs/vercel)
npm run preview                    # Podgląd builda
npm test                           # Playwright E2E, 95 testów (chromium 91 + chromium-no-js 4)
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

Full-stack SSR (Astro + React Islands). Strony marketingowe `index.astro` i `markets.astro` mają `prerender = true` — middleware **nie wykonuje się** dla stron prerenderowanych, dlatego ich nagłówki bezpieczeństwa (CSP, X-Frame-Options, HSTS, ...) są ustawione w `vercel.json`, nie w middleware. Wyjątek: `src/pages/markets/[id].astro` (podstrona pojedynczego wydarzenia) jest **jedyną SSR-ową stroną marketingową** (`prerender = false`, brak `getStaticPaths`) — status `ongoing/upcoming/past` zamroziłby się na dniu builda, a bez JS nie ma jak go odświeżyć. Dla niej middleware SIĘ wykonuje, więc jej nagłówki bezpieczeństwa przychodzą jednocześnie z middleware i z reguły `vercel.json` (reguła 1 to negative lookahead na wszystko poza `/api` i `/admin`) — wartości są identyczne, więc nowy wpis w `vercel.json` nie był potrzebny.

- `src/layouts/Layout.astro` - bazowy layout landingu z SEO, Open Graph, fontami (Quicksand). Opcjonalny prop `canonicalPath` (podaje go trasa SSR `markets/[id].astro` jako `get_event_path(event)`, bo `trailingSlash: "ignore"` dawał dwa indeksowalne URL-e na jedno wydarzenie); wszystkie 4 bloki JSON-LD idą przez `to_json_ld` (spójne escapowanie)
- `src/layouts/AdminLayout.astro` - osobny layout panelu admina (noindex, font systemowy, `rounded-md`)
- `src/pages/index.astro`, `src/pages/markets.astro` - strony publiczne (prerenderowane), importują sekcje z `src/components/`
- `src/pages/markets/[id].astro` - podstrona pojedynczego wydarzenia (SSR, patrz wyjątek prerenderu wyżej). Nieznany `id` → prawdziwy status **404** renderowany przez samą trasę, nie przez `Astro.rewrite("/404")` — Astro rzuca `ForbiddenRewrite` przy próbie rewrite na prerenderowane `/404`. Treść strony jest w `EventDetail.tsx`
- `src/components/EventDetail.tsx` - treść strony detalu wydarzenia, renderowana **bez** `client:*` (delta JS trasy 0 kB). Wydzielona z trasy `markets/[id].astro`, bo jednoplikowa wersja miała 546 linii przy limicie 500
- `src/components/event-theme.ts` - tokeny prezentacji wyciągnięte z `EventCard.tsx` (`STATUS_THEME`, `WORKSHOP_LABEL`, `get_event_link`, klasy badge/pill), żeby karta i detal nie rozjechały się wizualnie
- `src/components/` - sekcje strony jako React komponenty z Framer Motion
- `src/components/ui/` - reużywalne komponenty UI (Button, etc.)
- `src/components/our-works-data.ts` - dane sekcji "What We Do" + deep-linki do tabów: `?docs`, `?sdk`, `?core`, `?hive`, `?ufa`, `?eos`, `?eda`, `?data` (i `?tab=<alias>`). Duplikat aliasu **wywala build** celowo (`build_id_by_slug()`). Deep-link zatrzymuje auto-rotate i scrolluje do `#what-we-do-content` (treść kategorii pod navbarem), nie do nagłówka sekcji
- `src/components/events-data.ts` - jedyne źródło wydarzeń dla `/markets`, `/markets/<id>`, banera na stronie głównej i JSON-LD (`event-schema.ts`). `kind: "workshop"` przełącza teksty z „jedziemy” na „prowadzimy”, `schedule` dokłada godziny do `dateTime`/JSON-LD i domyka status o godzinie startu oraz końca (o północy dnia warsztatu jest jeszcze „upcoming”), `venue` daje adres na karcie i w `PostalAddress`, `admission` — pigułkę „Free entry · no registration”, `Offer` (`price: "0"`) wskazujący domyślnie na `/markets` (na detalu — na własny `canonical_path`) i `isAccessibleForFree`. `EventBanner` promuje **do dwóch** najbliższych wydarzeń z `get_promoted_events()` (trwające przed nadchodzącymi, `limit` domyślnie 2), nie jedno. `get_event_by_id()`, `get_event_path()`, `MARKETS_PATH` obsługują trasę `/markets/<id>`; **build-time guard unikalności `id`** wywala build (`Duplicate event id "<id>"`), analogicznie do `build_id_by_slug()` w `our-works-data.ts`
  - **Pułapka**: link do mapy powstaje z adresu pocztowego (`get_venue_map_url()`), nie z nazwy venue — pod tą samą nazwą stoi obok hotel, więc wyszukiwanie po nazwie trafia w złe miejsce
  - **Pułapka**: baner i `Markets` liczą status z `parse_iso_day(todayIso)` na pierwszym renderze i dopiero po mount przechodzą na `new Date()` — inaczej prerender i hydracja rozjeżdżają się na granicy doby
  - **Pułapka**: `get_event_status()` liczy dobę **w strefie wydarzenia** (offset z `TradeFairEvent.utcOffset`, `schedule.utcOffset` wygrywa jeśli jest, fallback = strefa renderera). Bez tego trasa SSR (zegar serwera = UTC na Vercelu) rozjeżdżała się ze statusem na liście o do 2h wokół północy CEST
- `src/components/event-schema.ts` - `build_event_schema(event, site, canonical_path?)` ma trzeci parametr opcjonalny; lista `/markets` dalej ma `offers.url` na `/markets`, detal wydarzenia ma kanoniczny URL wydarzenia
- `astro.config.mjs` - `sitemap.customPages` z `EVENTS.map(...)` — `@astrojs/sitemap` emituje tylko strony prerenderowane, więc trasy SSR (`/markets/<id>`) trzeba dołożyć ręcznie z tego samego źródła (`events-data.ts`), żeby nie powstała druga kopia listy do utrzymania
- `src/components/Navigation.tsx`, `src/components/Footer.tsx` - aktywny link dopasowywany **prefiksowo** (`/` matchuje tylko siebie) — inaczej „Markets” tracił `aria-current` na podstronie wydarzenia. Wejścia na detal: tytuł wydarzenia w `EventCard` i każdy wpis w `EventBanner` (baner promuje do dwóch wydarzeń, więc dawny jeden zbiorczy `<a href="/markets">` został rozbity na osobne linki na wpis; CTA banera dalej idzie na `/markets`)
- `src/components/admin/` - dashboard panelu (kafelki, wykres, top-N, tabela z sortowaniem/filtrowaniem/paginacją i deep-linkami przez query string), renderowany serwerowo. `TrafficFilters.tsx` + `SwitchLink.tsx` renderują 7 przełączników ruchu (polaryzacja jednolita: switch ON = kategoria widoczna, w URL zapisana jako odwrócona flaga `exclude*`/`includeInternal`). `CountryCard.tsx` doklada `showCountryIps` (top IP per kraj, prezentacyjne — nie zeruje `page`, w odróżnieniu od pozostałych 6 flag ruchu)
- `src/lib/utils.ts` - helper `cn()` do mergowania klas Tailwind
- `src/middleware.ts` - na requestach do stron dynamicznych: guard sesji dla `/admin/*` i `/api/admin/*`, nagłówki bezpieczeństwa. Nie loguje już ruchu
- `src/lib/logs/` - dane ruchu pochodzą ze **zdalnego pliku logu nginx** (`LOG_SOURCE_URL`), pobieranego serwerowo, cache'owanego w pamięci (`source.ts`, TTL `LOG_SOURCE_TTL_SECONDS`) i parsowanego (`nginx_parser.ts`, format `combined` + dwa dodatkowe cytowane pola: X-Forwarded-For i Accept-Language). `LogSourceRepository` jest **READ-ONLY** (bez `insert`) — własne logowanie w middleware, mocki i implementacja in-memory zostały usunięte
  - **Pułapka**: pole `ip` bierze się z `$remote_addr`, NIE z X-Forwarded-For — ten nagłówek jest sterowalny przez klienta
  - `user_agent.ts` kategoryzuje ruch nie-ludzki na 4 rodziny botów (`BotCategory`: crawler/seo/script/headless, pole `RequestLog.botCategory`) plus UA nierozpoznany i brak nagłówka UA — razem 6 niezależnych flag URL (`excludeCrawlers`, `excludeSeoTools`, `excludeScripts`, `excludeHeadless`, `excludeUnknownUa`, `excludeNoUa`) zamiast dawnego jednego `excludeBots`. Stary `excludeBots=1` nadal jest parsowany jako alias wszystkich sześciu i przekierowuje (303) na URL kanoniczny — zapisane linki nie psują się
  - **Pułapka**: klasyfikacja UA i predykat filtra muszą czytać z jednego źródła (`is_missing_user_agent()` w `user_agent.ts`) — dwie osobne kopie tego warunku się rozjeżdżały (pusty string wpadał do `unknownUa` zamiast `noUa`)
  - Ruch z loopbacku (health-checki, ~40% wpisów) to jeden z 7 przełączników w bloku "Filtry ruchu" (`includeInternal`), nie samotna flaga
  - Panel mieli **cały** log, nie okno najnowszych wpisów. `RECORD_BUDGET` w `nginx_parser.ts` (500 000 rekordów, ~300 MB) to zabezpieczenie przed OOM, nie limit prezentacji: po jego wyczerpaniu parser zostawia najnowsze wpisy (czyta plik od końca), zwraca `truncated` i panel dokleja adnotację "Widoczna jest tylko najnowsza część historii: X z Y linii logu". Budżet jest parametrem `parse_nginx_log()` — testy wstrzykują małą wartość zamiast hodować fixture
  - **Pułapka**: `FETCH_TIMEOUT_MS` (60 s) i `maxDuration` adaptera w `astro.config.mjs` (90 s) to para — Vercel ubija funkcję po `maxDuration`, więc podniesienie timeoutu fetcha bez tego drugiego jest martwe w produkcji
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

`npm test` (Playwright, 95 testów: chromium 91 + chromium-no-js 4) korzysta z lokalnego fixture logu (`tests/fixtures/`) — nie uderza w prawdziwy `LOG_SOURCE_URL`. Projekt `chromium-no-js` weryfikuje, że panel admina działa bez JavaScriptu; osobny test pilnuje, że z panelu nie wychodzi żaden request XHR/fetch. Specy panelu: `tests/admin.spec.ts` (ogólny przepływ), `tests/admin_traffic.spec.ts` (7 flag filtrów ruchu), `tests/admin_countries.spec.ts` (karta krajów + `showCountryIps`), `tests/nginx_parser.spec.ts` (budżet rekordów — degradacja na wstrzykniętej małej wartości, bez przeglądarki). Wydarzenia: `tests/events_data.spec.ts` (daty z harmonogramem, granice godziny startu i końca w `get_event_status()`, kształt JSON-LD wraz z `offers`/`isAccessibleForFree`/`PostalAddress`, link do mapy z adresu, kolejność `get_promoted_events()`, `offers.url` z `canonical_path`, guard duplikatu `id`, doba w strefie wydarzenia na fixture `TOKYO_CONFERENCE` — też bez przeglądarki) i `tests/event_detail.spec.ts` (nawigacja z karty i z banera na `/markets/<id>`, treść detalu, status 404 + noindex, JSON-LD pojedynczego Eventu, wariant no-JS z asercją dokładnie 1 `astro-island`). Spec `events_data.spec.ts` chodzi na własnych fixture'ach (`WORKSHOP`/`CONFERENCE`, wstrzykiwanych parametrem `events`); z produkcyjnego `EVENTS` korzystają tylko regresja EBC i round-trip escapowania. Wspólne locatory i kroki w `tests/support/` (w tym `tests/support/events.ts` dla detalu wydarzenia), fixture UA/logów w `tests/fixtures/user_agents.ts` i `tests/fixtures/log_entries.ts`.

## DaisyUI Theme

Custom theme "blockchainwares" zdefiniowany w `src/styles/global.css` - dark mode z oklch colors. Używaj klas DaisyUI (`bg-base-100`, `text-base-content`, `btn-primary`, etc.).

## Konwencje

- Komponenty React: `PascalCase.tsx`
- Utils: `snake_case.ts`
- TypeScript strict, zero `any`
- Max 500 linii na plik
- Export komponentów przez barrel files (`index.ts`)
