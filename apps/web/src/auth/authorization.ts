export type CourseMembershipRole =
  | 'course_owner'
  | 'course_manager'
  | 'catalog_editor'
  | 'fulfillment_staff'
  | 'analyst';
export type CourseMembershipStatus =
  | 'invited'
  | 'active'
  | 'suspended'
  | 'revoked';
export type CourseCapability =
  | 'view_management_workspace'
  | 'edit_course_operations'
  | 'edit_fulfillment_settings'
  | 'edit_catalog'
  | 'change_product_availability'
  | 'view_audit_history'
  | 'manage_course_members'
  | 'request_course_access'
  | 'view_partner_portal'
  | 'view_course_overview'
  | 'view_orders'
  | 'manage_orders'
  | 'view_catalog'
  | 'view_inventory'
  | 'edit_inventory'
  | 'view_storefront'
  | 'edit_storefront'
  | 'view_fulfillment'
  | 'view_promotions'
  | 'edit_promotions'
  | 'view_analytics'
  | 'manage_team';
export interface CourseMembership {
  version: 1;
  courseId: string;
  userId: string;
  role: CourseMembershipRole;
  status: CourseMembershipStatus;
  createdAt: string;
  updatedAt: string;
}
const matrix: Record<CourseMembershipRole, readonly CourseCapability[]> = {
  course_owner: [
    'view_partner_portal',
    'view_course_overview',
    'view_orders',
    'manage_orders',
    'view_catalog',
    'view_inventory',
    'edit_inventory',
    'view_storefront',
    'edit_storefront',
    'view_fulfillment',
    'view_promotions',
    'edit_promotions',
    'view_analytics',
    'manage_team',
    'view_management_workspace',
    'edit_course_operations',
    'edit_fulfillment_settings',
    'edit_catalog',
    'change_product_availability',
    'view_audit_history',
    'manage_course_members',
    'request_course_access',
  ],
  course_manager: [
    'view_partner_portal',
    'view_course_overview',
    'view_orders',
    'manage_orders',
    'view_catalog',
    'view_inventory',
    'edit_inventory',
    'view_storefront',
    'edit_storefront',
    'view_fulfillment',
    'view_promotions',
    'edit_promotions',
    'view_analytics',
    'manage_team',
    'view_management_workspace',
    'edit_course_operations',
    'edit_fulfillment_settings',
    'edit_catalog',
    'change_product_availability',
    'view_audit_history',
    'request_course_access',
  ],
  catalog_editor: [
    'view_partner_portal',
    'view_course_overview',
    'view_catalog',
    'view_inventory',
    'edit_inventory',
    'view_storefront',
    'view_management_workspace',
    'edit_catalog',
    'change_product_availability',
    'request_course_access',
  ],
  fulfillment_staff: [
    'view_partner_portal',
    'view_course_overview',
    'view_orders',
    'manage_orders',
    'view_inventory',
    'view_management_workspace',
    'change_product_availability',
    'request_course_access',
  ],
  analyst: [
    'view_partner_portal',
    'view_course_overview',
    'view_orders',
    'view_catalog',
    'view_inventory',
    'view_storefront',
    'view_fulfillment',
    'view_promotions',
    'view_analytics',
    'view_audit_history',
    'request_course_access',
  ],
};

export type PlatformRole = 'support_agent' | 'platform_admin';
export type PlatformCapability =
  | 'view_platform_portal'
  | 'review_course_applications'
  | 'approve_course_applications'
  | 'manage_courses'
  | 'manage_users'
  | 'manage_course_memberships'
  | 'view_all_orders'
  | 'view_payments'
  | 'manage_disputes'
  | 'manage_moderation'
  | 'view_reports'
  | 'manage_platform_settings'
  | 'view_platform_audit';
const platformMatrix: Record<PlatformRole, readonly PlatformCapability[]> = {
  support_agent: [
    'view_platform_portal',
    'review_course_applications',
    'view_all_orders',
    'view_payments',
    'manage_disputes',
    'manage_moderation',
    'view_reports',
    'view_platform_audit',
  ],
  platform_admin: [
    'view_platform_portal',
    'review_course_applications',
    'approve_course_applications',
    'manage_courses',
    'manage_users',
    'manage_course_memberships',
    'view_all_orders',
    'view_payments',
    'manage_disputes',
    'manage_moderation',
    'view_reports',
    'manage_platform_settings',
    'view_platform_audit',
  ],
};
export const hasPlatformCapability = (
  role: PlatformRole | undefined,
  capability: PlatformCapability,
) => Boolean(role && platformMatrix[role].includes(capability));
export const hasCapability = (
  membership: CourseMembership | undefined,
  capability: CourseCapability,
) =>
  membership?.status === 'active' &&
  matrix[membership.role].includes(capability);
export function parseMembership(value: unknown): CourseMembership | null {
  if (!value || typeof value !== 'object') return null;
  const m = value as Record<string, unknown>;
  if (
    m.version !== 1 ||
    typeof m.courseId !== 'string' ||
    typeof m.userId !== 'string' ||
    !Object.hasOwn(matrix, String(m.role)) ||
    !['invited', 'active', 'suspended', 'revoked'].includes(String(m.status)) ||
    typeof m.createdAt !== 'string' ||
    typeof m.updatedAt !== 'string'
  )
    return null;
  return m as unknown as CourseMembership;
}
export const roleLabel = (role: CourseMembershipRole) =>
  role
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
