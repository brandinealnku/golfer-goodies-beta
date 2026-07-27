# Golfer Goodies v0.2 implementation status

**Updated:** 2026-07-27
**Current phase:** Phase 1 — assessment and roadmap complete
**Release posture:** v0.1 static beta remains the working baseline; v0.2 production integrations are not implemented.

## Status legend

- **Complete:** scoped work was performed and checked.
- **Planned:** not started; the listed exit criteria must be met before claiming completion.
- **Blocked by prerequisite:** intentionally deferred until the named earlier work is verified.

## Verification snapshot

| Area | Status | Evidence and limits |
| --- | --- | --- |
| Repository assessment | Complete | All 24 original non-Git repository files were inspected. Architecture, routes, state, data, PWA, tests, and Pages workflow are documented in `V02_MIGRATION_ASSESSMENT.md`. |
| Existing dependency-free suite | Complete with environment limitation | Existing suite reported 17 passed and 0 failed under a temporary Node DOM/localStorage shim. No browser executable was available, so browser, PWA, accessibility, and responsive behavior remain unverified in this phase. |
| JavaScript syntax | Complete | Node syntax checks passed for all JavaScript modules and the service worker. |
| JSON validity | Complete | Manifest and every `data/*.json` document parsed successfully. |
| React migration | Not started | Explicitly out of scope for Phase 1 and not recommended until behavioral/data boundaries are established. |
| Firebase, authentication, Stripe, deployment | Not started | No service was configured, no secret or dependency was added, and nothing was deployed. |

## Phased roadmap

Phases are ordered to prevent UI claims from getting ahead of security, money movement, or operational correctness. Each phase must preserve the verified local-demo path unless an explicitly approved replacement has equal regression coverage.

### Phase 1 — assessment and migration controls

**Status: Complete**

- Inventory repository architecture, routes, styling, storage, data, PWA, tests, and deployment.
- Run available checks and record results with their environment limitations.
- Identify v0.1 compatibility requirements and migration risks.
- Establish an honest status document and add repository safeguards against removing working beta behavior.

**Exit criteria met:** assessment and status documents exist; no React, Firebase, Stripe, redesign, or deployment work was performed.

### Phase 2 — foundation and compatibility contracts

**Status: Planned — recommended next task**

- Write explicit route, entity/schema, localStorage migration, role/permission, tenant, and order-state contracts.
- Fix the dependency-free runner to await asynchronous tests and fail reliably on rejected promises.
- Add fixture schema checks and deterministic parity validation between `data/*.json` and `assets/js/baseline.js`.
- Add browser automation for critical preserved workflows, GitHub Pages subpaths, direct-file fallback where supported, keyboard operation, live announcements, responsive overflow, and service-worker offline/update behavior.
- Introduce repository/service interfaces behind `assets/js/data-service.js`; keep the current local adapter as the default and avoid visible redesign.
- Define observability, environments, configuration injection, privacy classification, retention/deletion, backup/recovery, and migration/rollback requirements.

**Exit criteria:** compatibility tests pass in a real browser and CI; contracts are reviewed; local demo behavior and state migration are verified; no production integration is implied.

### Phase 3 — Firebase platform and data foundation

**Status: Blocked by Phase 2**

- Select Firebase projects for isolated development/staging/production environments and document configuration handling. Public Firebase client configuration is distinct from secrets; privileged credentials remain outside the client and repository.
- Model Firestore tenants, users, memberships, courses, products, promotions, orders, order events, applications, rewards, and audit records with versioned converters.
- Implement Emulator Suite coverage, indexes, App Check strategy, Cloud Functions boundaries, transactional inventory/order operations, idempotency keys, and export/restore procedures.
- Build an explicit, reversible fixture seeding path. Do not silently upload localStorage data.
- Retain the local adapter for demonstrations and offline development.

**Exit criteria:** emulator tests prove data isolation, validation, transactions, retries, and migration rollback; no production enablement occurs yet.

### Phase 4 — authentication

**Status: Blocked by Firebase foundation**

- Define supported sign-in, account linking/recovery, verification, session, reauthentication, sign-out, account deletion, and abuse protections.
- Replace the demo role selector only for authenticated mode; retain it clearly labeled in local-demo mode.
- Map authenticated identities to explicit membership records rather than trusting client-provided roles.
- Add consent, privacy notice, retention, and support flows appropriate to collected identity/contact data.

**Exit criteria:** emulator and browser tests cover successful and failed identity lifecycles; no role is granted merely from client state.

### Phase 5 — authorization and tenancy

**Status: Blocked by authentication**

- Define least-privilege golfer, course staff, course admin, and platform admin permissions, including multi-course membership and suspension/revocation behavior.
- Implement Firestore/Storage rules and trusted-function checks that enforce course tenancy, field-level mutation constraints, and immutable audit fields.
- Separate order customer visibility, operational notes, contact data, analytics, and platform review permissions.
- Test an authorization matrix in the emulator, including cross-tenant reads/writes, stale claims, enumeration attempts, and direct API calls that bypass the UI.

**Exit criteria:** deny-by-default rules and server checks pass positive and negative tests; a security review signs off before real data is accepted.

### Phase 6 — marketplace data

**Status: Blocked by authorization**

