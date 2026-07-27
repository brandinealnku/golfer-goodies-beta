import { initializeApp, deleteApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { guard } from "./emulator-guard.mjs";
import { PROJECT_ID } from "./seed-data.mjs";
guard();
const app = initializeApp({ projectId: PROJECT_ID });
const [courses, users, status] = await Promise.all([
  getFirestore(app).collection("courses").get(),
  getAuth(app).listUsers(100),
  getFirestore(app).doc("system/seedStatus").get(),
]);
if (
  courses.size !== 5 ||
  users.users.length !== 8 ||
  status.data()?.products !== 40
)
  throw new Error("Local seed does not match the deterministic baseline.");
console.log("Verified 5 courses, 40 products, and 8 local users.");
await deleteApp(app);
