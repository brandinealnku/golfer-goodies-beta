import { readFile } from "node:fs/promises";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { ref, uploadBytes, deleteObject } from "firebase/storage";
import { afterAll, beforeAll, describe, it } from "vitest";
let env: RulesTestEnvironment;
beforeAll(
  async () =>
    (env = await initializeTestEnvironment({
      projectId: "golfer-goodies-local",
      storage: {
        host: "127.0.0.1",
        port: 9199,
        rules: await readFile("storage.rules", "utf8"),
      },
    })),
);
afterAll(() => env.cleanup());
const bytes = new Uint8Array([1, 2, 3]);
describe("Storage deny-first rules", () => {
  it("denies signed-out profile upload", () =>
    assertFails(
      uploadBytes(
        ref(
          env.unauthenticatedContext().storage(),
          "users/alice/profile/a.png",
        ),
        bytes,
        { contentType: "image/png" },
      ),
    ));
  it("allows a small own image", () =>
    assertSucceeds(
      uploadBytes(
        ref(
          env.authenticatedContext("alice").storage(),
          "users/alice/profile/a.png",
        ),
        bytes,
        { contentType: "image/png" },
      ),
    ));
  it("denies another profile and non-image", async () => {
    const s = env.authenticatedContext("alice").storage();
    await assertFails(
      uploadBytes(ref(s, "users/bob/profile/a.png"), bytes, {
        contentType: "image/png",
      }),
    );
    await assertFails(
      uploadBytes(ref(s, "users/alice/profile/a.txt"), bytes, {
        contentType: "text/plain",
      }),
    );
  });
  it("denies oversized, course, product, and unauthorized delete", async () => {
    const s = env.authenticatedContext("alice").storage();
    await assertFails(
      uploadBytes(
        ref(s, "users/alice/profile/large.png"),
        new Uint8Array(2 * 1024 * 1024),
        { contentType: "image/png" },
      ),
    );
    await assertFails(
      uploadBytes(ref(s, "courses/x/branding/a.png"), bytes, {
        contentType: "image/png",
      }),
    );
    await assertFails(
      uploadBytes(ref(s, "courses/x/products/p/a.png"), bytes, {
        contentType: "image/png",
      }),
    );
    await assertFails(
      deleteObject(
        ref(
          env.authenticatedContext("bob").storage(),
          "users/alice/profile/a.png",
        ),
      ),
    );
  });
});
