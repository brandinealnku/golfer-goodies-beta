import { expect, it } from 'vitest';
import { normalizeCourseContext } from './course-context';
it('returns an expired Active Round to browse-only mode', () => {
  expect(
    normalizeCourseContext(
      {
        selectedCourseId: 'summit-pines',
        mode: 'active_round',
        activeRound: {
          courseId: 'summit-pines',
          verificationMethod: 'demo_qr',
          verifiedAt: '2026-01-01T00:00:00Z',
          expiresAt: '2026-01-01T01:00:00Z',
        },
      },
      Date.parse('2026-01-02'),
    ),
  ).toEqual({
    selectedCourseId: 'summit-pines',
    mode: 'browse',
    expired: true,
  });
});
