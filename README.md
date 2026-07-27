# Golfer Goodies v0.2

Golfer Goodies is a fictional marketplace demonstration. The unchanged v0.1 beta remains at the repository root and in `legacy/v0.1/`. Phase 3 adds a **local-only Firebase Emulator Suite foundation** to the React/Vite app in `apps/web`; no production Firebase project, deployment, real authentication workflow, real customer/course data, orders, Stripe, or payment processing exists.

## Course-first marketplace (Phase 2.5)

The React demo discovery experience lists participating fictional courses, not products. Selecting a course persists a course context and is the only way to load that course's publicly visible products. The repository contract is course-scoped: `getProductsForCourse(courseId)` enforces the rule before products reach components.

A selected, unverified course is **browse only**: prices, availability, and details are visible, but add-to-cart controls remain blocked with an explanation. Simulated location confirmation, a fictional QR token, or a fictional course code can create a two-hour **Active Round** in local storage. This demonstration collects no location and provides no secure verification. An Active Round authorizes only its course, expires safely to browse-only mode, and can be ended by the user.

The intended cart rule is one course per cart: products must never carry across course changes. The current React demo has no functional cart or checkout, so there are no cart contents to preserve or clear. Closed and paused courses remain browseable but cannot become order-ready. Real geolocation, QR security, server eligibility, inventory reservation, connected ordering, checkout, authentication, and payments are not implemented.

## Prerequisites

- Node.js 22 and npm 10+
- Java 21 (a supported runtime for the Firebase emulators)
- Firebase CLI installed from the committed `firebase-tools` dependency

```text
npm install
npm run firebase:verify
```

The verifier checks Node, Java, and the local CLI and reports actionable errors; it never modifies system Java.

## Local project and services

The only Firebase identity is fictional `golfer-goodies-local`.

| Emulator       | Port |
| -------------- | ---: |
| UI             | 4000 |
| Hosting        | 5000 |
| Functions      | 5001 |
| Firestore      | 8080 |
| Authentication | 9099 |
| Storage        | 9199 |

No Firebase login or production credential is needed.

## Demo mode (Firebase-independent)

```text
npm run dev:demo
```

Demo mode uses the in-bundle fictional repository, performs no Firebase initialization, retains hash routes and relative assets, and remains suitable for static GitHub Pages. The root Pages workflow still serves v0.1.

## Complete local emulator workflow

```text
npm run build
npm run firebase:emulators
# in a second terminal
npm run firebase:seed
npm --workspace @golfer-goodies/web run dev -- --mode emulator
```

Open the web development URL shown by Vite, diagnostics at `#/dev/emulators`, or Emulator UI at `http://127.0.0.1:4000`. Emulator mode connects Auth, Firestore, Functions, and Storage only to loopback. If unavailable, the UI provides a safe error rather than raw Firebase details. Connected mode intentionally reports that it is not configured.

## Seed, reset, import, and export

```text
npm run firebase:seed
npm run firebase:reset
npm run firebase:export
firebase emulators:start --project golfer-goodies-local --import emulator-export
```

The deterministic scripts are authoritative. They refuse unknown projects, seed eight fictional `example.com` users idempotently, and create five courses, 40 categories, 40 alcohol-free products, and five promotions. Reset clears local Auth/Firestore/Storage and reseeds. Generated exports are ignored and optional. Local-only user credentials are documented in `docs/development/LOCAL_TEST_USERS.md`.

## Checks

```text
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:rules
npm run test:emulators
npm run test:all
npm run build
```

Rules tests cover public active records, hidden/draft/paused records, immutable marketplace data, self-only allowlisted profiles, privilege escalation denial, image MIME/size/path restrictions, and course/product upload denial. Emulator integration covers local clients, seed status, courses/products, missing records, and the health function. CI uses Node 22, Java 21, the local project ID, and no login or deployment.

## Architecture and security

React components use `MarketplaceRepository`; only the Firestore adapter queries Firebase. The centralized modular client connects once under emulator mode. Callable second-generation Functions expose safe local diagnostics only. Firestore and Storage rules default to deny. Seed/system writes use the Admin SDK only inside guarded local scripts. See `docs/architecture/FIREBASE_EMULATOR_FOUNDATION.md`.

The app retains semantic landmarks, keyboard focus, labels, live status, reduced motion, responsive layouts, accessible loading states, and safe error messaging. Manual assistive-technology and viewport QA remains required.

## Troubleshooting and limitations

Run `npm run firebase:verify` first. A refused seed indicates missing emulator host variables or the wrong project. Port conflicts require stopping the conflicting process; do not change only one client/config value. Build before starting Hosting Emulator. The diagnostics route is a development tool and reveals no tokens or secrets.

Phase 3 does not implement sign-in UI, account linking, claims, memberships, privileged course writes, orders, inventory transactions, uploads UI, App Check, notifications, production projects, deployment, Stripe, or payments. Firebase client identifiers are local placeholders, not secrets. Never use the test password outside local emulators.
