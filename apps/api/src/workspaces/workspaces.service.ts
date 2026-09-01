import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { WorkspaceDto, WorkspaceMemberDto } from '@nirmaanify/types';
import { PrismaService } from '../database/prisma.service';
import { CreateWorkspaceDto, InviteMemberDto } from './dto/workspace.dto';
import * as crypto from 'crypto';

@Injectable()
export class WorkspacesService {
  private readonly logger = new Logger(WorkspacesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * List all workspaces the authenticated user belongs to (Strict Multi-Tenant Isolation)
   */
  async listWorkspaces(userId: string): Promise<WorkspaceDto[]> {
    if (!userId) {
      throw new ForbiddenException('User identification required to list workspaces');
    }

    const workspaces = await this.prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        projects: true,
        members: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return workspaces.map((w) => {
      const isOwner = w.ownerId === userId;
      const memberRecord = w.members.find((m) => m.userId === userId);
      const userRole = isOwner ? 'OWNER' : (memberRecord?.role as any) || 'DEVELOPER';

      return {
        id: w.id,
        name: w.name,
        slug: w.slug,
        isPersonal: w.isPersonal,
        ownerId: w.ownerId,
        role: userRole,
        projectCount: w.projects?.length || 0,
        memberCount: w.members?.length || 1,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
      };
    });
  }

  /**
   * Get workspace details and member roster (Enforcing Member Access Check)
   */
  async getWorkspaceById(id: string, userId: string): Promise<WorkspaceDto> {
    const ws = await this.prisma.workspace.findUnique({
      where: { id },
      include: {
        projects: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!ws) {
      throw new NotFoundException(`Workspace ${id} not found`);
    }

    // Tenant Isolation Check
    const isOwner = ws.ownerId === userId;
    const memberRecord = ws.members.find((m) => m.userId === userId);

    if (!isOwner && !memberRecord) {
      throw new ForbiddenException('Access denied: You do not have permission to view this workspace');
    }

    const effectiveRole = isOwner ? 'OWNER' : (memberRecord?.role as any) || 'VIEWER';

    const members: WorkspaceMemberDto[] = ws.members.map((m) => ({
      id: m.id,
      workspaceId: m.workspaceId,
      userId: m.userId,
      role: m.role as any,
      user: {
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatarUrl: m.user.avatarUrl || undefined,
        role: m.user.role as any,
      },
      createdAt: m.createdAt,
    }));

    return {
      id: ws.id,
      name: ws.name,
      slug: ws.slug,
      isPersonal: ws.isPersonal,
      ownerId: ws.ownerId,
      role: effectiveRole,
      projectCount: ws.projects?.length || 0,
      memberCount: ws.members?.length || 1,
      members,
      createdAt: ws.createdAt,
      updatedAt: ws.updatedAt,
    };
  }

  /**
   * Create workspace in PostgreSQL with owner membership
   */
  async createWorkspace(dto: CreateWorkspaceDto, ownerId: string): Promise<WorkspaceDto> {
    if (!ownerId) {
      throw new ForbiddenException('Authentication required to create a workspace');
    }

    const baseSlug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const newWs = await this.prisma.workspace.create({
      data: {
        name: dto.name,
        slug,
        isPersonal: Boolean(dto.isPersonal),
        ownerId,
        members: {
          create: {
            userId: ownerId,
            role: 'OWNER',
          },
        },
      },
      include: {
        projects: true,
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    this.logger.log(`✓ Workspace created: ${newWs.name} (${newWs.id}) for owner ${ownerId}`);

    return {
      id: newWs.id,
      name: newWs.name,
      slug: newWs.slug,
      isPersonal: newWs.isPersonal,
      ownerId: newWs.ownerId,
      role: 'OWNER',
      projectCount: 0,
      memberCount: 1,
      createdAt: newWs.createdAt,
      updatedAt: newWs.updatedAt,
    };
  }

  /**
   * List workspace members with tenant validation
   */
  async listMembers(workspaceId: string, userId: string): Promise<WorkspaceMemberDto[]> {
    // Validate that caller has access to this workspace
    await this.validateWorkspaceAccess(workspaceId, userId);

    const members = await this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return members.map((m) => ({
      id: m.id,
      workspaceId: m.workspaceId,
      userId: m.userId,
      role: m.role as any,
      user: {
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatarUrl: m.user.avatarUrl || undefined,
        role: m.user.role as any,
      },
      createdAt: m.createdAt,
    }));
  }

  /**
   * Invite team member (Requires Owner or Admin in the target workspace)
   */
  async inviteMember(
    workspaceId: string,
    dto: InviteMemberDto,
    requestingUserId: string
  ): Promise<any> {
    const callerRole = await this.validateWorkspaceAccess(workspaceId, requestingUserId);

    if (callerRole !== 'OWNER' && callerRole !== 'ADMIN') {
      throw new ForbiddenException('Only workspace Owners and Admins can invite new members');
    }

    const email = dto.email.toLowerCase().trim();
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600000); // 7 days

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          role: dto.role as any,
          isEmailVerified: false,
          isActive: true,
        },
      });
    }

    // Check if user is already a member
    const existingMember = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this workspace');
    }

    const [invitation, member] = await this.prisma.$transaction([
      this.prisma.workspaceInvitation.create({
        data: {
          workspaceId,
          email,
          role: dto.role as any,
          token,
          expiresAt,
        },
      }),
      this.prisma.workspaceMember.create({
        data: {
          workspaceId,
          userId: user.id,
          role: dto.role as any,
        },
        include: {
          user: true,
        },
      }),
    ]);

    this.logger.log(`✓ Invited ${dto.email} as [${dto.role}] to workspace ${workspaceId}`);

    return {
      message: `Invitation successfully created for ${dto.email}`,
      token: invitation.token,
      member: {
        id: member.id,
        workspaceId: member.workspaceId,
        userId: member.userId,
        role: member.role,
        user: {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
        },
        createdAt: member.createdAt,
      },
    };
  }

