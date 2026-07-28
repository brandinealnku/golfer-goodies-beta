export interface BrowserPosition {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  capturedAt: string;
}

export type BrowserLocationError =
  | 'permission_denied'
  | 'unavailable'
  | 'timeout';

export const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 0,
};

/** Called only from an explicit user action. The returned coordinates are ephemeral. */
export function requestBrowserPosition(): Promise<BrowserPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords, timestamp }) =>
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracyMeters: coords.accuracy,
          capturedAt: new Date(timestamp).toISOString(),
        }),
      (error) => {
        const reason: BrowserLocationError =
          error.code === error.PERMISSION_DENIED
            ? 'permission_denied'
            : error.code === error.TIMEOUT
              ? 'timeout'
              : 'unavailable';
        reject(new Error(reason));
      },
      GEOLOCATION_OPTIONS,
    );
  });
}
