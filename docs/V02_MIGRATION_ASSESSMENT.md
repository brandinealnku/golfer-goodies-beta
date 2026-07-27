# Golfer Goodies v0.2 migration assessment

**Assessment date:** 2026-07-27
**Scope:** Phase 1 inspection and planning only. No framework migration, Firebase or Stripe configuration, redesign, deployment, or application behavior change was performed.

## Executive assessment

Golfer Goodies v0.1 is a dependency-free, static single-page demonstration that is intentionally usable from a GitHub Pages repository subpath and directly from `file:` URLs. It has a compact but tightly coupled rendering layer, a shared persistence/data module, checked-in fictional baseline records, local-only role and commerce simulations, an offline shell, a browser test page, and a Pages deployment workflow.

The safest v0.2 path is incremental. Preserve the static beta as a documented local-demo reference while introducing seams around data access, identity, authorization, order transitions, payments, and notifications. Do not begin with a React rewrite: the principal risks are tenancy, authorization, transactional integrity, payment lifecycle, and data migration rather than view technology.

## Repository inventory examined

Every tracked/non-Git file present during the assessment was read or inspected:

- Repository guidance and documentation: `AGENTS.md`, `README.md`.
- Entry points and install shell: `index.html`, `404.html`, `manifest.webmanifest`, `service-worker.js`, `assets/icons/icon.svg`, `.gitkeep`.
- Application implementation: `assets/js/app.js`, `assets/js/data-service.js`, `assets/js/baseline.js`, `assets/css/styles.css`.
- Fictional baseline collections: `data/courses.json`, `data/products.json`, `data/orders.json`, `data/users.json`, `data/promotions.json`, `data/course-applications.json`, `data/reviews.json`, `data/rewards.json`.
- Tests: `tests/index.html`, `tests/tests.js`.
- Deployment: `.github/workflows/deploy-pages.yml`.
- Git metadata relevant to history/configuration: current status, branch, recent commits, remotes, and tracked file list. The `.git` object database itself was not treated as application source.

## Current architecture

### Runtime and UI

- `index.html` is the shared semantic shell. It supplies navigation, mobile navigation, footer, role dialog, offline status, polite live region, and a single `<main>` rendering target.
- `assets/js/app.js` is a native ES module with top-level initialization. It owns route normalization, template-string views, delegated DOM events, role-specific dashboards, filtering, cart and checkout interactions, staff order transitions, administrative editing, live announcements, online/offline UI, and service-worker registration.
- Rendering is full-view replacement through `main.innerHTML`. Application state is refreshed from the data service at render time. There is no component framework, build step, package manifest, bundler, server runtime, or third-party client dependency.
- `assets/css/styles.css` contains the entire responsive design system, including tokens, grids, cards, operational tables/boards, mobile navigation, focus indicators, and reduced-motion rules. A later “2026 marketplace refinement” section overrides some original tokens and components rather than replacing them.

### Routing and GitHub Pages behavior

- The app is a hash-routed SPA. Normalized public routes include `#/discover`, `#/course/:id`, `#/cart`, `#/checkout`, `#/order/:id`, and account/partner/platform aliases. Internal values also include `market`, `courses`, `tracking`, `dashboard`, `course:<id>`, and `track:<id>`.
- Unknown routes render the beta information view rather than a dedicated not-found view.
- `404.html` redirects a project Pages path into the repository root with a `?route=` parameter. The application does not read that query parameter, so the recovery page returns a visitor to the app but does not restore the requested nested route. Hash URLs do not normally require server rewrites.
- Application, test, manifest, icon, data, and service-worker references are relative. This is essential for repository-subpath hosting and direct-file fallback.

### State management and persistence

- `assets/js/data-service.js` is the shared persistence boundary. It loads JSON using relative fetches, falls back to `BASELINE` for `file:` or fetch failure, reads/writes state, dispatches `gg-state`, manages roles, filters/sorts records, computes totals, enforces a single-course cart, creates orders, decrements inventory, adds reward points, and changes order status.
- One mutable localStorage document under `gg-beta-state-v4` contains `schemaVersion: 4`, all eight baseline collections, and cart state. `gg-beta-state-v3` is accepted as a legacy source and removed during a version mismatch migration. `gg-beta-role` separately stores the selected demonstration role.
- If no saved state exists, the service initializes from checked-in data and creates a cart with course, items, tip, fulfillment, and location fields. `Reset Demo` removes the v4 state and role and then rebuilds from the baseline.
- A version mismatch merges saved course and product records by stable ID, but other saved collections override their baseline counterparts through object spread. This is a limited demo migration, not a general schema migration system.
- State is a browser-local mutable snapshot. There is no concurrency control, validation layer, tenancy boundary, server authority, audit log, rollback, cross-device sync, or protected secret.

