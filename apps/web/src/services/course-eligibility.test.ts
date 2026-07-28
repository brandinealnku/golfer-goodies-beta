import { describe, expect, it } from 'vitest';
import {
  classifyRadius,
  connectedVerifier,
  createDemoVerifier,
} from './course-eligibility';
import { demoCourses } from '../data/demo-data';
describe('eligibility providers', () => {
  it.each([
    [50, 10, 100, 'inside'],
    [95, 10, 100, 'overlap'],
    [120, 10, 100, 'outside'],
  ])(
    'classifies accuracy-aware radius geometry',
    (distance, accuracy, radius, result) =>
      expect(
        classifyRadius(
          distance as number,
          accuracy as number,
          radius as number,
        ),
      ).toBe(result),
  );
  it('never authorizes a different course', async () =>
    expect(
      createDemoVerifier(demoCourses[0]).verifyLocation({ courseId: 'other' }),
    ).resolves.toEqual({ status: 'unavailable', reason: 'not_configured' }));
  it('does not silently use demo eligibility in connected mode', async () =>
    expect(
      connectedVerifier.verifyLocation({ courseId: 'summit-pines' }),
    ).resolves.toEqual({ status: 'unavailable', reason: 'not_configured' }));
});
