export type CourseMembershipRole =
  | 'course_owner'
  | 'course_manager'
  | 'catalog_editor'
  | 'fulfillment_staff';
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
  | 'request_course_access';
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
    'view_management_workspace',
    'edit_course_operations',
    'edit_fulfillment_settings',
    'edit_catalog',
    'change_product_availability',
    'view_audit_history',
    'request_course_access',
  ],
  catalog_editor: [
    'view_management_workspace',
    'edit_catalog',
    'change_product_availability',
    'request_course_access',
  ],
  fulfillment_staff: [
    'view_management_workspace',
    'change_product_availability',
    'request_course_access',
  ],
};
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
