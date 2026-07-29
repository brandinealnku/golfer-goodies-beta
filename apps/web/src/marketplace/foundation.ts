export type StorefrontStatus =
  | 'open'
  | 'scheduled'
  | 'paused'
  | 'closed'
  | 'setup_incomplete'
  | 'verification_pending';
export type MarketplaceOrderStatus =
  | 'new'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'awaiting_pickup'
  | 'out_for_delivery'
  | 'fulfilled'
  | 'needs_clarification'
  | 'delayed'
  | 'cancelled_by_course'
  | 'cancelled_by_golfer'
  | 'unable_to_fulfill'
  | 'refund_pending'
  | 'refunded';
export type MarketplaceFulfillment =
  | 'pro_shop_pickup'
  | 'clubhouse_pickup'
  | 'turn_pickup'
  | 'cart_delivery'
  | 'on_course_meetup'
  | 'locker_pickup';
export type MarketplacePaymentMethod =
  | 'pay_at_pickup'
  | 'pay_at_delivery'
  | 'member_account'
  | 'cash_at_course'
  | 'card_at_course'
  | 'mobile_wallet_at_course'
  | 'custom';
export interface Hours {
  day: string;
  opens: string;
  closes: string;
  closed?: boolean;
}
export interface FulfillmentConfiguration {
  id: MarketplaceFulfillment;
  enabled: boolean;
  availableHours: Hours[];
  minimumOrderCents: number;
  serviceFeeCents: number;
  preparationMinutes: number;
  instructions: string;
  locations: string[];
  maximumConcurrentOrders: number;
  eligibilityRequirements: string[];
}
export interface InventoryRecord {
  productId: string;
  mode:
    | 'unlimited'
    | 'manual'
    | 'automatic_placeholder'
    | 'scheduled'
    | 'fulfillment_specific';
  quantityAvailable?: number;
  lowStockThreshold?: number;
  soldOut: boolean;
  restockValue?: number;
  notes: string;
  updatedAt: string;
  updatedBy: string;
}
export interface PromotionConfiguration {
  id: string;
  type:
    | 'percentage'
    | 'fixed'
    | 'bogo'
    | 'bundle'
    | 'minimum_purchase'
    | 'promo_code'
    | 'scheduled'
    | 'featured_item'
    | 'announcement';
  title: string;
  active: boolean;
  startAt: string;
  endAt: string;
  eligibleProductIds: string[];
  eligibleCategories: string[];
  minimumPurchaseCents: number;
  usageLimit?: number;
  fulfillmentRestrictions: MarketplaceFulfillment[];
  publicMessage: string;
}
export interface StorefrontConfiguration {
  version: 1;
  courseId: string;
  status: StorefrontStatus;
  profile: {
    publicName: string;
    slug: string;
    logo?: string;
    heroImage?: string;
    description: string;
    address: string;
    city: string;
    state: string;
    timezone: string;
    publicEmail: string;
    publicPhone: string;
    customerMessage: string;
    amenities: string[];
    pickupLocations: string[];
    terms: string;
  };
  hours: {
    weekly: Hours[];
    holiday: Hours[];
    scheduledClosures: string[];
    acceptingOrders: boolean;
    pausedMessage: string;
    lastOrderTime: string;
    advanceOrderDays: number;
    maximumActiveOrders: number;
    maximumOrdersPerWindow: number;
    defaultPreparationMinutes: number;
  };
  fulfillment: FulfillmentConfiguration[];
  paymentMethods: {
    method: MarketplacePaymentMethod;
    enabled: boolean;
    instructions: string;
  }[];
  messages: Record<
    | 'announcement'
    | 'confirmation'
    | 'preparing'
    | 'ready'
    | 'outForDelivery'
    | 'delay'
    | 'cancellation'
    | 'fulfillment'
    | 'customerService',
    string
  >;
}
export interface MarketplaceOrder {
  version: 1;
  id: string;
  orderNumber: string;
  courseId: string;
  golferId: string;
  customerName: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    capturedPriceCents: number;
  }[];
  subtotalCents: number;
  feeCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  paymentMethod: MarketplacePaymentMethod;
  paymentStatus:
    | 'not_collected'
    | 'due_at_fulfillment'
    | 'paid_demo'
    | 'refund_pending'
    | 'refunded';
  amountCollectedCents: number;
  amountDueCents: number;
  refundStatus: 'none' | 'pending' | 'refunded';
  fulfillmentMethod: MarketplaceFulfillment;
  fulfillmentLocation: string;
  customerInstructions: string;
  courseInstructions: string;
  status: MarketplaceOrderStatus;
  estimatedCompletion: string;
  createdAt: string;
  updatedAt: string;
  history: { status: MarketplaceOrderStatus; at: string; message: string }[];
  customerMessages: string[];
  staffNotes: string[];
  assignedStaff?: string;
}
export interface CourseApplication {
  id: string;
  courseName: string;
  outcome: 'already_claimed' | 'unclaimed' | 'not_listed';
  status:
    | 'draft'
    | 'submitted'
    | 'verification_pending'
    | 'setup'
    | 'platform_review'
    | 'approved'
    | 'changes_requested'
    | 'rejected';
  applicantName: string;
  updatedAt: string;
}
export interface MarketplaceAudit {
  id: string;
  scope: 'course' | 'platform';
  courseId?: string;
  actorId: string;
  action: string;
  targetId: string;
  createdAt: string;
  detail: string;
}
export interface MarketplaceDemoState {
  version: 1;
  storefronts: StorefrontConfiguration[];
  inventory: InventoryRecord[];
  promotions: PromotionConfiguration[];
  orders: MarketplaceOrder[];
  applications: CourseApplication[];
  suspendedCourseIds: string[];
  suspendedUserIds: string[];
  audit: MarketplaceAudit[];
}

export interface MarketplaceRepository {
  getState(): MarketplaceDemoState;
  reset(): void;
}
export interface CoursePartnerRepository {
  transitionOrder(
    courseId: string,
    orderId: string,
    status: MarketplaceOrderStatus,
    actorId: string,
    message?: string,
  ): MarketplaceOrder;
  updateStorefrontStatus(
    courseId: string,
    status: StorefrontStatus,
    actorId: string,
  ): void;
}
export interface PlatformAdminRepository {
  setCourseSuspended(
    courseId: string,
    suspended: boolean,
    actorId: string,
  ): void;
  setUserSuspended(userId: string, suspended: boolean, actorId: string): void;
}
export interface OrderRepository {
  ordersForCourse(courseId: string): MarketplaceOrder[];
  findOrder(id: string): MarketplaceOrder | undefined;
}
export interface CourseApplicationRepository {
  setApplicationStatus(
    id: string,
    status: CourseApplication['status'],
    actorId: string,
  ): void;
}
export interface NotificationRepository {
  send(): never;
}
export interface PaymentRepository {
  collect(): never;
}
export interface AuditRepository {
  list(): MarketplaceAudit[];
}
