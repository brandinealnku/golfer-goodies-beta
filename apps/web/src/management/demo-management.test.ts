import { beforeEach, describe, expect, it } from 'vitest';
import { demoIdentities } from '../auth/identity';
import {
  demoCourse,
  demoCourseProducts,
  dollarsToCents,
  resetDemoManagement,
  submitDemoClaim,
  updateDemoCourse,
  updateDemoProduct,
} from './demo-management';
beforeEach(() => resetDemoManagement());
describe('browser-local management', () => {
  const manager = demoIdentities.find((u) => u.uid === 'summit-manager')!;
  const staff = demoIdentities.find((u) => u.uid === 'summit-fulfillment')!;
  const outsider = demoIdentities.find((u) => u.uid === 'no-course-access')!;
  it('converts dollars without fractional cents', () => {
    expect(dollarsToCents('10.95')).toBe(1095);
    expect(() => dollarsToCents('1.001')).toThrow();
  });
  it('synchronizes course operations and reset', () => {
    updateDemoCourse(manager, 'summit-pines', {
      orderingPaused: true,
      estimatedMinutes: 22,
    });
    expect(demoCourse('summit-pines')?.orderingPaused).toBe(true);
    resetDemoManagement();
    expect(demoCourse('summit-pines')?.orderingPaused).toBeFalsy();
  });
  it('keeps products course-scoped and filters hidden products', () => {
    const id = 'summit-pines-club-sandwich';
    updateDemoProduct(manager, 'summit-pines', id, {
      publiclyVisible: false,
      status: 'hidden',
    });
    expect(demoCourseProducts('summit-pines').some((p) => p.id === id)).toBe(
      false,
    );
    expect(
      demoCourseProducts('cedar-bend-muni').every(
        (p) => p.courseId === 'cedar-bend-muni',
      ),
    ).toBe(true);
  });
  it('allows staff availability but denies price edits', () => {
    const id = 'summit-pines-club-sandwich';
    updateDemoProduct(staff, 'summit-pines', id, {
      available: false,
      status: 'sold_out',
    });
    expect(
      demoCourseProducts('summit-pines').find((p) => p.id === id)?.available,
    ).toBe(false);
    expect(() =>
      updateDemoProduct(staff, 'summit-pines', id, { priceCents: 1 }),
    ).toThrow(/permission/);
  });
  it('denies users without membership and cross-course changes', () => {
    expect(() =>
      updateDemoCourse(outsider, 'summit-pines', { orderingPaused: true }),
    ).toThrow(/permission/);
    expect(() =>
      updateDemoCourse(manager, 'cedar-bend-muni', { orderingPaused: true }),
    ).toThrow(/permission/);
  });
  it('submits a pending claim without granting access', () => {
    const claim = submitDemoClaim(outsider, {
      courseId: 'summit-pines',
      requestedRole: 'course_manager',
      businessEmail: 'person@example.com',
      explanation: 'I help with fictional course operations.',
    });
    expect(claim.status).toBe('submitted');
    expect(() =>
      updateDemoCourse(outsider, 'summit-pines', { orderingPaused: true }),
    ).toThrow();
  });
  it('ignores malformed persisted overrides', () => {
    localStorage.setItem('gg.management.v1', 'not-json');
    expect(demoCourse('summit-pines')?.name).toMatch(/Summit Pines/);
  });
});
