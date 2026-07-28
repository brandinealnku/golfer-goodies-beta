# Real course discovery architecture

Phase 4A separates provider-owned `DiscoveredGolfCourse` records from internal `MarketplaceCourseSummary` records. UI code uses `CourseDiscoveryProvider`; demo, emulator, and Google implementations share this boundary. Matching requires both provider and provider Place ID. Names never establish participation. Ordering is available only for an `active` summary whose `orderingEnabled` flag is true; external, paused, suspended, onboarding, and inactive results expose no products.

Demo fixtures are fictional and Firebase-independent. Emulator fixtures are deterministic, include participating and nonparticipating results, and never call Google. Connected requests cross the HTTPS Function boundary. The function fixes the golf-course type, result count, endpoint, and field mask; the client cannot proxy arbitrary Places calls.

The initial experience is list-first. A map may be evaluated later with its own accessibility, cost, and attribution review. Course claiming and provider Place ID refresh are also future workflows: a future scheduled/admin process should revalidate stored IDs without caching provider content beyond permitted periods. Discovery never verifies an Active Round.

Tests mock or use local providers and make no Google calls. Contract tests cover provider-ID matching, paused courses, ordering-first sorting, and manual/location fallbacks.
