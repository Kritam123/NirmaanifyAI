import { UserRole } from './backend';

export type Permission =
  | 'WORKSPACE_CREATE'
  | 'WORKSPACE_MANAGE'
  | 'WORKSPACE_DELETE'
  | 'WORKSPACE_VIEW'
  | 'MEMBER_INVITE'
  | 'MEMBER_REMOVE'
  | 'MEMBER_ROLE_CHANGE'
  | 'PROJECT_CREATE'
  | 'PROJECT_EDIT'
  | 'PROJECT_DELETE'
  | 'PROJECT_VIEW'
  | 'PROJECT_DEPLOY'
  | 'STORAGE_VIEW'
  | 'STORAGE_UPLOAD'
  | 'STORAGE_DELETE'
  | 'STORAGE_SWITCH_DRIVER'
  | 'BILLING_MANAGE';

/**
 * Role hierarchy levels for numerical comparison
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  OWNER: 100,
  ADMIN: 80,
  DEVELOPER: 60,
  EDITOR: 40,
  MEMBER: 20,
  VIEWER: 10,
};

/**
 * Exact permissions assigned to each role in Nirmaanify
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  OWNER: [
    'WORKSPACE_CREATE',
    'WORKSPACE_MANAGE',
    'WORKSPACE_DELETE',
    'WORKSPACE_VIEW',
    'MEMBER_INVITE',
    'MEMBER_REMOVE',
    'MEMBER_ROLE_CHANGE',
    'PROJECT_CREATE',
    'PROJECT_EDIT',
    'PROJECT_DELETE',
    'PROJECT_VIEW',
    'PROJECT_DEPLOY',
    'STORAGE_VIEW',
    'STORAGE_UPLOAD',
    'STORAGE_DELETE',
    'STORAGE_SWITCH_DRIVER',
    'BILLING_MANAGE',
  ],
  ADMIN: [
    'WORKSPACE_CREATE',
    'WORKSPACE_MANAGE',
    'WORKSPACE_VIEW',
    'MEMBER_INVITE',
    'MEMBER_REMOVE',
    'MEMBER_ROLE_CHANGE',
    'PROJECT_CREATE',
    'PROJECT_EDIT',
    'PROJECT_DELETE',
    'PROJECT_VIEW',
    'PROJECT_DEPLOY',
    'STORAGE_VIEW',
    'STORAGE_UPLOAD',
    'STORAGE_DELETE',
    'STORAGE_SWITCH_DRIVER',
    'BILLING_MANAGE',
  ],
  DEVELOPER: [
    'WORKSPACE_VIEW',
    'PROJECT_CREATE',
    'PROJECT_EDIT',
    'PROJECT_VIEW',
    'PROJECT_DEPLOY',
    'STORAGE_VIEW',
    'STORAGE_UPLOAD',
    'STORAGE_DELETE',
  ],
  EDITOR: [
    'WORKSPACE_VIEW',
    'PROJECT_EDIT',
    'PROJECT_VIEW',
    'STORAGE_VIEW',
    'STORAGE_UPLOAD',
  ],
  MEMBER: [
    'WORKSPACE_VIEW',
    'PROJECT_VIEW',
    'STORAGE_VIEW',
  ],
  VIEWER: [
    'WORKSPACE_VIEW',
    'PROJECT_VIEW',
  ],
};

/**
 * Checks if a user's role meets or exceeds a required minimum role level
 */
export function hasRole(userRole?: UserRole | null, requiredRole?: UserRole): boolean {
  if (!userRole || !requiredRole) return false;
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
}

/**
 * Checks if a user's role is in the list of allowed roles
 */
export function hasAnyRole(userRole?: UserRole | null, allowedRoles?: UserRole[]): boolean {
  if (!userRole || !allowedRoles || allowedRoles.length === 0) return false;
  return allowedRoles.includes(userRole);
}

/**
 * Checks if a user role has a specific permission
 */
export function hasPermission(userRole?: UserRole | null, permission?: Permission): boolean {
  if (!userRole || !permission) return false;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}
