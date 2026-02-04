# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Opis projektu

Strona internetowa dla firmy BlockchainWares - software development company z Dąbrowy Górniczej, specjalizującej się w blockchain, EDA, engineering i bazach danych.

## Komendy

```bash
npm run dev       # Dev server na localhost:4321
npm run build     # Build produkcyjny do ./dist/
npm run preview   # Podgląd builda
npx tsc --noEmit  # Type check
```

## Tech Stack

- **Astro 5** + **React 19** (client:load dla interaktywnych sekcji)
- **Tailwind CSS 4** z **DaisyUI 5** (custom theme "blockchainwares")
- **Framer Motion 12** (animacje sekcji)
- **TypeScript** (strict mode via astro/tsconfigs/strict)

## Architektura

Single Page Application zbudowana w Astro z React Islands:
- `src/layouts/Layout.astro` - bazowy layout z SEO, Open Graph, fontami (Quicksand)
- `src/pages/index.astro` - główna strona, importuje wszystkie sekcje
- `src/components/` - sekcje strony jako React komponenty z Framer Motion
- `src/components/ui/` - reużywalne komponenty UI (Button, etc.)
- `src/lib/utils.ts` - helper `cn()` do mergowania klas Tailwind

Sekcje strony (w kolejności): Navigation, Hero, Expertise, OurWorks, Services, EndUsers, Team, Career, Contact, Footer

## DaisyUI Theme

Custom theme "blockchainwares" zdefiniowany w `src/styles/global.css` - dark mode z oklch colors. Używaj klas DaisyUI (`bg-base-100`, `text-base-content`, `btn-primary`, etc.).

## Konwencje

- Komponenty React: `PascalCase.tsx`
- Utils: `snake_case.ts`
- TypeScript strict, zero `any`
- Max 500 linii na plik
- Export komponentów przez barrel files (`index.ts`)
