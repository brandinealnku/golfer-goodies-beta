# Golfer Goodies v0.2 implementation status

**Updated:** 2026-07-27
**Current phase:** Phase 2 — React, TypeScript, and Vite foundation implemented; dependency-backed verification blocked by registry access
**Release posture:** v0.1 remains the deployed/static compatibility baseline. v0.2 is a local demo foundation and was not deployed.

## Phase 2 verification status

| Deliverable | Status | Evidence / limitation |
| --- | --- | --- |
| v0.1 preservation | Complete, statically verified | Root beta retained and an exact application/PWA/data/test snapshot copied to `legacy/v0.1/`; file comparisons passed. Real browser regression was not available. |
| React/Vite architecture | Implemented, build pending | Modular `apps/web` foundation, strict TS config, relative Vite base, HashRouter, role layouts, feature boundaries, and shared components exist. npm registry returned HTTP 403, so packages could not be installed and the app/build could not be executed here. |
| Environment modes | Implemented, tests pending | Typed `demo`, `emulator`, `connected` validation defaults absent values to demo and rejects invalid values. Only demo repositories work. |
| Demo marketplace | Implemented, tests pending | Five fictional archetypes and products are available only through `MarketplaceRepository`; Discover search and course detail screens consume it. |
| Routes/layouts/placeholders | Implemented, tests pending | Required golfer, partner, and platform routes use hash routing; unknown routes have a useful Not Found view. Future behavior is labeled as unavailable. |
| Design/accessibility foundation | Implemented, manual audit deferred | Tokens, semantic primitives, skip link, landmarks, labels, focus, reduced motion, status text, responsive layout, and 48px controls exist. Browser/AT, 200% zoom, and viewport testing remain deferred. |
| PWA | Partial by design | Relative manifest/icon and a minimal same-origin static-shell service worker exist. No private data, messaging, or offline orders are cached/supported. Browser lifecycle testing is deferred. |
| Firebase/Stripe/backend/deployment | Correctly deferred | No packages, configuration, services, secrets, or deployment were added. |

## Checks attempted in Phase 2

| Command | Actual result |
| --- | --- |
| `npm install` (`apps/web`) | **Blocked:** npm registry connection returned HTTP 403; dependencies were not installed. |
| `npm run format:check` | **Passed:** Prettier reported all v0.2 files matched style. |
| `npm run lint` | **Not runnable:** dependency installation was blocked. |
| `npm run typecheck` | **Not runnable:** dependency installation was blocked. |
| `npm run test:unit` | **Not runnable:** dependency installation was blocked. |
| `npm run test:components` | **Not runnable:** dependency installation was blocked. |
| `npm test` | **Not runnable:** dependency installation was blocked. |
| `npm run build` | **Not runnable:** dependency installation was blocked. |
| v0.1 snapshot `cmp` loop | **Passed:** preserved application, data, PWA, and test files match their root counterparts. |
| JSON parsing for manifests/data/package files | **Passed.** |
| targeted root-relative URL scan | **Passed:** no root-relative `src`, `href`, `start_url`, `scope`, or service-worker registration was found in v0.2 application files. |
| forbidden integration/package scan | **Passed:** no Firebase, Stripe, secret key, or live integration dependency/configuration was introduced. |

Package-based items are not marked verified. Phase 2 cannot be declared fully verified until install, format, lint, typecheck, Vitest suites, production build, local runtime smoke testing, and browser accessibility/subpath checks pass in an environment with package registry/browser access.

## Deferred work

- Install the pinned dependencies and regenerate/validate the lockfile against the registry; run every configured check.
- Browser smoke test every required hash route from a repository subpath, refresh behavior, Discover search, course detail, role navigation, dialog focus, PWA installation/update/offline shell, keyboard use, 200% zoom, reduced motion, and 320–1440px overflow.
- Keep root v0.1 deployment unchanged until a reviewed artifact strategy and equivalent regression evidence exist.
- Firebase, Authentication, Firestore, Cloud Functions, App Check, production configuration, Stripe, real carts/orders/payments, geolocation, notifications, and pilot deployment remain out of scope.

## Exact recommended Phase 3 task

> Complete only **Phase 3: Firebase Emulator Foundation** for Golfer Goodies v0.2. First finish every deferred Phase 2 verification and do not proceed unless formatting, lint, strict typecheck, unit/component tests, production build, local runtime, preserved v0.1 regression, repository-subpath routing, and foundational accessibility checks pass. Preserve `legacy/v0.1/` and the explicit fictional `demo` mode. Add Firebase dependencies and configuration only for a local Emulator Suite boundary; do not configure or deploy a production Firebase project, add Stripe, accept real data, or claim backend readiness. Define versioned, tenant-aware domain converters and repository interfaces for users, memberships, courses, products, promotions, orders, order events, applications, rewards, and audit records. Implement deny-by-default Firestore/Storage rules and Emulator Suite tests for tenant isolation, field validation, role membership, cross-tenant denial, transactional inventory/order operations, legal order transitions, retries, and idempotency. Add repeatable fictional fixture seeding, indexes, configuration validation, migration/rollback documentation, and export/restore procedures. Keep privileged credentials outside the client and repository, retain the demo adapter as the default local fallback, update README/AGENTS/status honestly, record exact commands and results, and do not deploy.
