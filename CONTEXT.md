# Pet Studio UI — Context Primer

> Read this first after a context reset. It tells you what exists, what's non-negotiable, and
> where to look for depth. Full spec: [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md). Perf
> numbers: [`PERFORMANCE_AUDIT.md`](PERFORMANCE_AUDIT.md). Recent fixes: [`CHANGELOG.md`](CHANGELOG.md).

## What this is

SPA for a pet clinic/grooming/hotel/shop business (Aracaju, Brazil). **Frontend-only, Phase 1**:
no backend exists yet (`Pet-Studio-Server/` is an empty sibling repo — a real API is coming).
All persistence is simulated in `localStorage`. Language: pt-BR throughout.

Stack: React 19, TypeScript (strict), Vite 8 (Rolldown), Tailwind v4, React Router 8, Zustand,
Zod, react-hook-form, date-fns + `@date-fns/tz`, react-day-picker, Radix Dialog, Sonner,
Leaflet, vite-plugin-pwa. No animation library — page transitions and floating objects are CSS.

## The one architectural rule that matters

**UI code never touches `localStorage` directly.** Everything goes through async repository
interfaces in `src/data/ports.ts`, implemented by `src/data/repositories/local*.ts`. This is
enforced by an ESLint rule (`no-restricted-imports` / `no-restricted-globals` in
`eslint.config.js`, scoped to `src/features/**`, `src/design-system/**`, `src/app/**`). The
point: when the real backend lands, only `data/repositories/index.ts` changes to swap in HTTP
implementations — no component touches storage today, so none will need to change.

Reactivity without a data-fetching library: `src/store/dataVersion.ts` holds a version counter
per domain (`products` / `bookings` / `availability`). Repositories bump the counter after every
mutation; a `storage` event listener also bumps it for cross-tab sync. `src/lib/useLiveQuery.ts`
is the hook every page uses to read data — it re-fetches when the relevant counter changes.
**`fetcher` passed to `useLiveQuery` must be `useCallback`'d** — its identity is the query key.

## Routes

Public: `/`, `/loja`, `/banho-e-tosa`, `/clinica`, `/hotel`, `/galeria`.
Admin (guarded): `/admin/login`, `/admin`, `/admin/produtos`, `/admin/agendamentos`, `/admin/calendario`.
All public pages except Home are `lazy()`; the entire `/admin` subtree is one isolated chunk that
never reaches public visitors (verified in the bundle — see audit).

Services modeled with a shared shape: `ServiceKind = 'grooming' | 'clinic' | 'hotel'`, each with a
`WeeklyTemplate` (slots per weekday) + `DateOverride[]` (per-date exceptions/closures). Grooming
is actually bookable (`GroomingBooking` records + slot-conflict checks). Clinic and Hotel are
**view-only** — a `DemandEntry` (`free`/`moderate`/`high`/`closed`) per date drives a public
calendar, and the CTA is always a WhatsApp deep link, never an in-app booking.

## Non-obvious things you must not "fix"

- **Dates are `'yyyy-MM-dd'` strings, never `Date` objects, and `now` is always injected** into
  domain functions (`src/domain/availability.ts`, `src/lib/datetime.ts`). This avoids the
  `new Date('2026-08-10')` UTC-midnight bug. Tests in `availability.test.ts` and
  `datetime.test.ts` pin this down — if you touch date logic, run them.
- **`localStorage` reads are Zod-validated** (`src/data/storage/driver.ts`,
  `readCollection`/`readValue`). Corrupted or hand-edited data silently falls back to the seed,
  never crashes. There's also a `MemoryStore` fallback for when `localStorage` itself is
  unavailable (Safari private mode). Don't add a raw `JSON.parse` anywhere in the data layer.
- **Storage schema version is `2`** (`src/data/storage/migrations.ts`). Bump it whenever you
  change a seeded collection's shape, or existing browsers will read stale/invalid data.
- **No `manualChunks` in `vite.config.ts`, on purpose** (see comment there). Vite 8's Rolldown
  bundler only partially honors it — an earlier attempt caused React to duplicate into two
  chunks. Rolldown's default chunking + `lazy()` per route is what's actually in use.
- **No animation library.** `motion`/`framer-motion` was removed — it was 228 modules (~28 KB gz)
  for one page-fade effect. Page transitions are CSS (`ds-page-enter` in `tokens.css` +
  `key`-ed remount in `PublicLayout.tsx`). Floating decorative objects
  (`src/design-system/motion/FloatingObject.tsx` + `PetShapes.tsx`) are also pure CSS keyframes.
  Don't reach for a motion library without checking bundle cost first.
