# Identity, memberships, and course management

## Boundary and modes

React consumes one application-level `IdentityProvider`; pages never construct Firebase Auth. Demo mode offers fixed fictional identities and stores only a validated identity ID. Emulator mode dynamically loads the centralized Firebase client, subscribes with Firebase Auth, and uses only `golfer-goodies-local`. Connected mode does not substitute demo authentication: browsing remains available while management reports that trusted services are not configured.

Course management uses a mode-specific repository boundary. Demo writes are versioned browser-local overlays on immutable repository seeds. Reset removes the overlay. Emulator writes use narrowly scoped second-generation callable functions and Firestore subscriptions. Connected mutations fail closed. GitHub Pages remains demo-only and repository-subpath compatible.

## Per-course authorization

Authorization comes from `/courses/{courseId}/members/{uid}`, never a global profile role. This prevents a Summit Pines membership from granting Cedar Bend access. Only `active` memberships confer capabilities; invited, suspended, and revoked records do not.

| Capability                      | Owner | Manager | Catalog editor | Fulfillment staff |
| ------------------------------- | ----- | ------- | -------------- | ----------------- |
| View workspace                  | yes   | yes     | yes            | limited           |
| Course operations / fulfillment | yes   | yes     | no             | no                |
| Catalog and prices              | yes   | yes     | yes            | no                |
| Active / sold-out availability  | yes   | yes     | yes            | yes               |
| Audit history                   | yes   | yes     | no             | no                |
| Membership information          | yes   | no      | no             | no                |

Route guards improve the experience, but repositories, callable functions, and Security Rules remain authorization boundaries. Normal clients cannot write memberships, courses, products, claims, or audit events directly.

## Data and trusted mutations

Profiles live at `/users/{uid}` without course roles. Memberships, products, and immutable audit entries are children of a course. Private requests live at `/courseClaims/{claimId}`. `ensureUserProfile`, `submitCourseClaim`, `updateCourseOperations`, `updateFulfillmentSettings`, `createCourseProduct`, `updateCourseProduct`, and `setCourseProductAvailability` derive the actor from the verified request, validate allowlisted input, load membership, use server timestamps, and append audit records.

A submitted claim remains **submitted** and creates no membership. Employment, domain, phone, website, and document verification and approval UI do not exist in this phase.

## Storefront, cart, and limitations

Published demo overlays are read by the same course-scoped marketplace repository as the golfer storefront. Existing cart lines retain their captured integer-cent price; newly added lines use the latest published price, with no silent repricing. Firestore rules permit only explicitly public active courses and visible active/sold-out products. Storage remains deny-first; arbitrary uploads are not implemented.

Demo edits are neither shared nor production operations. Production registration, verification, recovery, invitations, owner transfer, claim approval, uploads, payments, real fulfillment, and deployment are intentionally deferred.
