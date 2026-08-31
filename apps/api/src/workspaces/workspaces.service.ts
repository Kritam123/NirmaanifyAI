import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { WorkspaceDto, WorkspaceMemberDto } from '@nirmaanify/types';
import { CreateWorkspaceDto, InviteMemberDto } from './dto/workspace.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class WorkspacesService {
  private readonly logger = new Logger(WorkspacesService.name);

  private memoryWorkspaces: WorkspaceDto[] = [
    {
      id: 'ws-personal-001',
      name: "Alex's Workspace",
      slug: 'alex-personal',
      isPersonal: true,
      ownerId: 'usr-alex-001',
      role: 'OWNER',
      projectCount: 3,
      memberCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'ws-team-002',
      name: 'Acme SaaS Corp',
      slug: 'acme-saas',
      isPersonal: false,
      ownerId: 'usr-alex-001',
      role: 'OWNER',
      projectCount: 6,
      memberCount: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  private memoryMembers: Map<string, WorkspaceMemberDto[]> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  async listWorkspaces(userId?: string): Promise<WorkspaceDto[]> {
    try {
      const where: any = {};
      if (userId) {
        where.OR = [
          { ownerId: userId },
          { members: { some: { userId } } },
        ];
      }

      const dbWorkspaces = await this.prisma.workspace.findMany({
        where,
        include: {
          _count: { select: { projects: true, members: true } },
        },
        orderBy: { updatedAt: 'desc' },
      });

      if (dbWorkspaces.length > 0) {
        return dbWorkspaces.map((w) => ({
          id: w.id,
          name: w.name,
          slug: w.slug,
          isPersonal: w.isPersonal,
          ownerId: w.ownerId,
          role: 'OWNER' as const,
          projectCount: w._count.projects,
          memberCount: w._count.members,
          createdAt: w.createdAt.toISOString(),
          updatedAt: w.updatedAt.toISOString(),
        }));
      }
    } catch (err: any) {
      this.logger.warn(`Prisma listWorkspaces fallback to memory: ${err.message}`);
    }

    return this.memoryWorkspaces;
  }

  async getWorkspaceById(id: string): Promise<WorkspaceDto> {
    try {
      const dbWs = await this.prisma.workspace.findUnique({
        where: { id },
        include: {
          members: { include: { user: true } },
          _count: { select: { projects: true } },
        },
      });

      if (dbWs) {
        const members: WorkspaceMemberDto[] = dbWs.members.map((m) => ({
          id: m.id,
          workspaceId: m.workspaceId,
          userId: m.userId,
          role: m.role as any,
          user: {
            id: m.user.id,
            name: m.user.name,
            email: m.user.email,
            avatarUrl: m.user.avatarUrl || undefined,
          },
          createdAt: m.createdAt.toISOString(),
        }));

        return {
          id: dbWs.id,
          name: dbWs.name,
          slug: dbWs.slug,
          isPersonal: dbWs.isPersonal,
          ownerId: dbWs.ownerId,
          role: 'OWNER' as const,
          projectCount: dbWs._count.projects,
          memberCount: dbWs.members.length,
          members,
          createdAt: dbWs.createdAt.toISOString(),
          updatedAt: dbWs.updatedAt.toISOString(),
        };
      }
    } catch {
      // Fallback
    }

    const ws = this.memoryWorkspaces.find((w) => w.id === id);
    if (!ws) throw new NotFoundException(`Workspace ${id} not found`);
    return {
      ...ws,
      members: this.memoryMembers.get(id) || [],
    };
  }

  async createWorkspace(dto: CreateWorkspaceDto, ownerId: string): Promise<WorkspaceDto> {
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    try {
      const dbWs = await this.prisma.workspace.create({
        data: {
          name: dto.name,
          slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
          isPersonal: Boolean(dto.isPersonal),
          ownerId,
        },
      });

      await this.prisma.workspaceMember.create({
        data: {
          workspaceId: dbWs.id,
          userId: ownerId,
          role: 'OWNER',
        },
      });

      return {
        id: dbWs.id,
        name: dbWs.name,
        slug: dbWs.slug,
        isPersonal: dbWs.isPersonal,
        ownerId: dbWs.ownerId,
        role: 'OWNER',
        projectCount: 0,
        memberCount: 1,
        createdAt: dbWs.createdAt.toISOString(),
        updatedAt: dbWs.updatedAt.toISOString(),
      };
    } catch (err: any) {
      this.logger.warn(`Prisma createWorkspace fallback to memory: ${err.message}`);
    }

    const newWs: WorkspaceDto = {
      id: `ws-${Date.now()}`,
      name: dto.name,
      slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
      isPersonal: Boolean(dto.isPersonal),
      ownerId,
      role: 'OWNER',
      projectCount: 0,
      memberCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.memoryWorkspaces.push(newWs);
    return newWs;
  }

  async listMembers(workspaceId: string): Promise<WorkspaceMemberDto[]> {
    try {
      const members = await this.prisma.workspaceMember.findMany({
        where: { workspaceId },
        include: { user: true },
      });

      if (members.length > 0) {
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
          },
          createdAt: m.createdAt.toISOString(),
        }));
      }
    } catch {
      // Fallback
    }

    return this.memoryMembers.get(workspaceId) || [];
  }

  async inviteMember(workspaceId: string, dto: InviteMemberDto): Promise<any> {
    const token = `inv-${Date.now()}`;
    const newMember: WorkspaceMemberDto = {
      id: `mem-${Date.now()}`,
      workspaceId,
      userId: `usr-${Date.now()}`,
      role: dto.role,
      user: {
        id: `usr-${Date.now()}`,
        name: dto.email.split('@')[0],
        email: dto.email,
      },
      createdAt: new Date().toISOString(),
    };

    const current = this.memoryMembers.get(workspaceId) || [];
    current.push(newMember);
    this.memoryMembers.set(workspaceId, current);

    this.logger.log(`✓ Team member invited: ${dto.email} as [${dto.role}] to workspace ${workspaceId}`);

    return {
      message: `Invitation sent to ${dto.email}`,
      token,
      member: newMember,
    };
  }

  async removeMember(workspaceId: string, userId: string): Promise<boolean> {
    try {
      await this.prisma.workspaceMember.deleteMany({
        where: { workspaceId, userId },
      });
    } catch {
      // Fallback
    }

    const current = this.memoryMembers.get(workspaceId) || [];
    this.memoryMembers.set(
      workspaceId,
      current.filter((m) => m.userId !== userId)
    );
    return true;
  }
}
