import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import { getMarketplaceRepository } from '../../data/marketplace-repository';
import { useCourseContext } from '../../state/course-context';
import type { Course } from '../../types/marketplace';
import { useEffect, useState } from 'react';

export function CourseContextHeader() {
  const { context, announcement, endOrderingSession, clearCourse } =
    useCourseContext();
  const [course, setCourse] = useState<Course | null>(null);
  useEffect(() => {
    let current = true;
    if (!context.selectedCourseId) return;
    const courseId = context.selectedCourseId;
    void getMarketplaceRepository()
      .then((repository) => repository.getCourse(courseId))
      .then((value) => current && setCourse(value))
      .catch(() => current && setCourse(null));
    return () => {
      current = false;
    };
  }, [context.selectedCourseId]);
  const selectedCourse =
    course?.id === context.selectedCourseId ? course : undefined;
  return (
    <>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      {selectedCourse && (
        <aside className="course-context" aria-label="Course context">
          <div>
            <strong>
              {context.mode === 'ordering_session'
                ? 'Ordering Session'
                : 'Browsing'}{' '}
              · {selectedCourse.name}
            </strong>
            <span>
              <span className={`status status-${selectedCourse.availability}`}>
                {selectedCourse.availability}
              </span>{' '}
              {context.mode === 'ordering_session'
                ? 'Ordering unlocked'
                : 'Browse menu'}
            </span>
          </div>
          <div className="context-actions">
            <Link
              className="button secondary"
              to="/discover"
              onClick={clearCourse}
            >
              Change course
            </Link>
            {context.mode === 'ordering_session' && (
              <Button onClick={endOrderingSession}>End ordering session</Button>
            )}
          </div>
        </aside>
      )}
    </>
  );
}
