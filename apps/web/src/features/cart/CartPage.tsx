import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { demoCourses } from '../../data/demo-data';
import { useCart, itemUnitCents } from '../../state/cart';
import { useCourseContext } from '../../state/course-context';
import { useDemoOrders } from '../../state/demo-orders';
import type { FulfillmentMethod, OrderTotals } from '../../types/marketplace';
import { formatUsd, labelize } from '../../utils/format';
import { QuantityStepper } from '../courses/CoursePage';
export const calculateTotals = (
  subtotalCents: number,
  method: FulfillmentMethod,
): OrderTotals => {
  const serviceFeeCents = 149,
    taxCents = Math.round((subtotalCents * 8) / 100),
    deliveryFeeCents =
      method === 'cart-delivery' || method === 'on-course-meetup' ? 299 : 0;
  return {
    subtotalCents,
    serviceFeeCents,
    taxCents,
    deliveryFeeCents,
    totalCents: subtotalCents + serviceFeeCents + taxCents + deliveryFeeCents,
  };
};
export function CartPage() {
  const cart = useCart();
  const { context } = useCourseContext();
  const orders = useDemoOrders();
  const navigate = useNavigate();
  const course = demoCourses.find((c) => c.id === cart.cart?.courseId);
  const [method, setMethod] = useState<FulfillmentMethod | ''>('');
  const [details, setDetails] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  if (!cart.cart || !cart.itemCount || !course) return <CartEmptyState />;
  const currentCart = cart.cart;
  const totals = calculateTotals(
    cart.subtotalCents,
    (method || 'pickup') as FulfillmentMethod,
  );
  const place = () => {
    if (
      context.mode !== 'active_round' ||
      context.activeRound.courseId !== course.id
    ) {
      setError(
        'Start an Active Round at this course before placing a demo order.',
      );
      return;
    }
    if (!method) {
      setError('Choose how you would like to receive your items.');
      return;
    }
    if (
      (method === 'cart-delivery' || method === 'on-course-meetup') &&
      !details.trim()
    ) {
      setError('Add your current hole, cart number, or meeting instructions.');
      return;
    }
    if (!name.trim()) {
      setError('Enter a name for this local demonstration order.');
      return;
    }
    const now = new Date(),
      id = `demo-${now.getTime()}`;
    orders.create({
      version: 1,
      id,
      orderNumber: `GG-${String(now.getTime()).slice(-6)}`,
      courseId: course.id,
      courseName: course.name,
      items: currentCart.items,
      fulfillment: method,
      fulfillmentDetails: details || 'Pick up at the clubhouse counter.',
      totals,
      status: 'received',
      placedAt: now.toISOString(),
      estimatedReadyAt: new Date(
        now.getTime() + course.estimatedMinutes * 60000,
      ).toISOString(),
    });
    cart.clear();
    navigate(`/order/${id}`, { state: { success: true } });
  };
  return (
    <div className="page cart-page">
      <CartCourseHeader name={course.name} />
      <div className="checkout-grid">
        <section>
          <CartItemList />
          <FulfillmentSelector
            methods={course.fulfillmentMethods}
            value={method}
            onChange={setMethod}
          />
          {(method === 'cart-delivery' || method === 'on-course-meetup') && (
            <MeetingDetailsForm value={details} onChange={setDetails} />
          )}
          <CustomerDetailsSection value={name} onChange={setName} />
          <DemoPaymentSection />
        </section>
        <aside className="order-summary">
          <h2>Order summary</h2>
          <Row n="Subtotal" v={totals.subtotalCents} />
          <Row n="Service fee" v={totals.serviceFeeCents} />
          <Row n="Estimated tax" v={totals.taxCents} />
          {totals.deliveryFeeCents > 0 && (
            <Row n="Delivery fee" v={totals.deliveryFeeCents} />
          )}
          <Row n="Total" v={totals.totalCents} total />
          <p className="error-message" role="alert">
            {error}
          </p>
          <button className="button place-order" onClick={place}>
            Place demo order · {formatUsd(totals.totalCents)}
          </button>
        </aside>
      </div>
    </div>
  );
}
export function CartCourseHeader({ name }: { name: string }) {
  return (
    <header className="cart-course-header">
      <span className="eyebrow">One-course cart</span>
      <h1>Your order at {name}</h1>
      <p>Review your items and choose how to receive them.</p>
    </header>
  );
}
export function CartItemList() {
  const { cart, quantity, remove } = useCart();
  return (
    <section aria-labelledby="items-title">
      <h2 id="items-title">Your items</h2>
      {cart?.items.map((i) => (
        <article className="cart-item" key={i.id}>
          <img src={i.image} alt="" />
          <div>
            <h3>{i.name}</h3>
            {i.selectedModifiers.map((m) => (
              <small key={m.id}>{m.name}</small>
            ))}
            <strong>{formatUsd(itemUnitCents(i) * i.quantity)}</strong>
            <button className="link-button" onClick={() => remove(i.id)}>
              Remove
            </button>
          </div>
          <QuantityStepper
            value={i.quantity}
            onChange={(v) => quantity(i.id, v)}
            name={i.name}
          />
        </article>
      ))}
    </section>
  );
}
export function FulfillmentSelector({
  methods,
  value,
  onChange,
}: {
  methods: FulfillmentMethod[];
  value: string;
  onChange: (m: FulfillmentMethod) => void;
}) {
  return (
    <fieldset className="checkout-section">
      <legend>Choose fulfillment</legend>
      {methods.map((m) => (
        <label className="fulfillment-option" key={m}>
          <input
            type="radio"
            name="fulfillment"
            checked={value === m}
            onChange={() => onChange(m)}
          />
          <span>
            <strong>{labelize(m)}</strong>
            <small>
              {m === 'pickup'
                ? 'Collect at the clubhouse or at the turn.'
                : 'Meet on course using the details you provide.'}
            </small>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
export function MeetingDetailsForm({
  value,
  onChange,
}: {
  value: string;
  onChange: (s: string) => void;
}) {
  return (
    <label className="field checkout-section">
      Current hole, cart identifier, or meeting instructions
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </label>
  );
}
export function CustomerDetailsSection({
  value,
  onChange,
}: {
  value: string;
  onChange: (s: string) => void;
}) {
  return (
    <section className="checkout-section">
      <h2>Who is picking up?</h2>
      <label className="field">
        Name for this demo order
        <input
          autoComplete="name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
        />
      </label>
    </section>
  );
}
export function DemoPaymentSection() {
  return (
    <section className="demo-payment">
      <h2>Demo payment</h2>
      <p>
        <strong>No payment will be charged.</strong> This creates a local
        demonstration order only.
      </p>
    </section>
  );
}
export function CartEmptyState() {
  return (
    <div className="page empty-state">
      <span aria-hidden="true">⛳</span>
      <h1>Your cart is ready for the round</h1>
      <p>
        Start an Active Round, then add clubhouse favorites and golf essentials.
      </p>
      <Link className="button" to="/discover">
        Find your course
      </Link>
    </div>
  );
}
function Row({ n, v, total }: { n: string; v: number; total?: boolean }) {
  return (
    <div className={total ? 'summary-row total' : 'summary-row'}>
      <span>{n}</span>
      <strong>{formatUsd(v)}</strong>
    </div>
  );
}
