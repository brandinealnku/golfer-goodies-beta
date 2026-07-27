import { HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import {
  isLocalEmulator,
  LOCAL_PROJECT_ID,
  LOCAL_SERVICES,
} from "../config/local.js";
import type {
  EnvironmentResponse,
  HealthResponse,
} from "../utils/responses.js";
export function createHealthResponse(): HealthResponse {
  if (!isLocalEmulator())
    throw new HttpsError(
      "failed-precondition",
      "This diagnostic is available only in the local emulator.",
    );
  logger.info("Local health check", { projectId: LOCAL_PROJECT_ID });
  return {
    status: "ok",
    service: "golfer-goodies-functions",
    projectId: LOCAL_PROJECT_ID,
    environment: "local-emulator",
    serverTimestamp: new Date().toISOString(),
    schemaVersion: 1,
  };
}
export function createEnvironmentResponse(): EnvironmentResponse {
  if (!isLocalEmulator())
    throw new HttpsError(
      "permission-denied",
      "Local emulator environment required.",
    );
  return {
    emulator: true,
    projectId: LOCAL_PROJECT_ID,
    services: LOCAL_SERVICES,
  };
}