### Baseline data model

- The checked-in baseline has 5 courses, 40 products, 1 order, 1 user, 3 promotions, 2 course applications, 2 reviews, and 1 rewards object.
- Stable string IDs relate products, promotions, reviews, and orders to courses; orders and rewards relate to the demo user. Course records include listing metadata, fulfillment flags, categories, daily hours, promotion IDs, and fictional contact addresses.
- `assets/js/baseline.js` duplicates the JSON collections as an importable object for direct-file and failed-fetch operation. Maintaining both representations creates drift risk; no generation or equality check is currently present.
- Checkout stores submitted demo contact fields in the new local order. Payment options are labels only; no card fields, processor, or network transaction exist. “Current location” is also a labeled simulation and does not call geolocation.

### PWA implementation

- `manifest.webmanifest` uses relative `start_url`, scope, and SVG icon paths; it requests standalone display and describes a simulated marketplace.
- The service worker registers only outside `file:`. It precaches the app shell plus every JSON collection in cache `golfer-goodies-v2`, removes other named caches on activation, serves cache-first responses, opportunistically caches fetched GET responses, and falls back to `index.html` after a fetch failure.
- The implementation has no install UI, update prompt/version coordination, cache size/expiry policy, navigation-specific strategy, explicit response validation, or offline mutation queue. The broad HTML fallback may return HTML for a failed non-navigation GET.
- Offline and install behavior were inspected statically but not verified in a real browser during this assessment.

### Accessibility and responsive behavior to retain

- Existing foundations include landmarks, skip link, headings, native form controls and labels, a native dialog, `aria-expanded`, `aria-pressed`, progress labels, polite status announcements, visible `:focus-visible`, 44–48 pixel control sizing, reduced-motion behavior, scroll-contained boards/tables, and responsive mobile navigation.
- These are implementation features, not proof of WCAG conformance. No assistive-technology, keyboard-only, zoom, color-contrast, or viewport matrix was executed in this environment.

### Tests

- `tests/index.html` is a dependency-free browser runner that imports `tests/tests.js` and reports into an accessible ordered list and live summary.
- The suite contains 17 checks covering baseline size, course search/sort/archetypes/filters, product filtering, currency, cart arithmetic, multivendor blocking, order creation, status synchronization, hours/product/role persistence, reset, relative test-page URLs, and a small set of test-page label/landmark checks.
- The tests mutate and reset localStorage. They do not cover route normalization, most event-driven workflows, checkout validation, authorization, service-worker behavior, 404 recovery, baseline/JSON parity, data validation, error states, keyboard interaction, or visual/responsive behavior.
- The `test` helper is synchronous, while the “Reset restores baseline records” callback is declared `async`. Its returned promise is not awaited; a rejection after an awaited operation would not be counted correctly. It happens to assert synchronously after `DS.reset()` in the current fallback path, but the runner design should be corrected before relying on asynchronous integration tests.

## Commands run and actual results

| Command | Result |
| --- | --- |
| `find .. -name AGENTS.md -print` | Found one applicable file: `./AGENTS.md`. |
| `find . -type f -not -path './.git/*' -print \| sort` | Enumerated 24 repository files before this assessment added documentation. |
| `wc -l $(find . -type f -not -path './.git/*' \| sort)` | Counted 1,594 lines across the original repository files (minified files account for unusually long physical lines). |
| `cat`/`sed` inspection of every file listed above | Completed; long/minified source was additionally split for review, and all JSON was parsed for structural summaries. |
| `git status --short --branch` | Clean working tree on branch `work` before edits. |
| `git log -5 --oneline --decorate` | Inspected five most recent commits; HEAD was `0363b31`. |
| `git remote -v` | Produced no configured remotes. |
| `git branch -vv` | Confirmed current branch `work` at `0363b31`. |
| `node /tmp/run-golfer-tests.mjs` | **17 passed, 0 failed.** This ran the existing `tests/tests.js` unchanged with a temporary Node DOM/localStorage shim because no browser executable is installed. It verifies data-service logic and runner assertions, not real browser DOM, service-worker, accessibility, or PWA behavior. |
| `node --check assets/js/app.js && node --check assets/js/data-service.js && node --check assets/js/baseline.js && node --check service-worker.js && node --check tests/tests.js` | Passed with no syntax errors. |
| `python3 -m json.tool manifest.webmanifest` and `python3 -m json.tool data/*.json` | All manifest/data JSON parsed successfully. |
| `rg -n '(?:src\|href)="/' --glob '*.html' --glob '*.webmanifest' --glob '*.js' .` | No root-relative HTML `src`/`href` references found. This is a targeted scan, not a complete URL correctness proof. |

