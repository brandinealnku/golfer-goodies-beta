# Repository instructions

- Preserve GitHub Pages repository-subpath compatibility; use relative URLs only.
- Do not add server-side dependencies unless explicitly requested, and never expose secrets.
- Use shared functions in `assets/js/data-service.js` for persisted data access.
- Preserve semantic structure, keyboard operation, visible focus, labels, and live announcements.
- Add or update dependency-free tests when behavior changes.
- Update README capabilities and limitations honestly; distinguish simulation from live integrations.
- Do not claim a feature works unless it has been verified.
- Treat the v0.1 static beta as the compatibility baseline: evolve it incrementally and do not remove a working role, route, workflow, offline fallback, or dependency-free test without an approved replacement and regression coverage.
- Keep planned v0.2 integrations behind explicit boundaries and preserve a documented local-demo mode until their production behavior, security rules, and migration path have been verified.

## v0.2 foundation safeguards

- Preserve the complete v0.1 static beta in `legacy/v0.1/` and at the repository root until a verified replacement is approved.
- Preserve static-host and GitHub Pages repository-subpath compatibility; never introduce root-relative application assets.
- Use a shared repository/data-service boundary for application data; React components must not import raw JSON throughout the UI.
- Do not add Firebase until the Firebase phase or Stripe until the payment phase.
- Preserve semantic structure, keyboard operation, visible focus, labels, announcements, reduced-motion support, and responsive accessibility.
- Add tests for behavior changes and never describe a placeholder as operational.
- Keep every demo record fictional and free of real course/customer operational details.

## Firebase local emulator safeguards

- Demo mode must remain Firebase-independent; load Firebase dynamically only behind the repository adapter in emulator mode.
- Emulator scripts and tests must use only `golfer-goodies-local` and must refuse any real or unrecognized project ID.
- Never weaken Firestore or Storage rules for convenience; add explicit allow and denial tests for every rules change.
- Components must use repository adapters rather than accessing Firestore directly.
- Keep seed data fictional, deterministic, idempotent, alcohol-free, and represent money as integer cents.
- Do not add Stripe before its designated payment phase and do not deploy Firebase services without explicit authorization.
- Never commit secrets, service-account files, private keys, production credentials, or App Check debug tokens.

## Permanent course-context rules

- Never show products without course context.
- Never query marketplace-wide products for the golfer ordering flow.
- Every product must belong to a course.
- Course selection controls product visibility.
- Course verification controls ordering eligibility.
- Never rely solely on client-side eligibility for connected orders.
- Never request geolocation automatically on page load.
- Preserve non-location alternatives.
- Do not store continuous location history.
- Preserve one-course-per-cart behavior.

## Permanent discovery rules

- Never expose Places web-service keys to the browser.
- Never request location on page load.
- Never require location to search for a course.
- Never use continuous location tracking for course discovery.
- Never persist exact search coordinates.
- Never infer marketplace participation from a place name.
- Never display products for an external course.
- Never treat discovery location as ordering eligibility.
- Always preserve manual search.
- Always display required provider attribution.

## Permanent product-experience rules

- Never promote placeholder routes in primary navigation.
- Never carry cart contents across courses.
- Never collect real payment data in demo mode.
- Never use floating-point values for currency.
- Never hide ordering eligibility behind color alone.
- Never dominate consumer screens with developer disclaimers.
- Always preserve manual course search.
- Always keep exact coordinates out of persistent storage.
- Always test the complete primary journey at mobile width.
- Always provide a visible startup error fallback.
