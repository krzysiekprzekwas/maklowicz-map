# Agent Guide for Maklowicz Map

This document contains guidelines for AI coding agents working on the Maklowicz Map project - an interactive Next.js map showcasing locations visited by Robert Makłowicz.

## Project Overview

- **Framework**: Next.js 16 (Pages Router)
- **Language**: TypeScript (strict mode disabled)
- **Styling**: Tailwind CSS
- **Maps**: Leaflet with react-leaflet
- **State**: React hooks with localStorage for favorites
- **Data**: Static JSON file (`data/locations.json`)

## Build, Lint, and Test Commands

### Development
```bash
npm run dev              # Start dev server with Node inspector on localhost:3000
```

### Build & Production
```bash
npm run build            # Build for production (generates static pages)
npm start                # Start production server
```

### Linting
```bash
npx next lint            # Run ESLint (uses eslint-config-next)
```

### Utilities
```bash
npm run sitemap          # Generate sitemap using next-sitemap
npm run parse-location   # Parse Google Maps URL to location data
npm run parse-video      # Parse YouTube video URL to video data
```

### No Test Suite
- This project does not currently have automated tests
- Manual testing is done via dev server and production build

## Project Structure

```
/
├── pages/               # Next.js pages (Pages Router)
│   ├── index.tsx        # Main map page
│   ├── _app.tsx         # App wrapper with Header
│   ├── _document.tsx    # HTML document
│   ├── about.tsx        # About page
│   ├── contact.tsx      # Contact page
│   └── country/[slug].tsx # Dynamic country pages
├── components/          # React components
│   ├── filters/         # Filter UI components
│   ├── layout/          # Header and layout components
│   ├── location/        # Location detail components
│   └── map/             # Map component (dynamic import)
├── hooks/               # Custom React hooks
│   ├── useLocations.ts  # Location filtering logic
│   └── useLocationState.ts # State management
├── types/               # TypeScript type definitions
│   └── Location.ts      # Core data types
├── src/lib/             # Utility functions
├── data/                # Static JSON data
│   └── locations.json   # All location and video data
├── scripts/             # Data parsing scripts
│   ├── location-parser/ # Google Maps URL parser
│   └── video-parser/    # YouTube video parser
├── styles/              # Global CSS
└── public/              # Static assets
```

## Code Style Guidelines

### Imports
- Group imports: React/Next, third-party libs, local components, types, data
- Use relative imports for local files (`../`, `./`)
- Use named imports for components: `import { Component } from 'lib'`
- Import types with `type` keyword: `import type { Location } from '../types/Location'`

Example:
```typescript
import React from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useLocations } from '../hooks/useLocations';
import type { Location } from '../types/Location';
```

### TypeScript
- **Strict mode is disabled** - types are optional but encouraged
- Define interfaces for component props
- Use type aliases for complex types
- Export types from `types/` directory
- Use `interface` for object shapes, `type` for unions/aliases

### Naming Conventions
- **Components**: PascalCase (e.g., `LocationDetails`, `Filters`)
- **Files**: Match component name (e.g., `LocationDetails.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useLocations`)
- **Functions**: camelCase (e.g., `handleCountryClick`)
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Types/Interfaces**: PascalCase (e.g., `Location`, `CountryData`)

### Component Structure
- Use functional components with hooks
- Define prop interfaces above component
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks

### State Management
- Use `useState` for local component state
- Use custom hooks for shared state logic
- Use `localStorage` for persistence (favorites)
- Use `useMemo` for expensive computations
- URL query params for shareable state (country, placeId)

### Styling
- Use Tailwind CSS utility classes
- Custom colors defined in `tailwind.config.js`:
  - `primary` - brown theme color (#2c1810)
  - `secondary` - cream background (#f8f5f0)
  - `restaurant`, `attraction`, `other` - location type colors
- Responsive design: mobile-first with `md:` breakpoint
- Use `className` prop for conditional styling

### Error Handling
- No formal error boundaries in place
- Handle errors in async operations
- Provide fallback UI for loading states
- Use optional chaining for nullable data: `location?.name`

### Performance
- Map component is dynamically imported with `next/dynamic` (SSR disabled)
- Use `useMemo` for filtering and data transformations
- Images are lazy-loaded with loading states

### Data Flow
- All data lives in `data/locations.json`
- Data structure: videos → locations array
- Filtering happens client-side via hooks
- No API calls (static data only)

### Polish Language
- UI text is in Polish
- Comments can be in English
- Variable/function names in English

### Accessibility
- Use semantic HTML elements
- Include `aria-label` for icon buttons
- Maintain keyboard navigation support

## Common Patterns

### Dynamic Imports
```typescript
const Map = dynamic(() => import('../components/map/Map'), {
  ssr: false,
  loading: () => <div>Loading map...</div>
});
```

### Conditional Rendering
```typescript
{location && (
  <div>Content</div>
)}
```

### Mobile Detection
```typescript
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
  checkIfMobile();
  window.addEventListener('resize', checkIfMobile);
  return () => window.removeEventListener('resize', checkIfMobile);
}, []);
```

## Key Files to Understand

- `types/Location.ts` - Core data types
- `hooks/useLocations.ts` - Filtering logic
- `hooks/useLocationState.ts` - State management
- `data/locations.json` - All application data
- `pages/index.tsx` - Main application entry

## Environment Variables

Required in `.env`:
```
YOUTUBE_API_KEY=your_key
GOOGLE_MAPS_API_KEY=your_key
GEMINI_API_KEY=your_key
```

## Notes for Agents

- This is a static site with no backend
- All data is in `locations.json` - modify carefully
- Map uses Leaflet (not Google Maps) for rendering
- Mobile uses bottom sheet, desktop uses sidebar
- Favorites stored in browser localStorage
- Build generates static pages for all countries
