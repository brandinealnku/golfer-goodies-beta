import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  ErrorState,
  LoadingState,
  PageHeader,
  StatusBadge,
  TextInput,
} from '../../components/ui';
import { getMarketplaceRepository } from '../../data/marketplace-repository';
import { useCourseContext } from '../../state/course-context';
import type {
  Course,
  Product,
  VerificationMethod,
} from '../../types/marketplace';
import { formatUsd, labelize } from '../../utils/format';

export function CoursePage() {
  const { courseId = '' } = useParams();
  const { context, selectCourse, verify } = useCourseContext();
  const [course, setCourse] = useState<Course | null>();
  const [products, setProducts] = useState<Product[]>([]);
  const [code, setCode] = useState('');
  const [qr, setQr] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    let current = true;
    getMarketplaceRepository()
      .then(async (repository) => {
        const selected = await repository.getCourse(courseId);
        const scoped = selected
          ? await repository.getProductsForCourse(courseId)
          : [];
        if (current) {
          setCourse(selected);
          setProducts(scoped);
          if (selected && context.selectedCourseId !== courseId)
            selectCourse(courseId);
        }
      })
      .catch(() => current && setCourse(null));
    return () => {
      current = false;
    };
  }, [courseId]); // selection intentionally follows the route
  if (course === undefined) return <LoadingState />;
  if (!course)
    return (
      <ErrorState message="That fictional course or its products could not be loaded." />
    );
  const active =
    context.mode === 'active_round' &&
    context.activeRound.courseId === course.id;
  const blockedReason =
    course.availability === 'closed'
      ? 'This course is closed. Browse the menu or choose another course.'
      : course.orderingPaused
        ? 'Ordering is paused. Browse now and try again later.'
        : '';
  const complete = (method: VerificationMethod) => {
    verify(method);
    setMessage('Demo verification only. No real location was collected.');
  };
  return (
    <div className="page">
      <PageHeader title={course.name}>
        {course.verified && <Badge>✓ Verified Course</Badge>}
      </PageHeader>
      <p>
        {course.city}, {course.state} ·{' '}
        <StatusBadge status={course.availability} />
      </p>
      <p>
        <strong>Fulfilled by {course.name}</strong>
      </p>
      <dl>
        <dt>Fulfillment methods</dt>
        <dd>{course.fulfillmentMethods.map(labelize).join(', ')}</dd>
        <dt>Estimated fulfillment</dt>
        <dd>{course.estimatedMinutes} minutes</dd>
        <dt>Ordering status</dt>
        <dd>
          {active
            ? `Active Round · ${labelize(context.activeRound.verificationMethod)}`
            : 'Browse only'}
        </dd>
      </dl>
      {context.mode === 'browse' && context.expired && (
        <div className="alert" role="status">
          <strong>Active Round expired.</strong> Verify again to order.
        </div>
      )}
      {blockedReason ? (
        <div className="alert" role="status">
          {blockedReason} <Link to="/discover">Choose another course</Link>.
        </div>
      ) : (
        !active && (
          <section className="verification" aria-labelledby="verify-heading">
            <h2 id="verify-heading">Verify you’re at this course to order</h2>
            <p>
              These methods are demonstrations, not secure location validation.
              No browser location is requested.
            </p>
            <Button onClick={() => complete('simulated_location')}>
              Confirm demo location
            </Button>
            <div className="verification-entry">
              <TextInput
                id="demo-qr"
                label="Demo QR token"
                value={qr}
                onChange={(e) => setQr(e.target.value)}
                aria-describedby="qr-help qr-error"
              />
              <small id="qr-help">Fictional token: {course.demoQrToken}</small>
              <Button
                onClick={() =>
                  qr.trim().toUpperCase() === course.demoQrToken
                    ? complete('demo_qr')
                    : setMessage(
                        'Demo QR invalid. Check the token and try again.',
                      )
                }
              >
                Check demo QR
              </Button>
            </div>
            <div className="verification-entry">
              <TextInput
                id="course-code"
                label="Demo course code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                aria-describedby="code-help code-error"
              />
              <small id="code-help">
                Fictional demonstration code; it is not authentication.
              </small>
              <Button
                onClick={() =>
                  code.trim().toUpperCase() === course.demoCode
                    ? complete('demo_course_code')
                    : setMessage(
                        'Demo course code invalid. Check the code and try again.',
                      )
                }
              >
                Verify demo code
              </Button>
            </div>
          </section>
        )
      )}
      <p
        aria-live="polite"
        className={message.includes('invalid') ? 'error-message' : ''}
      >
        {message}
      </p>
      <h2>Course menu</h2>
      {products.length === 0 ? (
        <div className="state">
          <h3>No products available</h3>
          <p>Try another participating course.</p>
          <Link className="button" to="/discover">
            Change course
          </Link>
        </div>
      ) : (
        <section className="grid" aria-label={`${course.name} products`}>
          {products.map((p) => (
            <Card key={p.id}>
              <Badge>{labelize(p.category)}</Badge>
              <h3>{p.name}</h3>
              <p className="price">{formatUsd(p.priceCents)}</p>
              <p>
                {p.available ? 'Available' : 'Products unavailable'} · about{' '}
                {p.preparationMinutes} minutes
              </p>
              <Button disabled={!active || !p.available}>
                {active
                  ? p.available
                    ? 'Add to cart'
                    : 'Unavailable'
                  : 'Verify course to order'}
              </Button>
              {!active && (
                <p>
                  Browse-only mode: verification is required before adding an
                  item.
                </p>
              )}
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
