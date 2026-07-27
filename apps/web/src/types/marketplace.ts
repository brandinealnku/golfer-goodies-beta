export type ProductCategory =
  | 'food'
  | 'drink'
  | 'gear'
  | 'essentials'
  | 'service';
export type FulfillmentMethod = 'pickup' | 'cart-delivery' | 'on-course-meetup';
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
}
export interface Promotion {
  id: string;
  courseId: string;
  title: string;
  active: boolean;
}

export type VerificationMethod =
  | 'simulated_location'
  | 'demo_qr'
  | 'demo_course_code';
export interface ActiveRound {
  courseId: string;
  verificationMethod: VerificationMethod;
  verifiedAt: string;
  expiresAt: string;
  holeNumber?: number;
  cartNumber?: string;
}
export type CourseContext =
  | { selectedCourseId: null; mode: 'none' }
  | { selectedCourseId: string; mode: 'browse'; expired?: boolean }
  | {
      selectedCourseId: string;
      mode: 'active_round';
      activeRound: ActiveRound;
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
      reason: 'low_location_accuracy' | 'near_boundary';
      alternatives: ('demo_qr' | 'demo_course_code')[];
    }
  | {
      status: 'not_eligible';
      reason:
        | 'outside_service_area'
        | 'course_closed'
        | 'ordering_paused'
        | 'verification_expired';
    };
