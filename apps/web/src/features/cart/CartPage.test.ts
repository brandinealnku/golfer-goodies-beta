import { expect, it } from 'vitest';
import { calculateTotals } from './CartPage';
it('uses deterministic integer-cent checkout totals', () => {
  expect(calculateTotals(2000, 'cart-delivery')).toEqual({
    subtotalCents: 2000,
    serviceFeeCents: 149,
    taxCents: 160,
    deliveryFeeCents: 299,
    totalCents: 2608,
  });
});
it('has no delivery fee for pickup', () =>
  expect(calculateTotals(1000, 'pickup').deliveryFeeCents).toBe(0));
