import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  Cart,
  CartItem,
  Product,
  ProductModifierOption,
} from '../types/marketplace';

const KEY = 'golfer-goodies.cart.v1';
const Context = createContext<ReturnType<typeof useCartState> | null>(null);
export const itemUnitCents = (item: CartItem) =>
  item.unitPriceCents +
  item.selectedModifiers.reduce((sum, option) => sum + option.priceCents, 0);
export const cartSubtotalCents = (cart: Cart | null) =>
  cart?.items.reduce(
    (sum, item) => sum + itemUnitCents(item) * item.quantity,
    0,
  ) ?? 0;
export function readCart(): Cart | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (!value || typeof value !== 'object') return null;
    const cart = value as Cart;
    if (
      cart.version !== 1 ||
      typeof cart.courseId !== 'string' ||
      !Array.isArray(cart.items) ||
      cart.items.some(
        (i) =>
          !i ||
          typeof i.id !== 'string' ||
          !Number.isInteger(i.quantity) ||
          i.quantity < 1 ||
          !Number.isInteger(i.unitPriceCents),
      )
    )
      return null;
    return cart;
  } catch {
    return null;
  }
}
function useCartState() {
  const [cart, setCart] = useState<Cart | null>(readCart);
  const [announcement, setAnnouncement] = useState('');
  useEffect(() => {
    if (cart) localStorage.setItem(KEY, JSON.stringify(cart));
    else localStorage.removeItem(KEY);
  }, [cart]);
  const add = useCallback(
    (
      courseId: string,
      product: Product,
      quantity: number,
      selectedModifiers: ProductModifierOption[],
      instructions: string,
    ) => {
      setCart((current) => {
        if (current && current.courseId !== courseId) return current;
        const item: CartItem = {
          id: `${product.id}-${selectedModifiers.map((m) => m.id).join('-') || 'standard'}`,
          productId: product.id,
          name: product.name,
          unitPriceCents: product.priceCents,
          quantity,
          image: product.image,
          selectedModifiers,
          instructions,
        };
        const items = current?.items ?? [];
        const existing = items.find((i) => i.id === item.id);
        return {
          version: 1,
          courseId,
          items: existing
            ? items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              )
            : [...items, item],
          updatedAt: new Date().toISOString(),
        };
      });
      setAnnouncement(`${product.name} added to cart.`);
    },
    [],
  );
  const quantity = useCallback(
    (id: string, value: number) =>
      setCart((c) =>
        c
          ? {
              ...c,
              items: c.items.flatMap((i) =>
                i.id === id
                  ? value > 0
                    ? [{ ...i, quantity: value }]
                    : []
                  : [i],
              ),
              updatedAt: new Date().toISOString(),
            }
          : c,
      ),
    [],
  );
  const remove = useCallback((id: string) => {
    setCart((c) =>
      c
        ? {
            ...c,
            items: c.items.filter((i) => i.id !== id),
            updatedAt: new Date().toISOString(),
          }
        : c,
    );
    setAnnouncement('Item removed.');
  }, []);
  const clear = useCallback(() => {
    setCart(null);
    setAnnouncement('Cart cleared.');
  }, []);
  return useMemo(
    () => ({
      cart,
      add,
      quantity,
      remove,
      clear,
      announcement,
      subtotalCents: cartSubtotalCents(cart),
      itemCount: cart?.items.reduce((n, i) => n + i.quantity, 0) ?? 0,
    }),
    [cart, add, quantity, remove, clear, announcement],
  );
}
export function CartProvider({ children }: { children: ReactNode }) {
  return <Context.Provider value={useCartState()}>{children}</Context.Provider>;
}
export function useCart() {
  const value = useContext(Context);
  if (!value) throw new Error('useCart requires CartProvider');
  return value;
}
