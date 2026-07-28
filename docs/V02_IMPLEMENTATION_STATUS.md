# Golfer Goodies v0.2 implementation status

**Updated:** 2026-07-27
**Current phase:** Phase 2.5 — Course Context and Order Eligibility UX
**Release posture:** v0.1 and Firebase-independent demo mode remain preserved. No Firebase service was deployed or connected to production.

## Phase 2.5 — Course context and eligibility UX

Completed in the React demo: course-only discovery, persistent selected-course context, repository-enforced course product scoping, browse-only ordering blocks, a persistent/expiring one-course Active Round, simulated-location confirmation, fictional QR and course-code verification, contextual golfer navigation/header, closed/paused/pickup-only presentations, accessible live announcements, and controlled invalid/empty states. The product UI does not import raw demo data.

Vitest coverage was added for discovery without products, required repository course IDs, cross-course isolation, browse-only controls, all three demonstration verification paths, invalid codes, one-course rounds, expiration, course changes, contextual navigation/header, announcements, and confirmation that browser geolocation is not called. Those dependency-based tests could not execute in this environment. The dependency-free contract suite did execute successfully; see the actual results below.

| Phase 2.5 check              | Actual result                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| Formatting                   | Passed: `npm run format:check`.                                                      |
| Dependency-free contracts    | Passed: two course-scoping and no-geolocation source guards.                         |
| Lint                         | Blocked: `npm ci` did not materialize package files; ESLint packages cannot resolve. |
| Typecheck                    | Blocked: `npm ci` did not materialize React, Node, Firebase, and test type packages. |
| Unit tests                   | Not runnable: `vitest` is absent.                                                    |
| Component tests              | Not runnable: `vitest` is absent.                                                    |
| Production build             | Not runnable: TypeScript dependencies and Vite are absent.                           |
| Browser screenshot/manual QA | Not runnable because the application dependencies are absent.                        |

Real geolocation, background tracking, secure QR validation, server-side eligibility, authentication, inventory, checkout, and payments remain deferred. Demo verification is explicitly not security.

### Revised Phase 3 data requirements

Any Firestore marketplace design must make course ownership mandatory on every product, expose only public products through a course-scoped repository/query, model course availability and ordering pauses separately from verification, and support server-authoritative, expiring, single-course eligibility. Categories must be course-owned or explicitly shared taxonomy. Connected carts/orders must store one immutable course ID and reject cross-course items. Future server validation must not trust the local Active Round, demo codes, or client clocks; real location must be consent-driven, minimized, never automatic, and retain QR/code alternatives. The Firebase-independent local-demo adapter must remain available.

## Baseline before Phase 3

| Check                                | Result                                                                           |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| `npm run format:check` in `apps/web` | Passed.                                                                          |
| `npm run lint`                       | Failed: Phase 2 dependencies were not installed; `@eslint/js` could not resolve. |
| `npm run typecheck`                  | Failed: React/Vite/Vitest modules and types could not resolve.                   |
| Unit/component tests                 | Failed to start: Vitest was unavailable.                                         |
| `npm run build`                      | Failed: required packages were unavailable.                                      |
| `npm install`                        | Blocked by environment: npm registry proxy returned HTTP 403.                    |

Phase 2 was therefore incomplete. Phase 3 changes preserve its architecture and add correct dependency declarations, but installation remains an external blocker.

## Phase 3 implementation

- Local-only `golfer-goodies-local` config covers Auth, Firestore, second-generation Functions, Storage, Hosting, and UI.
- Strict, deny-first Firestore and Storage rules plus explicit allow/denial suites exist.
- Deterministic guarded seed/reset/export/environment scripts define five fictional courses, 40 categories, 40 alcohol-free products, five promotions, and eight Auth fixtures.
- Demo repository stays dynamically Firebase-independent; emulator mode selects a typed Firestore adapter and centralized loopback SDK client; connected mode refuses configuration.
- Safe callable diagnostics and a development diagnostics route exist.
- Pull-request CI provisions Node 22 and Java 21, installs from lockfiles, runs quality/rules/integration/build checks, and performs no deployment.

## Final results

| Check                             | Actual result                                                                                                        |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Environment verification          | Node 24 and Java 25 detected; Firebase CLI unavailable because dependencies could not be installed.                  |
| Formatting                        | Passed with the available global Prettier.                                                                           |
| Lint                              | Not runnable: declared packages unavailable.                                                                         |
| Typecheck                         | Not runnable: declared packages unavailable.                                                                         |
| Unit tests                        | Not runnable: Vitest unavailable.                                                                                    |
| Component tests                   | Not runnable: Vitest unavailable.                                                                                    |
| Firestore Rules tests             | Not runnable: Firebase CLI/rules testing package unavailable.                                                        |
| Storage Rules tests               | Not runnable: Firebase CLI/rules testing package unavailable.                                                        |
| Emulator integration              | Not runnable: Firebase CLI/Admin/Web SDK unavailable.                                                                |
| Production build                  | Not runnable: Vite/Firebase packages unavailable.                                                                    |
| Demo/emulator browser smoke tests | Not run: application dependencies/browser stack unavailable.                                                         |
| v0.1 byte comparison              | Passed; root and `legacy/v0.1` application snapshots remain identical.                                               |
| Static safety scans               | Passed for project-ID consistency, root-relative URLs, Stripe/service-account/private-key patterns, and JSON syntax. |

Phase 3 is **implemented but not verified complete**. Do not claim the emulators, rules, integrations, build, or runtime work until dependencies install and all checks execute successfully.

## Deferred and known issues

- Restore npm registry access, run `npm install`, commit the registry-generated root lockfile, and execute every command above.
- Validate seed/reset idempotency and all six emulator services in a real local stack.
- Run keyboard, screen-reader, 200% zoom, reduced-motion, responsive overflow, diagnostics, error/retry, and repository-subpath browser QA.
- Authentication UX, guest identity, linking, memberships, claims, App Check, production config/deployment, orders, inventory, real uploads, Stripe, and payments remain deferred.

## Exact recommended Phase 4 task

> **Phase 4: Authentication, Guest Identity, and Account Linking** — Begin only after every deferred Phase 2/3 quality, rules, emulator integration, build, demo smoke, emulator smoke, and accessibility check passes. Preserve v0.1, Firebase-independent demo mode, `golfer-goodies-local` guards, repository adapters, deterministic fictional fixtures, and deny-first rules. Implement emulator-only golfer identity lifecycle, explicitly modeled guest identity, account creation/sign-in/sign-out/recovery test flows, safe guest-to-account linking with conflict handling, membership records without client-assigned privileged roles, consent/deletion placeholders, and positive and negative Auth/Firestore/browser tests. Do not configure production Firebase, deploy services, add social providers, custom privileged claims, Stripe, checkout, real orders, or real user data.

## v0.3 Phase 4A increment

Implemented a typed course-discovery boundary, fictional demo and deterministic emulator providers, a server-mediated Google Places provider, provider-ID marketplace matching, intentional one-time location UX, manual fallback, external-course/request demonstration, accessible status messaging, and provider attribution. Connected discovery remains configuration-dependent; availability requests are not production submissions. No authentication, claiming, cart, checkout, orders, inventory, payments, or live map was added.

Recommended next phase: **Phase 4B: Authentication, Guest Identity, and Account Linking**.

## Phase 4A.2 — Product Experience Reset

Implemented a consumer-facing responsive shell, visual discovery and storefront, progressive Active Round verification, product-detail sheet, versioned one-course cart, deterministic no-payment checkout, and local demo order tracking. Demo ordering is intentionally browser-local in every mode; connected discovery does not imply connected fulfillment.
