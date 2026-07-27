# Golfer Goodies Beta

**Order the course. Keep playing.**

Golfer Goodies is a static, mobile-first demonstration of a third-party marketplace connecting golfers with participating fictional courses. Food, nonalcoholic drinks, gear, essentials, services, offers, fulfillment, and order operations are represented without pretending that a live commerce system exists.

## Target users and roles

- **Golfer:** searches and filters courses, browses storefronts, builds a single-course cart, places and tracks a demo order, and views rewards and history.
- **Course Admin:** edits a listing, catalog, inventory, availability, hours, delivery settings, promotions, and demonstration analytics.
- **Course Staff:** operates a tablet-friendly status board, assigns runners, estimates time, rejects orders, and updates fulfillment.
- **Platform Admin:** reviews applications, changes approval status, features or activates courses, and views simulated GMV and commission.

The role switcher is a convenience, not authentication. Every record is fictional.

## Beta capabilities

Five distinct fictional venues and 40 products power a marketplace home, functional search and filters, reusable course storefront, localStorage cart, demonstration checkout, synchronized tracking/staff queue, golfer profile and rewards, course administration, and platform controls. One course per cart is enforced. Fees, tax, tip, inventory decrement, reward points, order number, and estimated arrival are simulated. Alcohol is not offered.

## Run the demo

Opening `index.html` directly works: the shared data service uses its packaged baseline fallback because browsers generally block `fetch()` for `file:` URLs. For the complete service-worker/PWA experience, serve the repository:

```bash
python3 -m http.server 8000
# open http://localhost:8000/
```

Choose **Role Demo** in the header and select a view. Use **Reset Demo** there to remove application localStorage and restore packaged records. The dependency-free tests modify and reset demo storage; do not run them while preserving manual demo edits.

## Marketplace experience

The compact Discover view puts course search and nearby participating venues before long-form education. Each card communicates verified status, fictional distance, rating, order availability, fulfillment methods, minimum, and featured offer. Storefronts retain course identity inside the shared marketplace shell. Hash routes such as `#/discover`, `#/course/c1`, `#/cart`, `#/checkout`, and `#/order/o1` normalize to the static SPA without server rewrites.

**Round Mode is a roadmap limitation in this revision:** the current beta has outdoor-sized mobile controls and a persistent cart action, but does not yet offer a dedicated, persisted reduced-content Round Mode. Partner roles remain separated behind the discreet Demo menu; course staff, course administration, and platform administration use role-adapted operational views rather than golfer navigation.

## Repository structure

- `index.html`, `404.html` — SPA entry and subpath-safe recovery.
- `assets/css/styles.css` — responsive visual system and reduced-motion handling.
- `assets/js/app.js` — semantic UI and role workflows.
- `assets/js/data-service.js` — versioned state, baseline loading, cart, orders, filtering.
- `assets/js/baseline.js` — file-protocol fallback generated from the demo records.
- `data/*.json` — stable related course, product, order, user, promotion, application, review, and reward records.
- `manifest.webmanifest`, `service-worker.js`, `assets/icons/` — install metadata and offline shell.
- `tests/` — browser-based dependency-free test runner.
- `.github/workflows/deploy-pages.yml` — official GitHub Pages artifact deployment.

## Data model

Stable IDs relate products, promotions, reviews, and orders to courses; orders also relate to a user. The single `gg-beta-state-v4` localStorage document includes a schema version, non-destructive v3-to-v4 baseline migration, and working copies of all JSON collections. `gg-beta-role` stores the role. A version mismatch safely reinitializes the demo. Admin, staff, cart, tracking, rewards, and platform screens read and write through the shared service.

## Tests and current verification

Open `tests/index.html` under the local server. The suite checks baseline loading, course/product filtering, course sorting, five course archetypes, currency, cart math, multivendor blocking, order creation, tracking synchronization, hours and availability persistence, role persistence, reset, relative test-page assets, and accessibility labels.

Automated checks completed for this revision are recorded in the commit/PR summary. Static syntax and URL scans do not replace testing on the complete browser/device matrix.

### Manual QA checklist

