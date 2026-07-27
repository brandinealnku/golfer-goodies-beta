import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  ErrorState,
  LoadingState,
  PageHeader,
  StatusBadge,
} from '../../components/ui';
import { getMarketplaceRepository } from '../../data/marketplace-repository';
import type { Course, Product } from '../../types/marketplace';
import { formatUsd, labelize } from '../../utils/format';
import { EmulatorError } from '../../components/EmulatorError';
export function CoursePage() {
  const { courseId = '' } = useParams();
  const [course, setCourse] = useState<Course | null>();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    void Promise.all([
      getMarketplaceRepository().then((repository) =>
        repository.getCourse(courseId),
      ),
      getMarketplaceRepository().then((repository) =>
        repository.getProducts(courseId),
      ),
    ])
      .then(([c, p]) => {
        setCourse(c);
        setProducts(p);
      })
      .catch(() => setError('The local course data could not be loaded.'));
  }, [courseId, attempt]);
  if (error)
    return (
      <div className="page">
        <EmulatorError
          message={error}
          onRetry={() => {
            setError('');
            setCourse(undefined);
            setAttempt((value) => value + 1);
          }}
        />
      </div>
    );
  if (course === undefined) return <LoadingState />;
  if (course === null)
    return <ErrorState message="That fictional course was not found." />;
  return (
    <div className="page">
      <PageHeader title={course.name}>
        {course.verified && <Badge>✓ Verified Course</Badge>}
      </PageHeader>
      <p>
        {course.city}, {course.state}
      </p>
      <p>
        <StatusBadge status={course.availability} /> ·{' '}
        {course.fulfillmentMethods.map(labelize).join(', ')}
      </p>
      <section className="grid" aria-label="Fictional products">
        {products.map((p) => (
          <Card key={p.id}>
            <Badge>{labelize(p.category)}</Badge>
            <h2>{p.name}</h2>
            <p className="price">{formatUsd(p.priceCents)}</p>
            <p>
              {p.available ? 'Available' : 'Unavailable'} · about{' '}
              {p.preparationMinutes} minutes
            </p>
            <Button disabled>Planned for next phase</Button>
          </Card>
        ))}
      </section>
    </div>
  );
}
