import { describe, expect, it } from 'vitest';
import {
  hasCapability,
  parseMembership,
  type CourseMembership,
  type CourseMembershipRole,
} from './authorization';
const member = (
  role: CourseMembershipRole,
  status: CourseMembership['status'] = 'active',
): CourseMembership => ({
  version: 1,
  courseId: 'summit-pines',
  userId: 'user',
  role,
  status,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
});
describe('course capability matrix', () => {
  it('allows owners and managers to operate a course', () => {
    for (const role of ['course_owner', 'course_manager'] as const) {
      expect(hasCapability(member(role), 'edit_course_operations')).toBe(true);
      expect(hasCapability(member(role), 'edit_catalog')).toBe(true);
    }
  });
  it('limits catalog editors', () => {
    expect(hasCapability(member('catalog_editor'), 'edit_catalog')).toBe(true);
    expect(
      hasCapability(member('catalog_editor'), 'edit_course_operations'),
    ).toBe(false);
    expect(hasCapability(member('catalog_editor'), 'view_audit_history')).toBe(
      false,
    );
  });
  it('limits fulfillment staff to availability', () => {
    expect(
      hasCapability(member('fulfillment_staff'), 'change_product_availability'),
    ).toBe(true);
    expect(hasCapability(member('fulfillment_staff'), 'edit_catalog')).toBe(
      false,
    );
  });
  it('denies suspended, revoked, and missing memberships', () => {
    expect(
      hasCapability(
        member('course_owner', 'suspended'),
        'view_management_workspace',
      ),
    ).toBe(false);
    expect(
      hasCapability(
        member('course_owner', 'revoked'),
        'view_management_workspace',
      ),
    ).toBe(false);
    expect(hasCapability(undefined, 'view_management_workspace')).toBe(false);
  });
  it('validates membership records', () => {
    expect(parseMembership(member('course_manager'))).not.toBeNull();
    expect(
      parseMembership({ ...member('course_manager'), role: 'platform_admin' }),
    ).toBeNull();
  });
});
