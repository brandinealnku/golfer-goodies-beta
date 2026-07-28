import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  GEOLOCATION_OPTIONS,
  requestBrowserPosition,
} from './browser-location';

afterEach(() => vi.unstubAllGlobals());
describe('browser location adapter', () => {
  it('uses finite privacy-preserving options only when explicitly called', async () => {
    const getCurrentPosition = vi.fn((success) =>
      success({
        coords: { latitude: 1, longitude: 2, accuracy: 9 },
        timestamp: Date.parse('2030-01-01'),
      }),
    );
    vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } });
    expect(getCurrentPosition).not.toHaveBeenCalled();
    await expect(requestBrowserPosition()).resolves.toMatchObject({
      accuracyMeters: 9,
    });
    expect(getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      GEOLOCATION_OPTIONS,
    );
    expect(GEOLOCATION_OPTIONS).toEqual({
      enableHighAccuracy: true,
      timeout: 10_000,
      maximumAge: 0,
    });
  });
  it.each([
    [1, 'permission_denied'],
    [2, 'unavailable'],
    [3, 'timeout'],
  ])('distinguishes browser error %s', async (code, reason) => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (
          _success: PositionCallback,
          error: PositionErrorCallback,
        ) =>
          error({
            code,
            message: reason,
            PERMISSION_DENIED: 1,
            POSITION_UNAVAILABLE: 2,
            TIMEOUT: 3,
          }),
      },
    });
    await expect(requestBrowserPosition()).rejects.toThrow(reason);
  });
});
