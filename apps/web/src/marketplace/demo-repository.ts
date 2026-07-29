import type { Course, Product } from '../types/marketplace';
import type {
  AuditRepository,
  CourseApplication,
  CourseApplicationRepository,
  CoursePartnerRepository,
  MarketplaceAudit,
  MarketplaceDemoState,
  MarketplaceOrder,
  MarketplaceOrderStatus,
  MarketplaceRepository,
  NotificationRepository,
  OrderRepository,
  PaymentRepository,
  PlatformAdminRepository,
  StorefrontConfiguration,
  StorefrontStatus,
} from './foundation';

export const MARKETPLACE_STORE_KEY = 'gg.marketplace.foundation.v1';
export const MARKETPLACE_CHANGED = 'gg-marketplace-changed';
const at = '2026-07-29T12:00:00.000Z';
const storefront = (
  courseId: string,
  publicName: string,
  status: StorefrontStatus,
): StorefrontConfiguration => ({
  version: 1,
  courseId,
  status,
  profile: {
    publicName,
    slug: courseId,
    description: `A fictional ${publicName} demonstration storefront.`,
    address: '100 Demo Fairway',
    city: 'Sampleton',
    state: 'KY',
    timezone: 'America/New_York',
    publicEmail: 'hello@example.com',
    publicPhone: '(555) 010-0200',
    customerMessage: 'Order ahead, then follow the course pickup instructions.',
    amenities: ['Pro shop', 'Clubhouse'],
    pickupLocations: ['Pro shop counter', 'Clubhouse desk'],
    terms: 'Fictional demo orders only.',
  },
  hours: {
    weekly: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
      day,
      opens: '08:00',
      closes: '18:00',
    })),
    holiday: [],
    scheduledClosures: [],
    acceptingOrders: status === 'open',
    pausedMessage: 'Ordering is temporarily paused.',
    lastOrderTime: '17:30',
    advanceOrderDays: 0,
    maximumActiveOrders: 18,
    maximumOrdersPerWindow: 8,
    defaultPreparationMinutes: 15,
  },
  fulfillment: [
    {
      id: 'pro_shop_pickup',
      enabled: true,
      availableHours: [],
      minimumOrderCents: 0,
      serviceFeeCents: 0,
      preparationMinutes: 15,
      instructions: 'Show your demo order number.',
      locations: ['Pro shop counter'],
      maximumConcurrentOrders: 12,
      eligibilityRequirements: [],
    },
    {
      id: 'cart_delivery',
      enabled: courseId === 'summit-pines',
      availableHours: [],
      minimumOrderCents: 1000,
      serviceFeeCents: 250,
      preparationMinutes: 20,
      instructions: 'Provide a fictional hole and cart number.',
      locations: ['Holes 1–18'],
      maximumConcurrentOrders: 4,
      eligibilityRequirements: ['Active Ordering Session'],
    },
  ],
  paymentMethods: [
    {
      method: 'pay_at_pickup',
      enabled: true,
      instructions: 'Nothing is collected in this demo.',
    },
    {
      method: 'card_at_course',
      enabled: true,
      instructions: 'Pay course staff outside this demonstration.',
    },
  ],
  messages: {
    announcement: 'Welcome to our fictional demo storefront.',
    confirmation: 'Your demo order is in the queue.',
    preparing: 'The course is preparing your demo order.',
    ready: 'Your demo order is ready.',
    outForDelivery: 'Your demo delivery is on its way.',
    delay: 'The course updated your demo estimate.',
    cancellation: 'This demo order was cancelled.',
    fulfillment: 'Follow the selected pickup instructions.',
    customerService: 'Demo support: help@example.com',
  },
});
const order = (
  id: string,
  status: MarketplaceOrderStatus,
  courseId = 'summit-pines',
): MarketplaceOrder => ({
  version: 1,
  id,
  orderNumber: `GG-${id.slice(-3).toUpperCase()}`,
  courseId,
  golferId: 'demo-golfer',
  customerName: 'Jordan Golfer',
  items: [
    {
      productId: 'summit-pines-club-sandwich',
      name: 'Fairway Club',
      quantity: 2,
      capturedPriceCents: 1295,
    },
  ],
  subtotalCents: 2590,
  feeCents: 0,
  discountCents: 200,
  taxCents: 0,
  totalCents: 2390,
  paymentMethod: 'pay_at_pickup',
  paymentStatus: 'due_at_fulfillment',
  amountCollectedCents: 0,
  amountDueCents: 2390,
  refundStatus: 'none',
  fulfillmentMethod: 'pro_shop_pickup',
  fulfillmentLocation: 'Pro shop counter',
  customerInstructions: 'No utensils, please.',
  courseInstructions: 'Confirm demo order number.',
  status,
  estimatedCompletion: '2026-07-29T12:20:00.000Z',
  createdAt: at,
  updatedAt: at,
  history: [{ status, at, message: 'Deterministic demo order created.' }],
  customerMessages: [],
  staffNotes: ['Fictional training order.'],
});
export const createDemoMarketplaceState = (): MarketplaceDemoState => ({
  version: 1,
  storefronts: [
    storefront('summit-pines', 'Summit Pines', 'open'),
    storefront('cedar-bend-muni', 'Cedar Bend Municipal', 'paused'),
    storefront('harbor-dunes', 'Harbor Dunes', 'verification_pending'),
  ],
  inventory: [
    {
      productId: 'summit-pines-club-sandwich',
      mode: 'manual',
      quantityAvailable: 4,
      lowStockThreshold: 5,
      soldOut: false,
      restockValue: 12,
      notes: 'Demo count',
      updatedAt: at,
      updatedBy: 'summit-manager',
    },
    {
      productId: 'summit-pines-sparkler',
      mode: 'unlimited',
      soldOut: false,
      notes: '',
      updatedAt: at,
      updatedBy: 'summit-manager',
    },
  ],
  promotions: [
    {
      id: 'demo-lunch',
      type: 'fixed',
      title: 'Demo lunch special',
      active: true,
      startAt: '2026-01-01T00:00:00.000Z',
      endAt: '2027-01-01T00:00:00.000Z',
      eligibleProductIds: ['summit-pines-club-sandwich'],
      eligibleCategories: ['food'],
      minimumPurchaseCents: 2000,
      fulfillmentRestrictions: [],
      publicMessage: '$2 fictional demo discount on lunch orders.',
    },
  ],
  orders: [
    order('order-101', 'new'),
    order('order-102', 'preparing'),
    order('order-103', 'delayed'),
  ],
  applications: [
    {
      id: 'application-cedar',
      courseName: 'Cedar Bend Municipal',
      outcome: 'unclaimed',
      status: 'verification_pending',
      applicantName: 'Taylor Partner',
      updatedAt: at,
    },
    {
      id: 'application-harbor',
      courseName: 'Harbor Dunes',
      outcome: 'not_listed',
      status: 'changes_requested',
      applicantName: 'Riley Partner',
      updatedAt: at,
    },
  ],
  suspendedCourseIds: [],
  suspendedUserIds: ['suspended-manager'],
  audit: [
    {
      id: 'audit-seed',
      scope: 'platform',
      actorId: 'system',
      action: 'demo.seeded',
      targetId: 'marketplace',
      createdAt: at,
      detail: 'Deterministic fictional marketplace loaded.',
    },
  ],
});
export function isMarketplaceState(
  value: unknown,
): value is MarketplaceDemoState {
  const v = value as MarketplaceDemoState;
  return Boolean(
    v &&
      v.version === 1 &&
      Array.isArray(v.storefronts) &&
      Array.isArray(v.orders) &&
      v.orders.every(
        (o) =>
          o.version === 1 &&
          typeof o.courseId === 'string' &&
          Number.isInteger(o.totalCents),
      ) &&
      Array.isArray(v.audit),
  );
}
export class DemoMarketplaceRepository
  implements
    MarketplaceRepository,
    CoursePartnerRepository,
    PlatformAdminRepository,
    OrderRepository,
    CourseApplicationRepository,
    AuditRepository,
    NotificationRepository,
    PaymentRepository
{
  getState() {
    try {
      const parsed: unknown = JSON.parse(
        localStorage.getItem(MARKETPLACE_STORE_KEY) ?? 'null',
      );
      if (isMarketplaceState(parsed)) return structuredClone(parsed);
    } catch {
      /* safe deterministic recovery */
    }
    const initial = createDemoMarketplaceState();
    this.write(initial);
    return structuredClone(initial);
  }
  private write(state: MarketplaceDemoState) {
    localStorage.setItem(MARKETPLACE_STORE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event(MARKETPLACE_CHANGED));
  }
  private audit(
    state: MarketplaceDemoState,
    entry: Omit<MarketplaceAudit, 'id' | 'createdAt'>,
  ) {
    state.audit.unshift({
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    });
  }
  reset() {
    localStorage.removeItem(MARKETPLACE_STORE_KEY);
    this.write(createDemoMarketplaceState());
  }
  ordersForCourse(courseId: string) {
    return this.getState().orders.filter((o) => o.courseId === courseId);
  }
  findOrder(id: string) {
    return this.getState().orders.find((o) => o.id === id);
  }
  transitionOrder(
    courseId: string,
    orderId: string,
    status: MarketplaceOrderStatus,
    actorId: string,
    message = 'Demo status updated by course staff.',
  ) {
    const state = this.getState();
    const item = state.orders.find(
      (o) => o.id === orderId && o.courseId === courseId,
    );
    if (!item) throw new Error('Order is not available for this course.');
    item.status = status;
    item.updatedAt = new Date().toISOString();
    item.history.push({ status, at: item.updatedAt, message });
    this.audit(state, {
      scope: 'course',
      courseId,
      actorId,
      action: 'order.status_changed',
      targetId: orderId,
      detail: `Status changed to ${status}.`,
    });
    this.write(state);
    return structuredClone(item);
  }
  updateStorefrontStatus(
    courseId: string,
    status: StorefrontStatus,
    actorId: string,
  ) {
    const state = this.getState();
    const item = state.storefronts.find((s) => s.courseId === courseId);
    if (!item) throw new Error('Storefront not found.');
    if (state.suspendedCourseIds.includes(courseId) && status === 'open')
      throw new Error('A suspended course cannot accept orders.');
    item.status = status;
    item.hours.acceptingOrders = status === 'open';
    this.audit(state, {
      scope: 'course',
      courseId,
      actorId,
      action: 'storefront.status_changed',
      targetId: courseId,
      detail: `Storefront set to ${status}.`,
    });
    this.write(state);
  }
  setCourseSuspended(courseId: string, suspended: boolean, actorId: string) {
    const state = this.getState();
    state.suspendedCourseIds = suspended
      ? [...new Set([...state.suspendedCourseIds, courseId])]
      : state.suspendedCourseIds.filter((id) => id !== courseId);
    const sf = state.storefronts.find((s) => s.courseId === courseId);
    if (suspended && sf) {
      sf.status = 'closed';
      sf.hours.acceptingOrders = false;
    }
    this.audit(state, {
      scope: 'platform',
      actorId,
      action: suspended ? 'course.suspended' : 'course.reactivated',
      targetId: courseId,
      detail: 'Browser-local administrator simulation.',
    });
    this.write(state);
  }
  setUserSuspended(userId: string, suspended: boolean, actorId: string) {
    const state = this.getState();
    state.suspendedUserIds = suspended
      ? [...new Set([...state.suspendedUserIds, userId])]
      : state.suspendedUserIds.filter((id) => id !== userId);
    this.audit(state, {
      scope: 'platform',
      actorId,
      action: suspended ? 'user.suspended' : 'user.reactivated',
      targetId: userId,
      detail: 'Browser-local administrator simulation.',
    });
    this.write(state);
  }
  setApplicationStatus(
    id: string,
    status: CourseApplication['status'],
    actorId: string,
  ) {
    const state = this.getState();
    const app = state.applications.find((a) => a.id === id);
    if (!app) throw new Error('Application not found.');
    app.status = status;
    app.updatedAt = new Date().toISOString();
    this.audit(state, {
      scope: 'platform',
      actorId,
      action: 'application.status_changed',
      targetId: id,
      detail: `Application set to ${status}.`,
    });
    this.write(state);
  }
  list() {
    return this.getState().audit;
  }
  send(): never {
    throw new Error(
      'Real notifications are not configured; demo messages remain browser-local.',
    );
  }
  collect(): never {
    throw new Error('Payment processing is unavailable in demo mode.');
  }
}
export const demoMarketplaceRepository = new DemoMarketplaceRepository();
export function productCanBeOrdered(
  product: Product,
  inventory: MarketplaceDemoState['inventory'],
) {
  const record = inventory.find((i) => i.productId === product.id);
  return (
    product.publiclyVisible &&
    product.available &&
    product.status !== 'sold_out' &&
    !record?.soldOut &&
    (record?.quantityAvailable === undefined || record.quantityAvailable > 0)
  );
}
export function courseCanAcceptOrders(
  course: Course,
  state: MarketplaceDemoState,
) {
  const storefront = state.storefronts.find((s) => s.courseId === course.id);
  return Boolean(
    course.verified &&
      !state.suspendedCourseIds.includes(course.id) &&
      storefront?.status === 'open' &&
      storefront.hours.acceptingOrders,
  );
}
