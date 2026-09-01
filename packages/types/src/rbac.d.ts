import { UserRole } from './backend';
export type Permission = 'WORKSPACE_CREATE' | 'WORKSPACE_MANAGE' | 'WORKSPACE_DELETE' | 'WORKSPACE_VIEW' | 'MEMBER_INVITE' | 'MEMBER_REMOVE' | 'MEMBER_ROLE_CHANGE' | 'PROJECT_CREATE' | 'PROJECT_EDIT' | 'PROJECT_DELETE' | 'PROJECT_VIEW' | 'PROJECT_DEPLOY' | 'STORAGE_VIEW' | 'STORAGE_UPLOAD' | 'STORAGE_DELETE' | 'STORAGE_SWITCH_DRIVER' | 'BILLING_MANAGE';
/**
 * Role hierarchy levels for numerical comparison
 */
export declare const ROLE_HIERARCHY: Record<UserRole, number>;
/**
 * Exact permissions assigned to each role in Nirmaanify
 */
export declare const ROLE_PERMISSIONS: Record<UserRole, Permission[]>;
/**
 * Checks if a user's role meets or exceeds a required minimum role level
 */
export declare function hasRole(userRole?: UserRole | null, requiredRole?: UserRole): boolean;
/**
 * Checks if a user's role is in the list of allowed roles
 */
export declare function hasAnyRole(userRole?: UserRole | null, allowedRoles?: UserRole[]): boolean;
/**
 * Checks if a user role has a specific permission
 */
export declare function hasPermission(userRole?: UserRole | null, permission?: Permission): boolean;
//# sourceMappingURL=rbac.d.ts.map