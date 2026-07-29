import { beforeEach, describe, expect, it, vi } from 'vitest';
import { demoProducts, demoCourses } from '../data/demo-data';
import {
  createDemoMarketplaceState,
  DemoMarketplaceRepository,
  MARKETPLACE_STORE_KEY,
  courseCanAcceptOrders,
  productCanBeOrdered,
} from './demo-repository';

describe('marketplace demo repository', () => {
  beforeEach(() => localStorage.clear());
  it('recovers corrupt state and resets deterministic versioned records', () => {
    localStorage.setItem(MARKETPLACE_STORE_KEY, '{bad');
    const repo = new DemoMarketplaceRepository();
    expect(repo.getState().version).toBe(1);
    repo.setCourseSuspended('summit-pines', true, 'platform-admin');
    expect(repo.getState().suspendedCourseIds).toContain('summit-pines');
    repo.reset();
    expect(repo.getState()).toEqual(createDemoMarketplaceState());
  });
  it('keeps order transitions course scoped and audits staff actions', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(
      '00000000-0000-4000-8000-000000000001',
    );
    const repo = new DemoMarketplaceRepository();
    expect(() =>
      repo.transitionOrder(
        'cedar-bend-muni',
        'order-101',
        'accepted',
        'cedar-manager',
      ),
    ).toThrow(/course/);
    const changed = repo.transitionOrder(
      'summit-pines',
      'order-101',
      'accepted',
      'summit-manager',
    );
    expect(changed.status).toBe('accepted');
    expect(repo.list()[0]).toMatchObject({
      scope: 'course',
      action: 'order.status_changed',
      courseId: 'summit-pines',
    });
  });
  it('captures integer-cent order prices independent of catalog changes', () => {
    const state = createDemoMarketplaceState();
    const captured = state.orders[0].items[0].capturedPriceCents;
    const laterCatalogPrice = demoProducts[0].priceCents + 100;
    expect(laterCatalogPrice).not.toBe(captured);
    expect(state.orders[0].items[0].capturedPriceCents).toBe(captured);
    expect(Number.isInteger(state.orders[0].totalCents)).toBe(true);
  });
  it('applies inventory visibility and suspended course eligibility', () => {
    const state = createDemoMarketplaceState();
    const product = demoProducts.find(
      (p) => p.id === 'summit-pines-club-sandwich',
    )!;
    expect(productCanBeOrdered(product, state.inventory)).toBe(true);
    state.inventory[0].soldOut = true;
    expect(productCanBeOrdered(product, state.inventory)).toBe(false);
    const course = demoCourses.find((c) => c.id === 'summit-pines')!;
    expect(courseCanAcceptOrders(course, createDemoMarketplaceState())).toBe(
      true,
    );
    state.suspendedCourseIds.push(course.id);
    expect(courseCanAcceptOrders(course, state)).toBe(false);
  });
  it('audits application, course, and user administration', () => {
    const repo = new DemoMarketplaceRepository();
    repo.setApplicationStatus(
      'application-cedar',
      'approved',
      'platform-admin',
    );
    repo.setCourseSuspended('summit-pines', true, 'platform-admin');
    repo.setUserSuspended('demo-golfer', true, 'platform-admin');
    expect(
      repo
        .list()
        .slice(0, 3)
        .map((x) => x.action),
    ).toEqual([
      'user.suspended',
      'course.suspended',
      'application.status_changed',
    ]);
  });
});
