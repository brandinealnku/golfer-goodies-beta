# Course context and ordering eligibility

Course context has three canonical states: no selection, a selected course in `browse`, and a selected course with an `ordering_session`. An Ordering Session is versioned, belongs to exactly one stable internal course ID, records verification method/confidence and verification/expiration timestamps, and is active, expired, or revoked. Its duration is the named `ORDERING_SESSION_MINUTES` constant (120 minutes). Browsing and cart review remain available after expiry; adding and placing an order require an active course-matching session.

Verification appears only after Add. A minimal pending intent contains course/product IDs, quantity, modifier option IDs, instructions, and originating action. It is not persisted. Current repository data is checked before automatic completion; course changes, cancellation, missing/unavailable products, cross-course products, invalid modifiers, and missing required modifiers clear or reject it safely.

## Providers and location privacy

`BrowserPosition` is obtained by the dedicated adapter only after an explicit action through `getCurrentPosition` with `enableHighAccuracy: true`, `timeout: 10000`, and `maximumAge: 0`. Ten seconds avoids an indefinite blocked dialog; zero cache age avoids using a stale visit. Latitude and longitude are held only for the verification promise and are never stored, routed, logged, or included in analytics. Discovery coordinates are a separate search concern and never prove ordering eligibility.

The provider boundary returns eligible, uncertain (low accuracy or boundary overlap), not eligible (outside configured area, closed, or paused), or honestly unavailable. Demo mode simulates deterministic outcomes after the location action. Emulator geometry can classify a point plus its accuracy radius as clearly inside, overlapping a configured boundary, or clearly outside; radius fallback data must include source metadata and is not represented as a property boundary. Connected mode cannot authorize until a future trusted Firebase HTTPS/callable endpoint is configured and never calls Google Places or embeds secrets in the component.

QR and course code are fictional local fallbacks in this phase. They are not production security mechanisms. Production authentication, employee/course management, secure codes, geofencing, payments, and real ordering are deferred.

## Legacy migration

The old `active_round` / `ActiveRound` shape is recognized only while reading the existing storage key. Valid matching records map demo location, QR, and code methods to version 1 Ordering Sessions while retaining the original expiry. Expired sessions are not extended. Malformed, unsupported, missing-expiry, revoked, or wrong-course values safely normalize to browse/no-course state, and startup parsing never throws. Subsequent persistence writes only canonical new state.
