export type ProductCategory =
  | 'food'
  | 'drink'
  | 'gear'
  | 'essentials'
  | 'service';
export type FulfillmentMethod = 'pickup' | 'cart-delivery' | 'on-course-meetup';
export type DiscoveryProvider = 'google_places' | 'demo' | 'emulator';
export interface DiscoveredGolfCourse {
  provider: DiscoveryProvider;
  providerPlaceId: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  approximateDistanceMiles?: number;
  businessStatus?: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY';
  googleMapsUri?: string;
}
export interface MarketplaceCourseSummary {
  id: string;
  provider: DiscoveryProvider;
  providerPlaceId: string;
  marketplaceStatus:
    | 'active'
    | 'onboarding'
    | 'paused'
    | 'suspended'
    | 'inactive';
  orderingEnabled: boolean;
  fulfillmentMethods: FulfillmentMethod[];
  estimatedMinutes?: number;
  promotion?: string;
}
export interface CourseDiscoveryResult {
  discoveredCourse: DiscoveredGolfCourse;
  marketplaceCourse?: MarketplaceCourseSummary;
  orderingAvailable: boolean;
}
export type CourseAvailability = 'open' | 'limited' | 'closed';
export type UserRole = 'golfer' | 'partner-admin' | 'staff' | 'platform-admin';
export type OrderStatus =
  | 'draft'
  | 'placed'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'fulfilled'
  | 'cancelled';
export type PaymentStatus =
  | 'not-started'
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'failed'
  | 'refunded';
export interface Course {
  id: string;
  name: string;
  city: string;
  state: string;
  archetype: string;
  availability: CourseAvailability;
  fulfillmentMethods: FulfillmentMethod[];
  estimatedMinutes: number;
  verified: boolean;
  description: string;
  demoCode: string;
  demoQrToken: string;
  minimumOrderCents: number;
  promotion?: string;
  orderingPaused?: boolean;
  demoLocationResult?: 'eligible' | 'uncertain' | 'outside_service_area';
  locationVerificationEnabled?: boolean;
  serviceAreaConfiguration?: {
    type: 'radius';
    latitude: number;
    longitude: number;
    radiusMeters: number;
    source: 'staff' | 'osm' | 'platform' | 'radius_fallback';
  };
  image: string;
  imageAlt: string;
}
export interface ProductModifierOption {
  id: string;
  name: string;
  priceCents: number;
}
export interface ProductModifierGroup {
  id: string;
  name: string;
  required?: boolean;
  options: ProductModifierOption[];
}
export interface Product {
  id: string;
  courseId: string;
  name: string;
  category: ProductCategory;
  priceCents: number;
  available: boolean;
  preparationMinutes: number;
  publiclyVisible: boolean;
  image: string;
  imageAlt: string;
  description: string;
  tags: string[];
  featured?: boolean;
  popular?: boolean;
  modifiers?: ProductModifierGroup[];
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  image: string;
  selectedModifiers: ProductModifierOption[];
  instructions: string;
}
export interface Cart {
  version: 1;
  courseId: string;
  items: CartItem[];
  updatedAt: string;
}
export type DemoOrderStatus =
  | 'received'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'completed';
export interface OrderTotals {
  subtotalCents: number;
  serviceFeeCents: number;
  taxCents: number;
  deliveryFeeCents: number;
  totalCents: number;
}
export interface DemoOrder {
  version: 1;
  id: string;
  orderNumber: string;
  courseId: string;
  courseName: string;
  items: CartItem[];
  fulfillment: FulfillmentMethod;
  fulfillmentDetails: string;
  totals: OrderTotals;
  status: DemoOrderStatus;
  placedAt: string;
  estimatedReadyAt: string;
}
export interface Promotion {
  id: string;
  courseId: string;
  title: string;
  active: boolean;
}

export type VerificationMethod =
  | 'simulated_location'
  | 'geolocation'
  | 'course_qr'
  | 'course_code';
export interface OrderingSession {
  version: 1;
  id: string;
  courseId: string;
  verificationMethod: VerificationMethod;
  verifiedAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'revoked';
  confidence: 'high' | 'fallback' | 'demo';
}
export type CourseContext =
  | { selectedCourseId: null; mode: 'none' }
  | { selectedCourseId: string; mode: 'browse'; expired?: boolean }
  | {
      selectedCourseId: string;
      mode: 'ordering_session';
      orderingSession: OrderingSession;
    };
export type CourseEligibility =
  | {
      status: 'eligible';
      courseId: string;
      method: VerificationMethod;
      expiresAt: string;
    }
  | {
      status: 'uncertain';
      reason: 'low_accuracy' | 'near_boundary';
      alternatives: ('course_qr' | 'course_code')[];
    }
  | {
      status: 'not_eligible';
      reason:
        | 'outside_service_area'
        | 'course_closed'
        | 'ordering_paused'
        | 'verification_expired';
    };
