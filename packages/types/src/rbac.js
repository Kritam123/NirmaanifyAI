"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.ROLE_HIERARCHY = void 0;
exports.hasRole = hasRole;
exports.hasAnyRole = hasAnyRole;
exports.hasPermission = hasPermission;
/**
 * Role hierarchy levels for numerical comparison
 */
exports.ROLE_HIERARCHY = {
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
exports.ROLE_PERMISSIONS = {
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
function hasRole(userRole, requiredRole) {
    if (!userRole || !requiredRole)
        return false;
    return (exports.ROLE_HIERARCHY[userRole] ?? 0) >= (exports.ROLE_HIERARCHY[requiredRole] ?? 0);
}
/**
 * Checks if a user's role is in the list of allowed roles
 */
function hasAnyRole(userRole, allowedRoles) {
    if (!userRole || !allowedRoles || allowedRoles.length === 0)
        return false;
    return allowedRoles.includes(userRole);
}
/**
 * Checks if a user role has a specific permission
 */
function hasPermission(userRole, permission) {
    if (!userRole || !permission)
        return false;
    const permissions = exports.ROLE_PERMISSIONS[userRole] || [];
    return permissions.includes(permission);
}
//# sourceMappingURL=rbac.js.map