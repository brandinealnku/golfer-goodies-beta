import { expect, it } from 'vitest';
import { demoProducts } from '../data/demo-data';
import { validatePendingOrderingIntent } from './pending-ordering-intent';
const base = {
  courseId: 'summit-pines',
  productId: 'summit-pines-club-sandwich',
  quantity: 1,
  modifierOptionIds: ['chips'],
  specialInstructions: 'No pickle',
  originatingAction: 'add' as const,
};
it('validates minimum product intent against current repository data', () =>
  expect(
    validatePendingOrderingIntent(base, base.courseId, demoProducts),
  ).toMatchObject({ product: { id: base.productId } }));
it('rejects cross-course product injection', () =>
  expect(
    validatePendingOrderingIntent(
      { ...base, courseId: 'cedar-bend-muni' },
      'cedar-bend-muni',
      demoProducts,
    ),
  ).toBeNull());
it('rejects missing required modifiers', () =>
  expect(
    validatePendingOrderingIntent(
      { ...base, modifierOptionIds: [] },
      base.courseId,
      demoProducts,
    ),
  ).toBeNull());
it('rejects missing modifier options', () =>
  expect(
    validatePendingOrderingIntent(
      { ...base, modifierOptionIds: ['not-real'] },
      base.courseId,
      demoProducts,
    ),
  ).toBeNull());
