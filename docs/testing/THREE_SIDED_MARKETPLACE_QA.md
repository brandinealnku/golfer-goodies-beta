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
