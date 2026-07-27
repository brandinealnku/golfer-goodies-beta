# Course context and order eligibility

## Course-first information architecture

Discovery lists fictional participating courses and course-level summaries only. A course route establishes the persisted selection. Products never appear without that context, and `MarketplaceRepository.getProductsForCourse(courseId)` enforces ownership and public visibility before returning records.

## Visibility versus eligibility

Selection controls **visibility**; verification controls **ordering eligibility**. Browse mode permits course information, menus, price, availability, and promotions but blocks actionable cart behavior. Closed and ordering-paused courses explain their state; pickup-only courses advertise only pickup. A discriminated `CourseContext` and `CourseEligibility` model documents none, browse, active, uncertain, outside-area, closed, paused, and expired outcomes without unrelated Boolean flags.

## Active Round

A demonstration verification creates one expiring Active Round containing a course ID, method, verification/expiration timestamps, and optional hole/cart references. The shared React state layer persists it in local storage, normalizes expired data back to browse mode, never authorizes another course, and supports explicit ending. No precise coordinates or continuous history are stored.

## Demonstration verification

The three local-only paths are simulated-location confirmation, a course-specific fictional QR token, and a course-specific fictional code. They are usability prototypes, not authentication, presence proof, QR security, or connected-order authorization. The app never invokes browser geolocation.

## Future connected model

Real location must be opt-in at the moment of verification, tolerate uncertain accuracy/boundaries, minimize transient data, and retain QR/code alternatives. Future QR tokens require course binding, short expiry, replay resistance, signing, and server validation. A server—not client UI, local storage, or client time—must issue and validate eligibility for every inventory/order mutation.

Firestore must require valid course ownership for products and course-owned categories (or explicitly identified shared taxonomy); query only public records by course; represent availability, pauses, fulfillment, and eligibility separately; and bind every cart/order to exactly one immutable course. Rules and transactional server logic must deny missing, expired, mismatched, or cross-course eligibility.

## Privacy principles

Never request location on page load, track in the background, store continuous history, or retain precision beyond a documented need. Explain purpose and retention, collect the minimum, provide a non-location alternative, and allow a round to end. Demo records remain fictional.
