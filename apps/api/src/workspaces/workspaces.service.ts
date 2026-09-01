import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { WorkspaceDto, WorkspaceMemberDto } from '@nirmaanify/types';
import { PrismaService } from '../database/prisma.service';
import { CreateWorkspaceDto, InviteMemberDto } from './dto/workspace.dto';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class WorkspacesService {
  private readonly logger = new Logger(WorkspacesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService
  ) {}

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

    const pendingInvites = await this.prisma.workspaceInvitation.findMany({
      where: { workspaceId: id, status: 'PENDING' },
    });
    const pendingEmails = new Set(pendingInvites.map((inv) => inv.email.toLowerCase()));

    const members: WorkspaceMemberDto[] = ws.members.map((m) => {
      const isPending = pendingEmails.has(m.user.email.toLowerCase());
      return {
        id: m.id,
        workspaceId: m.workspaceId,
        userId: m.userId,
        role: m.role as any,
        status: isPending ? 'PENDING' : 'ACTIVE',
        user: {
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
          avatarUrl: m.user.avatarUrl || undefined,
          role: m.user.role as any,
        },
        createdAt: m.createdAt,
      };
    });

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

    const name = dto.name.trim();
    const slug = (dto.slug || name).toLowerCase().replace(/[^a-z0-9]/g, '-');

    const newWs = await this.prisma.workspace.create({
      data: {
        name,
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

    const [members, invitations] = await Promise.all([
      this.prisma.workspaceMember.findMany({
        where: { workspaceId },
        include: {
          user: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.workspaceInvitation.findMany({
        where: { workspaceId, status: 'PENDING' },
      }),
    ]);

    const pendingEmails = new Set(invitations.map((inv) => inv.email.toLowerCase()));

    return members.map((m) => {
      const isPending = pendingEmails.has(m.user.email.toLowerCase());
      return {
        id: m.id,
        workspaceId: m.workspaceId,
        userId: m.userId,
        role: m.role as any,
        status: isPending ? 'PENDING' : 'ACTIVE',
        user: {
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
          avatarUrl: m.user.avatarUrl || undefined,
          role: m.user.role as any,
        },
        createdAt: m.createdAt,
      };
    });
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

    // Fetch workspace details
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace) {
      throw new NotFoundException(`Workspace ${workspaceId} not found`);
    }

    // Fetch inviter details
    const inviter = await this.prisma.user.findUnique({
      where: { id: requestingUserId },
    });

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
      include: {
        user: true,
      },
    });

    const pendingInvite = await this.prisma.workspaceInvitation.findFirst({
      where: { workspaceId, email, status: 'PENDING' },
    });

    if (existingMember && !pendingInvite) {
      throw new ConflictException(`"${email}" is already an active member of this workspace`);
    }

    let memberRecord = existingMember;

    if (pendingInvite) {
      // Refresh pending invitation with new token and updated role
      await this.prisma.workspaceInvitation.update({
        where: { id: pendingInvite.id },
        data: {
          token,
          expiresAt,
          role: dto.role as any,
        },
      });

      if (existingMember) {
        await this.prisma.workspaceMember.update({
          where: { id: existingMember.id },
          data: { role: dto.role as any },
        });
      }
    } else {
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
      memberRecord = member;
    }

    // Send real Gmail / Nodemailer Invitation
    const emailResult = await this.mailService.sendWorkspaceInvitation({
      to: email,
      inviterName: inviter?.name || 'A team member',
      inviterEmail: inviter?.email || '',
      workspaceName: workspace.name,
      role: dto.role,
      token,
      expiresAt,
    });

    this.logger.log(
      `✓ Invited ${dto.email} as [${dto.role}] to workspace "${workspace.name}" (Delivered: ${emailResult.delivered})`
    );

    return {
      message: emailResult.delivered
        ? `Invitation successfully sent to ${dto.email}`
        : emailResult.message,
      token,
      delivered: emailResult.delivered,
      inviteLink: emailResult.inviteLink,
      member: memberRecord
        ? {
            id: memberRecord.id,
            workspaceId: memberRecord.workspaceId,
            userId: memberRecord.userId,
            role: memberRecord.role,
            status: 'PENDING',
            user: {
              id: memberRecord.user.id,
              name: memberRecord.user.name,
              email: memberRecord.user.email,
            },
            createdAt: memberRecord.createdAt,
          }
        : null,
    };
  }

  /**
   * Get public invitation details by token
   */
  async getInvitation(token: string): Promise<{
    id: string;
    email: string;
    role: string;
    status: string;
    expiresAt: Date;
    workspace: {
      id: string;
      name: string;
      slug: string;
      isPersonal: boolean;
      ownerName: string;
      ownerEmail: string;
    };
  }> {
    const invite = await this.prisma.workspaceInvitation.findUnique({
      where: { token },
      include: {
        workspace: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!invite) {
      throw new NotFoundException('Invitation not found or has been removed');
    }

    const isExpired = new Date() > invite.expiresAt;
    let status = invite.status;
    if (status === 'PENDING' && isExpired) {
      status = 'EXPIRED';
    }

    return {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      status,
      expiresAt: invite.expiresAt,
      workspace: {
        id: invite.workspace.id,
        name: invite.workspace.name,
        slug: invite.workspace.slug,
        isPersonal: invite.workspace.isPersonal,
        ownerName: invite.workspace.owner.name,
        ownerEmail: invite.workspace.owner.email,
      },
    };
  }

  /**
   * Accept an invitation using the unique token (Strict identity validation)
   */
  async acceptInvitation(token: string, userId: string): Promise<{ success: boolean; message: string; workspaceId: string }> {
    const invite = await this.prisma.workspaceInvitation.findUnique({
      where: { token },
      include: {
        workspace: true,
      },
    });

    if (!invite) {
      throw new NotFoundException('Invitation not found');
    }

    if (invite.status === 'ACCEPTED') {
      return {
        success: true,
        message: 'You have already accepted this invitation.',
        workspaceId: invite.workspaceId,
      };
    }

    if (new Date() > invite.expiresAt) {
      throw new BadRequestException('This invitation has expired. Please ask for a new invite.');
    }

    // 1. Fetch accepting user to validate recipient identity
    const acceptingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!acceptingUser) {
      throw new UnauthorizedException('User account not found');
    }

    // 2. Strict Recipient Email Validation (Prevents unauthorized acceptance)
    const acceptingEmail = acceptingUser.email.toLowerCase().trim();
    const invitedEmail = invite.email.toLowerCase().trim();

    if (acceptingEmail !== invitedEmail) {
      throw new ForbiddenException(
        `This invitation was exclusively issued to "${invite.email}". You are currently signed in as "${acceptingUser.email}". Please switch to the invited account to accept this invitation.`
      );
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Mark user as email verified
      await tx.user.update({
        where: { id: userId },
        data: { isEmailVerified: true },
      });

      // 2. Check for existing membership for this userId
      const existingForUser = await tx.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: invite.workspaceId,
            userId,
          },
        },
      });

      // 3. Check for placeholder membership with invite email
      const placeholderUser = await tx.user.findUnique({
        where: { email: invite.email },
      });

      if (placeholderUser && placeholderUser.id !== userId) {
        await tx.workspaceMember.deleteMany({
          where: {
            workspaceId: invite.workspaceId,
            userId: placeholderUser.id,
          },
        });
      }

      if (!existingForUser) {
        await tx.workspaceMember.create({
          data: {
            workspaceId: invite.workspaceId,
            userId,
            role: invite.role,
          },
        });
      } else {
        await tx.workspaceMember.update({
          where: { id: existingForUser.id },
          data: { role: invite.role },
        });
      }

      // 4. Mark ALL invitations for this email & workspace as ACCEPTED
      await tx.workspaceInvitation.updateMany({
        where: {
          workspaceId: invite.workspaceId,
          email: {
            equals: invite.email,
            mode: 'insensitive',
          },
        },
        data: { status: 'ACCEPTED' },
      });
    });

    this.logger.log(`✓ User ${userId} accepted invitation to workspace "${invite.workspace.name}"`);

    return {
      success: true,
      message: `Successfully joined workspace "${invite.workspace.name}"!`,
      workspaceId: invite.workspaceId,
    };
  }

  /**
   * Remove/Kick member from workspace (Requires Owner/Admin, cannot remove owner)
   */
  async removeMember(
    workspaceId: string,
    targetUserId: string,
    requestingUserId: string
  ): Promise<{ success: boolean; message: string }> {
    const callerRole = await this.validateWorkspaceAccess(workspaceId, requestingUserId);

    if (callerRole !== 'OWNER' && callerRole !== 'ADMIN') {
      throw new ForbiddenException('Only workspace Owners and Admins can remove members');
    }

    const ws = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          include: { user: true },
        },
      },
    });

    if (!ws) {
      throw new NotFoundException(`Workspace ${workspaceId} not found`);
    }

    if (ws.ownerId === targetUserId) {
      throw new BadRequestException('Cannot kick or remove the Owner of the workspace');
    }

    const targetMember = ws.members.find((m) => m.userId === targetUserId);
    if (!targetMember) {
      throw new NotFoundException('Member not found in this workspace');
    }

    // Admins cannot remove other Admins or Owners (Only Owner can remove Admins)
    if (callerRole === 'ADMIN' && targetMember.role === 'ADMIN' && targetUserId !== requestingUserId) {
      throw new ForbiddenException('Admins cannot kick other Admins. Only the Workspace Owner can do so.');
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Delete project memberships for projects in this workspace
      const projects = await tx.project.findMany({
        where: { workspaceId },
        select: { id: true },
      });
      const projectIds = projects.map((p) => p.id);
      if (projectIds.length > 0) {
        await tx.projectMember.deleteMany({
          where: {
            projectId: { in: projectIds },
            userId: targetUserId,
          },
        });
      }

      // 2. Delete workspace membership
      await tx.workspaceMember.deleteMany({
        where: {
          workspaceId,
          userId: targetUserId,
        },
      });

      // 3. Remove pending invitations for that email
      if (targetMember.user?.email) {
        await tx.workspaceInvitation.deleteMany({
          where: {
            workspaceId,
            email: { equals: targetMember.user.email, mode: 'insensitive' },
          },
        });
      }
    });

    this.logger.log(
      `✓ Kicked/Removed user ${targetUserId} from workspace "${ws.name}" by ${requestingUserId}`
    );

    return {
      success: true,
      message: `Successfully removed ${targetMember.user?.name || targetMember.user?.email} from the workspace.`,
    };
  }

  /**
   * Leave workspace (Member voluntary departure, Owner cannot leave)
   */
  async leaveWorkspace(
    workspaceId: string,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    const ws = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          include: { user: true },
        },
      },
    });

    if (!ws) {
      throw new NotFoundException(`Workspace ${workspaceId} not found`);
    }

    if (ws.ownerId === userId) {
      throw new BadRequestException(
        'Workspace owners cannot leave their own workspace. Please transfer ownership or delete the workspace.'
      );
    }

    const membership = ws.members.find((m) => m.userId === userId);
    if (!membership) {
      throw new BadRequestException('You are not a member of this workspace');
    }

    await this.prisma.$transaction(async (tx) => {
      // 1. Delete project memberships for this user in this workspace
      const projects = await tx.project.findMany({
        where: { workspaceId },
        select: { id: true },
      });
      const projectIds = projects.map((p) => p.id);
      if (projectIds.length > 0) {
        await tx.projectMember.deleteMany({
          where: {
            projectId: { in: projectIds },
            userId,
          },
        });
      }

      // 2. Delete workspace membership
      await tx.workspaceMember.deleteMany({
        where: {
          workspaceId,
          userId,
        },
      });

      // 3. Mark any invitations as EXPIRED
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (user?.email) {
        await tx.workspaceInvitation.updateMany({
          where: {
            workspaceId,
            email: { equals: user.email, mode: 'insensitive' },
          },
          data: { status: 'EXPIRED' },
        });
      }
    });

    this.logger.log(`✓ User ${userId} voluntarily left workspace "${ws.name}" (${workspaceId})`);

    return {
      success: true,
      message: `You have successfully left the workspace "${ws.name}".`,
    };
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
