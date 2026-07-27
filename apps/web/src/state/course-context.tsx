import {
  createContext,
  type ReactNode,
  useContext,
  useCallback,
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
    if (!raw) return { selectedCourseId: null, mode: 'none' };
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || !('mode' in value))
      return { selectedCourseId: null, mode: 'none' };
    const candidate = value as Partial<CourseContext>;
    if (candidate.mode === 'none')
      return { selectedCourseId: null, mode: 'none' };
    if (
      typeof candidate.selectedCourseId !== 'string' ||
      (candidate.mode !== 'browse' && candidate.mode !== 'active_round')
    )
      return { selectedCourseId: null, mode: 'none' };
    if (candidate.mode === 'active_round' && !('activeRound' in candidate))
      return { selectedCourseId: candidate.selectedCourseId, mode: 'browse' };
    return normalizeCourseContext(candidate as CourseContext);
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
  const selectCourse = useCallback((courseId: string) => {
    setContext({ selectedCourseId: courseId, mode: 'browse' });
    setAnnouncement('Course changed. Browse-only mode is active.');
  }, []);
  const verify = useCallback((method: VerificationMethod, now = new Date()) => {
    setContext((current) => {
      if (!current.selectedCourseId) return current;
      const round: ActiveRound = {
        courseId: current.selectedCourseId,
        verificationMethod: method,
        verifiedAt: now.toISOString(),
        expiresAt: new Date(
          now.getTime() + ACTIVE_ROUND_MINUTES * 60_000,
        ).toISOString(),
      };
      return {
        selectedCourseId: round.courseId,
        mode: 'active_round',
        activeRound: round,
      };
    });
    setAnnouncement('Demo verification complete. Active Round started.');
  }, []);
  const endRound = useCallback(() => {
    setContext((current) =>
      current.selectedCourseId
        ? { selectedCourseId: current.selectedCourseId, mode: 'browse' }
        : current,
    );
    setAnnouncement('Active Round ended. Browse-only mode is active.');
  }, []);
  const clearCourse = useCallback(() => {
    setContext({ selectedCourseId: null, mode: 'none' });
    setAnnouncement('Course cleared. Choose a course to browse products.');
  }, []);
  const api = useMemo<CourseContextApi>(
    () => ({
      context,
      announcement,
      selectCourse,
      verify,
      endRound,
      clearCourse,
    }),
    [announcement, clearCourse, context, endRound, selectCourse, verify],
  );
  return <Context.Provider value={api}>{children}</Context.Provider>;
}
export function useCourseContext() {
  const value = useContext(Context);
  if (!value)
    throw new Error('useCourseContext requires CourseContextProvider');
  return value;
}
