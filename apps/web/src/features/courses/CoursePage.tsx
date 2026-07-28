import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getMarketplaceRepository } from '../../data/marketplace-repository';
import { useCourseContext } from '../../state/course-context';
import { useCart } from '../../state/cart';
import type {
  Course,
  Product,
  ProductCategory,
  ProductModifierOption,
  VerificationMethod,
} from '../../types/marketplace';
import { formatUsd, labelize } from '../../utils/format';
import { ModalOverlay } from '../../components/ModalOverlay';
import {
  validatePendingOrderingIntent,
  type PendingOrderingIntent,
} from '../../state/pending-ordering-intent';
import { createDemoVerifier } from '../../services/course-eligibility';

export function getCourseRestriction(course: Course, expired: boolean) {
  if (course.availability === 'closed')
    return {
      status: 'not_eligible' as const,
      reason: 'course_closed' as const,
    };
  if (course.orderingPaused)
    return {
      status: 'not_eligible' as const,
      reason: 'ordering_paused' as const,
    };
  if (expired)
    return {
      status: 'not_eligible' as const,
      reason: 'verification_expired' as const,
    };
}
export function QuantityStepper({
  value,
  onChange,
  name,
}: {
  value: number;
  onChange: (n: number) => void;
  name: string;
}) {
  return (
    <div className="quantity-stepper">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label={`Decrease ${name} quantity`}
      >
        −
      </button>
      <output aria-live="polite">{value}</output>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label={`Increase ${name} quantity`}
      >
        +
      </button>
    </div>
  );
}
class OverlayErrorBoundary extends Component<
  { children: ReactNode; label: string; onRetry: () => void },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidCatch(error: Error) {
    if (import.meta.env.DEV) console.error('Overlay rendering failed', error);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="page overlay-error" role="alert">
        <h2>We couldn’t open {this.props.label}</h2>
        <p>The course page is still available. Try opening it again.</p>
        <button
          type="button"
          className="button"
          onClick={() => {
            this.setState({ error: false });
            this.props.onRetry();
          }}
        >
          Try again
        </button>
      </div>
    );
  }
}
export function CoursePage() {
  const { courseId = '' } = useParams();
  const navigate = useNavigate();
  const { context, selectCourse, verify } = useCourseContext();
  const cart = useCart();
  const [course, setCourse] = useState<Course | null>();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [pendingIntent, setPendingIntent] =
    useState<PendingOrderingIntent | null>(null);
  const [changePending, setChangePending] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    ProductCategory | 'all'
  >('all');
  const productButtons = useRef(new Map<string, HTMLButtonElement>());
  useEffect(() => {
    let live = true;
    getMarketplaceRepository()
      .then(async (r) => {
        const c = await r.getCourse(courseId);
        const p = c ? await r.getProductsForCourse(courseId) : [];
        if (live) {
          setCourse(c);
          setProducts(p);
          if (c && context.selectedCourseId !== courseId) {
            if (cart.cart && cart.cart.courseId !== courseId && cart.itemCount)
              setChangePending(true);
            else selectCourse(courseId);
          }
        }
      })
      .catch(() => live && setCourse(null));
    return () => {
      live = false;
    };
  }, [
    courseId,
    context.selectedCourseId,
    selectCourse,
    cart.cart,
    cart.itemCount,
  ]);
  useEffect(() => {
    setSelectedProductId(null);
    setPendingIntent(null);
    setVerifyOpen(false);
    setSelectedCategory('all');
  }, [courseId]);
  useEffect(() => {
    if (
      selectedCategory !== 'all' &&
      !products.some((product) => product.category === selectedCategory)
    )
      setSelectedCategory('all');
  }, [products, selectedCategory]);
  if (course === undefined)
    return (
      <div className="page skeleton" role="status">
        Preparing the clubhouse…
      </div>
    );
  if (!course)
    return (
      <div className="page">
        <h1>Course unavailable</h1>
        <Link className="button" to="/discover">
          Find another course
        </Link>
      </div>
    );
  const active =
    context.mode === 'ordering_session' &&
    context.orderingSession.courseId === course.id;
  const blocked = course.availability === 'closed' || course.orderingPaused;
  const categories = [...new Set(products.map((product) => product.category))];
  const categoryIsAvailable =
    selectedCategory === 'all' || categories.includes(selectedCategory);
  const effectiveCategory = categoryIsAvailable ? selectedCategory : 'all';
  const displayedCategories =
    effectiveCategory === 'all' ? categories : [effectiveCategory];
  const displayedProducts =
    effectiveCategory === 'all'
      ? products
      : products.filter((product) => product.category === effectiveCategory);
  const selectedProduct = products.find(
    (p) => p.id === selectedProductId && p.courseId === courseId,
  );
  const returnFocus = selectedProductId
    ? productButtons.current.get(selectedProductId)
    : pendingIntent
      ? productButtons.current.get(pendingIntent.productId)
      : null;
  const openProduct = (productId: string) => setSelectedProductId(productId);
  const requireVerification = (intent: PendingOrderingIntent) => {
    setPendingIntent(intent);
    setSelectedProductId(null);
    setVerifyOpen(true);
  };
  return (
    <div className="storefront">
      <section className="course-hero">
        <img src={course.image} alt={course.imageAlt} />
        <div>
          <span
            className={`availability ${blocked ? 'unavailable' : 'available'}`}
          >
            {course.orderingPaused
              ? 'Ordering paused'
              : course.availability === 'closed'
                ? 'Closed'
                : 'Open for demo ordering'}
          </span>
          <h1>{course.name}</h1>
          <p>
            {course.city}, {course.state} · {course.description}
          </p>
          <p>
            <strong>
              {course.fulfillmentMethods.map(labelize).join(' · ')}
            </strong>{' '}
            · About {course.estimatedMinutes} min
          </p>
        </div>
      </section>
      <div className="round-banner">
        <div>
          <strong>
            {active
              ? `Ordering unlocked at ${course.name}`
              : `You’re browsing ${course.name}`}
          </strong>
          <span>
            {active
              ? `Ordering Session expires at ${new Date(context.mode === 'ordering_session' ? context.orderingSession.expiresAt : 0).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.`
              : 'Browse the menu. Verify when you’re ready to add an item.'}
          </span>
        </div>
        <Link className="button secondary" to="/discover">
          Change course
        </Link>
      </div>
      {blocked && (
        <div className="page">
          <div className="alert" role="status">
            <strong>
              {course.orderingPaused
                ? 'Ordering is taking a short pause.'
                : 'The clubhouse is closed.'}
            </strong>{' '}
            You can browse the menu, but items cannot be added right now.
          </div>
        </div>
      )}
      <nav className="category-nav" aria-label="Menu categories">
        {(['all', ...categories] as const).map((category) => {
          const selected = effectiveCategory === category;
          const label = category === 'all' ? 'All' : labelize(category);
          return (
            <button
              key={category}
              type="button"
              aria-label={`${label} products`}
              aria-pressed={selected}
              onClick={() => setSelectedCategory(category)}
            >
              <span className="category-selected-indicator" aria-hidden="true">
                {selected ? '✓' : ''}
              </span>
              {label}
            </button>
          );
        })}
      </nav>
      <div className="page menu">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Your on-course concierge</span>
            <h2>
              {effectiveCategory === 'all'
                ? 'Clubhouse favorites'
                : `${labelize(effectiveCategory)} at ${course.name}`}
            </h2>
          </div>
          <p>
            {effectiveCategory === 'all'
              ? 'Food, refreshments, and round-saving essentials.'
              : `Showing only ${labelize(effectiveCategory).toLowerCase()} products from this course.`}
          </p>
        </div>
        {displayedProducts.length === 0 ? (
          <div className="category-empty state" role="status">
            <h3>
              {effectiveCategory === 'all'
                ? 'No products available right now'
                : `No ${labelize(effectiveCategory).toLowerCase()} items right now`}
            </h3>
            <p>Explore the complete course menu for another option.</p>
            <button
              type="button"
              className="button"
              onClick={() => setSelectedCategory('all')}
            >
              View all products
            </button>
          </div>
        ) : (
          displayedCategories.map((category) => (
            <section id={`category-${category}`} key={category}>
              <h2>{labelize(category)}</h2>
              <div className="product-grid">
                {displayedProducts
                  .filter((p) => p.category === category)
                  .map((p) => (
                    <article className="product-card" key={p.id}>
                      <button
                        type="button"
                        className="product-open"
                        data-product-id={p.id}
                        ref={(node) => {
                          if (node) productButtons.current.set(p.id, node);
                          else productButtons.current.delete(p.id);
                        }}
                        onClick={() => openProduct(p.id)}
                        aria-label={`View ${p.name} details`}
                      >
                        <img src={p.image} alt={p.imageAlt} loading="lazy" />
                        <span>{p.popular ? 'Popular' : ''}</span>
                        <h3>{p.name}</h3>
                        <p>{p.description}</p>
                        <strong>{formatUsd(p.priceCents)}</strong>
                        <span
                          className="product-card-action"
                          aria-hidden="true"
                        >
                          {active && !blocked ? 'View and add' : 'View details'}
                          {' →'}
                        </span>
                      </button>
                    </article>
                  ))}
              </div>
            </section>
          ))
        )}
      </div>
      {selectedProduct && (
        <OverlayErrorBoundary
          key={selectedProduct.id}
          label="product details"
          onRetry={() => setSelectedProductId(selectedProduct.id)}
        >
          <ProductDetailSheet
            product={selectedProduct}
            active={active && !blocked}
            returnFocus={returnFocus}
            onClose={() => setSelectedProductId(null)}
            onRequireVerification={(q, m, i) =>
              requireVerification({
                courseId: course.id,
                productId: selectedProduct.id,
                quantity: q,
                modifierOptionIds: m.map((option) => option.id),
                specialInstructions: i,
                originatingAction: 'add',
              })
            }
            onAdd={(q, m, i) => {
              cart.add(course.id, selectedProduct, q, m, i);
              setSelectedProductId(null);
            }}
          />
        </OverlayErrorBoundary>
      )}
      {verifyOpen && (
        <OverlayErrorBoundary
          key={`verification-${course.id}`}
          label="course verification"
          onRetry={() => setVerifyOpen(true)}
        >
          <RoundVerificationSheet
            course={course}
            returnFocus={returnFocus}
            onClose={() => {
              setVerifyOpen(false);
              setPendingIntent(null);
            }}
            onVerified={(method) => {
              const validated = pendingIntent
                ? validatePendingOrderingIntent(
                    pendingIntent,
                    course.id,
                    products,
                  )
                : null;
              if (!validated) {
                setVerifyOpen(false);
                setPendingIntent(null);
                return;
              }
              verify(method);
              cart.add(
                course.id,
                validated.product,
                pendingIntent!.quantity,
                validated.modifiers,
                pendingIntent!.specialInstructions,
              );
              setVerifyOpen(false);
              setPendingIntent(null);
            }}
          />
        </OverlayErrorBoundary>
      )}
      {changePending && (
        <CourseChangeDialog
          currentName={
            cart.cart
              ? [
                  'summit-pines',
                  'meadow-loop',
                  'circuit-links',
                  'heritage-oaks',
                  'cedar-bend',
                ].includes(cart.cart.courseId)
                ? 'your current course'
                : 'current course'
              : 'current course'
          }
          target={course.name}
          onKeep={() => navigate(`/course/${cart.cart?.courseId}`)}
          onChange={() => {
            cart.clear();
            selectCourse(course.id);
            setChangePending(false);
          }}
        />
      )}
    </div>
  );
}
function ProductDetailSheet({
  product,
  active,
  onClose,
  onRequireVerification,
  onAdd,
  returnFocus,
}: {
  product: Product;
  active: boolean;
  onClose: () => void;
  onRequireVerification: (
    q: number,
    m: ProductModifierOption[],
    i: string,
  ) => void;
  onAdd: (q: number, m: ProductModifierOption[], i: string) => void;
  returnFocus?: HTMLElement | null;
}) {
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<ProductModifierOption[]>([]);
  const [instructions, setInstructions] = useState('');
  const firstIncompleteRef = useRef<HTMLFieldSetElement>(null);
  const total =
    (product.priceCents + selected.reduce((n, o) => n + o.priceCents, 0)) *
    quantity;
  const incompleteRequiredGroup = product.modifiers?.find(
    (group) =>
      group.required &&
      !group.options.some((option) =>
        selected.some((selection) => selection.id === option.id),
      ),
  );
  const addDescriptionIds = [
    !product.available ? 'product-unavailable-message' : '',
    incompleteRequiredGroup
      ? `modifier-${incompleteRequiredGroup.id}-requirement`
      : '',
  ]
    .filter(Boolean)
    .join(' ');
  const attemptAdd = () => {
    if (!product.available) return;
    if (incompleteRequiredGroup) {
      firstIncompleteRef.current?.focus();
      return;
    }
    if (active) onAdd(quantity, selected, instructions);
    else onRequireVerification(quantity, selected, instructions);
  };
  return (
    <ModalOverlay
      className="product-sheet"
      labelledBy="product-title"
      onClose={onClose}
      returnFocus={returnFocus}
      dataAttributes={{
        'data-product-sheet': '',
        'data-product-id': product.id,
      }}
    >
      <button
        type="button"
        className="sheet-close"
        onClick={onClose}
        aria-label="Close product details"
      >
        ×
      </button>
      <img src={product.image} alt={product.imageAlt} />
      <div className="sheet-content">
        <span className="eyebrow">{labelize(product.category)}</span>
        <h2 id="product-title">{product.name}</h2>
        <p>{product.description}</p>
        <div className="chips">
          {product.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <p>
          <strong>{formatUsd(product.priceCents)}</strong> · Ready in about{' '}
          {product.preparationMinutes} min
        </p>
        {!product.available && (
          <p id="product-unavailable-message" className="error-message">
            This item is unavailable and cannot be added right now.
          </p>
        )}
        {product.modifiers?.map((g) => {
          const missing =
            g.required &&
            !g.options.some((option) =>
              selected.some((selection) => selection.id === option.id),
            );
          const requirementId = `modifier-${g.id}-requirement`;
          return (
            <fieldset
              key={g.id}
              ref={
                g.id === incompleteRequiredGroup?.id
                  ? firstIncompleteRef
                  : undefined
              }
              tabIndex={-1}
              aria-describedby={missing ? requirementId : undefined}
              className={
                missing
                  ? 'modifier-group modifier-group-required'
                  : 'modifier-group'
              }
            >
              <legend>
                {g.name}
                {g.required ? ' (required)' : ''}
              </legend>
              {g.options.map((o) => (
                <label className="choice" key={o.id}>
                  <input
                    type="radio"
                    name={g.id}
                    checked={selected.some((s) => s.id === o.id)}
                    onChange={() =>
                      setSelected((s) => [
                        ...s.filter(
                          (v) => !g.options.some((x) => x.id === v.id),
                        ),
                        o,
                      ])
                    }
                  />
                  {o.name} {o.priceCents ? `+${formatUsd(o.priceCents)}` : ''}
                </label>
              ))}
              <p
                id={requirementId}
                className="modifier-requirement"
                role="status"
                aria-live="polite"
              >
                {missing
                  ? `Choose ${g.name.replace(/^Choose /i, '').toLowerCase()} to continue.`
                  : ''}
              </p>
            </fieldset>
          );
        })}
        <label className="field">
          Special instructions
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            maxLength={160}
          />
        </label>
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          name={product.name}
        />
      </div>
      <div className="sheet-action">
        {active ? (
          <button
            type="button"
            className="button"
            aria-disabled={!product.available}
            aria-describedby={addDescriptionIds || undefined}
            onClick={attemptAdd}
          >
            Add · {formatUsd(total)}
          </button>
        ) : (
          <button type="button" className="button" onClick={attemptAdd}>
            Verify you’re at this course
          </button>
        )}
      </div>
    </ModalOverlay>
  );
}
function RoundVerificationSheet({
  course,
  onClose,
  onVerified,
  returnFocus,
}: {
  course: Course;
  onClose: () => void;
  onVerified: (m: VerificationMethod) => void;
  returnFocus?: HTMLElement | null;
}) {
  const [method, setMethod] = useState<VerificationMethod | null>(null);
  const [entry, setEntry] = useState('');
  const [error, setError] = useState('');
  const submit = async () => {
    if (!method) return;
    if (method === 'simulated_location') {
      const result = await createDemoVerifier(course).verifyLocation({
        courseId: course.id,
      });
      if (result.status === 'eligible') onVerified(method);
      else if (result.status === 'uncertain')
        setError(
          'Your location may overlap the course boundary. Try location again, scan the course QR, or enter the course code.',
        );
      else
        setError(
          'Ordering cannot be unlocked with this location. Scan the course QR or enter the course code instead.',
        );
      return;
    }
    const expected =
      method === 'course_qr' ? course.demoQrToken : course.demoCode;
    if (entry.trim().toUpperCase() === expected) onVerified(method);
    else
      setError(
        `That demo ${method === 'course_qr' ? 'QR token' : 'course code'} does not match. Try again.`,
      );
  };
  return (
    <ModalOverlay
      className="verification-sheet"
      labelledBy="verify-title"
      onClose={onClose}
      returnFocus={returnFocus}
      dataAttributes={{ 'data-verification-sheet': '' }}
    >
      <button
        type="button"
        className="sheet-close"
        onClick={onClose}
        aria-label="Close course verification"
      >
        ×
      </button>
      <h2 id="verify-title">Confirm you’re at {course.name}</h2>
      <p>
        Ordering is available to guests currently at this course. Choose a
        verification method to unlock ordering.
      </p>
      <div
        className="method-tabs"
        role="group"
        aria-label="Verification method"
      >
        <button
          type="button"
          aria-pressed={method === 'simulated_location'}
          onClick={() => {
            setMethod('simulated_location');
            setError('');
          }}
        >
          Use my location
        </button>
        <button
          type="button"
          aria-pressed={method === 'course_qr'}
          onClick={() => {
            setMethod('course_qr');
            setError('');
          }}
        >
          Scan course QR
        </button>
        <button
          type="button"
          aria-pressed={method === 'course_code'}
          onClick={() => {
            setMethod('course_code');
            setError('');
          }}
        >
          Enter course code
        </button>
      </div>
      {method === null ? (
        <p className="location-privacy">
          Location is requested only after you choose Use my location. Precise
          location is used only for this eligibility check and is not saved in
          your browser.
        </p>
      ) : method === 'simulated_location' ? (
        <div className="alert">
          <p>
            Demo mode simulates a one-time location check after this explicit
            action. It does not request browser location.
          </p>
          {course.demoLocationResult !== 'eligible' && (
            <div className="verification-recovery" role="status">
              <strong>A fallback method may be needed at this course.</strong>
              <p>Choose Scan course QR or Enter course code to continue.</p>
              <dl>
                <dt>Fictional QR token</dt>
                <dd>
                  <code>{course.demoQrToken}</code>
                </dd>
                <dt>Fictional course code</dt>
                <dd>
                  <code>{course.demoCode}</code>
                </dd>
              </dl>
            </div>
          )}
        </div>
      ) : (
        <label className="field" htmlFor="verification-entry">
          {method === 'course_qr' ? 'Demo QR token' : 'Demo course code'}
          <input
            id="verification-entry"
            aria-label={
              method === 'course_qr' ? 'Demo QR token' : 'Demo course code'
            }
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            aria-invalid={Boolean(error)}
          />
          <small>
            Try: {method === 'course_qr' ? course.demoQrToken : course.demoCode}
          </small>
        </label>
      )}
      <p className="error-message" role="status">
        {error}
      </p>
      {method && (
        <button type="button" className="button" onClick={submit}>
          {method === 'simulated_location'
            ? 'Check location'
            : 'Unlock ordering'}
        </button>
      )}
    </ModalOverlay>
  );
}
function CourseChangeDialog({
  currentName,
  target,
  onKeep,
  onChange,
}: {
  currentName: string;
  target: string;
  onKeep: () => void;
  onChange: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (typeof ref.current?.showModal === 'function') ref.current.showModal();
    else ref.current?.setAttribute('open', '');
  }, []);
  return (
    <dialog ref={ref} aria-labelledby="change-title">
      <h2 id="change-title">Change courses?</h2>
      <p>
        Changing courses will clear the {currentName} cart because each order
        belongs to one course.
      </p>
      <div className="button-row">
        <button type="button" className="button secondary" onClick={onKeep}>
          Keep current course
        </button>
        <button type="button" className="button" onClick={onChange}>
          Clear cart and change to {target}
        </button>
      </div>
    </dialog>
  );
}
