import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useIdentity } from '../../auth/IdentityContext';
import { demoProducts } from '../../data/demo-data';
import {
  demoMarketplaceRepository,
  MARKETPLACE_CHANGED,
} from '../../marketplace/demo-repository';
import type {
  MarketplaceDemoState,
  MarketplaceOrderStatus,
} from '../../marketplace/foundation';
import { formatUsd } from '../../utils/format';
const useMarket = () => {
  const [s, set] = useState(() => demoMarketplaceRepository.getState());
  useEffect(() => {
    const f = () => set(demoMarketplaceRepository.getState());
    window.addEventListener(MARKETPLACE_CHANGED, f);
    return () => window.removeEventListener(MARKETPLACE_CHANGED, f);
  }, []);
  return s;
};
const Notice = () => (
  <aside className="portal-disclosure" aria-label="Demo mode notice">
    <strong>Browser-local marketplace demo</strong>
    <span>
      No real application, verification, payment, message, or order is
      submitted.
    </span>
  </aside>
);
const Badge = ({ value }: { value: string }) => (
  <span className="status-badge">{value.replaceAll('_', ' ')}</span>
);
const Card = ({ label, value }: { label: string; value: string | number }) => (
  <article className="summary-card">
    <span>{label}</span>
    <strong>{value}</strong>
  </article>
);
const Empty = ({ title, text }: { title: string; text: string }) => (
  <section className="intentional-empty">
    <h2>{title}</h2>
    <p>{text}</p>
  </section>
);
export function PartnerIndex() {
  const { state, memberships } = useIdentity();
  const membership = memberships.find((item) => item.status === 'active');
  return state.status === 'signed_in' && membership ? (
    <Navigate to={`/partner/course/${membership.courseId}`} replace />
  ) : (
    <div className="portal-page">
      <Notice />
      <h1>Course Partner portal</h1>
      <p>
        Course tools are course-specific. Choose a fictional course employee
        identity with an active membership, or begin demo onboarding. Demo
        onboarding submits no real information, and course changes remain in
        this browser.
      </p>
      <div className="button-row">
        <Link className="button" to="/account">
          Choose Demo Identity
        </Link>
        <Link className="button secondary" to="/partner/join">
          Explore Course Onboarding
        </Link>
        <Link className="button secondary" to="/discover">
          Return to Golfer Marketplace
        </Link>
      </div>
    </div>
  );
}
export function PartnerOverview() {
  const { courseId = 'summit-pines' } = useParams();
  const state = useMarket();
  const sf = state.storefronts.find((x) => x.courseId === courseId);
  const orders = state.orders.filter((x) => x.courseId === courseId);
  if (!sf)
    return (
      <Empty
        title="No storefront"
        text="This course has no demo configuration."
      />
    );
  const count = (x: string) => orders.filter((o) => o.status === x).length;
  return (
    <div className="portal-page">
      <Notice />
      <header className="portal-title">
        <div>
          <p className="eyebrow">Course operations</p>
          <h1>{sf.profile.publicName}</h1>
          <p>{sf.profile.customerMessage}</p>
        </div>
        <Badge value={sf.status} />
      </header>
      <h2>Needs attention now</h2>
      <div className="summary-grid">
        {[
          ['New orders', count('new')],
          ['Preparing', count('preparing')],
          ['Ready', count('ready')],
          ['Delayed', count('delayed')],
          ['Needs attention', count('delayed') + count('needs_clarification')],
        ].map(([label, value]) => (
          <Card key={label} label={String(label)} value={value} />
        ))}
      </div>
      <h2>Quick actions</h2>
      <div className="button-row">
        <button
          onClick={() =>
            demoMarketplaceRepository.updateStorefrontStatus(
              courseId,
              sf.status === 'open' ? 'paused' : 'open',
              'summit-manager',
            )
          }
        >
          {sf.status === 'open' ? 'Pause storefront' : 'Open storefront'}
        </button>
        <Link
          className="button secondary"
          to={`/partner/course/${courseId}/orders`}
        >
          Manage active orders
        </Link>
        <Link className="button secondary" to={`/course/${courseId}`}>
          Preview storefront
        </Link>
      </div>
      <h2>Fictional business snapshot</h2>
      <div className="summary-grid">
        <Card label="Demo orders today" value={orders.length} />
        <Card
          label="Demo gross sales"
          value={formatUsd(orders.reduce((n, o) => n + o.totalCents, 0))}
        />
        <Card
          label="Popular product"
          value={
            demoProducts.find((p) => p.courseId === courseId && p.popular)
              ?.name ?? 'No activity'
          }
        />
        <Card
          label="Low stock"
          value={
            state.inventory.filter(
              (i) =>
                i.quantityAvailable !== undefined &&
                i.lowStockThreshold !== undefined &&
                i.quantityAvailable <= i.lowStockThreshold,
            ).length
          }
        />
        <Card label="Fulfillment mix" value="Pickup demo" />
      </div>
      <h2>Setup checklist</h2>
      <ul className="checklist">
        {[
          'Course profile',
          'Store hours',
          'Products',
          'Inventory',
          'Fulfillment',
          'Payment instructions',
          'Customer messages',
          'Team access',
        ].map((x, i) => (
          <li key={x}>
            {i < 6 ? '✓' : '○'} {x}
          </li>
        ))}
      </ul>
    </div>
  );
}
export function PartnerOrders() {
  const { courseId = 'summit-pines' } = useParams();
  const state = useMarket();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const next: Record<string, MarketplaceOrderStatus> = {
    new: 'accepted',
    accepted: 'preparing',
    preparing: 'ready',
    ready: 'fulfilled',
    delayed: 'preparing',
    needs_clarification: 'accepted',
  };
  const orders = state.orders.filter(
    (o) =>
      o.courseId === courseId &&
      (filter === 'all' || o.status === filter) &&
      (o.orderNumber + o.customerName).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="portal-page">
      <Notice />
      <h1>Order queue</h1>
      <p>Updates remain local and create course audit entries.</p>
      <div className="filters">
        <label>
          Search orders
          <input value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <label>
          Status
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All statuses</option>
            {[
              'new',
              'accepted',
              'preparing',
              'ready',
              'delayed',
              'fulfilled',
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="table-wrap">
        <table>
          <caption>Fictional course orders</caption>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Fulfillment</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <th scope="row">
                  {o.orderNumber}
                  <small>
                    {o.items.map((i) => `${i.quantity}× ${i.name}`)}
                  </small>
                </th>
                <td>{o.customerName}</td>
                <td>
                  <Badge value={o.status} />
                </td>
                <td>{o.fulfillmentMethod.replaceAll('_', ' ')}</td>
                <td>{o.paymentStatus.replaceAll('_', ' ')}</td>
                <td>{formatUsd(o.totalCents)}</td>
                <td>
                  {next[o.status] && (
                    <button
                      onClick={() =>
                        demoMarketplaceRepository.transitionOrder(
                          courseId,
                          o.id,
                          next[o.status],
                          'summit-manager',
                        )
                      }
                    >
                      Mark {next[o.status].replaceAll('_', ' ')}
                    </button>
                  )}
                  <button
                    className="link-button"
                    onClick={() =>
                      demoMarketplaceRepository.transitionOrder(
                        courseId,
                        o.id,
                        'delayed',
                        'summit-manager',
                      )
                    }
                  >
                    Mark delayed
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
const partnerCopy: Record<string, [string, string]> = {
  products: [
    'Products',
    'Manage course-owned catalog visibility and integer-cent prices.',
  ],
  inventory: [
    'Inventory',
    'Review quantities, low-stock thresholds, sold-out state, and attribution.',
  ],
  storefront: [
    'Storefront',
    'Configure profile, hours, payment instructions, and customer messages.',
  ],
  fulfillment: [
    'Fulfillment',
    'Control pickup and delivery methods, fees, minimums, locations, and estimates.',
  ],
  promotions: [
    'Promotions',
    'Model fictional discounts and announcements with eligibility restrictions.',
  ],
  analytics: [
    'Analytics',
    'Review deterministic activity; no analytics warehouse is connected.',
  ],
  team: [
    'Team',
    'Review course-scoped memberships. Users cannot self-promote.',
  ],
  settings: [
    'Settings',
    'Review protected course configuration and demo boundaries.',
  ],
};
export function PartnerSection({
  section: explicitSection,
}: {
  section?: string;
}) {
  const { section: routeSection, courseId = 'summit-pines' } = useParams();
  const section = explicitSection ?? routeSection ?? 'settings';
  const state = useMarket();
  const [title, text] = partnerCopy[section] ?? [
    'Workspace',
    'An intentional repository-backed route.',
  ];
  return (
    <div className="portal-page">
      <Notice />
      <h1>{title}</h1>
      <p>{text}</p>
      {section === 'products' ? (
        <div className="card-grid">
          {demoProducts
            .filter((p) => p.courseId === courseId)
            .map((p) => (
              <Card
                key={p.id}
                label={p.name}
                value={`${formatUsd(p.priceCents)} · ${p.publiclyVisible ? 'Public' : 'Hidden'}`}
              />
            ))}
        </div>
      ) : section === 'inventory' ? (
        <div className="table-wrap">
          <table>
            <caption>Course inventory</caption>
            <thead>
              <tr>
                <th>Product</th>
                <th>Mode</th>
                <th>Available</th>
                <th>Low stock</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {state.inventory.map((i) => (
                <tr key={i.productId}>
                  <th>
                    {demoProducts.find((p) => p.id === i.productId)?.name ??
                      i.productId}
                  </th>
                  <td>{i.mode}</td>
                  <td>{i.quantityAvailable ?? 'Unlimited'}</td>
                  <td>{i.lowStockThreshold ?? '—'}</td>
                  <td>{i.soldOut ? 'Sold out' : 'Available'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : section === 'fulfillment' ? (
        <div className="card-grid">
          {state.storefronts
            .find((s) => s.courseId === courseId)
            ?.fulfillment.map((f) => (
              <Card
                key={f.id}
                label={f.id.replaceAll('_', ' ')}
                value={`${f.enabled ? 'Enabled' : 'Unavailable'} · ${f.preparationMinutes} min`}
              />
            ))}
        </div>
      ) : section === 'promotions' ? (
        <div className="card-grid">
          {state.promotions.map((p) => (
            <Card key={p.id} label={p.title} value={p.publicMessage} />
          ))}
        </div>
      ) : (
        <Empty
          title={`${title} demo boundary`}
          text="This meaningful route reserves a future service implementation and does not claim a live integration."
        />
      )}
    </div>
  );
}
export function OnboardingPage() {
  const { applicationId } = useParams();
  const app = useMarket().applications.find((a) => a.id === applicationId);
  return (
    <div className="portal-page">
      <Notice />
      <p className="eyebrow">Course partner onboarding</p>
      <h1>{app?.courseName ?? 'Join Golfer Goodies'}</h1>
      <ol className="stepper">
        {[
          'Create demo partner account',
          'Find existing course',
          'Claim or add course',
          'Enter verification information',
          'Verification pending',
          'Set up storefront',
          'Preview storefront',
          'Submit for review',
          'Approved or changes requested',
        ].map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ol>
      <h2>Prevent duplicate courses</h2>
      <div className="card-grid">
        <Card label="Already claimed" value="Request team access" />
        <Card label="Existing, unclaimed" value="Begin demo claim" />
        <Card label="Not yet listed" value="Begin demo listing" />
      </div>
      {app && (
        <p>
          Current status: <Badge value={app.status} />
        </p>
      )}
      <p>
        Production onboarding requires trusted server-side identity and business
        verification.
      </p>
      <Link
        className="button"
        to={app ? `/partner/application/${app.id}/setup` : '/partner/claim'}
      >
        Continue demo workflow
      </Link>
    </div>
  );
}
const platformCopy: Record<string, [string, string]> = {
  courses: [
    'Courses',
    'Review storefront, staff, activity, applications, and suspensions.',
  ],
  applications: [
    'Applications',
    'Review fictional onboarding and claims; production approval requires trusted verification.',
  ],
  users: [
    'Users',
    'Review fictional golfers, course staff, and platform roles.',
  ],
  orders: ['Orders', 'Monitor course-scoped status and attention signals.'],
  payments: [
    'Payments',
    'Monitor payment fields; no gateway or funds movement is connected.',
  ],
  disputes: [
    'Disputes',
    'Triage fictional issues; no support service is connected.',
  ],
  moderation: [
    'Moderation',
    'Review trust signals; no production enforcement is connected.',
  ],
  reports: ['Reports', 'Inspect demo summaries; no warehouse is connected.'],
  audit: ['Audit log', 'Review append-only repository actions.'],
};
const Audit = ({ state }: { state: MarketplaceDemoState }) => (
  <div className="table-wrap">
    <table>
      <caption>Fictional audit activity</caption>
      <thead>
        <tr>
          <th>Action</th>
          <th>Scope</th>
          <th>Actor</th>
          <th>Detail</th>
        </tr>
      </thead>
      <tbody>
        {state.audit.map((a) => (
          <tr key={a.id}>
            <th>{a.action}</th>
            <td>{a.scope}</td>
            <td>{a.actorId}</td>
            <td>{a.detail}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
export function PlatformOverview() {
  const s = useMarket();
  return (
    <div className="portal-page">
      <Notice />
      <h1>Marketplace supervision</h1>
      <div className="summary-grid">
        {[
          ['Listed courses', s.storefronts.length],
          [
            'Active courses',
            s.storefronts.filter((x) => x.status === 'open').length,
          ],
          [
            'Accepting orders',
            s.storefronts.filter((x) => x.hours.acceptingOrders).length,
          ],
          ['Pending applications', s.applications.length],
          ['Pending claims', 1],
          ['Active users', 8],
          [
            'Active orders',
            s.orders.filter((x) => x.status !== 'fulfilled').length,
          ],
          [
            'Needs attention',
            s.orders.filter((x) => x.status === 'delayed').length,
          ],
          [
            'Demo GMV',
            formatUsd(s.orders.reduce((n, o) => n + o.totalCents, 0)),
          ],
          ['Suspended courses', s.suspendedCourseIds.length],
          ['Suspended users', s.suspendedUserIds.length],
        ].map(([label, value]) => (
          <Card key={String(label)} label={String(label)} value={value} />
        ))}
      </div>
      <h2>Recent audit activity</h2>
      <Audit state={s} />
    </div>
  );
}
export function PlatformSection() {
  const { section = 'courses' } = useParams();
  const s = useMarket();
  const [title, text] = platformCopy[section] ?? [
    'Platform record',
    'A fictional supervisory record.',
  ];
  return (
    <div className="portal-page">
      <Notice />
      <h1>{title}</h1>
      <p>{text}</p>
      {section === 'courses' ? (
        <div className="card-grid">
          {s.storefronts.map((x) => (
            <article className="summary-card" key={x.courseId}>
              <Link to={`/platform/courses/${x.courseId}`}>
                <strong>{x.profile.publicName}</strong>
              </Link>
              <Badge
                value={
                  s.suspendedCourseIds.includes(x.courseId)
                    ? 'suspended'
                    : x.status
                }
              />
              <button
                onClick={() =>
                  demoMarketplaceRepository.setCourseSuspended(
                    x.courseId,
                    !s.suspendedCourseIds.includes(x.courseId),
                    'platform-admin',
                  )
                }
              >
                {s.suspendedCourseIds.includes(x.courseId)
                  ? 'Reactivate'
                  : 'Suspend'}{' '}
                demo course
              </button>
            </article>
          ))}
        </div>
      ) : section === 'applications' ? (
        <div className="card-grid">
          {s.applications.map((a) => (
            <article className="summary-card" key={a.id}>
              <Link to={`/platform/applications/${a.id}`}>
                <strong>{a.courseName}</strong>
              </Link>
              <Badge value={a.status} />
              <button
                onClick={() =>
                  demoMarketplaceRepository.setApplicationStatus(
                    a.id,
                    'approved',
                    'platform-admin',
                  )
                }
              >
                Approve demo
              </button>
              <button
                className="link-button"
                onClick={() =>
                  demoMarketplaceRepository.setApplicationStatus(
                    a.id,
                    'changes_requested',
                    'platform-admin',
                  )
                }
              >
                Request changes
              </button>
            </article>
          ))}
        </div>
      ) : section === 'users' ? (
        <div className="card-grid">
          {[
            'demo-golfer',
            'summit-owner',
            'summit-manager',
            'platform-admin',
            'suspended-manager',
          ].map((id) => (
            <article className="summary-card" key={id}>
              <Link to={`/platform/users/${id}`}>
                <strong>{id}</strong>
              </Link>
              <span>
                {s.suspendedUserIds.includes(id) ? 'Suspended' : 'Active'}
              </span>
              <button
                onClick={() =>
                  demoMarketplaceRepository.setUserSuspended(
                    id,
                    !s.suspendedUserIds.includes(id),
                    'platform-admin',
                  )
                }
              >
                {s.suspendedUserIds.includes(id) ? 'Reactivate' : 'Suspend'}{' '}
                demo user
              </button>
            </article>
          ))}
        </div>
      ) : section === 'audit' ? (
        <Audit state={s} />
      ) : section === 'orders' ? (
        <PartnerOrders />
      ) : (
        <Empty
          title={`${title} monitoring boundary`}
          text="Demo context is shown intentionally; the corresponding production service is not connected."
        />
      )}
    </div>
  );
}
export function PlatformDetail() {
  const p = useParams();
  const id = p.courseId ?? p.applicationId ?? p.userId ?? p.orderId;
  return (
    <div className="portal-page">
      <Notice />
      <p className="eyebrow">Platform record</p>
      <h1>{id}</h1>
      <p>
        Centralized fictional review context. Every supported administrator
        action is audited; no production action occurs.
      </p>
      <Link to="/platform/audit">Review audit log</Link>
    </div>
  );
}
export function PlatformSettings() {
  const s = useMarket();
  return (
    <div className="portal-page">
      <Notice />
      <h1>Platform settings</h1>
      <p>
        Production marketplace configuration and credentials are unavailable.
      </p>
      <button
        className="danger"
        onClick={() =>
          window.confirm('Reset all browser-local demo marketplace data?') &&
          demoMarketplaceRepository.reset()
        }
      >
        Reset demo marketplace
      </button>
      <p role="status">
        Demo state version {s.version}; reset restores deterministic fictional
        records.
      </p>
    </div>
  );
}
