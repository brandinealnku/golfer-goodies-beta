# Golfer Goodies — Course-Operated Sales Demo

This is an **isolated, browser-local demonstration** for pitching Golfer Goodies as software licensed to golf courses. It does not replace the existing React/Vite/Firebase application.

## Start
Open `course-operator-demo/index.html` in a browser. The UI requires no build tools. For a hosted preview, publish this folder as a static site or merge into the existing demo deployment after testing.

## Three-minute demo
1. **Golfer:** Add bottled water and a snack to the cart.
2. Choose **Clubhouse pickup**, then submit a simulated order.
3. Switch to **Course Staff**, see the new order, and advance it through received → accepted → preparing → ready → completed.
4. Switch to **Course Setup** and turn off clubhouse pickup, leave on-course delivery enabled.
5. Return to **Golfer**, add an item, choose a hole (1–18), and submit an on-course delivery order.
6. Back in **Course Staff**, process the order and reset the demo in Course Setup.

## Safety and scope
- Fictional products and sample course. No payment collection, messages, order dispatch, geolocation, or actual fulfillment.
- Data resides in `localStorage` on the current browser/device, key `gg.course-operated-demo.v1`. Separate devices do **not** share orders. Tabs in the same browser can sync.
- No credentials, external API, Firebase, or payment processor.
- The “course setup” view is not authenticated. It is **not** safe for real use.
- Product prices and availability are demo configuration; changing prices is not included.
- The existing marketplace app and its deployment remain unchanged.

## Validation checklist before customer-facing demo
- [ ] Mobile Safari and Chrome screen layout
- [ ] Add/remove quantities and totals
- [ ] Pickup order and staff status lifecycle
- [ ] Delivery requires hole selection
- [ ] Disabling a fulfillment method removes it from new orders
- [ ] Disabled catalog items disappear from the storefront
- [ ] Browser reload retains orders; demo reset clears them
- [ ] No real-order or real-payment claims appear

## Six-hour budget / next gate
This version demonstrates an end-to-end interaction within one browser. Do not build production payments, hosted accounts, staff identity, multi-device synchronization, or additional administration until an operator conversation confirms those needs. The next decision is whether the demo helps secure a golf-course meeting.
