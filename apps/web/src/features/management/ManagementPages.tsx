import { useState, type FormEvent } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useIdentity } from '../../auth/IdentityContext';
import type { AuthenticatedUser } from '../../auth/identity';
import {
  hasCapability,
  roleLabel,
  type CourseMembership,
} from '../../auth/authorization';
import {
  allDemoCourseProducts,
  demoCourse,
  dollarsToCents,
  recentAudit,
  resetDemoManagement,
  updateDemoCourse,
} from '../../management/demo-management';
import { formatUsd, labelize } from '../../utils/format';
import type { FulfillmentMethod, Product } from '../../types/marketplace';
import { getCourseManagementRepository } from '../../management/course-management-repository';

function Guard({
  children,
}: {
  children: (
    courseId: string,
    membership: ReturnType<typeof useIdentity>['memberships'][number],
    user: Extract<
      ReturnType<typeof useIdentity>['state'],
      { status: 'signed_in' }
    >['user'],
  ) => React.ReactNode;
}) {
  const { courseId = '' } = useParams();
  const { state, memberships } = useIdentity();
  if (state.status === 'loading')
    return <p role="status">Checking course access…</p>;
  if (state.status !== 'signed_in')
    return (
      <Navigate
        to={`/account?returnTo=${encodeURIComponent(`/manage/course/${courseId}`)}`}
        replace
      />
    );
  const membership = memberships.find((m) => m.courseId === courseId);
  if (!hasCapability(membership, 'view_management_workspace'))
    return (
      <div className="page">
        <h1>Course access denied</h1>
        <p>Your account does not have an active membership for this course.</p>
        <Link className="button" to="/account">
          Return to account
        </Link>
      </div>
    );
  return <>{children(courseId, membership!, state.user)}</>;
}
export function ManageIndex() {
  const { memberships } = useIdentity();
  const first = memberships.find((m) =>
    hasCapability(m, 'view_management_workspace'),
  );
  return first ? (
    <Navigate to={`/manage/course/${first.courseId}`} replace />
  ) : (
    <div className="page">
      <h1>No managed courses</h1>
      <Link to="/account">Request access</Link>
    </div>
  );
}
export function CourseManagementPage() {
  return (
    <Guard>
      {(courseId, membership, user) => (
        <Workspace courseId={courseId} membership={membership} user={user} />
      )}
    </Guard>
  );
}
interface WorkspaceProps {
  courseId: string;
  membership: CourseMembership;
  user: AuthenticatedUser;
}

