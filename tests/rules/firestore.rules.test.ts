import { readFile } from "node:fs/promises";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
let env: RulesTestEnvironment;
const projectId = "golfer-goodies-local";
beforeAll(
  async () =>
    (env = await initializeTestEnvironment({
      projectId,
      firestore: {
        host: "127.0.0.1",
        port: 8080,
        rules: await readFile("firestore.rules", "utf8"),
      },
    })),
);
afterAll(() => env.cleanup());
beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (c) => {
    const db = c.firestore();
    await setDoc(doc(db, "courses/active"), {
      status: "active",
      marketplaceVisible: true,
    });
    await setDoc(doc(db, "courses/draft"), {
      status: "draft",
      marketplaceVisible: true,
    });
    await setDoc(doc(db, "courses/paused"), {
      status: "paused",
      marketplaceVisible: true,
    });
    await setDoc(doc(db, "courses/hidden"), {
      status: "active",
      marketplaceVisible: false,
    });
    for (const status of ["active", "draft", "archived"])
      await setDoc(doc(db, `courses/active/products/${status}`), {
        status,
        priceCents: 500,
      });
    await setDoc(doc(db, "users/alice"), {
      displayName: "Alice",
      preferences: { theme: "light" },
      createdAt: Timestamp.fromMillis(1),
      updatedAt: Timestamp.fromMillis(1),
    });
  });
});
describe("Firestore deny-first rules", () => {
  it("allows only public active courses", async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(db, "courses/active")));
    for (const id of ["draft", "paused", "hidden"])
      await assertFails(getDoc(doc(db, `courses/${id}`)));
  });
  it("allows only active public products", async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(db, "courses/active/products/active")));
    await assertFails(getDoc(doc(db, "courses/active/products/draft")));
    await assertFails(getDoc(doc(db, "courses/active/products/archived")));
  });
  it("denies public marketplace writes", async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertFails(
      setDoc(doc(db, "courses/new"), {
        status: "active",
        marketplaceVisible: true,
      }),
    );
    await assertFails(
      setDoc(doc(db, "courses/active/products/new"), {
        status: "active",
        priceCents: 1,
      }),
    );
  });
  it("isolates profiles and permits limited self profile", async () => {
    const alice = env.authenticatedContext("alice").firestore(),
      bob = env.authenticatedContext("bob").firestore();
    await assertSucceeds(getDoc(doc(alice, "users/alice")));
    await assertFails(getDoc(doc(bob, "users/alice")));
    await assertSucceeds(
      setDoc(doc(bob, "users/bob"), {
        displayName: "Bob",
        preferences: { alerts: true },
        createdAt: Timestamp.fromMillis(1),
        updatedAt: Timestamp.fromMillis(1),
      }),
    );
    await assertFails(
      setDoc(doc(bob, "users/alice"), {
        displayName: "Bob",
        preferences: {},
        createdAt: Timestamp.fromMillis(1),
        updatedAt: Timestamp.fromMillis(1),
      }),
    );
  });
  it("denies privilege, unknown field, timestamp, system and price changes", async () => {
    const db = env.authenticatedContext("alice").firestore();
    await assertFails(
      updateDoc(doc(db, "users/alice"), { role: "platform-admin" }),
    );
    await assertFails(
      updateDoc(doc(db, "users/alice"), { platformAdmin: true }),
    );
    await assertFails(
      updateDoc(doc(db, "users/alice"), { createdAt: Timestamp.fromMillis(2) }),
    );
    await assertFails(setDoc(doc(db, "system/config"), { open: true }));
    await assertFails(
      updateDoc(doc(db, "courses/active/products/active"), { priceCents: 1 }),
    );
    await assertFails(
      updateDoc(doc(db, "courses/active"), { marketplaceVisible: false }),
    );
  });
});
