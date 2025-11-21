<!-- Copilot / AI agent instructions for the Dopamine PWA repo -->
# Quick onboarding for AI coding agents

This file documents repository-specific conventions, architecture notes, and examples that help AI agents make safe, focused changes.

1) Purpose / Big picture
- This is a Next.js 14 App Router PWA skeleton (TypeScript + some JS duplicates). Primary purpose: field-force PWA for recording visits, showing reps on a map, and PWA features (installable + push notifications).

2) Canonical source
- Prefer the files under `src/` (TypeScript) as the canonical implementation. There are parallel JS copies under top-level `app/` and `components/` that appear to be older or alternative implementations. When making functional changes, update `src/` first and consider syncing `app/` only when necessary.

3) How the app is structured (key files)
- `package.json` — scripts: `dev`, `build`, `start`.
- `next.config.mjs` — Next config (App Router enabled).
- `src/app/*` — main Next App Router code (pages, API routes under `src/app/api`).
- `src/components/*` — React components (client components use `'use client'`).
- `src/lib/firebase.ts` — Firebase init + `getFirebaseMessaging()` helper; uses `NEXT_PUBLIC_` env vars.
- `src/lib/mongodb.ts` — Mongoose helper `dbConnect()`; throws if `MONGODB_URI` missing.
- `public/manifest.webmanifest`, `public/sw.js`, `public/firebase-messaging-sw.js` — PWA/service worker assets.

4) Dev / build / run
- Node >= 18 recommended (README). Typical commands from repo root:
  - `npm install`
  - `npm run dev` (runs `next dev`)
  - `npm run build` / `npm run start`

5) Important environment variables
- `MONGODB_URI` — required for `src/lib/mongodb.ts` (server-side). Set in `.env.local`.
- `NEXT_PUBLIC_FIREBASE_*` — keys used in `src/lib/firebase.ts` and client code.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — used by map components if enabled.

6) API routes and data patterns
- There are two `visits` handlers: `app/api/visits/route.js` (in-memory mock) and `src/app/api/visits/route.ts` (Mongoose-backed). When implementing or fixing APIs prefer `src/app/api/visits/route.ts` and call `dbConnect()` (see file). Note: `app/api/visits/route.js` uses `export const dynamic = 'force-dynamic'` to prevent Next caching — copy this pattern if you add dynamic in-memory routes.

7) PWA & notifications
- `next-pwa` is included in `package.json`. Service workers are in `public/` and referenced from `app/layout.js` (`/manifest.webmanifest`). `src/lib/firebase.ts` checks `isSupported()` before requesting messaging. Use `public/firebase-messaging-sw.js` as the default SW for FCM notifications.

8) Conventions and patterns to follow
- Use `src/` TypeScript files when possible — they reflect current intent.
- Client components must include `'use client'` (see `src/components/Sidebar.tsx`).
- Keep UI text direction `dir="rtl"` and Arabic text conventions (see `src/app/layout.tsx` and components).
- When adding server-side code that touches the DB, always call `await dbConnect()` before using Mongoose models.

9) Examples (copyable patterns)
- DB connect in an API handler:
  ```ts
  import { dbConnect } from '../../../lib/mongodb';
  await dbConnect();
  // then use mongoose models
  ```
- Firebase messaging helper (use `getFirebaseMessaging()` from `src/lib/firebase.ts`).

10) What to watch out for
- Duplicate implementations: editing both `app/` and `src/` can create inconsistencies. Prefer `src/` and leave `app/` untouched unless you intentionally keep both in sync.
- Some server-side JS files (top-level `lib/`) expect different env var names (e.g., non-`NEXT_PUBLIC_`) — double-check which variant the file uses.
- In-memory storage (in `app/api/visits/route.js`) is ephemeral — do not assume persistence in production.

11) When adding tests or linting
- The repo includes TypeScript and ESLint devDependencies. Run `npm run lint` and keep TypeScript types compatible with existing `src/` types.

12) Files to inspect first when changing features
- `src/app/api/visits/route.ts` — visits API (canonical)
- `src/lib/mongodb.ts` and `lib/mongodb.js` — DB helpers
- `src/lib/firebase.ts` and `public/firebase-messaging-sw.js` — notifications
- `src/components/Sidebar.tsx`, `app/reps-map/RepsMapClient.js` — UI + map usage
- `README.md` — quick local setup steps and env guidance

If anything here is unclear or you want the instructions to be stricter (for example: always modify both `app/` and `src/`, or target only one), tell me which policy you prefer and I'll refine this file.