- **The `/admin` login is not security.** Demo credentials only (`.env.local`,
  `VITE_DEMO_USERNAME`/`VITE_DEMO_PASSWORD`, default `admin`/`petstudio`). Never put real
  credentials or real customer data in seed data.

## Recent changes made directly by the repo owner (not in `IMPLEMENTATION_PLAN.md`)

These landed as separate commits after the initial build, fixing real mobile/PWA issues found by
testing on device. Check `CHANGELOG.md` for the running log. Highlights:

- `useInstallPrompt.ts` was rewritten to capture `beforeinstallprompt` **globally at module load**
  (not inside a component effect) — the event can fire before React mounts, and the original
  version missed it intermittently.
- `ProductFilters.tsx` (Shop) now collapses category/promo/sort filters behind a "Mostrar Filtros"
  toggle on mobile (`lg:hidden` + local `isOpen` state); the animal-type filter and search stay
  always visible. Shop grid is `grid-cols-2` on mobile, not single-column.
- `WhatsAppFab` uses fixed Tailwind positioning (`bottom-4 md:bottom-6`) instead of
  `env(safe-area-inset-bottom)` — the safe-area approach caused jumping during mobile scroll. FAB
  is `z-50`.
- `PublicLayout` has `overflow-x-hidden` — decorative floaters were causing horizontal scroll on
  mobile that made the FAB vanish off-screen.
- **The Home page `Marquee` was removed** (visual clutter + overflow risk on mobile). The
  `Marquee` component itself still exists (`src/design-system/decorative/Marquee.tsx`) and is
  still used on `/hotel` — don't assume it's dead code.
- `ProductCard`'s WhatsApp button shows icon-only on mobile, "Consultar" label on desktop.

## Known gaps (be honest about these, don't claim they're done)

- **Initial JS bundle is ~174 KB gzip against a 160 KB budget** (see `PERFORMANCE_AUDIT.md` §4 for
  the ranked fix list — top one is deferring `bootstrapStorage()` past first paint).
- **Lighthouse, Core Web Vitals, axe, and cross-browser testing have never been run.** Don't
  report performance/accessibility scores that weren't measured.
- **All imagery is placeholder** (`loremflickr.com` with locked seeds for determinism) — product
  photos, gallery photos, and the PWA icon mark are all provisional. Real assets are a client
  deliverable (see Appendix C of the plan).
- **`@font-face` is not set up** — fonts are the system stack. `tokens.css` defines
  `--font-display`/`--font-body`/`--font-script` names but no actual font files are loaded yet.

## Commands

```bash
npm run dev          # dev server
npm run typecheck     # tsc -b, strict
npm run lint          # eslint . — must be 0 errors (1 informational react-hook-form warning is expected)
npm test              # vitest run — currently 45 tests, all in domain/lib logic
npm run build         # typecheck + vite build
npm run preview       # serve the production build (use this, not `dev`, to check real bundle behavior)
```

## Where things live

```
src/
├── app/              # router.tsx, layouts/ (Public, Admin), providers.tsx, routePrefetch.ts
├── design-system/
│   ├── tokens.css     # ALL custom CSS/keyframes live here — @theme colors, animations, rdp overrides
│   ├── primitives/    # Button, Card, Badge, Modal, Input/Select/Textarea, DataTable, FilterChip…
│   ├── motion/        # FloatingObject, PetShapes (bone/yarn/paw/fish SVGs), Reveal, CountUp
│   └── decorative/    # Icon (lucide + sprite.svg unifier), SectionHeading, Marquee, Blob, WavyDivider
├── domain/            # types.ts, schemas.ts (Zod), availability.ts (pure logic, tested)
├── data/
│   ├── ports.ts        # repository interfaces — the contract
│   ├── storage/        # driver.ts (Zod-validated localStorage+fallback), migrations.ts, seed.ts, keys.ts
│   └── repositories/   # local*Repository.ts implementations + index.ts (the swap point)
├── store/             # dataVersion.ts (reactivity), authStore.ts
├── lib/                # datetime, money, whatsapp (templates), search, businessHours, useLiveQuery, ics, phoneMask
├── features/
│   ├── home/ shop/ grooming/ clinic/ hotel/ gallery/
│   └── admin/{auth,dashboard,products,bookings,calendar}/
├── pwa/               # useInstallPrompt, InstallButton, IosInstallModal, useServiceWorkerUpdate
└── config/site.ts     # phone, address, hours, coords — placeholder values, edit before launch
```

WhatsApp message text lives in exactly one place: `src/lib/whatsapp.ts` (`whatsappTemplates`).
Never inline a WhatsApp message string in a component.
