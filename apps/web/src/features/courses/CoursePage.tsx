import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getMarketplaceRepository } from '../../data/marketplace-repository';
import { useCourseContext } from '../../state/course-context';
import { useCart } from '../../state/cart';
import type {
  Course,
  Product,
  ProductModifierOption,
  VerificationMethod,
} from '../../types/marketplace';
import { formatUsd, labelize } from '../../utils/format';

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
export function CoursePage() {
  const { courseId = '' } = useParams();
  const navigate = useNavigate();
  const { context, selectCourse, verify } = useCourseContext();
  const cart = useCart();
  const [course, setCourse] = useState<Course | null>();
  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product>();
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [intent, setIntent] = useState<Product>();
  const [changePending, setChangePending] = useState(false);
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
    context.mode === 'active_round' &&
    context.activeRound.courseId === course.id;
  const blocked = course.availability === 'closed' || course.orderingPaused;
  const openProduct = (p: Product) => setProduct(p);
  const requireRound = (p?: Product) => {
    setIntent(p);
    setProduct(undefined);
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
              ? `Active at ${course.name}`
              : `You’re browsing ${course.name}`}
          </strong>
          <span>
            {active
              ? 'Ordering unlocked for this round.'
              : 'Start your round to unlock ordering.'}
          </span>
        </div>
        {!active && !blocked && (
          <button className="button" onClick={() => requireRound()}>
            Start round
          </button>
        )}
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
        {[...new Set(products.map((p) => p.category))].map((c) => (
          <a key={c} href={`#category-${c}`}>
            {labelize(c)}
          </a>
        ))}
      </nav>
      <div className="page menu">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Your on-course concierge</span>
            <h2>Clubhouse favorites</h2>
          </div>
          <p>Food, refreshments, and round-saving essentials.</p>
        </div>
        {[...new Set(products.map((p) => p.category))].map((category) => (
          <section id={`category-${category}`} key={category}>
            <h2>{labelize(category)}</h2>
            <div className="product-grid">
              {products
                .filter((p) => p.category === category)
                .map((p) => (
                  <article className="product-card" key={p.id}>
                    <button
                      className="product-open"
                      onClick={() => openProduct(p)}
                      aria-label={`View ${p.name} details`}
                    >
                      <img src={p.image} alt={p.imageAlt} loading="lazy" />
                      <span>{p.popular ? 'Popular' : ''}</span>
                      <h3>{p.name}</h3>
                      <p>{p.description}</p>
                      <strong>{formatUsd(p.priceCents)}</strong>
                      <span className="product-card-action" aria-hidden="true">
                        {active && !blocked ? 'View and add' : 'View details'}
                        {' →'}
                      </span>
                    </button>
                  </article>
                ))}
            </div>
          </section>
        ))}
      </div>
      {product && (
        <ProductDetailSheet
          product={product}
          active={active && !blocked}
          onClose={() => setProduct(undefined)}
          onRequireRound={() => requireRound(product)}
          onAdd={(q, m, i) => {
            cart.add(course.id, product, q, m, i);
            setProduct(undefined);
          }}
        />
      )}
      {verifyOpen && (
        <RoundVerificationSheet
          course={course}
          onClose={() => {
            setVerifyOpen(false);
            setIntent(undefined);
          }}
          onVerified={(method) => {
            verify(method);
            setVerifyOpen(false);
            if (intent) setProduct(intent);
            setIntent(undefined);
          }}
        />
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
  onRequireRound,
  onAdd,
}: {
  product: Product;
  active: boolean;
  onClose: () => void;
  onRequireRound: () => void;
  onAdd: (q: number, m: ProductModifierOption[], i: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<ProductModifierOption[]>([]);
  const [instructions, setInstructions] = useState('');
  const firstIncompleteRef = useRef<HTMLFieldSetElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (typeof d?.showModal === 'function') d.showModal();
    else d?.setAttribute('open', '');
    return () => {
      if (typeof d?.close === 'function') d.close();
    };
  }, []);
  const total =
    (product.priceCents + selected.reduce((n, o) => n + o.priceCents, 0)) *
    quantity;
  const incompleteRequiredGroup = product.modifiers?.find(
    (group) =>
      active &&
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
    onAdd(quantity, selected, instructions);
  };
  return (
    <dialog
      ref={ref}
      className="product-sheet"
      aria-labelledby="product-title"
      onCancel={onClose}
      onClose={onClose}
    >
      <button
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
            active &&
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
            className="button"
            aria-disabled={!product.available}
            aria-describedby={addDescriptionIds || undefined}
            onClick={attemptAdd}
          >
            Add · {formatUsd(total)}
          </button>
        ) : (
          <button className="button" onClick={onRequireRound}>
            Start round to order
          </button>
        )}
      </div>
    </dialog>
  );
}
function RoundVerificationSheet({
  course,
  onClose,
  onVerified,
}: {
  course: Course;
  onClose: () => void;
  onVerified: (m: VerificationMethod) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [method, setMethod] =
    useState<VerificationMethod>('simulated_location');
  const [entry, setEntry] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (typeof ref.current?.showModal === 'function') ref.current.showModal();
    else ref.current?.setAttribute('open', '');
    return () => {
      if (typeof ref.current?.close === 'function') ref.current.close();
    };
  }, []);
  const submit = () => {
    if (method === 'simulated_location') {
      if (course.demoLocationResult === 'eligible') onVerified(method);
      else
        setError(
          'This simulated location cannot verify the round. Choose a QR or course code instead.',
        );
      return;
    }
    const expected =
      method === 'demo_qr' ? course.demoQrToken : course.demoCode;
    if (entry.trim().toUpperCase() === expected) onVerified(method);
    else
      setError(
        `That demo ${method === 'demo_qr' ? 'QR token' : 'course code'} does not match. Try again.`,
      );
  };
  return (
    <dialog
      ref={ref}
      className="verification-sheet"
      aria-labelledby="verify-title"
      onCancel={onClose}
    >
      <button
        className="sheet-close"
        onClick={onClose}
        aria-label="Close round verification"
      >
        ×
      </button>
      <h2 id="verify-title">Start your round</h2>
      <p>
        Choose one demonstration method. No continuous location tracking is
        used.
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
          Current location
        </button>
        <button
          type="button"
          aria-pressed={method === 'demo_qr'}
          onClick={() => {
            setMethod('demo_qr');
            setError('');
          }}
        >
          Demo QR
        </button>
        <button
          type="button"
          aria-pressed={method === 'demo_course_code'}
          onClick={() => {
            setMethod('demo_course_code');
            setError('');
          }}
        >
          Course code
        </button>
      </div>
      {method === 'simulated_location' ? (
        <div className="alert">
          <p>
            Demo mode simulates a one-time location check; it never contacts
            geolocation.
          </p>
          {course.demoLocationResult !== 'eligible' && (
            <div className="verification-recovery" role="status">
              <strong>This demo course requires a non-location method.</strong>
              <p>Choose Demo QR or Course code above to continue.</p>
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
          {method === 'demo_qr' ? 'Demo QR token' : 'Demo course code'}
          <input
            id="verification-entry"
            aria-label={
              method === 'demo_qr' ? 'Demo QR token' : 'Demo course code'
            }
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            aria-invalid={Boolean(error)}
          />
          <small>
            Try: {method === 'demo_qr' ? course.demoQrToken : course.demoCode}
          </small>
        </label>
      )}
      <p className="error-message" role="status">
        {error}
      </p>
      <button className="button" onClick={submit}>
        Verify and start round
      </button>
    </dialog>
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
        <button className="button secondary" onClick={onKeep}>
          Keep current course
        </button>
        <button className="button" onClick={onChange}>
          Clear cart and change to {target}
        </button>
      </div>
    </dialog>
  );
}
