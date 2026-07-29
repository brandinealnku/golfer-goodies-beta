# Marketplace experience foundation

## Three connected portals

Golfer Goodies now has a course-first golfer marketplace, a course-scoped operational Partner portal, and a structurally distinct supervisory Platform Administration portal. Hash routing and relative application assets preserve GitHub Pages repository-subpath hosting. The v0.1 baseline remains unchanged at the root and under `legacy/v0.1/`.

## Onboarding and claims

The demo workflow models account creation, matching an already-claimed or unclaimed course, adding an unlisted course, verification pending, setup, preview, platform review, approval, and changes requested. It submits nothing. Production claims require trusted server-side identity, duplicate prevention, document handling, and verification.

## Roles and capabilities

Course roles (`course_owner`, `course_manager`, `catalog_editor`, `fulfillment_staff`, `analyst`) map centrally to course capabilities. Membership status and course ID remain mandatory; no global role grants course access. Platform roles (`support_agent`, `platform_admin`) use a separate centralized capability matrix. Suspended identities are represented in demo state and production enforcement remains a trusted-service responsibility.

## Storefront configuration

The typed model reserves profile, weekly/holiday hours, closures, capacity, six fulfillment types, accepted payment instructions, and lifecycle customer messages. Inventory supports unlimited, manual, scheduled, fulfillment-specific, and an explicitly unavailable automatic placeholder. Promotions carry integer-cent minimums, schedules, product/category eligibility, and fulfillment restrictions.

## Order lifecycle

Orders progress through `new`, `accepted`, `preparing`, `ready`, `awaiting_pickup`, `out_for_delivery`, and `fulfilled`, with clarification, delay, cancellation, unable-to-fulfill, and refund states. Every order has one course, captured item prices and integer-cent totals, separated payment/collection/refund fields, fulfillment context, history, customer messages, and staff notes. Partner status transitions append course audit events.

## Platform administration

Platform screens summarize courses, applications, users, orders, payments, disputes, moderation, reports, settings, and audit activity. Course/user suspensions and application decisions are browser-local simulations and append platform audit records. Audit records have no UI edit operation.

## Persistence, reset, and boundaries

`gg.marketplace.foundation.v1` contains validated version 1 browser-local state. Missing, unsupported, or corrupt state recovers to deterministic fictional fixtures. Platform Settings exposes an explicit confirmed reset. `MarketplaceRepository`, `CoursePartnerRepository`, `PlatformAdminRepository`, `OrderRepository`, `CourseApplicationRepository`, `NotificationRepository`, `PaymentRepository`, and `AuditRepository` define later service seams. Demo notifications and payments fail with honest unavailable errors. No Firebase Admin SDK, credential, gateway, or production write appears in browser code.

GitHub Pages builds demo mode only. Emulator support remains local-only; production onboarding, authentication, verification, payments, notifications, tax, inventory integrations, analytics, and privileged enforcement remain unimplemented.