- [ ] At 320, 375, 430, 768, 1024, and 1440 CSS pixels, verify no page-level horizontal overflow.
- [ ] Browse each course; search and select multiple product categories.
- [ ] Add from another course and verify the clear-and-switch explanation.
- [ ] Change quantities, fulfillment, simulated location, tip, and submit checkout.
- [ ] Change the new order through every staff status and verify tracking after each step.
- [ ] Edit products and every weekday setting; reload and verify persistence.
- [ ] Change application/course controls; reload and verify persistence.
- [ ] Navigate all controls with keyboard only; verify focus, dialog close, labels, and announcements.
- [ ] Enable reduced motion, zoom to 200%, and test a mobile screen reader.
- [ ] Test offline after one successful HTTPS/localhost load; verify the offline notice.
- [ ] Reset and confirm baseline products, hours, role, cart, and orders return.

## GitHub Pages deployment

1. Push this repository to GitHub with the default branch named `main` (or update the workflow branch if different).
2. In **Settings → Pages → Build and deployment → Source**, choose **GitHub Actions**.
3. Open **Actions**, select **Deploy static beta to Pages**, and run it, or push to `main`.
4. Wait for both the artifact and deploy steps to pass.
5. Open the environment URL shown by the deployment job, typically `https://USERNAME.github.io/golfer-goodies-beta/`.
6. Verify storefront navigation, an order, role switching, the test runner at `/golfer-goodies-beta/tests/`, refresh behavior, and offline reload.

This repository has not been claimed as deployed; a successful GitHub Actions run and URL inspection are required. All application URLs are relative and the service worker derives scope from its own repository-subpath location.

## Accessibility and responsive design

The app includes semantic landmarks, a skip link, logical headings, keyboard controls, labeled inputs, native accessible dialog, live status regions, large targets, visible focus, contrast-conscious colors, responsive grids, scroll-contained operations tables/boards, and `prefers-reduced-motion`. These are WCAG-oriented practices, not a certification. Screen-reader and assistive-technology audits remain necessary.

## PWA and install

The manifest uses standalone display, brand colors, and an original SVG icon. The service worker precaches the shell and all JSON with only relative paths. Installation requires HTTPS (GitHub Pages qualifies) or localhost and browser support. A first online visit is necessary before offline use. Direct `file:` use intentionally does not register a service worker.

## Privacy and known limitations

- All data and roles live in editable localStorage; there is no security, cross-device synchronization, concurrency, recovery, real inventory, or staff notification.
- Contact fields entered at checkout are attached to the local demonstration order. Use fictional values; Reset Demo removes them.
- “Use my current location” never invokes geolocation and inserts a labeled fictional value.
- Payment selectors collect no card number and process nothing. Fees, tax, sales, rewards, reviews, commission, and analytics are illustrative.
- Time/open labels use demo records rather than the visitor’s timezone and a live scheduling engine.
- Promotion editing is simplified to creation and persisted activation; catalog product creation uses a safe template.
- The custom 404 assumes a project Pages URL whose first path segment is the repository name.
- Browser console, screen-reader, offline, and device-matrix validation should be repeated in release QA.

## Production roadmap

### Recommended next task: Firebase-backed pilot

Define a security and tenancy model first, then replace local state with Firebase Authentication, Firestore, Cloud Functions, App Check, Emulator Suite tests, audit logging, and per-course security rules. Create separate golfer/course staff/platform claims; migrate stable IDs; implement idempotent order transitions and inventory transactions; add consent, retention, deletion, backups, monitoring, and an explicit local-demo mode. Validate the full model in the Emulator Suite before using production data.

### Stripe Connect

After legal and financial review, onboard course merchants with Stripe Connect, store no card data, create server-side PaymentIntents, use signed webhooks and idempotency, define refunds/disputes/tips/tax/payouts, reconcile orders, and disclose fees. Never put secret keys in this client.

### Mapping and location

Obtain consent; favor coarse/course-relative positions; minimize retention; define hole/cart geofences with course validation; add permission denial and manual fallbacks; evaluate mapping terms, accessibility, safety, and battery impact. Never expose golfer coordinates to unrelated vendors.

### Notifications

Add opt-in push/SMS/email behind trusted server functions, templating, delivery logs, quiet hours, unsubscribe flows, rate limits, escalation, and privacy controls. Staff updates should use realtime subscriptions with ordered, authorized transitions.

### Legal and operations

Before real transactions, address marketplace/vendor agreements, consumer disclosures, privacy laws, PCI scope, tax, refunds, chargebacks, accessibility, insurance, food safety/allergens, delivery liability, worker practices, emergency support, record retention, incident response, and jurisdictional requirements. Alcohol would additionally require market-by-market licensing, permitted inventory and hours, age/identity verification at purchase and handoff, intoxication/refusal training, compliant couriers, restricted-location rules, audit trails, and regulator/counsel approval.
