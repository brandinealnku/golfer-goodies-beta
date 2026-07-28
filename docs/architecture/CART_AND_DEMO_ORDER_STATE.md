# Cart and Demo Order State

`CartProvider` owns one validated version-1 cart under `golfer-goodies.cart.v1`. Items contain immutable integer-cent base and modifier prices, quantity, fictional product reference, and instructions. A cart cannot accept another course; course navigation presents confirmation and clears only after explicit approval. Invalid cart storage resets only cart state.

`DemoOrderProvider` stores validated version-1 local orders under `golfer-goodies.demo-orders.v1`. Checkout snapshots course, items, fulfillment, deterministic totals, placed/estimate times, and status before clearing the cart. Pickup follows received → preparing → ready → completed; delivery follows received → preparing → out for delivery → completed.

No coordinates, Places bodies, secrets, payment credentials, or continuous location history enter either record. These repositories are local demonstrations and are not connected order APIs.
