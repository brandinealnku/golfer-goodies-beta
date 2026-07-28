import { Link } from 'react-router-dom';
import { useDemoOrders } from '../../state/demo-orders';
import { formatUsd, labelize } from '../../utils/format';
export function OrdersPage() {
  const { orders } = useDemoOrders();
  return (
    <div className="page">
      <span className="eyebrow">Local demonstration history</span>
      <h1>Your orders</h1>
      {!orders.length ? (
        <div className="empty-state">
          <h2>No demo orders yet</h2>
          <p>Your local order history will appear here after checkout.</p>
          <Link className="button" to="/discover">
            Find a course
          </Link>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((o) => (
            <Link className="card" key={o.id} to={`/order/${o.id}`}>
              <span className="availability available">
                {labelize(o.status)}
              </span>
              <h2>{o.courseName}</h2>
              <p>
                {o.orderNumber} · {new Date(o.placedAt).toLocaleString()}
              </p>
              <strong>{formatUsd(o.totals.totalCents)}</strong>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
