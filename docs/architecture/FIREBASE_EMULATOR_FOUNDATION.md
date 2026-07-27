# Firebase Local Emulator Foundation

## Boundary and identity

Phase 3 uses the fictional, local-only project `golfer-goodies-local`. `.firebaserc`, browser configuration, Admin seed tooling, rules tests, integration tests, and Functions agree on that value. Guards refuse other project IDs. There is no production project, deployment target, service account, or secret.

## Services

`firebase.json` runs Authentication (9099), Firestore (8080), Functions (5001), Hosting (5000), Storage (9199), and Emulator UI (4000) in single-project mode. Hosting serves `apps/web/dist`; it is an emulator convenience, not deployment configuration. Functions use Node 22, strict TypeScript, Admin SDK, and second-generation callable APIs.

## Application modes and initialization

`demo` dynamically avoids the Firebase adapter and remains static and fictional. `emulator` dynamically imports `FirestoreMarketplaceRepository`, initializes the modular Web SDK centrally, and connects every SDK service once to loopback. `connected` rejects access because no real project is configured. UI components remain repository-agnostic.

## Repository and records

The Firestore adapter maps timestamps and Firebase documents at its boundary into shared UI types. Collections are `courses`, nested `categories`, `products`, and `promotions`, fixture-only `users`, and server-only `system/config` and `system/seedStatus`. Five courses contain 40 products, 40 categories, and five promotions. Prices are integer cents; timestamps are deterministic Admin `Timestamp` values.

## Seed, reset, and export

`scripts/seed-data.mjs` is authoritative. `seed-emulators.mjs` performs deterministic merge writes and idempotently creates/updates Auth fixtures. `reset-emulators.mjs` clears only recognized emulator endpoints and reseeds. Exports are optional local snapshots in ignored `emulator-export/`; start with `firebase emulators:start --import emulator-export` when intentionally testing an export.

## Security strategy

Firestore and Storage default to deny. Public reads require active, marketplace-visible parents and active/public children. Marketplace writes and system records are client-denied. Profiles are self-only, field allowlisted, and cannot contain role/admin fields. Storage allows small image uploads only to the authenticated user's own profile path; ordinary course/product uploads are denied. Explicit allow and denial tests run in the emulators.

## Tests and migration path

Unit/component tests remain independent. Rules tests use `@firebase/rules-unit-testing`; integration tests run inside `firebase emulators:exec` after deterministic seeding. CI installs Node 22 and Java 21 and never logs into Firebase. A later phase may add real identity behind membership records, but must retain demo mode, project guards, deny-first rules, converters, rollback, and negative tests. Production configuration and deployment require separate authorization.
