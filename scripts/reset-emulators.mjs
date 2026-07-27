import { guard } from "./emulator-guard.mjs";
import { PROJECT_ID } from "./seed-data.mjs";
import { spawnSync } from "node:child_process";
guard();
for (const url of [
  `http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
  `http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST || "127.0.0.1:9199"}/emulator/v1/projects/${PROJECT_ID}/buckets/${PROJECT_ID}.firebasestorage.app/objects`,
]) {
  const response = await fetch(url, { method: "DELETE" });
  if (!response.ok && response.status !== 404)
    throw new Error(`Reset failed (${response.status}).`);
}
const auth = await fetch(
  `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/emulator/v1/projects/${PROJECT_ID}/accounts`,
  { method: "DELETE" },
);
if (!auth.ok) throw new Error("Authentication reset failed.");
const result = spawnSync(process.execPath, ["scripts/seed-emulators.mjs"], {
  stdio: "inherit",
  env: process.env,
});
process.exitCode = result.status ?? 1;
