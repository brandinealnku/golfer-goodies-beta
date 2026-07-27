export const LOCAL_PROJECT_ID = "golfer-goodies-local" as const;
export const LOCAL_SERVICES = [
  "auth",
  "firestore",
  "functions",
  "storage",
  "hosting",
] as const;
export function isLocalEmulator() {
  return (
    process.env.FUNCTIONS_EMULATOR === "true" &&
    process.env.GCLOUD_PROJECT === LOCAL_PROJECT_ID
  );
}
