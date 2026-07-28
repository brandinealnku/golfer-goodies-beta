import type { Product, ProductModifierOption } from '../types/marketplace';

export interface PendingOrderingIntent {
  courseId: string;
  productId: string;
  quantity: number;
  modifierOptionIds: string[];
  specialInstructions: string;
  originatingAction: 'add';
}

export function validatePendingOrderingIntent(
  intent: PendingOrderingIntent,
  selectedCourseId: string,
  products: Product[],
): { product: Product; modifiers: ProductModifierOption[] } | null {
  if (intent.courseId !== selectedCourseId || intent.quantity < 1) return null;
  const product = products.find(
    (item) => item.id === intent.productId && item.courseId === intent.courseId,
  );
  if (!product?.available) return null;
  const options = product.modifiers?.flatMap((group) => group.options) ?? [];
  const modifiers = intent.modifierOptionIds.map((id) =>
    options.find((option) => option.id === id),
  );
  if (modifiers.some((option) => !option)) return null;
  const selectedIds = new Set(intent.modifierOptionIds);
  if (
    product.modifiers?.some(
      (group) =>
        group.required &&
        !group.options.some((option) => selectedIds.has(option.id)),
    )
  )
    return null;
  return { product, modifiers: modifiers as ProductModifierOption[] };
}
