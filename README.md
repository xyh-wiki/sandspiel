# Sandspiel — sand simulation playground

A production-ready, static React + TypeScript site for running a falling-sand simulation directly in the browser. Includes i18n (EN/中文) with auto-detect, light/dark theming, local saves/exports, SEO assets, and a Related Tools module.

## Features
- Canvas-based sand/water/stone/soil/wood/plant/seed/fire/steam simulation with play/pause, step, reset, undo, low-power toggle, random fill, clear, and brush sizing.
- Save/load locally (localStorage), download/import JSON, and export PNG snapshots.
- Mobile-friendly controls, touch support, no hover-only actions; performance guardrails for low-power devices.
- Templates: default “Garden homestead” plus river delta, desert dunes, volcanic ridge, rainforest edge, and blank slate.
- i18n with auto language detection (navigator), user override persisted; theme respects system and persists.
- SEO-ready: meta tags, Open Graph/Twitter, WebApplication + FAQPage + BreadcrumbList JSON-LD, sitemap.xml, robots.txt, full favicon set.
- Related tools/eCosystem links rendered from a centralized config in main content and footer.

## Requirements
- Node >=18 (<=25)
- npm (bundled with Node)

## Setup
```bash
npm install
npm run dev
```
- Dev server: http://localhost:5173
- Build: `npm run build` outputs to `dist/`
- Preview built site: `npm run preview`

## Environment variables
Create `.env` from `.env.example` if you need to override the public site URL used in sharing contexts:
```
VITE_SITE_URL=https://sandspiel.xyh.wiki
```
Core functionality works without any env vars or backend.

## Deployment (Dokploy + Nixpacks)
- Build command: `npm run build`
- Publish directory: `dist/`
- Node version: respect package.json engines (>=18 <=25); set `NIXPACKS_NODE_VERSION` if you pin it.
- No Dockerfile required; Nixpacks will detect Vite, install deps, run the build, and serve `dist` via your preferred static file server or Dokploy static deployment.
- Environment: static hosting only; no persistent backend is required. If you later add optional counters/rankings, use environment variables only and keep the UI functional without them.

## Browser limitations & performance guidance
- Recommended grid sizes: default 176x118; for low-memory mobile devices stay at or below ~160x120 and use Low-power mode (caps FPS and lowers resolution).
- File imports: keep JSON saves under ~1MB to avoid spikes during parsing; imports surface human-readable errors.
- Rendering: canvas-only; modern browsers with Canvas support required. The app shows FPS/particle counts; pause or clear if counts surge.
- Touch: touch drawing enabled; no hover dependencies.
- Retry/reset: undo/clear/reset are always available; imports and saves show status messages instead of failing silently.

## Privacy
- All simulation data, saves, and preferences (language/theme) stay in the browser (localStorage or downloaded files). No accounts, no analytics, and no uploads.

## Project structure
- `src/` React + TS code (simulation engine, i18n, state, components, styles)
- `public/` static assets (favicons, sitemap.xml, robots.txt, manifest, OG image)
- `dist/` build output after `npm run build`
