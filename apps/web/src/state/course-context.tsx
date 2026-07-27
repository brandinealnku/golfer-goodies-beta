import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  ActiveRound,
  CourseContext,
  VerificationMethod,
} from '../types/marketplace';

const STORAGE_KEY = 'golfer-goodies.course-context.v1';
export const ACTIVE_ROUND_MINUTES = 120;

export function normalizeCourseContext(
  value: CourseContext,
  now = Date.now(),
): CourseContext {
  if (
    value.mode === 'active_round' &&
    Date.parse(value.activeRound.expiresAt) <= now
  ) {
    return {
      selectedCourseId: value.selectedCourseId,
      mode: 'browse',
      expired: true,
    };
  }
  return value;
}

type CourseContextApi = {
  context: CourseContext;
  announcement: string;
  selectCourse: (courseId: string) => void;
  verify: (method: VerificationMethod, now?: Date) => void;
  endRound: () => void;
  clearCourse: () => void;
};
const Context = createContext<CourseContextApi | null>(null);

function readContext(): CourseContext {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return normalizeCourseContext(
      raw
        ? (JSON.parse(raw) as CourseContext)
        : { selectedCourseId: null, mode: 'none' },
    );
  } catch {
    return { selectedCourseId: null, mode: 'none' };
  }
}

export function CourseContextProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<CourseContext>(readContext);
  const [announcement, setAnnouncement] = useState('No course selected.');
  useEffect(
    () => localStorage.setItem(STORAGE_KEY, JSON.stringify(context)),
    [context],
  );
  useEffect(() => {
    if (context.mode !== 'active_round') return;
    const remaining = Date.parse(context.activeRound.expiresAt) - Date.now();
    if (remaining <= 0) {
      setContext(normalizeCourseContext(context));
      setAnnouncement(
        'Your demo Active Round expired. Browse-only mode is active.',
      );
      return;
    }
    const timer = window.setTimeout(() => {
      setContext(normalizeCourseContext(context));
      setAnnouncement(
        'Your demo Active Round expired. Browse-only mode is active.',
      );
    }, remaining);
    return () => window.clearTimeout(timer);
  }, [context]);
  const api = useMemo<CourseContextApi>(
    () => ({
      context,
      announcement,
      selectCourse(courseId) {
        setContext({ selectedCourseId: courseId, mode: 'browse' });
        setAnnouncement('Course changed. Browse-only mode is active.');
      },
      verify(method, now = new Date()) {
        if (!context.selectedCourseId) return;
        const round: ActiveRound = {
          courseId: context.selectedCourseId,
          verificationMethod: method,
          verifiedAt: now.toISOString(),
          expiresAt: new Date(
            now.getTime() + ACTIVE_ROUND_MINUTES * 60_000,
          ).toISOString(),
        };
        setContext({
          selectedCourseId: round.courseId,
          mode: 'active_round',
          activeRound: round,
        });
        setAnnouncement('Demo verification complete. Active Round started.');
      },
      endRound() {
        if (!context.selectedCourseId) return;
        setContext({
          selectedCourseId: context.selectedCourseId,
          mode: 'browse',
        });
        setAnnouncement('Active Round ended. Browse-only mode is active.');
      },
      clearCourse() {
        setContext({ selectedCourseId: null, mode: 'none' });
        setAnnouncement('Course cleared. Choose a course to browse products.');
      },
    }),
    [announcement, context],
  );
  return <Context.Provider value={api}>{children}</Context.Provider>;
}
export function useCourseContext() {
  const value = useContext(Context);
  if (!value)
    throw new Error('useCourseContext requires CourseContextProvider');
  return value;
}
