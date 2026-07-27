import { beforeEach, describe, expect, it } from "vitest";
import {
  createEnvironmentResponse,
  createHealthResponse,
} from "../src/health/handlers.js";
describe("local diagnostics", () => {
  beforeEach(() => {
    process.env.FUNCTIONS_EMULATOR = "true";
    process.env.GCLOUD_PROJECT = "golfer-goodies-local";
  });
  it("returns safe health metadata", () =>
    expect(createHealthResponse()).toMatchObject({
      status: "ok",
      projectId: "golfer-goodies-local",
    }));
  it("lists local services", () =>
    expect(createEnvironmentResponse().services).toContain("firestore"));
});