## v0.1 components and workflows to preserve

Preserve these as compatibility requirements until a verified replacement exists:

1. **Static/local demo mode:** no-build operation from GitHub Pages and baseline fallback when opened through `file:` or when JSON fetches fail.
2. **Repository-subpath-safe navigation/assets:** relative URLs, hash routing, manifest scope/start URL, test links, service-worker registration, and cached resource paths.
3. **Marketplace discovery:** featured venues/products/promotions, course search, filters, sorting service, course storefronts, category filtering, availability, minimum order, fulfillment, ratings, and fictional-distance disclosures.
4. **Single-course commerce flow:** add/merge items, explain and confirm course switching, cart quantity/removal/clear, fulfillment/location/tip selection, fee/tax totals, checkout validation, demo order creation, inventory decrement, reward accrual, and tracking.
5. **Role-separated demonstrations:** golfer account/history/rewards/preferences; course staff queue, estimates, runner/notes, rejection and ordered fulfillment updates; course admin listing/catalog/inventory/hours/promotions/analytics; platform application and marketplace controls.
6. **Shared persistence boundary:** all persisted application access through `assets/js/data-service.js`, stable IDs, schema/version awareness, reset behavior, and a safe migration path for existing `gg-beta-state-v4` users.
7. **Accessibility/responsive foundations:** semantic shell, labels, keyboard-native controls, visible focus, live announcements, dialog semantics, reduced motion, mobile controls, and scroll containment.
8. **PWA shell and truthful simulation language:** install metadata, offline status/shell, fictional records, no alcohol, no asserted authentication/payment/location/fulfillment integrations, and clear localStorage/privacy warnings.
9. **Dependency-free regression suite and checked-in fixtures:** retain the current checks while expanding coverage around each extracted boundary.

## Risks and migration constraints

### Highest priority

- A client-selected role is not authentication or authorization. It must never be translated directly into production access.
- Local order, inventory, reward, course, and application updates are not transactional or trustworthy. Production writes need server-authoritative validation, tenant isolation, idempotency, and auditability.
- Payment UI is simulation only. Stripe secret operations and webhook verification must live in trusted server code; no secret may enter this repository's client bundle.
- Existing browser state can contain locally entered contact details. Any migration/import plan must be opt-in, validated, minimized, and explicit about retention; silently uploading localStorage would be inappropriate.

### Architecture and quality

- `app.js` combines routing, rendering, mutations, and event wiring in one minified-style file. Extract boundaries with characterization tests before changing rendering technology.
- JSON and `baseline.js` duplicate the same data. Add a deterministic generator or parity test before editing fixtures.
- The service worker needs explicit navigation/static/data strategies and update tests before v0.2 resources are added.
- Test coverage is broad for a small beta but shallow for accessibility, routing, error handling, migration, and asynchronous behavior. A real browser test path is required before claiming those behaviors are verified.
- Deployment Actions are pinned only by version tags, upload the entire repository, and run no test job before deployment. Production evolution should pin trusted actions by commit SHA, exclude non-site material where practical, and require quality gates.

## Phase 1 decision

No application migration should occur in Phase 1. The v0.1 beta remains the behavioral baseline. Phase 2 should establish contracts and characterization coverage first, without React, Firebase, Stripe, or visual redesign.

## Recommended Phase 2 task

**Create a dependency-free v0.2 foundation and compatibility test harness.** Document route, repository-subpath, storage-schema, data-entity, role/permission, and order-state contracts; fix the test runner so it awaits asynchronous tests; add deterministic baseline JSON/parity validation and browser automation for the preserved discovery → storefront → cart → checkout → staff update → tracking journey; then introduce interface boundaries in `data-service.js` for local demo repositories without changing visible behavior. This supplies evidence and seams needed for a later Firebase emulator phase while keeping the current beta deployable.
