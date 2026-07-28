import type { Course } from '../types/marketplace';
import type { BrowserPosition } from './browser-location';

export interface LocationVerificationInput {
  courseId: string;
  position?: BrowserPosition;
}
export type LocationVerificationResult =
  | { status: 'eligible'; courseId: string; confidence: 'high' | 'demo' }
  | { status: 'uncertain'; reason: 'low_accuracy' | 'near_boundary' }
  | {
      status: 'not_eligible';
      reason: 'outside_service_area' | 'course_closed' | 'ordering_paused';
    }
  | { status: 'unavailable'; reason: 'not_configured' };
export interface CourseEligibilityVerifier {
  verifyLocation(
    input: LocationVerificationInput,
  ): Promise<LocationVerificationResult>;
}

export function classifyRadius(
  distanceMeters: number,
  accuracyMeters: number,
  radiusMeters: number,
) {
  if (distanceMeters + accuracyMeters < radiusMeters) return 'inside';
  if (distanceMeters - accuracyMeters > radiusMeters) return 'outside';
  return 'overlap';
}

export function createDemoVerifier(course: Course): CourseEligibilityVerifier {
  return {
    async verifyLocation({ courseId }) {
      if (courseId !== course.id)
        return { status: 'unavailable', reason: 'not_configured' };
      if (course.availability === 'closed')
        return { status: 'not_eligible', reason: 'course_closed' };
      if (course.orderingPaused)
        return { status: 'not_eligible', reason: 'ordering_paused' };
      if (course.demoLocationResult === 'eligible')
        return { status: 'eligible', courseId, confidence: 'demo' };
      if (course.demoLocationResult === 'uncertain')
        return { status: 'uncertain', reason: 'near_boundary' };
      return { status: 'not_eligible', reason: 'outside_service_area' };
    },
  };
}

/** Connected mode never grants eligibility without a future trusted endpoint. */
export const connectedVerifier: CourseEligibilityVerifier = {
  async verifyLocation() {
    return { status: 'unavailable', reason: 'not_configured' };
  },
};
