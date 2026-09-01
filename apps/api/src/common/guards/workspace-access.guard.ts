import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
import { UserRole } from '@nirmaanify/types';

export const WORKSPACE_ROLES_KEY = 'workspace_roles';

@Injectable()
export class WorkspaceAccessGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user || !user.id) {
      throw new ForbiddenException('User authentication required');
    }

    // Extract workspaceId from params, body, or query
    const workspaceId =
      req.params?.workspaceId ||
      req.params?.id ||
      req.body?.workspaceId ||
      req.query?.workspaceId;

    if (!workspaceId) {
      return true; // No specific workspace targeted; pass to next handler
    }

    // Fetch workspace with membership
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: true,
      },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace ${workspaceId} not found`);
    }

    // Determine user's effective role in this specific workspace
    let effectiveRole: UserRole | null = null;

    if (workspace.ownerId === user.id) {
      effectiveRole = 'OWNER';
    } else {
      const membership = workspace.members.find((m) => m.userId === user.id);
      if (membership) {
        effectiveRole = membership.role as UserRole;
      }
    }

    // Tenant Isolation Check: If user is not the owner or a member, DENY ACCESS
    if (!effectiveRole) {
      throw new ForbiddenException(
        'Access denied: You do not have permission to access or view this workspace'
      );
    }

    // Check if endpoint requires specific workspace-level roles
    const requiredWorkspaceRoles = this.reflector.getAllAndOverride<UserRole[]>(
      WORKSPACE_ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (requiredWorkspaceRoles && requiredWorkspaceRoles.length > 0) {
      const roleHierarchy: Record<UserRole, number> = {
        OWNER: 5,
        ADMIN: 4,
        DEVELOPER: 3,
        EDITOR: 2,
        VIEWER: 1,
        MEMBER: 1,
      };

      const userRank = roleHierarchy[effectiveRole] || 0;
      const minRequiredRank = Math.min(
        ...requiredWorkspaceRoles.map((r) => roleHierarchy[r] || 0)
      );

      const hasRequiredRole =
        requiredWorkspaceRoles.includes(effectiveRole) || userRank >= minRequiredRank;

      if (!hasRequiredRole) {
        throw new ForbiddenException(
          `Insufficient workspace permissions: requires [${requiredWorkspaceRoles.join(
            ', '
          )}] in this workspace. Your role is [${effectiveRole}].`
        );
      }
    }

    // Attach verified workspace and effective role to request context
    req.workspace = workspace;
    req.workspaceRole = effectiveRole;

    return true;
  }
}
