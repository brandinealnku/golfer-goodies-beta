import { onCall } from "firebase-functions/v2/https";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { discoverCourses } from "./discovery/handlers.js";
import { initializeApp, getApps } from "firebase-admin/app";
import {
  createCourseProductHandler,
  ensureUserProfileHandler,
  setCourseProductAvailabilityHandler,
  submitCourseClaimHandler,
  updateCourseOperationsHandler,
  updateCourseProductHandler,
  updateFulfillmentSettingsHandler,
} from "./management/handlers.js";
if (!getApps().length) initializeApp();
export const ensureUserProfile = onCall(ensureUserProfileHandler);
export const submitCourseClaim = onCall(submitCourseClaimHandler);
export const updateCourseOperations = onCall(updateCourseOperationsHandler);
export const updateFulfillmentSettings = onCall(
  updateFulfillmentSettingsHandler,
);
export const createCourseProduct = onCall(createCourseProductHandler);
export const updateCourseProduct = onCall(updateCourseProductHandler);
export const setCourseProductAvailability = onCall(
  setCourseProductAvailabilityHandler,
);
import {
  createEnvironmentResponse,
  createHealthResponse,
} from "./health/handlers.js";
export const healthCheck = onCall(() => createHealthResponse());
export const getEmulatorEnvironment = onCall(() => createEnvironmentResponse());
const googlePlacesApiKey = defineSecret("GOOGLE_PLACES_API_KEY");
export const discoverGolfCourses = onRequest(
  { secrets: [googlePlacesApiKey], cors: true },
  async (request, response) => {
    if (request.method !== "POST") {
      response.status(405).json({ error: "Method not allowed" });
      return;
    }
    try {
      response.json(
        await discoverCourses(
          request.body as Record<string, unknown>,
          googlePlacesApiKey.value(),
        ),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Discovery failed";
      response
        .status(
          message.includes("required") ||
            message.includes("valid") ||
            message.includes("Unsupported") ||
            message.includes("range")
            ? 400
            : 503,
        )
        .json({ error: message });
    }
  },
);
