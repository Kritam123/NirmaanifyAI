import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, Permission, hasAnyRole, hasPermission } from '@nirmaanify/types';
import { ROLES_KEY, PERMISSIONS_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    // If no roles or permissions specified, allow access
    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const userRole: UserRole = user?.role || 'MEMBER';

    // Check required roles if specified
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRoleMatch = hasAnyRole(userRole, requiredRoles);
      if (!hasRoleMatch) {
        throw new ForbiddenException(
          `Access denied: requires one of [${requiredRoles.join(', ')}] role(s). Your role is [${userRole}].`
        );
      }
    }

    // Check required permissions if specified
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasPermissionMatch = requiredPermissions.every((perm) =>
        hasPermission(userRole, perm)
      );
      if (!hasPermissionMatch) {
        throw new ForbiddenException(
          `Access denied: requires permissions [${requiredPermissions.join(', ')}].`
        );
      }
    }

    return true;
  }
}
