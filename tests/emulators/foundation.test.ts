import { initializeApp, deleteApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import {
  collection,
  connectFirestoreEmulator,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from "firebase/functions";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { afterAll, describe, expect, it } from "vitest";
const app = initializeApp({
  projectId: "golfer-goodies-local",
  apiKey: "local",
  appId: "local",
});
const auth = getAuth(app),
  db = getFirestore(app),
  functions = getFunctions(app),
  storage = getStorage(app);
connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
connectFirestoreEmulator(db, "127.0.0.1", 8080);
connectFunctionsEmulator(functions, "127.0.0.1", 5001);
connectStorageEmulator(storage, "127.0.0.1", 9199);
afterAll(() => deleteApp(app));
describe("local emulator foundation", () => {
  it("configures all clients locally", () => {
    expect(auth.config.emulator?.url).toContain("9099");
    expect(storage.app.options.projectId).toBe("golfer-goodies-local");
  });
  it("loads deterministic public marketplace", async () => {
    const publicCourses = query(
      collection(db, "courses"),
      where("status", "==", "active"),
      where("marketplaceVisible", "==", true),
    );

    const activeProducts = query(
      collection(db, "courses/summit-pines/products"),
      where("status", "==", "active"),
    );

    expect((await getDocs(publicCourses)).size).toBe(4);
    expect((await getDocs(activeProducts)).size).toBe(8);
  });
  it("denies access to a missing non-public course", async () => {
    await expect(getDoc(doc(db, "courses/missing"))).rejects.toMatchObject({
      code: "permission-denied",
    });
  });
  it("calls safe health function", async () =>
    expect(
      (await httpsCallable(functions, "healthCheck")()).data,
    ).toMatchObject({ status: "ok", projectId: "golfer-goodies-local" }));
});
