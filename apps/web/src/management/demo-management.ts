import type { AuthenticatedUser, DemoIdentity } from '../auth/identity';
import type { CourseMembership } from '../auth/authorization';
import { hasCapability } from '../auth/authorization';
import { demoCourses, demoProducts } from '../data/demo-data';
import type { Course, Product } from '../types/marketplace';

const STORE_KEY = 'gg.management.v1';
export const MANAGEMENT_CHANGED_EVENT = 'gg-management-changed';
interface Store {
  version: 1;
  courses: Record<string, Partial<Course>>;
  products: Record<string, Partial<Product>>;
  claims: CourseClaim[];
  audit: AuditEvent[];
}
export interface CourseClaim {
  id: string;
  courseId: string;
  requestedBy: string;
  requestedRole: 'course_owner' | 'course_manager';
  status: 'submitted';
  businessEmail: string;
  explanation: string;
  createdAt: string;
}
export interface AuditEvent {
  id: string;
  courseId: string;
  actorUid: string;
  action: string;
  targetType: 'course' | 'product' | 'claim';
  targetId: string;
  changedFields: string[];
  createdAt: string;
}
const empty = (): Store => ({
  version: 1,
  courses: {},
  products: {},
  claims: [],
  audit: [],
});
function read(): Store {
  try {
    const value = JSON.parse(
      localStorage.getItem(STORE_KEY) ?? 'null',
    ) as Store;
    if (
      value?.version === 1 &&
      value.courses &&
      value.products &&
      Array.isArray(value.claims) &&
      Array.isArray(value.audit)
    )
      return value;
  } catch {
    /* malformed local demo state is intentionally ignored */
  }
  return empty();
}
function write(store: Store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(MANAGEMENT_CHANGED_EVENT));
}
export function resetDemoManagement() {
  localStorage.removeItem(STORE_KEY);
  window.dispatchEvent(new Event(MANAGEMENT_CHANGED_EVENT));
}
export function demoCourse(id: string) {
  const course = demoCourses.find((item) => item.id === id);
  return course ? { ...structuredClone(course), ...read().courses[id] } : null;
}
export function demoCourseProducts(courseId: string) {
  const store = read();
  return demoProducts
    .filter((p) => p.courseId === courseId)
    .map((p) => ({ ...structuredClone(p), ...store.products[p.id] }))
    .filter(
      (p) =>
        p.publiclyVisible &&
        (p.status === undefined ||
          p.status === 'active' ||
          p.status === 'sold_out'),
    );
}
export function allDemoCourseProducts(courseId: string) {
  const store = read();
  return demoProducts
    .filter((p) => p.courseId === courseId)
    .map((p) => ({ ...structuredClone(p), ...store.products[p.id] }));
}
export function getMembershipsForUser(
  user: AuthenticatedUser,
): CourseMembership[] {
  if (user.mode !== 'demo') return [];
  const membership = (user as DemoIdentity).membership;
  if (!membership) return [];
  const now = '2026-01-01T00:00:00.000Z';
  return [
    {
      version: 1,
      userId: user.uid,
      courseId: membership.courseId,
      role: membership.role,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
  ];
}
function authorize(
  user: AuthenticatedUser,
  courseId: string,
  capability: Parameters<typeof hasCapability>[1],
) {
  const membership = getMembershipsForUser(user).find(
    (m) => m.courseId === courseId,
  );
  if (!hasCapability(membership, capability))
    throw new Error('You do not have permission to make this course change.');
}
function audit(
  store: Store,
  user: AuthenticatedUser,
  courseId: string,
  action: string,
  targetType: AuditEvent['targetType'],
  targetId: string,
  changedFields: string[],
) {
  store.audit.unshift({
    id: crypto.randomUUID(),
    courseId,
    actorUid: user.uid,
    action,
    targetType,
    targetId,
    changedFields,
    createdAt: new Date().toISOString(),
  });
}
export function updateDemoCourse(
  user: AuthenticatedUser,
  courseId: string,
  changes: Partial<Course>,
) {
  authorize(user, courseId, 'edit_course_operations');
  const allowed = [
    'orderingPaused',
    'estimatedMinutes',
    'minimumOrderCents',
    'promotion',
    'fulfillmentMethods',
  ] as const;
  if (
    Object.keys(changes).some(
      (key) => !allowed.includes(key as (typeof allowed)[number]),
    )
  )
    throw new Error('Unsupported course field.');
  if (
    changes.estimatedMinutes !== undefined &&
    (!Number.isInteger(changes.estimatedMinutes) ||
      changes.estimatedMinutes < 1 ||
      changes.estimatedMinutes > 180)
  )
    throw new Error('Preparation time must be between 1 and 180 minutes.');
  if (
    changes.minimumOrderCents !== undefined &&
    (!Number.isInteger(changes.minimumOrderCents) ||
      changes.minimumOrderCents < 0)
  )
    throw new Error('Minimum order must use whole cents.');
  if (changes.promotion && changes.promotion.length > 120)
    throw new Error('Promotion must be 120 characters or fewer.');
  if (changes.fulfillmentMethods?.length === 0 && !changes.orderingPaused)
    throw new Error('Choose at least one fulfillment method.');
  const store = read();
  store.courses[courseId] = { ...store.courses[courseId], ...changes };
  audit(
    store,
    user,
    courseId,
    'course.operations.updated',
    'course',
    courseId,
    Object.keys(changes),
  );
  write(store);
}
export function updateDemoProduct(
  user: AuthenticatedUser,
  courseId: string,
  productId: string,
  changes: Partial<Product>,
) {
  const product = demoProducts.find(
    (p) => p.id === productId && p.courseId === courseId,
  );
  if (!product) throw new Error('Product is not available for this course.');
  const availabilityOnly = Object.keys(changes).every((key) =>
    ['available', 'status'].includes(key),
  );
  authorize(
    user,
    courseId,
    availabilityOnly ? 'change_product_availability' : 'edit_catalog',
  );
  if (
    changes.priceCents !== undefined &&
    (!Number.isInteger(changes.priceCents) || changes.priceCents < 0)
  )
    throw new Error('Price must use non-negative whole cents.');
  if (changes.name !== undefined && !changes.name.trim())
    throw new Error('Product name is required.');
  if (
    changes.preparationMinutes !== undefined &&
    (!Number.isInteger(changes.preparationMinutes) ||
      changes.preparationMinutes < 1 ||
      changes.preparationMinutes > 180)
  )
    throw new Error('Preparation time is invalid.');
  const store = read();
  store.products[productId] = { ...store.products[productId], ...changes };
  audit(
    store,
    user,
    courseId,
    'product.updated',
    'product',
    productId,
    Object.keys(changes),
  );
  write(store);
}
export function submitDemoClaim(
  user: AuthenticatedUser,
  input: Omit<CourseClaim, 'id' | 'requestedBy' | 'status' | 'createdAt'>,
) {
  if (!demoCourses.some((c) => c.id === input.courseId))
    throw new Error('Choose a valid course.');
  if (
    !/^\S+@\S+\.\S+$/.test(input.businessEmail) ||
    input.explanation.trim().length < 10
  )
    throw new Error('Enter a business email and a helpful explanation.');
  const store = read();
  const claim = {
    ...input,
    id: crypto.randomUUID(),
    requestedBy: user.uid,
    status: 'submitted' as const,
    createdAt: new Date().toISOString(),
  };
  store.claims.push(claim);
  audit(store, user, input.courseId, 'claim.submitted', 'claim', claim.id, [
    'requestedRole',
    'businessEmail',
    'explanation',
  ]);
  write(store);
  return claim;
}
export function recentAudit(courseId: string) {
  return read()
    .audit.filter((e) => e.courseId === courseId)
    .slice(0, 5);
}
export function dollarsToCents(value: string) {
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(value))
    throw new Error(
      'Enter a dollar amount with no more than two decimal places.',
    );
  const [whole, fraction = ''] = value.split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}
