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
import { marketplaceRepository } from '../../data/marketplace-repository';
import type { Course, Product } from '../../types/marketplace';
import { formatUsd, labelize } from '../../utils/format';
export function CoursePage() {
  const { courseId = '' } = useParams();
  const [course, setCourse] = useState<Course | null>();
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    void Promise.all([
      marketplaceRepository.getCourse(courseId),
      marketplaceRepository.getProducts(courseId),
    ]).then(([c, p]) => {
      setCourse(c);
      setProducts(p);
    });
  }, [courseId]);
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
