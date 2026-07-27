import { PROJECT_ID } from "./seed-data.mjs";
export function guard() {
  const project =
    process.env.GCLOUD_PROJECT ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    PROJECT_ID;
  if (project !== PROJECT_ID)
    throw new Error(`Refusing local operation for project ${project}.`);
  if (
    !process.env.FIRESTORE_EMULATOR_HOST ||
    !process.env.FIREBASE_AUTH_EMULATOR_HOST
  )
    throw new Error(
      "Required emulator hosts are absent. Run through firebase emulators:exec or start the local suite.",
    );
  return project;
}
