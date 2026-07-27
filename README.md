# Golfer Goodies

**Order the course. Keep playing.**

This repository contains two deliberately separate, fictional demonstrations. The dependency-free **v0.1 beta remains the compatibility baseline**, while `apps/web/` introduces the **v0.2 Phase 2 React, TypeScript, and Vite foundation**. Neither application connects to authentication, Firebase, Stripe, a payment processor, real inventory, or a backend.

## Preserved v0.1 beta

The original beta remains unchanged at the repository root for the current GitHub Pages workflow and is also snapshotted under `legacy/v0.1/` with its HTML, CSS, JavaScript data service, fixtures, PWA files, icon, and dependency-free tests. Run it with:

```bash
python3 -m http.server 8000
# http://localhost:8000/ or http://localhost:8000/legacy/v0.1/
```

Its roles, localStorage workflows, simulations, limitations, and tests remain documented by the Phase 1 assessment. The snapshot is a compatibility reference, not a production application.

## v0.2 foundation

Phase 2 supplies a strict TypeScript React application with hash routing, role-separated layouts, design tokens and dependency-free UI primitives, typed fictional data behind `MarketplaceRepository`, a working searchable Discover screen, course/product details, honest placeholders, safe environment validation, and a static-shell-only PWA foundation.

### Structure

- `apps/web/src/app`, `routes`, `layouts` — application composition, hash routes, and golfer/partner/platform shells.
- `apps/web/src/components` — accessible foundational UI components.
- `apps/web/src/config` — typed `demo | emulator | connected` mode validation.
- `apps/web/src/data`, `types`, `utils` — repository abstraction, fictional seed data, shared domain types, and formatting.
- `apps/web/src/features` — working marketplace/course screens and future-phase placeholders.
- `apps/web/public` — subpath-relative manifest, icon, and conservative application-shell service worker.
- `legacy/v0.1` — preserved static beta snapshot.

Empty feature directories establish future module boundaries without claiming implementations.

## Prerequisites and installation

Use Node.js 20.19+ (or 22.12+) and npm 10+. From the v0.2 app:

```bash
cd apps/web
npm install
```

The lockfile is committed. This environment could not reach the npm registry, so dependency installation and all package-driven checks must be rerun where registry access is available.

## Development and application modes

```bash
cd apps/web
cp .env.example .env.local
npm run dev
```

`VITE_APP_MODE` accepts `demo`, `emulator`, or `connected`; an absent local value defaults safely to `demo`, and invalid values stop startup rather than becoming connected. Only `demo` behavior exists in Phase 2. `emulator` and `connected` are typed reserved values, not working integrations. The non-production UI shows an environment badge. `.env.example` contains no secrets.

Hash routing keeps refresh/direct navigation compatible with static hosts and repository subpaths. All app assets, manifest entries, service-worker registration, and Vite build URLs are relative (`base: './'`).

## Checks and production build

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:unit
npm run test:components
npm test
npm run build
```

Tests cover mode validation, repository data, search, cards/details, USD formatting, the environment badge, role navigation, accessible form labels, Not Found handling, and hash-link subpath behavior. `dist/` is the build artifact. Phase 2 did not deploy it or replace the root v0.1 Pages artifact.

## Current functionality

- Five stable fictional course archetypes and fictional products load through a repository interface.
- Discover searches course name, city, or state and presents availability, fulfillment, estimates, and verified status in text.
- Course details present fictional products, categories, availability, preparation estimates, and USD prices.
- Cart, checkout, order tracking, account, partner operations, and platform operations are polished placeholders. Disabled Add controls explicitly say they are planned.
- Golfer, partner, and platform navigation are separated. The shared foundation includes skip navigation, landmarks, labels, focus styles, reduced motion, responsive grids, and 48px golfer targets.
- The PWA manifest is install-oriented; the minimal worker caches only a relative static shell. It does not cache private data or support offline order submission.

## GitHub Pages and known limitations

The existing workflow still deploys v0.1 from the repository root. A future reviewed workflow must build and select a v0.2 artifact; no deployment was performed here. Hash routing avoids server rewrites, while `base: './'` preserves project-site paths. Installation/PWA behavior requires localhost or HTTPS.

Phase 2 has no auth, authorization, tenancy, real cart/checkout/order, Firebase, Stripe, live availability, geolocation, notifications, backend security, or production readiness. Emulator and connected modes are not implemented. Automated browser accessibility, screen-reader, 200% zoom, viewport overflow, and service-worker lifecycle audits remain release QA. npm registry access was unavailable during this change, so package checks/build are recorded as environment-blocked rather than passed.

## Next implementation phase

**Phase 3: Firebase Emulator Foundation** should introduce only emulator-backed platform/data boundaries, tenant-safe schema and rules tests, converters, repeatable fictional seeding, transactional/idempotent operations, and migration rollback while retaining demo mode. It must not configure production or Stripe.
