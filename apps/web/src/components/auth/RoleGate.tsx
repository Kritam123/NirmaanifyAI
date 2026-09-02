'use client';

import React from 'react';
import { UserRole, Permission } from '@nirmaanify/types';
import { Badge } from '@nirmaanify/ui';
import { useRBAC } from '../../hooks/use-rbac';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  minRole?: UserRole;
  fallback?: React.ReactNode;
  showUnauthorizedMessage?: boolean;
}

/**
 * Conditionally renders children only if the active user matches the required roles/levels
 */
export const RoleGate: React.FC<RoleGateProps> = ({
  children,
  allowedRoles,
  minRole,
  fallback = null,
  showUnauthorizedMessage = false,
}) => {
  const { role, hasAnyRole, hasRole } = useRBAC();

  let isAuthorized = true;

  if (allowedRoles && allowedRoles.length > 0) {
    isAuthorized = hasAnyRole(allowedRoles);
  } else if (minRole) {
    isAuthorized = hasRole(minRole);
  }

  if (!isAuthorized) {
    if (fallback) return <>{fallback}</>;
    if (showUnauthorizedMessage) {
      return (
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-3">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>
            Access restricted. Your current role is <strong className="font-bold uppercase">{role}</strong>.
          </span>
        </div>
      );
    }
    return null;
  }

  return <>{children}</>;
};

interface PermissionGateProps {
  children: React.ReactNode;
  permission: Permission;
  fallback?: React.ReactNode;
}

/**
 * Conditionally renders children only if the active user has a specific permission
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  fallback = null,
}) => {
  const { can } = useRBAC();

  if (!can(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface RoleBadgeProps {
  role?: UserRole;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

/**
 * Visual badge reflecting the user or member's assigned RBAC role
 */
export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role = 'MEMBER',
  size = 'sm',
  showIcon = false,
}) => {
  const getBadgeConfig = (r: UserRole): { variant: 'indigo' | 'violet' | 'cyan' | 'warning' | 'secondary'; label: string } => {
    switch (r) {
      case 'OWNER':
        return { variant: 'indigo', label: 'Owner' };
      case 'ADMIN':
        return { variant: 'violet', label: 'Admin' };
      case 'DEVELOPER':
        return { variant: 'cyan', label: 'Developer' };
      case 'EDITOR':
        return { variant: 'warning', label: 'Editor' };
      case 'VIEWER':
        return { variant: 'secondary', label: 'Viewer' };
      default:
        return { variant: 'secondary', label: 'Member' };
    }
  };

  const config = getBadgeConfig(role);

  return (
    <Badge variant={config.variant} size={size} className="inline-flex items-center gap-1">
      {showIcon && <ShieldCheck className="h-3 w-3" />}
      <span>{config.label}</span>
    </Badge>
  );
};
