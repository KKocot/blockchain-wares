# BlockchainWares

Strona internetowa dla firmy BlockchainWares - software development company specjalizującej się w blockchain, Event-Driven Architecture, engineering i bazach danych.

**Lokalizacja:** Dąbrowa Górnicza, Polska

## Tech Stack

- **Astro 5** - Static Site Generator
- **React 19** - UI Library
- **Tailwind CSS 4** - Styling
- **Framer Motion 12** - Animations
- **TypeScript** - Type Safety

## Design

Inspiracja: [Landio](https://landio.framer.website)

### Color Palette
- Background: `#04070d`
- Text: `#d5dbe6`
- Accent: `#3b82f6`
- Muted: `#4b5563`

### Typography
- Font: Quicksand (Google Fonts)

## Project Structure

```
src/
├── components/        # React components
│   ├── Hero.tsx      # Hero section with animations
│   └── ui/           # UI components (Button, Card, etc.)
├── layouts/          # Astro layouts
│   └── Layout.astro  # Base layout with SEO
├── pages/            # Astro pages
│   └── index.astro   # Homepage
├── lib/              # Utils and helpers
│   └── utils.ts      # cn() utility
└── styles/           # Global styles
    └── global.css    # Tailwind + theme config

public/
└── assets/
    └── img/
        ├── brands/   # Client/partner logos
        └── icons/    # Custom icons
```

## Commands

All commands are run from the root of the project:

| Command | Action |
|---------|--------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview build locally |
| `npx tsc --noEmit` | Type check |

## Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Open [http://localhost:4321](http://localhost:4321) in your browser

## Building for Production

```bash
npm run build
```

Output will be in `./dist/` directory.

## Design Tokens

All design tokens are defined in `src/styles/global.css` using CSS variables:

```css
--color-background: #04070d
--color-text: #d5dbe6
--color-accent: #3b82f6
--color-accent-hover: #2563eb
--color-muted: #4b5563
--color-border: #1f2937
```

## Conventions

- **Components:** PascalCase.tsx
- **Utils:** snake_case.ts
- **TypeScript:** Strict mode, zero `any`
- **Max file size:** 500 lines

## Resources

- [Astro Documentation](https://docs.astro.build)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
