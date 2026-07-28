import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  CourseContext,
  OrderingSession,
  VerificationMethod,
} from '../types/marketplace';

export const COURSE_CONTEXT_STORAGE_KEY = 'golfer-goodies.course-context.v1';
export const ORDERING_SESSION_MINUTES = 120;

const methods: VerificationMethod[] = [
  'geolocation',
  'simulated_location',
  'course_qr',
  'course_code',
];

function validSession(value: unknown): value is OrderingSession {
  if (!value || typeof value !== 'object') return false;
  const session = value as Partial<OrderingSession>;
  return (
    session.version === 1 &&
    typeof session.id === 'string' &&
    typeof session.courseId === 'string' &&
    methods.includes(session.verificationMethod as VerificationMethod) &&
    typeof session.verifiedAt === 'string' &&
    Number.isFinite(Date.parse(session.verifiedAt)) &&
    typeof session.expiresAt === 'string' &&
    Number.isFinite(Date.parse(session.expiresAt)) &&
    ['active', 'expired', 'revoked'].includes(session.status ?? '') &&
    ['high', 'fallback', 'demo'].includes(session.confidence ?? '')
  );
}

export function normalizeCourseContext(
  value: unknown,
  now = Date.now(),
): CourseContext {
  if (!value || typeof value !== 'object')
    return { selectedCourseId: null, mode: 'none' };
  const candidate = value as Record<string, unknown>;
  if (candidate.mode === 'none')
    return { selectedCourseId: null, mode: 'none' };
  if (typeof candidate.selectedCourseId !== 'string')
    return { selectedCourseId: null, mode: 'none' };
  if (candidate.mode === 'browse')
    return {
      selectedCourseId: candidate.selectedCourseId,
      mode: 'browse',
      expired: candidate.expired === true,
    };

  let session: OrderingSession | null = null;
  if (
    candidate.mode === 'ordering_session' &&
    validSession(candidate.orderingSession)
  ) {
    session = candidate.orderingSession;
  } else if (candidate.mode === 'active_round') {
    const legacy = candidate.activeRound as Record<string, unknown> | undefined;
    const legacyMethod =
      legacy?.verificationMethod === 'demo_qr'
        ? 'course_qr'
        : legacy?.verificationMethod === 'demo_course_code'
          ? 'course_code'
          : legacy?.verificationMethod === 'simulated_location'
            ? 'simulated_location'
            : null;
    if (
      legacyMethod &&
      legacy?.courseId === candidate.selectedCourseId &&
      typeof legacy.verifiedAt === 'string' &&
      Number.isFinite(Date.parse(legacy.verifiedAt)) &&
      typeof legacy.expiresAt === 'string' &&
      Number.isFinite(Date.parse(legacy.expiresAt))
    ) {
      session = {
        version: 1,
        id: `migrated-${candidate.selectedCourseId}-${Date.parse(legacy.verifiedAt)}`,
        courseId: candidate.selectedCourseId,
        verificationMethod: legacyMethod,
        verifiedAt: legacy.verifiedAt,
        expiresAt: legacy.expiresAt,
        status: 'active',
        confidence: legacyMethod === 'simulated_location' ? 'demo' : 'fallback',
      };
    }
  }
  if (!session || session.courseId !== candidate.selectedCourseId)
    return { selectedCourseId: candidate.selectedCourseId, mode: 'browse' };
  if (session.status !== 'active' || Date.parse(session.expiresAt) <= now)
    return {
      selectedCourseId: candidate.selectedCourseId,
      mode: 'browse',
      expired: session.status !== 'revoked',
    };
  return {
    selectedCourseId: candidate.selectedCourseId,
    mode: 'ordering_session',
    orderingSession: session,
  };
}

export function readStoredCourseContext(storage: Pick<Storage, 'getItem'>) {
  try {
    const raw = storage.getItem(COURSE_CONTEXT_STORAGE_KEY);
    return normalizeCourseContext(raw ? JSON.parse(raw) : null);
  } catch {
    return { selectedCourseId: null, mode: 'none' } as CourseContext;
  }
}

type CourseContextApi = {
  context: CourseContext;
  announcement: string;
  selectCourse: (courseId: string) => void;
  verify: (method: VerificationMethod, now?: Date) => void;
  endOrderingSession: () => void;
  clearCourse: () => void;
};
const Context = createContext<CourseContextApi | null>(null);

export function CourseContextProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<CourseContext>(() =>
    readStoredCourseContext(localStorage),
  );
  const [announcement, setAnnouncement] = useState('No course selected.');
  useEffect(() => {
    try {
      localStorage.setItem(COURSE_CONTEXT_STORAGE_KEY, JSON.stringify(context));
    } catch {
      // Storage may be unavailable; browsing remains functional.
    }
  }, [context]);
  useEffect(() => {
    if (context.mode !== 'ordering_session') return;
    const remaining =
      Date.parse(context.orderingSession.expiresAt) - Date.now();
    const expire = () => {
      setContext(normalizeCourseContext(context));
      setAnnouncement(
        'Your Ordering Session expired. Verify again to add items or place an order.',
      );
    };
    if (remaining <= 0) return expire();
    const timer = window.setTimeout(expire, remaining);
    return () => window.clearTimeout(timer);
  }, [context]);
  const selectCourse = useCallback((courseId: string) => {
    setContext({ selectedCourseId: courseId, mode: 'browse' });
    setAnnouncement('Course changed. Browse menu is active.');
  }, []);
  const verify = useCallback((method: VerificationMethod, now = new Date()) => {
    setContext((current) => {
      if (!current.selectedCourseId) return current;
      const session: OrderingSession = {
        version: 1,
        id: `session-${current.selectedCourseId}-${now.getTime()}`,
        courseId: current.selectedCourseId,
        verificationMethod: method,
        verifiedAt: now.toISOString(),
        expiresAt: new Date(
          now.getTime() + ORDERING_SESSION_MINUTES * 60_000,
        ).toISOString(),
        status: 'active',
        confidence:
          method === 'simulated_location'
            ? 'demo'
            : method === 'geolocation'
              ? 'high'
              : 'fallback',
      };
      return {
        selectedCourseId: session.courseId,
        mode: 'ordering_session',
        orderingSession: session,
      };
    });
    setAnnouncement('Ordering unlocked.');
  }, []);
  const endOrderingSession = useCallback(() => {
    setContext((current) =>
      current.selectedCourseId
        ? { selectedCourseId: current.selectedCourseId, mode: 'browse' }
        : current,
    );
    setAnnouncement('Ordering Session ended. Browse menu is active.');
  }, []);
  const clearCourse = useCallback(() => {
    setContext({ selectedCourseId: null, mode: 'none' });
    setAnnouncement('Course cleared. Choose a course to browse products.');
  }, []);
  const api = useMemo(
    () => ({
      context,
      announcement,
      selectCourse,
      verify,
      endOrderingSession,
      clearCourse,
    }),
    [
      announcement,
      clearCourse,
      context,
      endOrderingSession,
      selectCourse,
      verify,
    ],
  );
  return <Context.Provider value={api}>{children}</Context.Provider>;
}

export function useCourseContext() {
  const value = useContext(Context);
  if (!value)
    throw new Error('useCourseContext requires CourseContextProvider');
  return value;
}
