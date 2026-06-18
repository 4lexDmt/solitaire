# Solitaire

Premium Klondike solitaire — calm, ad-free, and offline-first. Built with Next.js 16, a pure deterministic engine, Motion-powered interactions, and optional Supabase cloud sync.

## Requirements

- Node.js 20+
- npm 10+

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server (Turbopack) |
| `npm run build` | Production build (includes Serwist service worker) |
| `npm run start` | Serve production build |
| `npm test` | Run Vitest unit tests |
| `npm run generate-pool` | Generate verified winnable seed pools into `public/data/` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

### Winnable seed pools

Bundled pools power **Winnable deals only** mode offline:

```bash
npm run generate-pool -- --target 50 --draw both
```

This writes `public/data/winnable-draw1.json` and `winnable-draw3.json`. Pools are precached by the service worker.

### Environment variables (optional cloud sync)

Create `.env.local` for Supabase (game works fully offline without these):

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Deploy on Vercel

1. Push the repository to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Framework preset: **Next.js** (auto-detected).
4. Add Supabase env vars if using cloud sync.
5. Deploy.

`vercel.json` sets cache headers for the web manifest, service worker route, and winnable pool JSON.

### PWA install

After deployment, the app is installable from supported browsers (Add to Home Screen / Install app). The Serwist service worker precaches:

- App shell and static assets
- Winnable seed pools (`/data/winnable-draw*.json`)
- Offline fallback page (`/~offline`)

## Architecture notes

- **Engine:** Pure TypeScript in `src/engine/` — deterministic deals, reducer, scoring.
- **Solver:** DFS backtracking with transposition table; Web Worker via `src/solver/solverClient.ts` (code-split).
- **Persistence:** IndexedDB via `idb`; optional Supabase sync.
- **A11y:** Keyboard play, `LiveRegion` move announcements, four-color deck toggle, 44px touch targets, focus rings.

See `docs/SPEC.md` for the full product and design contract.
