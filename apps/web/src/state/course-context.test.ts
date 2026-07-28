import { describe, expect, it } from 'vitest';
import {
  normalizeCourseContext,
  readStoredCourseContext,
  COURSE_CONTEXT_STORAGE_KEY,
} from './course-context';

const future = '2030-01-01T02:00:00.000Z';
const current = {
  selectedCourseId: 'summit-pines',
  mode: 'ordering_session',
  orderingSession: {
    version: 1,
    id: 's1',
    courseId: 'summit-pines',
    verificationMethod: 'course_code',
    verifiedAt: '2030-01-01T00:00:00.000Z',
    expiresAt: future,
    status: 'active',
    confidence: 'fallback',
  },
};
describe('OrderingSession normalization and migration', () => {
  it('handles no stored context', () =>
    expect(readStoredCourseContext({ getItem: () => null })).toEqual({
      selectedCourseId: null,
      mode: 'none',
    }));
  it('accepts a valid current session', () =>
    expect(
      normalizeCourseContext(current, Date.parse('2030-01-01T01:00:00Z')),
    ).toEqual(current));
  it('expires without extending the timestamp', () =>
    expect(normalizeCourseContext(current, Date.parse(future))).toEqual({
      selectedCourseId: 'summit-pines',
      mode: 'browse',
      expired: true,
    }));
  it('returns revoked sessions to browse mode', () =>
    expect(
      normalizeCourseContext(
        {
          ...current,
          orderingSession: { ...current.orderingSession, status: 'revoked' },
        },
        0,
      ),
    ).toEqual({
      selectedCourseId: 'summit-pines',
      mode: 'browse',
      expired: false,
    }));
  it('rejects a session for another course', () =>
    expect(
      normalizeCourseContext(
        {
          ...current,
          orderingSession: { ...current.orderingSession, courseId: 'cedar' },
        },
        0,
      ),
    ).toEqual({ selectedCourseId: 'summit-pines', mode: 'browse' }));
  it('migrates a valid legacy ActiveRound', () =>
    expect(
      normalizeCourseContext(
        {
          selectedCourseId: 'summit-pines',
          mode: 'active_round',
          activeRound: {
            courseId: 'summit-pines',
            verificationMethod: 'demo_qr',
            verifiedAt: '2030-01-01T00:00:00Z',
            expiresAt: future,
          },
        },
        0,
      ),
    ).toMatchObject({
      mode: 'ordering_session',
      orderingSession: { verificationMethod: 'course_qr', expiresAt: future },
    }));
  it.each([
    { bad: true },
    { selectedCourseId: 'summit-pines', mode: 'active_round', activeRound: {} },
    {
      ...current,
      orderingSession: {
        ...current.orderingSession,
        verificationMethod: 'wifi',
      },
    },
    {
      ...current,
      orderingSession: { ...current.orderingSession, expiresAt: undefined },
    },
  ])('falls back safely for malformed or unsupported data', (value) =>
    expect(normalizeCourseContext(value, 0).mode).not.toBe('ordering_session'),
  );
  it('never throws on malformed JSON', () =>
    expect(
      readStoredCourseContext({
        getItem: (key) => (key === COURSE_CONTEXT_STORAGE_KEY ? '{' : null),
      }),
    ).toEqual({ selectedCourseId: null, mode: 'none' }));
});