function Workspace({ courseId, membership, user }: WorkspaceProps) {
  const [revision, setRevision] = useState(0);
  const course = demoCourse(courseId);
  const products = allDemoCourseProducts(courseId);
  const [message, setMessage] = useState('');
  if (!course) return <p>Course unavailable.</p>;
  const canOperations = hasCapability(membership, 'edit_course_operations');
  const canCatalog = hasCapability(membership, 'edit_catalog');
  const audit = recentAudit(courseId);
  async function saveOperations(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    try {
      const fulfillment = d.getAll('fulfillment') as FulfillmentMethod[];
      const changes = {
        orderingPaused: d.get('paused') === 'on',
        estimatedMinutes: Number(d.get('prep')),
        minimumOrderCents: dollarsToCents(String(d.get('minimum'))),
        promotion: String(d.get('promotion')),
        fulfillmentMethods: fulfillment,
      };
      if (user.mode === 'demo') updateDemoCourse(user, courseId, changes);
      else
        await getCourseManagementRepository().updateCourseOperations(
          user,
          courseId,
          {
            ...changes,
            availability: changes.orderingPaused ? 'limited' : 'open',
          },
        );
      setRevision(revision + 1);
      setMessage(
        'Course operations saved. The local golfer storefront is updated.',
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed.');
    }
  }
  return (
    <div className="page management-page">
      <div className="management-heading">
        <div>
          <span className="eyebrow">
            Employee workspace · {roleLabel(membership.role)}
          </span>
          <h1>{course.name}</h1>
          <p>
            {course.orderingPaused
              ? 'Ordering paused'
              : 'Accepting demo orders'}{' '}
            · About {course.estimatedMinutes} min
          </p>
        </div>
        <Link className="button secondary" to={`/course/${courseId}`}>
          Preview storefront
        </Link>
      </div>
      <nav className="management-tabs" aria-label="Course management">
        <a href="#operations">Operations</a>
        <a href="#products">Products</a>
      </nav>
      <section className="management-stats" aria-label="Storefront summary">
        <div className="card">
          <strong>{products.filter((p: Product) => p.available).length}</strong>
          <span>Active products</span>
        </div>
        <div className="card">
          <strong>
            {products.filter((p: Product) => !p.available).length}
          </strong>
          <span>Sold out</span>
        </div>
        <div className="card">
          <strong>{formatUsd(course.minimumOrderCents)}</strong>
          <span>Minimum order</span>
        </div>
      </section>
      {canOperations ? (
        <form
          id="operations"
          className="card form-stack"
          onSubmit={saveOperations}
        >
          <h2>Course operations</h2>
          <label className="check">
            <input
              name="paused"
              type="checkbox"
              defaultChecked={course.orderingPaused}
            />{' '}
            Temporarily pause ordering
          </label>
          <label>
            Default preparation minutes
            <input
              name="prep"
              type="number"
              min="1"
              max="180"
              required
              defaultValue={course.estimatedMinutes}
            />
          </label>
          <label>
            Minimum order (dollars)
            <input
              name="minimum"
              inputMode="decimal"
              required
              defaultValue={(course.minimumOrderCents / 100).toFixed(2)}
            />
          </label>
          <label>
            Promotion text
            <input
              name="promotion"
              maxLength={120}
              defaultValue={course.promotion}
            />
          </label>
          <fieldset>
            <legend>Fulfillment methods</legend>
            {(
              [
                'pickup',
                'cart-delivery',
                'on-course-meetup',
              ] as FulfillmentMethod[]
            ).map((method) => (
              <label className="check" key={method}>
                <input
                  name="fulfillment"
                  type="checkbox"
                  value={method}
                  defaultChecked={course.fulfillmentMethods.includes(method)}
                />
                {labelize(method)}
              </label>
            ))}
          </fieldset>
          <button className="button">Save operations</button>
        </form>
      ) : (
        <section id="operations" className="card">
          <h2>Course operations</h2>
          <p>
            Your {roleLabel(membership.role).toLowerCase()} membership can view
            status but cannot change course settings.
          </p>
        </section>
      )}
      <p role="status" aria-live="polite">
        {message}
      </p>
      <section id="products">
        <div className="section-heading">
          <h2>Products</h2>
          {canCatalog && <span>Catalog editing enabled</span>}
        </div>
        <div className="product-management-list">
          {products.map((product: Product) => (
            <ProductRow
              key={product.id}
              product={product}
              user={user}
              canCatalog={canCatalog}
              refresh={() => setRevision((n: number) => n + 1)}
              setMessage={setMessage}
            />
          ))}
        </div>
      </section>
      {hasCapability(membership, 'view_audit_history') && (
        <section className="card">
          <h2>Recent changes</h2>
          {audit.length ? (
            <ul>
              {audit.map((event) => (
                <li key={event.id}>
                  <strong>{labelize(event.action)}</strong> ·{' '}
                  {event.changedFields.join(', ')}
                </li>
              ))}
            </ul>
          ) : (
            <p>No browser-local management changes yet.</p>
          )}
        </section>
      )}{' '}
      {user.mode === 'demo' && (
        <button
          className="button secondary"
          onClick={() => {
            resetDemoManagement();
            setRevision(revision + 1);
            setMessage('Demo data restored to repository seed values.');
          }}
        >
          Reset demo data
        </button>
      )}
    </div>
  );
}
interface ProductRowProps {
  product: Product;
  user: AuthenticatedUser;
  canCatalog: boolean;
  refresh: () => void;
  setMessage: (message: string) => void;
}

function ProductRow({
  product,
  user,
  canCatalog,
  refresh,
  setMessage,
}: ProductRowProps) {
  const [editing, setEditing] = useState(false);
  async function availability() {
    try {
      const status = product.available ? 'sold_out' : 'active';
      await getCourseManagementRepository().setProductAvailability(
        user,
        product.courseId,
        product.id,
        status,
      );
      refresh();
      setMessage(
        `${product.name} is now ${product.available ? 'sold out' : 'active'}.`,
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Change failed.');
    }
  }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    try {
      await getCourseManagementRepository().updateProduct(
        user,
        product.courseId,
        product.id,
        {
          name: String(d.get('name')),
          priceCents: dollarsToCents(String(d.get('price'))),
          preparationMinutes: Number(d.get('prep')),
          description: String(d.get('description')),
          featured: d.get('featured') === 'on',
          popular: d.get('popular') === 'on',
        },
      );
      setEditing(false);
      refresh();
      setMessage(`${product.name} saved.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed.');
    }
  }
  return (
    <article className="card managed-product">
      <img src={product.image} alt={product.imageAlt} />
      <div>
        <h3>{product.name}</h3>
        <p>
          {labelize(product.category)} · {formatUsd(product.priceCents)} ·{' '}
          {product.preparationMinutes} min
        </p>
        <span
          className={`availability ${product.available ? 'available' : 'unavailable'}`}
        >
          {product.available ? 'Active' : 'Sold out'}
        </span>
      </div>
      <div className="button-row">
        <button className="button secondary" onClick={availability}>
          {product.available ? 'Mark sold out' : 'Mark active'}
        </button>
        {canCatalog && (
          <button
            className="button secondary"
            onClick={() => setEditing(!editing)}
          >
            Edit
          </button>
        )}
      </div>
      {editing && (
        <form className="product-editor form-stack" onSubmit={save}>
          <label>
            Name
            <input name="name" required defaultValue={product.name} />
          </label>
          <label>
            Description
            <textarea
              name="description"
              required
              defaultValue={product.description}
            />
          </label>
          <label>
            Price (dollars)
            <input
              name="price"
              required
              defaultValue={(product.priceCents / 100).toFixed(2)}
            />
          </label>
          <label>
            Preparation minutes
            <input
              name="prep"
              type="number"
              min="1"
              max="180"
              required
              defaultValue={product.preparationMinutes}
            />
          </label>
          <label className="check">
            <input
              name="featured"
              type="checkbox"
              defaultChecked={product.featured}
            />
            Featured
          </label>
          <label className="check">
            <input
              name="popular"
              type="checkbox"
              defaultChecked={product.popular}
            />
            Popular
          </label>
          <button className="button">Save product</button>
        </form>
      )}
    </article>
  );
}
