# Product Journey QA

## Manual matrix

Test 320, 375, 430, 768, 1024, and 1440px. At 375 and 1440: open discovery; confirm no automatic permission prompt; run nearby and manual search; compare enabled/external cards; open an enabled course; browse; open product; start round from product; choose one verification method; add two items; edit quantity; open cart; choose each supported fulfillment; complete the no-payment checkout; advance tracking; reorder; then attempt a different course with a nonempty cart and verify confirmation.

Check keyboard focus, Escape/backdrop close and focus restoration for portal dialogs, persistent labels, live announcements, status text, sticky actions, 320px overflow, reduced motion, and screen-reader names. Inspect localStorage to confirm versioned cart/order/course records and absence of coordinates/payment fields. In demo/emulator network panels, verify no Google or real geolocation calls.

Automated Chromium smoke coverage lives in `tests/browser/product-journey.spec.ts`. It verifies the portal DOM contracts (`data-product-sheet`, `data-product-id`, and `data-verification-sheet`) and completes the Summit Pines and Cedar Bend add-to-cart journeys against the running Vite demo. Install only Chromium with `npx playwright install --with-deps chromium`, then run `npm run test:browser`.

## Known limitations

Status progression is manual, estimates/tax/fees are deterministic simulations, and orders remain in one browser. Connected mode continues to support discovery rather than production commerce.
