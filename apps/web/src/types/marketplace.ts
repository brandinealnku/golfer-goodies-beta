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
}
export interface Product {
  id: string;
  courseId: string;
  name: string;
  category: ProductCategory;
  priceCents: number;
  available: boolean;
  preparationMinutes: number;
}
export interface Promotion {
  id: string;
  courseId: string;
  title: string;
  active: boolean;
}
