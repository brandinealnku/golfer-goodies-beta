# Employee-to-storefront QA

Run demo QA at 375 × 812 and 1440 × 900. Sign in through Account with the clearly labeled manager demo, open Manage, pause Summit Pines, and confirm its public page says ordering is paused. Resume, edit Fairway Club, return to the course page, and confirm the updated price or preparation copy. Sign out and confirm Manage disappears and a manually entered management route returns to Account or denies access.

Repeat with catalog editor: product edit and availability controls are enabled while operations are read-only. Repeat with fulfillment staff: active/sold-out controls are enabled, while price, create, and settings controls are absent. The no-access demo must have no Manage navigation; submitting a request must show unverified submitted status and must not grant access.

Reset demo data and confirm repository seed values return. In emulator mode, use only seeded `example.com` users and `golfer-goodies-local`; verify a callable update produces a Firestore audit entry and subscribed storefront update. Never point these tests at production services.
