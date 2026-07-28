import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card, PageHeader, TextInput } from '../../components/ui';
import { environment } from '../../config/environment';
import {
  getCourseDiscoveryProvider,
  matchCourses,
} from '../../data/course-discovery';
import type { CourseDiscoveryResult } from '../../types/marketplace';
import { labelize } from '../../utils/format';

type LocationState =
  | 'not-requested'
  | 'requesting'
  | 'denied'
  | 'timed-out'
  | 'unavailable'
  | 'poor-accuracy'
  | 'ready'
  | 'error';
const message: Record<LocationState, string> = {
  'not-requested':
    'Location has not been requested. Manual search is always available.',
  requesting: 'Requesting your location…',
  denied: 'Location permission is unavailable. Search manually below.',
  'timed-out':
    'Location took too long to respond. Search manually or try again.',
  unavailable:
    'Location is unavailable in this browser. Search manually below.',
  'poor-accuracy':
    'Your approximate location was used; distances may be less precise.',
  ready: 'Nearby golf courses loaded.',
  error:
    'Course discovery is unavailable right now. Search again or try later.',
};
export function DiscoverPage() {
  const [locationState, setLocationState] =
    useState<LocationState>('not-requested');
  const [results, setResults] = useState<CourseDiscoveryResult[]>([]);
  const [manual, setManual] = useState<CourseDiscoveryResult[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const provider = getCourseDiscoveryProvider();
  useEffect(() => {
    if (navigator.permissions?.query)
      void navigator.permissions
        .query({ name: 'geolocation' })
        .then((p) => {
          if (p.state === 'denied') setLocationState('denied');
        })
        .catch(() => undefined);
  }, []);
  const near = () => {
    if (environment.mode === 'demo') {
      setLoading(true);
      void provider
        .searchNearby({ latitude: 0, longitude: 0 })
        .then((found) => {
          setResults(matchCourses(found));
          setLocationState('ready');
        })
        .catch(() => setLocationState('error'))
        .finally(() => setLoading(false));
      return;
    }
    if (!navigator.geolocation) {
      setLocationState('unavailable');
      return;
    }
    setLocationState('requesting');
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const found = matchCourses(
            await provider.searchNearby({
              latitude: coords.latitude,
              longitude: coords.longitude,
              radiusMeters: 25000,
            }),
          );
          setResults(found);
          setLocationState(coords.accuracy > 5000 ? 'poor-accuracy' : 'ready');
        } catch {
          setLocationState('error');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLocationState(
          error.code === 1
            ? 'denied'
            : error.code === 3
              ? 'timed-out'
              : 'unavailable',
        );
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };
  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    const term = query.trim();
    setManual([]);
    if (!term) return;
    setLoading(true);
    try {
      setManual(matchCourses(await provider.searchByText({ query: term })));
    } catch {
      setLocationState('error');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="page discovery-page">
      <section className="discovery-hero">
        <PageHeader title="Everything you need, without leaving the course.">
          <Badge>
            {environment.mode === 'demo'
              ? 'Fictional demonstration'
              : `${environment.mode} discovery`}
          </Badge>
        </PageHeader>
        <p>
          Find your course, start your round, and order food, drinks, and golf
          essentials.
        </p>
        <button
          className="button hero-action"
          onClick={near}
          disabled={loading}
        >
          Find nearby courses
        </button>
      </section>
      <section className="location-panel" aria-labelledby="nearby-heading">
        <h2 id="nearby-heading">Courses near you</h2>
        <p>
          We use your location once to find nearby golf courses. We do not
          continuously track or save your precise location.
        </p>
        <button
          className="button"
          onClick={near}
          aria-describedby="location-status"
          disabled={loading}
        >
          Find courses near me
        </button>
        <p id="location-status" role="status" aria-live="polite">
          {message[locationState]}
        </p>
      </section>
      <form className="search-panel" onSubmit={search}>
        <TextInput
          label="Search by course name, city, or ZIP"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="button" disabled={loading}>
          Search courses
        </button>
      </form>
      <p>
        <Link to="/recent">Recent courses</Link> ·{' '}
        <span>Saved courses (not yet available)</span>
      </p>
      {loading && (
        <div className="skeleton" role="status">
          Finding golf courses…
        </div>
      )}
      <Results
        title="Ordering available nearby"
        items={results.filter((r) => r.orderingAvailable)}
      />
      {results.length > 0 && !results.some((r) => r.orderingAvailable) && (
        <p className="alert">
          No order-enabled courses were found nearby. Other real courses are
          listed below.
        </p>
      )}
      <Results
        title="Other nearby golf courses"
        items={results.filter((r) => !r.orderingAvailable)}
      />
      {manual.length === 0 && query.trim() && !loading ? (
        <p role="status">
          No courses match that manual search. Try a course, city, state, or
          ZIP.
        </p>
      ) : (
        <Results title="Manual search results" items={manual} />
      )}
      {(results.some((r) => r.discoveredCourse.provider === 'google_places') ||
        manual.some(
          (r) => r.discoveredCourse.provider === 'google_places',
        )) && (
        <p
          className="google-attribution"
          aria-label="Google Places attribution"
        >
          Google
        </p>
      )}
      <section className="how-it-works" aria-labelledby="how-heading">
        <span className="eyebrow">Your on-course concierge</span>
        <h2 id="how-heading">How it works</h2>
        <ol>
          <li>
            <strong>Find your course</strong>
            <span>Search manually or choose a one-time nearby lookup.</span>
          </li>
          <li>
            <strong>Start your round</strong>
            <span>Use a safe demo verification method.</span>
          </li>
          <li>
            <strong>Order and keep playing</strong>
            <span>Track a local demonstration order.</span>
          </li>
        </ol>
      </section>
    </div>
  );
}
function Results({
  title,
  items,
}: {
  title: string;
  items: CourseDiscoveryResult[];
}) {
  if (!items.length) return null;
  return (
    <section aria-labelledby={title.replaceAll(' ', '-')}>
      <h2 id={title.replaceAll(' ', '-')}>{title}</h2>
      <div className="grid">
        {items.map(
          ({
            discoveredCourse: c,
            marketplaceCourse: m,
            orderingAvailable,
          }) => (
            <Card key={`${c.provider}:${c.providerPlaceId}`}>
              <img
                className="course-card-image"
                src={`images/demo/courses/${m?.id ?? 'cedar-bend'}.svg`}
                alt=""
                loading="lazy"
              />
              <p
                className={`availability ${orderingAvailable ? 'available' : 'unavailable'}`}
              >
                {orderingAvailable
                  ? 'Ordering available'
                  : 'Ordering not available here yet'}
              </p>
              <h3>{c.name}</h3>
              {c.approximateDistanceMiles !== undefined && (
                <p>
                  Approximately {c.approximateDistanceMiles.toFixed(1)} miles
                  away
                </p>
              )}
              <p>{c.formattedAddress}</p>
              {c.businessStatus && c.businessStatus !== 'OPERATIONAL' && (
                <p>{labelize(c.businessStatus)}</p>
              )}
              {orderingAvailable && m ? (
                <>
                  <p>
                    {m.fulfillmentMethods.map(labelize).join(', ')}
                    {m.estimatedMinutes
                      ? ` · About ${m.estimatedMinutes} minutes`
                      : ''}
                  </p>
                  {m.promotion && (
                    <p>
                      <strong>{m.promotion}</strong>
                    </p>
                  )}
                  <Link className="button" to={`/course/${m.id}`}>
                    View course
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    className="button"
                    to={`/discover/course/${encodeURIComponent(c.providerPlaceId)}`}
                    state={{ course: c }}
                  >
                    Request Golfer Goodies
                  </Link>
                  {c.googleMapsUri ? (
                    <a href={c.googleMapsUri} target="_blank" rel="noreferrer">
                      Open {c.name} in Google Maps (new tab)
                    </a>
                  ) : (
                    <p>Google Maps link unavailable.</p>
                  )}
                </>
              )}
            </Card>
          ),
        )}
      </div>
    </section>
  );
}
