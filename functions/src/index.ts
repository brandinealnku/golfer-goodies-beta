import { onCall } from "firebase-functions/v2/https";
import {
  createEnvironmentResponse,
  createHealthResponse,
} from "./health/handlers.js";
export const healthCheck = onCall(() => createHealthResponse());
export const getEmulatorEnvironment = onCall(() => createEnvironmentResponse());
