# AI-Travel-Guider (AI-Powered City Guider)

An AI-assisted travel planning web app built with React + TypeScript + Tailwind and a Hono (Cloudflare Workers) API layer. It focuses on explainable, rule-based recommendations and itinerary generation.

## Features

- AI-based attraction recommendations (weighted scoring)
- Personalization by travel style (family/solo/couple/adventure)
- Smart filtering and search
- Maps via Leaflet / React-Leaflet

## Architecture

```
Frontend (React + TypeScript + Tailwind)
  ↓
API (Hono on Cloudflare Workers)
  ↓
Recommendation / itinerary services
  ↓
Static datasets
```

## Getting started (local)

Prereqs: Node.js (recommended: LTS), npm

```bash
npm install
npm run dev
```

Then open the URL printed by Vite (usually `http://localhost:5173`).

## Environment variables

- `NVIDIA_API_KEY` (server-side only)
  - Local dev: set it in `.dev.vars` (gitignored) or in your shell environment
  - Production (Wrangler): `wrangler secret put NVIDIA_API_KEY`

## Scripts

```bash
npm run dev
npm run build
npm run lint
```

## Project structure

```
src/
  react-app/   # frontend (pages/components)
  worker/      # Hono worker + services + static data
  shared/      # shared types/utilities
```

## Notes

- The background video `public/bg-video.mp4` is included in a compressed form to stay under GitHub’s 100MB limit.