  /**
   * Remove member from workspace (Requires Owner/Admin, cannot remove owner)
   */
  async removeMember(
    workspaceId: string,
    targetUserId: string,
    requestingUserId: string
  ): Promise<boolean> {
    const callerRole = await this.validateWorkspaceAccess(workspaceId, requestingUserId);

    if (callerRole !== 'OWNER' && callerRole !== 'ADMIN') {
      throw new ForbiddenException('Only workspace Owners and Admins can remove members');
    }

    const ws = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (ws && ws.ownerId === targetUserId) {
      throw new BadRequestException('Cannot remove the owner of the workspace');
    }

    await this.prisma.workspaceMember.deleteMany({
      where: {
        workspaceId,
        userId: targetUserId,
      },
    });

    this.logger.log(`✓ Removed user ${targetUserId} from workspace ${workspaceId}`);
    return true;
  }

  /**
   * Delete workspace with cascading deletion of all contained projects and relations
   */
  async deleteWorkspace(workspaceId: string, userId: string): Promise<{ success: boolean; message: string }> {
    const callerRole = await this.validateWorkspaceAccess(workspaceId, userId);

    if (callerRole !== 'OWNER' && callerRole !== 'ADMIN') {
      throw new ForbiddenException('Only workspace Owners and Admins can delete this workspace');
    }

    const ws = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        projects: true,
      },
    });

    if (!ws) {
      throw new NotFoundException(`Workspace ${workspaceId} not found`);
    }

    const projectCount = ws.projects.length;

    // Transactionally delete all projects, members, invitations, and workspace
    await this.prisma.$transaction(async (tx) => {
      // 1. Delete project members for all projects in this workspace
      const projectIds = ws.projects.map((p) => p.id);
      if (projectIds.length > 0) {
        await tx.projectMember.deleteMany({
          where: { projectId: { in: projectIds } },
        });
        // 2. Delete all projects
        await tx.project.deleteMany({
          where: { workspaceId },
        });
      }

      // 3. Delete workspace invitations
      await tx.workspaceInvitation.deleteMany({
        where: { workspaceId },
      });

      // 4. Delete workspace members
      await tx.workspaceMember.deleteMany({
        where: { workspaceId },
      });

      // 5. Delete the workspace
      await tx.workspace.delete({
        where: { id: workspaceId },
      });

      // 6. Record audit log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'WORKSPACE_DELETED',
          entity: 'WORKSPACE',
          entityId: workspaceId,
          metadata: {
            workspaceName: ws.name,
            deletedProjectsCount: projectCount,
          },
        },
      });
    });

    this.logger.log(
      `✓ Workspace "${ws.name}" (${workspaceId}) and ${projectCount} project(s) permanently deleted by user ${userId}`
    );

    return {
      success: true,
      message: `Workspace "${ws.name}" and ${projectCount} associated project(s) were permanently deleted.`,
    };
  }

  /**
   * Helper to validate user has access to workspace and return their effective role
   */
  private async validateWorkspaceAccess(workspaceId: string, userId: string): Promise<string> {
    const ws = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });

    if (!ws) {
      throw new NotFoundException(`Workspace ${workspaceId} not found`);
    }

    if (ws.ownerId === userId) {
      return 'OWNER';
    }

    const member = ws.members.find((m) => m.userId === userId);
    if (!member) {
      throw new ForbiddenException('Access denied: You are not a member of this workspace');
    }

    return member.role;
  }
}
