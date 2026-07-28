const FIELD_MASK =
  "places.id,places.displayName,places.shortFormattedAddress,places.location,places.businessStatus,places.googleMapsUri,places.primaryType";
const MAX_RADIUS_METERS = 50000;
type RequestInput = {
  operation?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  radiusMeters?: unknown;
  query?: unknown;
};
type GooglePlace = {
  id: string;
  displayName?: { text?: string };
  shortFormattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  businessStatus?: string;
  googleMapsUri?: string;
  primaryType?: string;
};
export function validateDiscoveryInput(data: RequestInput) {
  if (data.operation === "nearby") {
    if (
      typeof data.latitude !== "number" ||
      data.latitude < -90 ||
      data.latitude > 90 ||
      typeof data.longitude !== "number" ||
      data.longitude < -180 ||
      data.longitude > 180
    )
      throw new Error("Valid coordinates are required.");
    const radius =
      typeof data.radiusMeters === "number" ? data.radiusMeters : 25000;
    if (radius < 100 || radius > MAX_RADIUS_METERS)
      throw new Error("Search radius is outside the allowed range.");
    return {
      operation: "nearby" as const,
      latitude: data.latitude,
      longitude: data.longitude,
      radius,
    };
  }
  if (data.operation === "text") {
    if (
      typeof data.query !== "string" ||
      data.query.trim().length < 2 ||
      data.query.length > 120
    )
      throw new Error("Enter a valid course or location query.");
    return { operation: "text" as const, query: data.query.trim() };
  }
  throw new Error("Unsupported discovery operation.");
}
const radians = (n: number) => (n * Math.PI) / 180;
function distanceMiles(a: number, b: number, c: number, d: number) {
  const x =
    Math.sin(radians(c - a) / 2) ** 2 +
    Math.cos(radians(a)) *
      Math.cos(radians(c)) *
      Math.sin(radians(d - b) / 2) ** 2;
  return 3958.8 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
export async function discoverCourses(data: RequestInput, key: string) {
  const input = validateDiscoveryInput(data);
  const nearby = input.operation === "nearby";
  const url = nearby
    ? "https://places.googleapis.com/v1/places:searchNearby"
    : "https://places.googleapis.com/v1/places:searchText";
  const body = nearby
    ? {
        includedTypes: ["golf_course"],
        rankPreference: "DISTANCE",
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude: input.latitude, longitude: input.longitude },
            radius: input.radius,
          },
        },
      }
    : {
        textQuery: `golf course ${input.query}`,
        includedType: "golf_course",
        strictTypeFiltering: true,
        pageSize: 20,
      };
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("Places provider unavailable.");
  const payload = (await response.json()) as { places?: GooglePlace[] };
  return {
    courses: (payload.places ?? [])
      .filter(
        (p) =>
          p.primaryType === "golf_course" &&
          p.location?.latitude !== undefined &&
          p.location.longitude !== undefined,
      )
      .map((p) => ({
        provider: "google_places",
        providerPlaceId: p.id,
        name: p.displayName?.text ?? "Golf course",
        formattedAddress: p.shortFormattedAddress ?? "Address unavailable",
        latitude: p.location!.latitude!,
        longitude: p.location!.longitude!,
        businessStatus: p.businessStatus,
        googleMapsUri: p.googleMapsUri,
        ...(nearby
          ? {
              approximateDistanceMiles: distanceMiles(
                input.latitude,
                input.longitude,
                p.location!.latitude!,
                p.location!.longitude!,
              ),
            }
          : {}),
      })),
  };
}
