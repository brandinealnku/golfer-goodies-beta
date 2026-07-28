import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { environment } from '../../config/environment';
import type { DiscoveredGolfCourse } from '../../types/marketplace';
export function ExternalCoursePage() {
  const course = (
    useLocation().state as { course?: DiscoveredGolfCourse } | null
  )?.course;
  const [sent, setSent] = useState(false);
  if (!course) return <Navigate to="/discover" replace />;
  return (
    <main className="page">
      <Link to="/discover">← Back to nearby courses</Link>
      <h1>{course.name}</h1>
      <p>{course.formattedAddress}</p>
      {course.approximateDistanceMiles !== undefined && (
        <p>
          Approximately {course.approximateDistanceMiles.toFixed(1)} miles away
        </p>
      )}
      <div className="alert">
        <strong>Ordering not available here yet.</strong>
        <p>
          This external course has no menu, products, Ordering Session, or
          marketplace ordering context.
        </p>
      </div>
      {course.googleMapsUri ? (
        <a href={course.googleMapsUri} target="_blank" rel="noreferrer">
          Open in Google Maps (new tab)
        </a>
      ) : (
        <p>Google Maps link unavailable.</p>
      )}
      <h2>Request Golfer Goodies</h2>
      {sent ? (
        <p role="status">
          Request recorded for this {environment.mode} demonstration. It does
          not email, onboard, or activate the course.
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <p>
            Provider Place ID: <code>{course.providerPlaceId}</code>
          </p>
          <label className="field">
            Optional note
            <textarea name="note" maxLength={500} />
          </label>
          <label className="field">
            Optional email placeholder
            <input name="email" type="email" autoComplete="email" />
          </label>
          <p>
            This request is{' '}
            {environment.mode === 'demo'
              ? 'local-only'
              : environment.mode === 'emulator'
                ? 'emulator-backed'
                : 'connected demonstration data'}{' '}
            and sends no email.
          </p>
          <button className="button">Request Golfer Goodies</button>
        </form>
      )}
    </main>
  );
}
