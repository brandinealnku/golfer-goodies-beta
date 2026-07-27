export interface HealthResponse {
  status: "ok";
  service: "golfer-goodies-functions";
  projectId: string;
  environment: "local-emulator";
  serverTimestamp: string;
  schemaVersion: 1;
}
export interface EnvironmentResponse {
  emulator: true;
  projectId: string;
  services: readonly string[];
}
