import { expect, it, beforeEach } from 'vitest';
import { cartSubtotalCents, readCart } from './cart';
import type { Cart } from '../types/marketplace';
beforeEach(() => localStorage.clear());
it('calculates integer-cent totals with modifiers', () => {
  const cart: Cart = {
    version: 1,
    courseId: 'summit-pines',
    updatedAt: new Date().toISOString(),
    items: [
      {
        id: 'x',
        productId: 'p',
        name: 'Item',
        unitPriceCents: 1095,
        quantity: 2,
        image: 'x',
        instructions: '',
        selectedModifiers: [{ id: 'fruit', name: 'Fruit', priceCents: 150 }],
      },
    ],
  };
  expect(cartSubtotalCents(cart)).toBe(2490);
});
it('fails safely for invalid persisted cart state', () => {
  localStorage.setItem('golfer-goodies.cart.v1', '{"version":1,"items":"bad"}');
  expect(readCart()).toBeNull();
});
