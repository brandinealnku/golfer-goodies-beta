import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDemoOrders, statusPath } from '../../state/demo-orders';
import { useCart } from '../../state/cart';
import { demoProducts } from '../../data/demo-data';
import { formatUsd, labelize } from '../../utils/format';
export function OrderTrackingPage() {
  const { orderId } = useParams();
  const { orders, setStatus } = useDemoOrders();
  const cart = useCart();
  const navigate = useNavigate();
  const order = orders.find((o) => o.id === orderId);
  if (!order)
    return (
      <div className="page empty-state">
        <h1>Order not found</h1>
        <p>This local demo order may belong to another browser.</p>
        <Link className="button" to="/orders">
          View orders
        </Link>
      </div>
    );
  const path = statusPath(order.fulfillment),
    index = path.indexOf(order.status);
  const advance = () =>
    setStatus(order.id, path[Math.min(index + 1, path.length - 1)]);
  const reorder = () => {
    order.items.forEach((i) => {
      const p = demoProducts.find((p) => p.id === i.productId);
      if (p)
        cart.add(
          order.courseId,
          p,
          i.quantity,
          i.selectedModifiers,
          i.instructions,
        );
    });
    navigate(`/course/${order.courseId}`);
  };
  return (
    <div className="page tracking">
      <section className="status-hero">
        <span className="eyebrow">{order.orderNumber}</span>
        <h1>
          {order.status === 'completed'
            ? 'Round refueled.'
            : order.status === 'received'
              ? 'We’ve got your demo order.'
              : order.status === 'preparing'
                ? 'Your items are being prepared.'
                : order.status === 'ready'
                  ? 'Ready when you are.'
                  : 'Your demo order is heading your way.'}
        </h1>
        <p>
          {order.courseName} · Estimated{' '}
          {new Date(order.estimatedReadyAt).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
      </section>
      <ol className="timeline" aria-label="Order progress">
        {path.map((s, i) => (
          <li
            className={i <= index ? 'complete' : ''}
            aria-current={i === index ? 'step' : undefined}
            key={s}
          >
            <span aria-hidden="true">{i <= index ? '✓' : '○'}</span>
            <strong>{labelize(s)}</strong>
          </li>
        ))}
      </ol>
      <div className="tracking-grid">
        <section className="card">
          <h2>Fulfillment details</h2>
          <p>
            <strong>{labelize(order.fulfillment)}</strong>
          </p>
          <p>{order.fulfillmentDetails}</p>
          <p>
            This status is simulated locally; no course staff are updating it.
          </p>
        </section>
        <section className="card">
          <h2>Items</h2>
          {order.items.map((i) => (
            <p key={i.id}>
              {i.quantity} × {i.name}
            </p>
          ))}
          <strong>Total {formatUsd(order.totals.totalCents)}</strong>
        </section>
      </div>
      <div className="button-row">
        <button className="button" onClick={reorder}>
          Reorder from this course
        </button>
        <Link className="button secondary" to={`/course/${order.courseId}`}>
          Return to storefront
        </Link>
      </div>
      {import.meta.env.MODE !== 'production' && (
        <aside className="demo-controls">
          <strong>Demo status controls</strong>
          <p>These controls simulate progress on this device only.</p>
          <button
            className="button"
            onClick={advance}
            disabled={index === path.length - 1}
          >
            Advance demo status
          </button>
          <button
            className="link-button"
            onClick={() => setStatus(order.id, 'received')}
          >
            Reset
          </button>
        </aside>
      )}
    </div>
  );
}
