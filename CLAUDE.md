# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive Next.js map ("Śladami Roberta Makłowicza") showcasing ~1,050 restaurants and attractions visited by Robert Makłowicz (Polish culinary travel host) across ~191 YouTube videos. This is a static site with no backend — all data lives in `data/locations.json`.

## Commands

```bash
npm run dev           # Dev server with Node inspector on localhost:3000
npm run build         # Production build (generates static country pages)
npm start             # Start production server
npx next lint         # Run ESLint

# Data parsing utilities (require .env API keys)
npm run parse-location "https://maps.google.com/..."   # Parse Google Maps URL → location data
npm run parse-video "https://youtube.com/watch?v=..."  # Parse YouTube URL → video data
npm run sitemap       # Generate sitemap
```

No test suite — manual testing via dev server.

## Architecture

**Tech stack**: Next.js 16 (Pages Router), TypeScript (strict mode disabled), Tailwind CSS, Leaflet + react-leaflet + react-leaflet-cluster.

### Data Flow

1. `data/locations.json` — single source of truth (structure: `{ videos: Video[] }`, each Video has `locations[]`)
2. `hooks/useLocations.ts` — filters locations by country/video/search using `useMemo`
3. `hooks/useLocationState.ts` — global state (selected location, country, video, search query, favorites via `localStorage`)
4. `pages/index.tsx` — wires hooks together, passes filtered locations to Map and Filters
5. `components/map/Map.tsx` — dynamically imported (SSR disabled), renders Leaflet map with clustering

### UI Layout

- **Desktop**: sidebar (Filters) + map + details panel side-by-side
- **Mobile**: map fullscreen + bottom sheet for filters/details + floating toggle button

### Map Performance

The map has several optimizations for smooth 55–60fps panning on mobile:
- Icon caching (`hooks/useIconCache.ts`) — 9 cached icons reused across all markers
- Canvas renderer on mobile (`src/lib/deviceDetection.ts`)
- Marker clustering via react-leaflet-cluster (disabled below zoom 8)
- `chunkedLoading` enabled on TileLayer

### Key Patterns

**Dynamic import for Map** (always SSR disabled):
```typescript
const Map = dynamic(() => import('../components/map/Map'), { ssr: false });
```

**URL query params** are used for shareable state (`country`, `placeId`).

**Custom Tailwind colors** (defined in `tailwind.config.js`):
- `primary` — #2c1810 (brown)
- `secondary` — #f8f5f0 (cream)
- `restaurant`, `attraction`, `other` — location type badge colors

### Polish Language

All UI text is in Polish. Comments and variable/function names are in English.

## Environment Variables

API keys are only needed for the data-parsing scripts, not for running the app itself:

```
YOUTUBE_API_KEY=...
GOOGLE_MAPS_API_KEY=...
GEMINI_API_KEY=...
```

## Adding New Locations

Use `npm run parse-location` / `npm run parse-video` scripts (in `scripts/`) to generate JSON entries, then manually append to `data/locations.json`. Modify `locations.json` carefully — it is the entire dataset.
