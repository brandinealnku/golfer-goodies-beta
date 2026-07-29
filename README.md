# Golfer Goodies v0.2

## Three-sided marketplace foundation

Golfer Goodies is a fictional, course-operated marketplace demonstration with three connected experiences:

- **Golfer marketplace:** `#/discover`, contextual `#/course/:courseId`, `#/cart`, `#/checkout`, `#/orders`, `#/order/:orderId`, and `#/account` retain course-first discovery, verify-on-first-Add, one-course cart, no-payment checkout, and local tracking.
- **Course Partner portal:** `#/partner`, onboarding at `#/partner/join`, application/setup/preview routes, and `#/partner/course/:courseId` routes for Overview, Orders, Products, Inventory, Storefront, Fulfillment, Promotions, Analytics, Team, and Settings. Operational actions are course-scoped browser simulations.
- **Platform Administration:** `#/platform` plus Courses, Applications, Users, Orders, Payments, Disputes, Moderation, Reports, Platform Settings, and Audit Log routes. Administrator decisions, suspensions, and notes are fictional local simulations with audit records.

The shared typed foundation models storefront profiles and hours, inventory, six fulfillment types, promotions, payment instructions, customer messages, course-scoped orders with captured integer-cent prices, applications, suspensions, and audit records. The repository boundary is documented in [marketplace experience architecture](docs/architecture/MARKETPLACE_EXPERIENCE_FOUNDATION.md); manual journeys are in [three-sided marketplace QA](docs/testing/THREE_SIDED_MARKETPLACE_QA.md).

### Demo identities

Use Account to choose `demo-golfer@example.com`, `summit-owner@example.com`, `summit-manager@example.com`, `summit-catalog@example.com`, `summit-fulfillment@example.com`, `cedar-manager@example.com`, `no-course-access@example.com`, or `platform-admin@example.com`. Course capabilities derive from active per-course memberships. The deterministic platform administrator has a distinct platform role and does not gain course access through that role.

### Demo persistence and limitations

Marketplace foundation state is validated and versioned under `gg.marketplace.foundation.v1`. Corrupt or unsupported state safely recovers to fictional fixtures. **Reset demo marketplace** is available under `#/platform/settings`. All names, courses, applications, users, inventory, sales, and audit activity are fictional. No real application, verification, payment, refund, notification, moderation, analytics, or support action occurs. Connected implementations are unavailable until trusted services exist.

GitHub Pages publishes **demo mode only** using hash routes and relative assets. It never initializes Firebase or production services. Emulator mode remains local-only under `golfer-goodies-local`; no deployment command is part of this work.

### Development and verification

```text
npm ci
npm run dev:demo
npm run firebase:verify
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:pages
npm run test:rules
npm run test:emulators
npm run build
npx --no-install playwright install chromium
npm run test:browser
git diff --check
```

## v0.4 Phase 2 account and management slice

The React beta includes an explicit identity boundary, deterministic browser-local demo employees, Firebase Auth emulator sign-in, per-course memberships and capabilities, unverified course-access requests, and a first employee workspace for operations and catalog availability. Authorized published changes flow through the course-scoped marketplace repository to the golfer storefront. Demo changes stay in one browser and can be reset; emulator changes use local Firestore and trusted callable functions; connected accounts remain honestly unavailable until production onboarding is configured.

See [identity and management architecture](docs/architecture/IDENTITY_MEMBERSHIPS_AND_COURSE_MANAGEMENT.md), [employee QA](docs/testing/EMPLOYEE_STOREFRONT_QA.md), and [local test users](docs/development/LOCAL_TEST_USERS.md). This phase does **not** provide real employee verification, claim approval, production registration, uploads, payments, or live fulfillment. Existing carts retain captured prices when a catalog price changes; only newly added products use the new price.

Golfer Goodies is a fictional marketplace demonstration. The v0.1 beta is retained at the repository root and in `legacy/v0.1/`, but it is no longer deployed to GitHub Pages. Phase 3 adds a **local-only Firebase Emulator Suite foundation** to the React/Vite app in `apps/web`; no production Firebase project, deployment, real authentication workflow, real customer/course data, orders, Stripe, or payment processing exists.

## Course-first marketplace (Phase 2.5)

The React demo discovery experience lists participating fictional courses, not products. Selecting a course persists a course context and is the only way to load that course's publicly visible products. The repository contract is course-scoped: `getProductsForCourse(courseId)` enforces the rule before products reach components.

A selected, unverified course is **browse only**: prices, availability, and details are visible, but ordering controls remain blocked with an explanation. Simulated location confirmation, a fictional QR token, or a fictional course code can create a two-hour **Ordering Session** in local storage. Uncertain and outside-area simulated results direct users to non-location alternatives. This demonstration collects no location and provides no secure verification. An Ordering Session authorizes only its course, expires safely to browse menu, and can be ended by the user. Because no cart exists yet, an Ordering Session displays an honestly labeled planned-order control rather than pretending an item was added.

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

