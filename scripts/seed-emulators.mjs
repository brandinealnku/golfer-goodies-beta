import { initializeApp, deleteApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { guard } from "./emulator-guard.mjs";
import { courses, PASSWORD, PROJECT_ID, users } from "./seed-data.mjs";
guard();
const app = initializeApp({ projectId: PROJECT_ID });
const auth = getAuth(app),
  db = getFirestore(app);
for (const u of users) {
  try {
    await auth.updateUser(u.uid, {
      email: u.email,
      password: PASSWORD,
      displayName: u.displayName,
    });
  } catch (e) {
    if (e.code === "auth/user-not-found")
      await auth.createUser({
        uid: u.uid,
        email: u.email,
        password: PASSWORD,
        displayName: u.displayName,
      });
    else throw e;
  }
}
const now = Timestamp.fromMillis(1735689600000);
let writes = 0;
for (const c of courses) {
  const { categories, products, promotion, ...course } = c;
  await db
    .doc(`courses/${c.id}`)
    .set({ ...course, createdAt: now, updatedAt: now });
  writes++;
  for (const x of categories) {
    await db
      .doc(`courses/${c.id}/categories/${x.id}`)
      .set({ ...x, createdAt: now, updatedAt: now });
    writes++;
  }
  for (const x of products) {
    await db
      .doc(`courses/${c.id}/products/${x.id}`)
      .set({ ...x, createdAt: now, updatedAt: now });
    writes++;
  }
  await db
    .doc(`courses/${c.id}/promotions/${promotion.id}`)
    .set({ ...promotion, createdAt: now, updatedAt: now });
  writes++;
}
await db.doc("system/config").set({ projectId: PROJECT_ID, schemaVersion: 1 });
await db.doc("system/seedStatus").set({
  status: "ready",
  schemaVersion: 1,
  seededAt: now,
  courses: courses.length,
  products: courses.reduce((n, c) => n + c.products.length, 0),
  users: users.length,
});
console.log(
  `Seeded ${courses.length} courses, ${writes - 5} child records, and ${users.length} emulator users.`,
);
await deleteApp(app);
