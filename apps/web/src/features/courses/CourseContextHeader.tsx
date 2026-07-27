import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import { demoCourses } from '../../data/demo-data';
import { useCourseContext } from '../../state/course-context';

export function CourseContextHeader() {
  const { context, announcement, endRound, clearCourse } = useCourseContext();
  const course = demoCourses.find(
    (item) => item.id === context.selectedCourseId,
  );
  return (
    <>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      {course && (
        <aside className="course-context" aria-label="Course context">
          <div>
            <strong>
              {context.mode === 'active_round' ? 'Active Round' : 'Browsing'} ·{' '}
              {course.name}
            </strong>
            <span>
              <span className={`status status-${course.availability}`}>
                {course.availability}
              </span>{' '}
              {context.mode === 'active_round'
                ? 'Order-ready demo'
                : 'Browse only'}
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
            {context.mode === 'active_round' && (
              <Button onClick={endRound}>End round</Button>
            )}
          </div>
        </aside>
      )}
    </>
  );
}
