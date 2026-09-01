'use client';

import { useMemo } from 'react';
import { useAuth } from '../context/auth-context';
import {
  UserRole,
  Permission,
  hasRole as checkRole,
  hasAnyRole as checkAnyRole,
  hasPermission as checkPermission,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
} from '@nirmaanify/types';

export function useRBAC() {
  const { user, activeWorkspace } = useAuth();

  // Current effective role (from workspace membership if available, or user global role)
  const role: UserRole = useMemo(() => {
    return (activeWorkspace?.role || user?.role || 'MEMBER') as UserRole;
  }, [activeWorkspace?.role, user?.role]);

  const permissions = useMemo(() => {
    return ROLE_PERMISSIONS[role] || [];
  }, [role]);

  const roleLevel = useMemo(() => {
    return ROLE_HIERARCHY[role] ?? 0;
  }, [role]);

  return {
    role,
    roleLevel,
    permissions,
    isOwner: role === 'OWNER',
    isAdmin: role === 'ADMIN' || role === 'OWNER',
    isDeveloper: checkRole(role, 'DEVELOPER'),
    isEditor: checkRole(role, 'EDITOR'),
    isViewer: role === 'VIEWER',
    can: (permission: Permission) => checkPermission(role, permission),
    hasRole: (requiredRole: UserRole) => checkRole(role, requiredRole),
    hasAnyRole: (allowedRoles: UserRole[]) => checkAnyRole(role, allowedRoles),
    // Common Action Presets
    canManageWorkspace: checkPermission(role, 'WORKSPACE_MANAGE'),
    canDeleteWorkspace: checkPermission(role, 'WORKSPACE_DELETE'),
    canInviteMembers: checkPermission(role, 'MEMBER_INVITE'),
    canRemoveMembers: checkPermission(role, 'MEMBER_REMOVE'),
    canCreateProject: checkPermission(role, 'PROJECT_CREATE'),
    canEditProject: checkPermission(role, 'PROJECT_EDIT'),
    canDeleteProject: checkPermission(role, 'PROJECT_DELETE'),
    canManageStorage: checkPermission(role, 'STORAGE_UPLOAD'),
    canSwitchStorageDriver: checkPermission(role, 'STORAGE_SWITCH_DRIVER'),
  };
}
