import { environment } from '../config/environment';
import { demoCourses } from './demo-data';
import type {
  CourseDiscoveryResult,
  DiscoveredGolfCourse,
  MarketplaceCourseSummary,
} from '../types/marketplace';

export interface NearbyCourseSearch {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
}
export interface TextCourseSearch {
  query: string;
}
export interface CourseDiscoveryProvider {
  searchNearby(input: NearbyCourseSearch): Promise<DiscoveredGolfCourse[]>;
  searchByText(input: TextCourseSearch): Promise<DiscoveredGolfCourse[]>;
}

const fixtures: DiscoveredGolfCourse[] = [
  {
    provider: 'demo',
    providerPlaceId: 'demo-summit-pines',
    name: 'Summit Pines Resort',
    formattedAddress: '1 Alpine Way, Silver Hollow, CO',
    latitude: 39.7,
    longitude: -105.7,
    approximateDistanceMiles: 2.4,
    businessStatus: 'OPERATIONAL',
  },
  {
    provider: 'demo',
    providerPlaceId: 'demo-river-glass',
    name: 'River Glass Golf Course',
    formattedAddress: '80 Fairway Lane, Silver Hollow, CO',
    latitude: 39.71,
    longitude: -105.69,
    approximateDistanceMiles: 5.1,
    businessStatus: 'OPERATIONAL',
  },
  {
    provider: 'demo',
    providerPlaceId: 'demo-circuit-links',
    name: 'Circuit Links',
    formattedAddress: '9 Byte Drive, Nova City, TX',
    latitude: 32.8,
    longitude: -96.8,
    approximateDistanceMiles: 7.8,
    businessStatus: 'OPERATIONAL',
  },
];
const demoSummaries: MarketplaceCourseSummary[] = demoCourses.map((course) => ({
  id: course.id,
  provider: 'demo',
  providerPlaceId: `demo-${course.id}`,
  marketplaceStatus: course.orderingPaused
    ? 'paused'
    : course.availability === 'closed'
      ? 'inactive'
      : 'active',
  orderingEnabled: !course.orderingPaused && course.availability !== 'closed',
  fulfillmentMethods: course.fulfillmentMethods,
  estimatedMinutes: course.estimatedMinutes,
  promotion: course.promotion,
}));
const summaries: MarketplaceCourseSummary[] = [
  ...demoSummaries,
  ...demoSummaries.map((s) => ({
    ...s,
    provider: 'emulator' as const,
    providerPlaceId: s.providerPlaceId.replace('demo-', 'emulator-'),
  })),
];
export class DemoCourseDiscoveryProvider implements CourseDiscoveryProvider {
  async searchNearby(input: NearbyCourseSearch) {
    void input;
    return structuredClone(fixtures);
  }
  async searchByText({ query }: TextCourseSearch) {
    const q = query.trim().toLowerCase();
    return structuredClone(
      fixtures.filter((c) =>
        `${c.name} ${c.formattedAddress}`.toLowerCase().includes(q),
      ),
    );
  }
}
export class EmulatorCourseDiscoveryProvider extends DemoCourseDiscoveryProvider {
  override async searchNearby(input: NearbyCourseSearch) {
    return (await super.searchNearby(input)).map((c) => ({
      ...c,
      provider: 'emulator' as const,
      providerPlaceId: c.providerPlaceId.replace('demo-', 'emulator-'),
    }));
  }
  override async searchByText(input: TextCourseSearch) {
    return (await super.searchByText(input)).map((c) => ({
      ...c,
      provider: 'emulator' as const,
      providerPlaceId: c.providerPlaceId.replace('demo-', 'emulator-'),
    }));
  }
}
export class GooglePlacesCourseDiscoveryProvider implements CourseDiscoveryProvider {
  private async call(
    operation: 'nearby' | 'text',
    input: NearbyCourseSearch | TextCourseSearch,
  ) {
    const endpoint = import.meta.env.VITE_DISCOVERY_FUNCTION_URL;
    if (!endpoint) throw new Error('Live course discovery is not configured.');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ operation, ...input }),
    });
    if (!response.ok) throw new Error('Live course discovery is unavailable.');
    return ((await response.json()) as { courses: DiscoveredGolfCourse[] })
      .courses;
  }
  searchNearby(input: NearbyCourseSearch) {
    return this.call('nearby', input);
  }
  searchByText(input: TextCourseSearch) {
    return this.call('text', input);
  }
}
export function matchCourses(
  courses: DiscoveredGolfCourse[],
  marketplace = summaries,
): CourseDiscoveryResult[] {
  return courses
    .map((discoveredCourse) => {
      const marketplaceCourse = marketplace.find(
        (m) =>
          m.provider === discoveredCourse.provider &&
          m.providerPlaceId === discoveredCourse.providerPlaceId,
      );
      return {
        discoveredCourse,
        marketplaceCourse,
        orderingAvailable:
          marketplaceCourse?.marketplaceStatus === 'active' &&
          marketplaceCourse.orderingEnabled === true,
      };
    })
    .sort(
      (a, b) =>
        Number(b.orderingAvailable) - Number(a.orderingAvailable) ||
        (a.discoveredCourse.approximateDistanceMiles ?? Infinity) -
          (b.discoveredCourse.approximateDistanceMiles ?? Infinity),
    );
}
export function getCourseDiscoveryProvider(): CourseDiscoveryProvider {
  if (environment.mode === 'demo') return new DemoCourseDiscoveryProvider();
  if (environment.mode === 'emulator')
    return new EmulatorCourseDiscoveryProvider();
  return new GooglePlacesCourseDiscoveryProvider();
}
