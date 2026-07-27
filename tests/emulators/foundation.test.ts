import { initializeApp, deleteApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import {
  collection,
  connectFirestoreEmulator,
  doc,
  getDoc,
  getDocs,
  getFirestore,
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
  it("loads deterministic seed status and marketplace", async () => {
    expect((await getDoc(doc(db, "system/seedStatus"))).data()?.courses).toBe(
      5,
    );
    expect((await getDocs(collection(db, "courses"))).size).toBe(5);
    expect(
      (await getDocs(collection(db, "courses/summit-pines/products"))).size,
    ).toBe(8);
  });
  it("handles a missing course", async () =>
    expect((await getDoc(doc(db, "courses/missing"))).exists()).toBe(false));
  it("calls safe health function", async () =>
    expect(
      (await httpsCallable(functions, "healthCheck")()).data,
    ).toMatchObject({ status: "ok", projectId: "golfer-goodies-local" }));
});