Demo mode uses the in-bundle fictional repository, performs no Firebase initialization, retains hash routes and relative assets, and remains suitable for static GitHub Pages. GitHub Pages builds the React application in demo mode and publishes only `apps/web/dist`. The retained root and `legacy/v0.1/` copies of v0.1 are compatibility references and are not part of the deployed artifact.

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

## v0.3 Phase 4A: course discovery

The React application now offers an intentional, one-time location action and a location-independent manual course search. Demo results are fictional; emulator results are deterministic. Connected mode calls the trusted `discoverGolfCourses` function only when `VITE_DISCOVERY_FUNCTION_URL` is configured. A Google Places key is never shipped to the browser. Discovered external courses remain separate from marketplace courses and cannot expose products or create course context. Availability requests are demonstrations only: they send no email and do not onboard a course.

Current limitations: there is no map, authentication, saved-course implementation, production onboarding, course claiming, or connected availability-request persistence. Live discovery requires Google Cloud/Firebase configuration described in `docs/development/GOOGLE_PLACES_SETUP.md`.

## Product Experience Reset (Phase 4A.2)

The React demonstration now supports a complete fictional golfer journey: intentional course discovery, course-scoped visual storefronts, simulated Ordering Session verification, a one-course local cart, fulfillment selection, no-payment demo checkout, and local order-status tracking. The compact responsive shell exposes only meaningful Home/Course, Orders, Account, and contextual cart destinations.

Cart and demo-order records are versioned, validated, stored only in the browser, and use integer cents. Demo mode does not call Google, Firebase, geolocation, payment, or a real course. Emulator mode retains its adapters; connected mode still provides discovery only and does **not** submit carts or orders. Images are repository-owned SVG illustrations. Authentication, real payment, course staff fulfillment, notifications, and production ordering remain intentionally out of scope.

Real-browser product journey smoke tests use the development-only Playwright test runner and its Chromium browser. Run `npx playwright install --with-deps chromium` once, then `npm run test:browser`; the runner starts the demo Vite app automatically. Playwright is limited to regression testing and is not shipped in the application bundle.

## v0.4 Phase 1: ordering eligibility

Golfers may browse a selected course storefront without verification. Verification is triggered only by an Add attempt, after quantity, modifier choices, and special instructions have been captured as a minimal pending ordering intent. Successful verification creates a course-scoped, two-hour **Ordering Session**, revalidates the intent against current course product data, and adds it automatically. Browsing and cart review remain available after expiration; adding or placing a demo order requires a current session.

Demo mode deterministically simulates location only after **Use my location** is chosen and supports fictional QR and course-code fallbacks. The browser adapter is isolated from product components and specifies high accuracy, a 10-second timeout, and no cached positions (`maximumAge: 0`). Precise coordinates exist only in memory for one verification call: they are not written to local storage, routes, logs, or analytics. Discovery location is separate and never establishes ordering eligibility. Emulator-ready accuracy geometry distinguishes clearly inside, boundary overlap, and clearly outside; radius fixtures must identify their source and do not claim property-boundary precision. Connected mode deliberately returns “not configured” until a trusted Firebase HTTPS/callable verification boundary exists; it never falls back to demo authorization.

Stored legacy `ActiveRound` records are read only for migration. Valid course-matching records retain their expiration and map to version 1 `OrderingSession` methods; expired records are not extended, and malformed, unsupported, or cross-course records safely become browse mode. Only the new context is subsequently written. Production geofencing, secure QR/code issuance, Firebase Authentication, course management, payments, real order submission, and production course-area data remain intentionally unavailable.

## Public landing and safe partner navigation

The public `#/discover` route is the golfer-first marketplace landing page: it explains the fictional marketplace, provides one manual/location/code/QR discovery module, shows deterministic course storefronts without requesting location, describes the golfer journey and partner value, and links discreetly to the Platform Administration demo. All public footer destinations are existing hash routes or in-page information. Metadata and the web manifest use repository-safe references for GitHub Pages.

Partner navigation derives course context only from active course memberships. Without one, `#/partner` shows Partner Home, onboarding/claim, identity selection, and marketplace exit links. With one, links use `/partner/course/:courseId`; incomplete `/partner/:section` aliases redirect to the active membership, invalid or unauthorized courses show an intentional access state, and unknown sections return a specific unavailable state. The navigation is prepared for multiple memberships with a labeled selector that preserves the current section. A platform role never grants course access.

Everything remains a browser-local fictional demonstration: onboarding does not submit, verification is simulated, no payment is collected, and no production service is connected. After an update, reload once; if an old installed shell persists, close open tabs and clear the site's storage/cache before reopening. Run the verification commands listed above, including the metadata/pages contract and Chromium journeys.
