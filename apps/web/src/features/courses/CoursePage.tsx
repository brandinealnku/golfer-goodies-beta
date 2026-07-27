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
  CourseEligibility,
  Product,
  VerificationMethod,
} from '../../types/marketplace';
import { formatUsd, labelize } from '../../utils/format';

type NotEligible = Extract<CourseEligibility, { status: 'not_eligible' }>;
export function getCourseRestriction(
  course: Course,
  expired: boolean,
): NotEligible | undefined {
  if (course.availability === 'closed')
    return { status: 'not_eligible', reason: 'course_closed' };
  if (course.orderingPaused)
    return { status: 'not_eligible', reason: 'ordering_paused' };
  if (expired)
    return { status: 'not_eligible', reason: 'verification_expired' };
}

const restrictionMessage: Record<NotEligible['reason'], string> = {
  outside_service_area: 'Outside this course’s service area.',
  course_closed:
    'This course is closed. Browse the menu or choose another course.',
  ordering_paused: 'Ordering is paused. Browse now and try again later.',
  verification_expired: 'Your Active Round expired. Verify again to order.',
};

export function CoursePage() {
  const { courseId = '' } = useParams();
  const { context, selectCourse, verify } = useCourseContext();
  const [course, setCourse] = useState<Course | null>();
  const [products, setProducts] = useState<Product[]>([]);
  const [code, setCode] = useState('');
  const [qr, setQr] = useState('');
  const [message, setMessage] = useState('');
  const [locationEligibility, setLocationEligibility] =
    useState<CourseEligibility>();
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
          setMessage('');
          setLocationEligibility(undefined);
          if (selected && context.selectedCourseId !== courseId)
            selectCourse(courseId);
        }
      })
      .catch(() => current && setCourse(null));
    return () => {
      current = false;
    };
  }, [courseId, context.selectedCourseId, selectCourse]);
  if (course === undefined || (course && course.id !== courseId))
    return <LoadingState />;
  if (!course)
    return (
      <ErrorState message="That fictional course or its products could not be loaded." />
    );
  const active =
    context.mode === 'active_round' &&
    context.activeRound.courseId === course.id;
  const restriction = getCourseRestriction(
    course,
    context.mode === 'browse' && Boolean(context.expired),
  );
  const complete = (method: VerificationMethod) => {
    verify(method);
    setMessage('Demo verification only. No real location was collected.');
  };
  const confirmDemoLocation = () => {
    if (course.demoLocationResult === 'uncertain') {
      setLocationEligibility({
        status: 'uncertain',
        reason: 'low_location_accuracy',
        alternatives: ['demo_qr', 'demo_course_code'],
      });
      setMessage(
        'Demo verification is uncertain. No real location was collected.',
      );
      return;
    }
    if (course.demoLocationResult === 'outside_service_area') {
      setLocationEligibility({
        status: 'not_eligible',
        reason: 'outside_service_area',
      });
      setMessage('Demo result: outside this course’s service area.');
      return;
    }
    complete('simulated_location');
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
      {course.fulfillmentMethods.length === 1 &&
        course.fulfillmentMethods[0] === 'pickup' && (
          <div className="alert" role="status">
            <strong>Pickup-only availability.</strong> On-course delivery is not
            offered here. Browse the pickup menu or choose another course.
          </div>
        )}
      {restriction?.reason === 'verification_expired' && (
        <div className="alert" role="status">
          <strong>Active Round expired.</strong>{' '}
          {restrictionMessage.verification_expired}
        </div>
      )}
      {restriction && restriction.reason !== 'verification_expired' ? (
        <div className="alert" role="status">
          {restrictionMessage[restriction.reason]}{' '}
          <Link to="/discover">Choose another course</Link>.
        </div>
      ) : (
        !active && (
          <section className="verification" aria-labelledby="verify-heading">
            <h2 id="verify-heading">Verify you’re at this course to order</h2>
            <p>
              These methods are demonstrations, not secure location validation.
              No browser location is requested.
            </p>
            <Button onClick={confirmDemoLocation}>Confirm demo location</Button>
            {locationEligibility?.status === 'uncertain' && (
              <div className="alert" role="status">
                <strong>Verification uncertain.</strong> Location accuracy is
                low in this simulation. Use the demo QR or course code instead.
              </div>
            )}
            {locationEligibility?.status === 'not_eligible' && (
              <div className="alert" role="status">
                <strong>Outside service area.</strong> Continue browsing, use a
                non-location demo method, or{' '}
                <Link to="/discover">choose another course</Link>.
              </div>
            )}
            <div className="verification-entry">
              <TextInput
                id="demo-qr"
                label="Demo QR token"
                value={qr}
                onChange={(e) => setQr(e.target.value)}
                aria-describedby={
                  message.startsWith('Demo QR invalid')
                    ? 'qr-help verification-message'
                    : 'qr-help'
                }
                aria-invalid={message.startsWith('Demo QR invalid')}
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
                aria-describedby={
                  message.startsWith('Demo course code invalid')
                    ? 'code-help verification-message'
                    : 'code-help'
                }
                aria-invalid={message.startsWith('Demo course code invalid')}
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
        id="verification-message"
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
              <Button disabled>
                {active
                  ? p.available
                    ? 'Ordering planned — not yet available'
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
