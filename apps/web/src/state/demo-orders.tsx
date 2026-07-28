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
  DemoOrder,
  DemoOrderStatus,
  FulfillmentMethod,
} from '../types/marketplace';
const KEY = 'golfer-goodies.demo-orders.v1';
const Context = createContext<ReturnType<typeof useStateLayer> | null>(null);
function read(): DemoOrder[] {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(v)
      ? v.filter((o): o is DemoOrder =>
          Boolean(
            o &&
            typeof o === 'object' &&
            (o as DemoOrder).version === 1 &&
            typeof (o as DemoOrder).id === 'string',
          ),
        )
      : [];
  } catch {
    return [];
  }
}
export const statusPath = (method: FulfillmentMethod): DemoOrderStatus[] =>
  method === 'cart-delivery' || method === 'on-course-meetup'
    ? ['received', 'preparing', 'out_for_delivery', 'completed']
    : ['received', 'preparing', 'ready', 'completed'];
function useStateLayer() {
  const [orders, setOrders] = useState<DemoOrder[]>(read);
  useEffect(() => localStorage.setItem(KEY, JSON.stringify(orders)), [orders]);
  const create = useCallback(
    (order: DemoOrder) => setOrders((o) => [order, ...o]),
    [],
  );
  const setStatus = useCallback(
    (id: string, status: DemoOrderStatus) =>
      setOrders((os) => os.map((o) => (o.id === id ? { ...o, status } : o))),
    [],
  );
  return useMemo(
    () => ({ orders, create, setStatus }),
    [orders, create, setStatus],
  );
}
export function DemoOrderProvider({ children }: { children: ReactNode }) {
  return (
    <Context.Provider value={useStateLayer()}>{children}</Context.Provider>
  );
}
export function useDemoOrders() {
  const v = useContext(Context);
  if (!v) throw new Error('useDemoOrders requires DemoOrderProvider');
  return v;
}
