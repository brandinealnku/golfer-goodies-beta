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
import { formatUsd } from '../../utils/format';
import { useCourseContext } from '../../state/course-context';
export const filterCourses = (courses: Course[], query: string) => {
  const q = query.trim().toLowerCase();
  return courses.filter((c) =>
    `${c.name} ${c.city} ${c.state}`.toLowerCase().includes(q),
  );
};
export function DiscoverPage() {
  const { context } = useCourseContext();
  const [courses, setCourses] = useState<Course[]>();
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    getMarketplaceRepository()
      .then((repository) => repository.getCourses())
      .then((nextCourses) => {
        if (active) setCourses(nextCourses);
      })
      .catch(() => {
        if (active) {
          setError('The fictional course catalog could not be loaded.');
        }
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  const shown = useMemo(
    () => filterCourses(courses ?? [], query),
    [courses, query],
  );
  return (
    <div className="page">
      <PageHeader title="Find a participating course">
        <Badge>Course-first demo</Badge>
      </PageHeader>
      <p>
        Choose a fictional course before browsing its menu. Individual products
        are never shown without course context.
      </p>
      {context.mode === 'none' && (
        <div className="alert" role="status">
          <strong>No course selected.</strong> Search or choose a participating
          course to see its menu.
        </div>
      )}
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
                <dt>Minimum order</dt>
                <dd>{formatUsd(c.minimumOrderCents)}</dd>
                <dt>Menu summary</dt>
                <dd>Food, alcohol-free drinks, gear and turn pickup</dd>
              </dl>
              {c.promotion && (
                <p>
                  <strong>{c.promotion}</strong>
                </p>
              )}
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
