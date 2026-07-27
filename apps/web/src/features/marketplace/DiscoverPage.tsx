import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge,
  Card,
  EmptyState,
  LoadingState,
  PageHeader,
  StatusBadge,
  TextInput,
} from '../../components/ui';
import { getMarketplaceRepository } from '../../data/marketplace-repository';
import type { Course } from '../../types/marketplace';
import { labelize } from '../../utils/format';
import { EmulatorError } from '../../components/EmulatorError';
export const filterCourses = (courses: Course[], query: string) => {
  const q = query.trim().toLowerCase();
  return courses.filter((c) =>
    `${c.name} ${c.city} ${c.state}`.toLowerCase().includes(q),
  );
};
export function DiscoverPage() {
  const [courses, setCourses] = useState<Course[]>();
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    getMarketplaceRepository()
      .then((repository) => repository.getCourses())
      .then(setCourses)
      .catch(() =>
        setError('The fictional course catalog could not be loaded.'),
      );
  }, [attempt]);
  const shown = useMemo(
    () => filterCourses(courses ?? [], query),
    [courses, query],
  );
  return (
    <div className="page">
      <PageHeader title="Discover course favorites">
        <Badge>v0.2 beta foundation</Badge>
      </PageHeader>
      <p>
        Browse five fictional venues. Marketplace ordering is not implemented in
        this phase.
      </p>
      <TextInput
        label="Search courses by name, city, or state"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {error ? (
        <EmulatorError
          message={error}
          onRetry={() => {
            setError('');
            setCourses(undefined);
            setAttempt((value) => value + 1);
          }}
        />
      ) : !courses ? (
        <LoadingState />
      ) : shown.length === 0 ? (
        <EmptyState message="Try another course, city, or state." />
      ) : (
        <section className="grid" aria-label="Fictional courses">
          {shown.map((c) => (
            <Card key={c.id}>
              <div className="card-badges">
                <StatusBadge status={c.availability} />
                {c.verified && <Badge>✓ Verified Course</Badge>}
              </div>
              <h2>{c.name}</h2>
              <p>
                {c.city}, {c.state}
              </p>
              <p>{c.description}</p>
              <dl>
                <dt>Fulfillment</dt>
                <dd>{c.fulfillmentMethods.map(labelize).join(', ')}</dd>
                <dt>Estimate</dt>
                <dd>{c.estimatedMinutes} minutes</dd>
              </dl>
              <Link className="button" to={`/course/${c.id}`}>
                View {c.name}
              </Link>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
