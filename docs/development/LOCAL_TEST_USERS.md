# Local Firebase Emulator test users

The v0.4 seed adds `catalog-editor@example.com`, `fulfillment-staff@example.com`, and `no-access@example.com`. Summit Pines has deterministic owner, manager, catalog editor, fulfillment staff, and suspended memberships. The manager also has Cedar Bend access for course-scoping coverage. No-access and golfer fixtures have no membership. Re-seeding updates the same UIDs and paths without duplication.

These fictional accounts exist only after seeding the Authentication Emulator for `golfer-goodies-local`. Never reuse these credentials outside local development.

**Local-only password for every fixture:** `LocalGoodies22!`

| Account                      | Intended future fixture only     |
| ---------------------------- | -------------------------------- |
| `golfer@example.com`         | Golfer                           |
| `owner@example.com`          | Course owner                     |
| `manager@example.com`        | Course manager                   |
| `staff@example.com`          | Course staff                     |
| `runner@example.com`         | Fulfillment runner               |
| `suspended@example.com`      | Suspended-user scenarios         |
| `support@example.com`        | Platform support                 |
| `platform-admin@example.com` | Platform administrator scenarios |

These labels are not claims, custom claims, or working authorization assignments. Phase 4 will define identity and linking behavior.
