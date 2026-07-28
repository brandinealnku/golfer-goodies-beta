import { describe, expect, it, vi } from 'vitest';
import {
  DemoCourseDiscoveryProvider,
  EmulatorCourseDiscoveryProvider,
  matchCourses,
} from './course-discovery';
import type {
  DiscoveredGolfCourse,
  MarketplaceCourseSummary,
} from '../types/marketplace';
const place = (
  id: string,
  name = 'Same Name',
  distance = 2,
): DiscoveredGolfCourse => ({
  provider: 'demo',
  providerPlaceId: id,
  name,
  formattedAddress: 'Fictional, CO',
  latitude: 1,
  longitude: 1,
  approximateDistanceMiles: distance,
});
const market = (
  id: string,
  placeId: string,
  status: MarketplaceCourseSummary['marketplaceStatus'] = 'active',
): MarketplaceCourseSummary => ({
  id,
  provider: 'demo',
  providerPlaceId: placeId,
  marketplaceStatus: status,
  orderingEnabled: true,
  fulfillmentMethods: ['pickup'],
});
describe('course discovery boundary', () => {
  it('matches provider identity, never a shared name', () => {
    const result = matchCourses(
      [place('external')],
      [market('internal', 'different')],
    );
    expect(result[0].orderingAvailable).toBe(false);
  });
  it('requires active and enabled marketplace status', () => {
    expect(
      matchCourses([place('paused')], [market('x', 'paused', 'paused')])[0]
        .orderingAvailable,
    ).toBe(false);
  });
  it('groups ordering first and sorts distance', () => {
    const result = matchCourses(
      [place('far', 'A', 8), place('near', 'B', 1)],
      [market('enabled', 'far')],
    );
    expect(result.map((r) => r.discoveredCourse.providerPlaceId)).toEqual([
      'far',
      'near',
    ]);
  });
  it('demo and emulator never fetch Google', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    await new DemoCourseDiscoveryProvider().searchNearby({
      latitude: 1,
      longitude: 1,
    });
    await new EmulatorCourseDiscoveryProvider().searchNearby({
      latitude: 1,
      longitude: 1,
    });
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
