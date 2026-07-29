# Three-sided marketplace QA

## Journeys

1. Golfer: at mobile width, open `#/discover`, choose Summit Pines, open a product, verify on first Add, review the single-course cart, place a no-payment demo order, and open tracking.
2. Partner: choose `summit-owner@example.com`, open `#/partner`, confirm the Summit Pines overview, pause/reopen the storefront, filter `orders`, advance an order, then inspect inventory, fulfillment, promotions, team, and settings routes.
3. Administrator: choose `platform-admin@example.com`, open `#/platform`, inspect all navigation, approve/request changes on an application, suspend/reactivate a course and user, confirm audit entries, and reset under Platform Settings.
4. Onboarding: open `#/partner/join`; check all nine stages and the already-claimed, unclaimed, and unlisted outcomes.

All addresses and records are fictional `example.com` demonstrations. Demo actions never send messages, collect money, verify a business, or call Firebase.

## Accessibility and responsive checks

Use keyboard-only navigation to traverse portal links, filters, tables, actions, and the reset confirmation. Confirm the skip link, one main landmark, named portal navigation, heading order, visible focus, text status labels, table captions, and live route announcements. At 375px, verify the portal navigation scrolls horizontally and tables become readable record blocks. Repeat with reduced motion.

## Automated checks

Run the root commands in README. Unit coverage includes capability separation, version validation, corrupt-state recovery, reset, course-scoped transitions, integer-cent captured prices, visibility/inventory eligibility, suspension, application changes, and audit creation. Browser coverage retains the complete golfer journey and GitHub Pages/service-worker contract.

## Known limitations

Partner catalog editing, rich settings forms, connected order synchronization, real identity enforcement, approvals, documents, payment, messaging, tax, moderation, disputes, reporting exports, and production analytics remain intentionally unavailable. Manual screen-reader testing and a real-device matrix remain necessary.

## Landing and partner-route regression walkthrough

1. At 375×812, 768×1024, and 1440×900, open `#/discover`; confirm one H1, readable hero, one unified finder, five fictional cards, How It Works, partner benefits, three-sided explanation, trust list, native-details FAQ, split CTA, and organized footer without horizontal scrolling. Confirm no location prompt appears until **Use My Location**.
2. Signed out, as golfer, and as platform admin, open `#/partner`. Confirm only Partner Home, Join, Claim, Choose Demo Identity, and marketplace exit appear and each avoids the global 404.
3. Choose `summit-owner@example.com` and repeat every course navigation link. Confirm the route begins `#/partner/course/summit-pines/` and headings match. Repeat manager. Confirm `#/partner/products` redirects to the authorized scoped route.
4. Open an unauthorized course ID, an unknown section, and a malformed incomplete partner route. Expect access/section guidance, never generic 404. A platform admin must not gain Summit access.
5. Keyboard-check the skip link, current-page state, selector, search form, FAQ, focus indicators, and all essential mobile actions. Native details must open without a trap. Status text must supplement color.
6. To inspect a fresh service-worker shell, close other tabs, clear site data in browser developer tools, reload, and confirm the v04 cache. GitHub Pages must retain hash routes under `/golfer-goodies-beta/`.

Expected identities include the signed-out state, golfer, Summit owner/manager, Cedar manager, no-course-access user, and distinct platform admin. All behavior remains fictional and browser-local; manual screen-reader, real-device, and multi-membership fixture QA remain recommended.