- Connect read models for approved/active courses, products, availability, fulfillment settings, hours, promotions, reviews, and search/filter behavior.
- Define publish/draft moderation, inventory semantics, pricing/currency rules, media handling, allergen/product disclosures, and cache invalidation.
- Migrate stable fixture IDs through a repeatable staging import while preserving local fixtures.
- Add loading, empty, stale, offline, conflict, and permission-denied states without redesigning established workflows prematurely.

**Exit criteria:** authorized staging data supports preserved discovery/storefront/admin flows; fixture migration and rollback are rehearsed; search limitations are documented.

### Phase 7 — orders and fulfillment operations

**Status: Blocked by marketplace data**

- Formalize a server-authoritative order state machine, rejection/cancellation reasons, actor permissions, inventory reservation/release, estimates, runner assignment, notes, and append-only events.
- Use transactions and idempotency for create/update operations; define retry, duplicate, timeout, conflict, and partial-failure handling.
- Build realtime golfer tracking and staff queue subscriptions with ordered transitions and tenant isolation.
- Define support, refunds linkage, data retention, audit, incident response, and offline operational behavior.

**Exit criteria:** emulator and concurrency tests prove legal transitions, inventory integrity, idempotency, isolation, and synchronized tracking under retries.

### Phase 8 — Stripe Connect and financial lifecycle

**Status: Blocked by verified orders plus legal/financial review**

- Choose an appropriate Connect account/charge model with counsel and finance; define merchant onboarding, platform fees, tips, taxes, refunds, disputes, chargebacks, payouts, reconciliation, and support ownership.
- Create PaymentIntents and privileged Stripe operations only in trusted server functions. Verify signed webhooks and make every handler idempotent and replay-safe.
- Store Stripe identifiers and sanitized status only; never store raw card data or expose secret keys.
- Reconcile payment and order state explicitly, including asynchronous success, failure, cancellation, refund, dispute, and webhook ordering.
- Preserve simulation mode until end-to-end test-mode results and operational runbooks are approved.

**Exit criteria:** Stripe test-mode and webhook replay tests pass; finance/security/legal review is recorded; reconciliation and incident runbooks are exercised. This is not a claim of live payment readiness.

### Phase 9 — operations and administration

**Status: Blocked by orders and payment model**

- Productionize onboarding/approval, catalog moderation, course activation/suspension, hours/availability, staff membership, analytics definitions, support tooling, and auditable administrative actions.
- Add monitoring, structured logs, alerting, dashboards, rate limits, abuse controls, backup/restore drills, incident response, and customer/course support escalation.
- Define marketplace/vendor agreements, privacy and deletion operations, consumer disclosures, accessibility process, food safety/allergen responsibilities, tax/refund policies, delivery liability, and jurisdictional constraints.
- Keep alcohol out of scope unless a separately approved compliance program covers licensing, inventory/hours, identity/age checks, handoff/refusal, courier rules, and audit trails.

**Exit criteria:** staging operational drills and access reviews pass; legal and support owners approve runbooks and disclosures.

### Phase 10 — notifications

**Status: Blocked by authorized order events and operations**

- Select opt-in push/SMS/email channels and consent records; define templates, localization, accessibility, quiet hours, preferences, unsubscribe, and contact verification.
- Send only from trusted functions reacting idempotently to authorized events. Add rate limits, deduplication, delivery logs, retries/dead letters, escalation, and provider failover policy.
- Minimize personal data in message content and prevent cross-tenant or wrong-recipient delivery.

**Exit criteria:** sandbox delivery and failure tests pass; consent, unsubscribe, duplication, privacy, and support scenarios are verified.

### Phase 11 — comprehensive testing and release qualification

**Status: Planned throughout; final gate blocked by prior phases**

- Run unit, schema, rules, emulator integration, browser end-to-end, contract, migration, concurrency, webhook, accessibility, visual/responsive, PWA/offline/update, performance, and security tests.
- Test supported browsers/devices, 320–1440 pixel viewports, keyboard-only navigation, 200% zoom, reduced motion, screen readers, poor networks, offline recovery, stale clients, and repository-subpath deployment.
- Exercise backup restore, rollback, incident, payment reconciliation, notification failure, deletion/retention, and tenant offboarding runbooks.
- Record exact commands, versions, environments, results, failures, waivers, and manual evidence. Do not convert partial or simulated checks into production claims.

**Exit criteria:** agreed quality/security/accessibility/performance gates pass in staging; residual risks and limitations are approved and documented.

### Phase 12 — deployment and controlled rollout

**Status: Blocked by release qualification**

- Add test/build/security gates before Pages deployment, pin third-party Actions appropriately, create a minimal site artifact, and preserve repository-subpath URLs.
- Establish environment promotion, protected approvals, configuration validation, preview/staging smoke tests, database/function/rules rollout ordering, feature flags, rollback, and post-deploy monitoring.
- Roll out to internal users and a limited fictional/test pilot before any real course or transaction. Expand only against explicit service-level and incident thresholds.
- Verify the deployed URL, routes, auth, tenant boundaries, critical order/payment flows, PWA update/offline behavior, observability, and rollback rather than inferring success from a workflow badge.

**Exit criteria:** approved production readiness review, successful controlled rollout, verified deployment evidence, and an exercised rollback plan. No deployment was performed in Phase 1.

## Immediate next action

Open a narrowly scoped Phase 2 change for **foundation contracts and compatibility testing**, not React or cloud integration. Its deliverable should be a verified browser/CI characterization suite plus local repository interfaces in `data-service.js`, with no visible behavior change and no loss of the static beta.
