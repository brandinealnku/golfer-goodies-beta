import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";

type Role =
  | "course_owner"
  | "course_manager"
  | "catalog_editor"
  | "fulfillment_staff";
type Capability =
  | "operations"
  | "fulfillment"
  | "catalog"
  | "availability"
  | "audit";
const capabilities: Record<Role, readonly Capability[]> = {
  course_owner: [
    "operations",
    "fulfillment",
    "catalog",
    "availability",
    "audit",
  ],
  course_manager: [
    "operations",
    "fulfillment",
    "catalog",
    "availability",
    "audit",
  ],
  catalog_editor: ["catalog", "availability"],
  fulfillment_staff: ["availability"],
};
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new HttpsError("invalid-argument", "A valid request is required.");
  return value as Record<string, unknown>;
}
function text(value: unknown, name: string, max = 120) {
  if (typeof value !== "string" || !value.trim() || value.length > max)
    throw new HttpsError("invalid-argument", `${name} is invalid.`);
  return value.trim();
}
function integer(value: unknown, name: string, min = 0, max = 1_000_000) {
  if (
    !Number.isInteger(value) ||
    (value as number) < min ||
    (value as number) > max
  )
    throw new HttpsError("invalid-argument", `${name} is invalid.`);
  return value as number;
}
async function authorize(
  request: CallableRequest,
  courseId: string,
  capability: Capability,
) {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Sign in is required.");
  const snap = await getFirestore()
    .doc(`courses/${courseId}/members/${uid}`)
    .get();
  const member = snap.data() as { role?: Role; status?: string } | undefined;
  if (
    !member ||
    member.status !== "active" ||
    !member.role ||
    !capabilities[member.role]?.includes(capability)
  )
    throw new HttpsError(
      "permission-denied",
      "You do not have permission to manage this course.",
    );
  return uid;
}
async function audit(
  courseId: string,
  uid: string,
  action: string,
  targetType: "course" | "product",
  targetId: string,
  changedFields: string[],
) {
  const ref = getFirestore().collection(`courses/${courseId}/auditLog`).doc();
  await ref.set({
    version: 1,
    id: ref.id,
    courseId,
    actorUid: uid,
    action,
    targetType,
    targetId,
    changedFields,
    createdAt: FieldValue.serverTimestamp(),
  });
}
export async function ensureUserProfileHandler(request: CallableRequest) {
  if (!request.auth?.uid)
    throw new HttpsError("unauthenticated", "Sign in is required.");
  const data = object(request.data);
  const displayName = text(data.displayName, "Display name", 80);
  const ref = getFirestore().doc(`users/${request.auth.uid}`);
  await ref.set(
    {
      version: 1,
      uid: request.auth.uid,
      email: request.auth.token.email ?? "",
      displayName,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  return { ok: true };
}
export async function submitCourseClaimHandler(request: CallableRequest) {
  if (!request.auth?.uid)
    throw new HttpsError("unauthenticated", "Sign in is required.");
  const data = object(request.data);
  const courseId = text(data.courseId, "Course ID", 80),
    requestedRole = data.requestedRole;
  if (!["course_owner", "course_manager"].includes(String(requestedRole)))
    throw new HttpsError("invalid-argument", "Requested role is invalid.");
  const ref = getFirestore().collection("courseClaims").doc();
  await ref.set({
    version: 1,
    id: ref.id,
    courseId,
    requestedBy: request.auth.uid,
    requestedRole,
    businessEmail: text(data.businessEmail, "Business email", 160),
    explanation: text(data.explanation, "Explanation", 1000),
    status: "submitted",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return { ok: true, id: ref.id, status: "submitted" };
}
export async function updateCourseOperationsHandler(request: CallableRequest) {
  const data = object(request.data),
    courseId = text(data.courseId, "Course ID", 80);
  const uid = await authorize(request, courseId, "operations");
  const changes = object(data.changes);
  const allowed = [
    "status",
    "acceptsOrders",
    "defaultPrepMinutes",
    "minimumOrderCents",
    "promotion",
  ];
  if (Object.keys(changes).some((k) => !allowed.includes(k)))
    throw new HttpsError("invalid-argument", "Unsupported course field.");
  if (changes.defaultPrepMinutes !== undefined)
    integer(changes.defaultPrepMinutes, "Preparation time", 1, 180);
  if (changes.minimumOrderCents !== undefined)
    integer(changes.minimumOrderCents, "Minimum order", 0);
  if (changes.promotion !== undefined && typeof changes.promotion !== "string")
    throw new HttpsError("invalid-argument", "Promotion is invalid.");
  await getFirestore()
    .doc(`courses/${courseId}`)
    .update({
      ...changes,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: uid,
    });
  await audit(
    courseId,
    uid,
    "course.operations.updated",
    "course",
    courseId,
    Object.keys(changes),
  );
  return { ok: true };
}
export async function updateFulfillmentSettingsHandler(
  request: CallableRequest,
) {
  const data = object(request.data),
    courseId = text(data.courseId, "Course ID", 80);
  const uid = await authorize(request, courseId, "fulfillment");
  if (
    !Array.isArray(data.fulfillmentMethods) ||
    !data.fulfillmentMethods.length ||
    data.fulfillmentMethods.some(
      (v) =>
        !["pickup", "cart-delivery", "on-course-meetup"].includes(String(v)),
    )
  )
    throw new HttpsError(
      "invalid-argument",
      "Fulfillment methods are invalid.",
    );
  await getFirestore().doc(`courses/${courseId}`).update({
    fulfillmentMethods: data.fulfillmentMethods,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: uid,
  });
  await audit(courseId, uid, "course.fulfillment.updated", "course", courseId, [
    "fulfillmentMethods",
  ]);
  return { ok: true };
}
async function productMutation(request: CallableRequest, create: boolean) {
  const data = object(request.data),
    courseId = text(data.courseId, "Course ID", 80);
  const uid = await authorize(request, courseId, "catalog"),
    product = object(data.product);
  const allowed = [
    "name",
    "shortDescription",
    "categoryId",
    "priceCents",
    "preparationMinutes",
    "status",
    "publiclyVisible",
    "featured",
    "popular",
    "image",
    "imageAlt",
    "tags",
    "modifierGroups",
  ];
  if (Object.keys(product).some((k) => !allowed.includes(k)))
    throw new HttpsError("invalid-argument", "Unsupported product field.");
  text(product.name, "Product name", 100);
  integer(product.priceCents, "Price", 0);
  integer(product.preparationMinutes, "Preparation time", 1, 180);
  if (
    !["active", "sold_out", "hidden", "draft"].includes(String(product.status))
  )
    throw new HttpsError("invalid-argument", "Product status is invalid.");
  const ref = create
    ? getFirestore().collection(`courses/${courseId}/products`).doc()
    : getFirestore().doc(
        `courses/${courseId}/products/${text(data.productId, "Product ID", 100)}`,
      );
  if (!create && !(await ref.get()).exists)
    throw new HttpsError("not-found", "Product was not found.");
  await ref.set(
    {
      ...product,
      courseId,
      id: ref.id,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: uid,
    },
    { merge: !create },
  );
  await audit(
    courseId,
    uid,
    create ? "product.created" : "product.updated",
    "product",
    ref.id,
    Object.keys(product),
  );
  return { ok: true, id: ref.id };
}
export const createCourseProductHandler = (r: CallableRequest) =>
  productMutation(r, true);
export const updateCourseProductHandler = (r: CallableRequest) =>
  productMutation(r, false);
export async function setCourseProductAvailabilityHandler(
  request: CallableRequest,
) {
  const data = object(request.data),
    courseId = text(data.courseId, "Course ID", 80),
    productId = text(data.productId, "Product ID", 100);
  const uid = await authorize(request, courseId, "availability");
  if (!["active", "sold_out"].includes(String(data.status)))
    throw new HttpsError("invalid-argument", "Availability status is invalid.");
  const ref = getFirestore().doc(`courses/${courseId}/products/${productId}`);
  if (!(await ref.get()).exists)
    throw new HttpsError("not-found", "Product was not found.");
  await ref.update({
    status: data.status,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: uid,
  });
  await audit(
    courseId,
    uid,
    "product.availability.updated",
    "product",
    productId,
    ["status"],
  );
  return { ok: true };
}
