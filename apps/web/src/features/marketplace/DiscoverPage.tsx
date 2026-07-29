import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card, TextInput } from '../../components/ui';
import { environment } from '../../config/environment';
import { demoCourses } from '../../data/demo-data';
import {
  getCourseDiscoveryProvider,
  matchCourses,
} from '../../data/course-discovery';
import type { CourseDiscoveryResult } from '../../types/marketplace';
import { labelize } from '../../utils/format';

const FAQ = [
  [
    'What is Golfer Goodies?',
    'A fictional demonstration of a course-operated ordering marketplace.',
  ],
  [
    'How does a golfer place an order?',
    'Choose a participating course, browse its storefront, verify on the first Add, and complete the no-payment demo checkout.',
  ],
  [
    'Who controls prices and inventory?',
    'In the product model, each participating course controls its own catalog and availability. Demo changes remain local.',
  ],
  [
    'Can a course offer pickup and cart delivery?',
    'The demo models pickup and several on-course options when a course enables them.',
  ],
  [
    'How does a golf course join?',
    'Explore the demo application; it submits no real information and performs no verification.',
  ],
  [
    'Does Golfer Goodies process payments?',
    'No. The demonstration never requests or processes real payment details.',
  ],
  [
    'Is this a live marketplace?',
    'No. All people, courses, orders, and operational records are fictional.',
  ],
  [
    'How is location information used?',
    'Location is requested only after an explicit action, is not continuously tracked, and demo mode uses fictional results.',
  ],
  [
    'What happens when a course is closed or paused?',
    'Its storefront remains browseable, but ordering is unavailable.',
  ],
  [
    'Can course staff have different permissions?',
    'Yes. Active course-scoped demo memberships model distinct capabilities; platform roles do not grant course access.',
  ],
] as const;

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
  const scrollToFinder = () =>
    document.getElementById('course-finder')?.scrollIntoView();
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
      <section className="landing-hero" id="about">
        <div>
          <Badge>
            Golf course marketplace demonstration · No real payment is processed
          </Badge>
          <h1>Everything you need on the course—without leaving the game.</h1>
          <p>
            Order food, drinks, golf essentials, and available course services
            directly from participating golf courses. Choose your course, see
            what is available now, and select pickup or an available on-course
            fulfillment option.
          </p>
          <div className="button-row">
            <button
              className="button hero-action"
              type="button"
              onClick={scrollToFinder}
            >
              Find My Course
            </button>
            <Link className="button secondary" to="/partner">
              I Manage a Golf Course
            </Link>
          </div>
        </div>
        <img
          src="images/demo/courses/summit-pines.svg"
          alt="Illustrated fairway representing the fictional Golfer Goodies marketplace"
        />
      </section>
      <section
        className="discovery-module"
        id="course-finder"
        aria-labelledby="finder-heading"
      >
        <span className="eyebrow">Start here</span>
        <h2 id="finder-heading">Find your course</h2>
        <form className="search-panel" onSubmit={search} role="search">
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
        <div className="button-row">
          <button
            className="button secondary"
            type="button"
            onClick={near}
            aria-describedby="location-status"
            disabled={loading}
          >
            Use My Location
          </button>
          <Link className="button secondary" to="/course/summit-pines">
            Enter Course Code
          </Link>
          <Link className="button secondary" to="/course/summit-pines">
            Scan Course QR <small>(demo)</small>
          </Link>
        </div>
        <p id="location-status" role="status" aria-live="polite">
          {message[locationState]}
        </p>
        <p className="privacy-note">
          Location is requested only after you choose it and is never
          continuously tracked. Demo mode uses deterministic fictional results
          instead of real geolocation.
        </p>
      </section>
      {loading && (
        <div className="skeleton" role="status">
          Finding golf courses…
        </div>
      )}
      <Results
        title="Search results"
        items={manual.length ? manual : results}
      />
      {manual.length === 0 && query.trim() && !loading && (
        <p role="status">
          No courses match that search. Try a course, city, state, or ZIP.
        </p>
      )}
      <section aria-labelledby="featured-heading">
        <span className="eyebrow">No location needed</span>
        <h2 id="featured-heading">Explore participating course storefronts</h2>
        <div className="grid featured-courses">
          {demoCourses.slice(0, 5).map((course) => (
            <Card key={course.id}>
              <img
                className="course-card-image"
                src={course.image}
                alt={course.imageAlt}
                loading="lazy"
              />
              <p
                className={`availability ${course.availability === 'open' && !course.orderingPaused ? 'available' : 'unavailable'}`}
              >
                {course.orderingPaused
                  ? 'Paused'
                  : course.availability === 'limited'
                    ? 'Limited fulfillment'
                    : course.availability[0].toUpperCase() +
                      course.availability.slice(1)}
              </p>
              <h3>{course.name}</h3>
              <p>
                {course.city}, {course.state} ·{' '}
                {course.fulfillmentMethods.map(labelize).join(', ')}
              </p>
              <p>
                About {course.estimatedMinutes} minutes
                {course.promotion ? ` · ${course.promotion}` : ''}
              </p>
              <Link className="button" to={`/course/${course.id}`}>
                View Storefront
              </Link>
            </Card>
          ))}
        </div>
      </section>
      <section
        className="how-it-works"
        id="how-it-works"
        aria-labelledby="how-heading"
      >
        <span className="eyebrow">Simple and course-first</span>
        <h2 id="how-heading">How it works</h2>
        <ol>
          <li>
            <strong>Choose your course</strong>
            <span>Search by course name, location, course code, or QR.</span>
          </li>
          <li>
            <strong>Shop what is available now</strong>
            <span>
              See course-controlled inventory, pricing, promotions, hours, and
              fulfillment options.
            </span>
          </li>
          <li>
            <strong>Order and keep playing</strong>
            <span>
              Choose an available pickup or on-course option and track your demo
              order.
            </span>
          </li>
        </ol>
      </section>
      <section
        className="partner-value"
        id="for-courses"
        aria-labelledby="partner-heading"
      >
        <span className="eyebrow">For golf courses</span>
        <h2 id="partner-heading">
          Turn your course into an on-demand marketplace
        </h2>
        <p>
          Control your storefront, inventory, pricing, hours, fulfillment
          options, promotions, customer instructions, and active orders from one
          course-operated workspace.
        </p>
        <div className="benefit-grid">
          {[
            'Manage your storefront',
            'Control products and pricing',
            'Track inventory and sold-out items',
            'Offer pickup or on-course fulfillment',
            'Coordinate active orders',
            'Promote high-margin products',
            'Manage course staff access',
            'Review fictional sales and operations data',
          ].map((benefit) => (
            <article key={benefit}>
              <h3>{benefit}</h3>
            </article>
          ))}
        </div>
        <div className="button-row">
          <Link className="button" to="/partner">
            Explore the Course Partner Demo
          </Link>
          <Link className="button secondary" to="/partner/join">
            Start a Demo Application
          </Link>
        </div>
      </section>
      <section aria-labelledby="platform-heading">
        <h2 id="platform-heading">One marketplace, three perspectives</h2>
        <div className="three-sided">
          <article>
            <h3>Golfers</h3>
            <p>
              Find a course, browse current offerings, and place a browser-local
              demo order.
            </p>
          </article>
          <article>
            <h3>Golf Courses</h3>
            <p>
              Control what is sold, when it is available, and how it is
              fulfilled.
            </p>
          </article>
          <article>
            <h3>Golfer Goodies</h3>
            <p>
              Demonstrates marketplace access, orders, governance, and platform
              visibility.
            </p>
          </article>
        </div>
      </section>
      <section
        className="trust-panel"
        id="demo-trust"
        aria-labelledby="trust-heading"
      >
        <h2 id="trust-heading">Clear about this demonstration</h2>
        <ul>
          <li>All courses and accounts are fictional.</li>
          <li>No real orders, payments, or course verification occur.</li>
          <li>Course and platform actions remain browser-local.</li>
          <li>Location is not continuously tracked.</li>
          <li>Production services are not connected.</li>
        </ul>
      </section>
      <section className="faq" aria-labelledby="faq-heading">
        <h2 id="faq-heading">Frequently asked questions</h2>
        {FAQ.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </section>
      <section className="final-cta">
        <article>
          <h2>Playing today?</h2>
          <button className="button" type="button" onClick={scrollToFinder}>
            Find your course
          </button>
        </article>
        <article>
          <h2>Manage a golf course?</h2>
          <Link className="button secondary" to="/partner">
            Explore the partner platform
          </Link>
        </article>
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
