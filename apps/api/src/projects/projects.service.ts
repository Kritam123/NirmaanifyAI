import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ProjectDto } from '@nirmaanify/types';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * List projects scoped strictly to user's authorized workspaces (Tenant Isolation)
   */
  async listProjects(workspaceId?: string, userId?: string): Promise<ProjectDto[]> {
    if (!userId) {
      throw new ForbiddenException('User authentication required to list projects');
    }

    if (workspaceId) {
      // Validate access to targeted workspace
      const ws = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: { members: true },
      });

      if (!ws) {
        throw new NotFoundException(`Workspace ${workspaceId} not found`);
      }

      const hasAccess = ws.ownerId === userId || ws.members.some((m) => m.userId === userId);
      if (!hasAccess) {
        throw new ForbiddenException('Access denied: You do not belong to this workspace');
      }

      const projects = await this.prisma.project.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
      });

      return projects.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description || undefined,
        type: p.type as any,
        workspaceId: p.workspaceId,
        framework: p.framework,
        uiLibrary: p.uiLibrary,
        isBackendEnabled: p.isBackendEnabled,
        projectSchema: p.projectSchema as any,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
    }

    // If workspaceId is not specified, only fetch projects from user's accessible workspaces
    const accessibleWorkspaces = await this.prisma.workspace.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      select: { id: true },
    });

    const workspaceIds = accessibleWorkspaces.map((w) => w.id);

    const projects = await this.prisma.project.findMany({
      where: { workspaceId: { in: workspaceIds } },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description || undefined,
      type: p.type as any,
      workspaceId: p.workspaceId,
      framework: p.framework,
      uiLibrary: p.uiLibrary,
      isBackendEnabled: p.isBackendEnabled,
      projectSchema: p.projectSchema as any,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  /**
   * Get project details by ID with tenant isolation verification
   */
  async getProjectById(id: string, userId: string): Promise<ProjectDto> {
    const p = await this.prisma.project.findUnique({
      where: { id },
      include: {
        workspace: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!p) throw new NotFoundException(`Project ${id} not found`);

    const hasAccess =
      p.workspace.ownerId === userId ||
      p.workspace.members.some((m) => m.userId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('Access denied: You do not have permission to view this project');
    }

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description || undefined,
      type: p.type as any,
      workspaceId: p.workspaceId,
      framework: p.framework,
      uiLibrary: p.uiLibrary,
      isBackendEnabled: p.isBackendEnabled,
      projectSchema: p.projectSchema as any,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  /**
   * Create new project (Verifying workspace write permissions)
   */
  async createProject(data: Partial<ProjectDto>, userId: string): Promise<ProjectDto> {
    if (!data.workspaceId) {
      throw new BadRequestException('Workspace ID is required to create a project');
    }

    // Verify user can create projects in target workspace
    const ws = await this.prisma.workspace.findUnique({
      where: { id: data.workspaceId },
      include: { members: true },
    });

    if (!ws) {
      throw new NotFoundException(`Workspace ${data.workspaceId} not found`);
    }

    const isOwner = ws.ownerId === userId;
    const member = ws.members.find((m) => m.userId === userId);

    if (!isOwner && (!member || member.role === 'VIEWER')) {
      throw new ForbiddenException('You do not have permission to create projects in this workspace');
    }

    const baseSlug = data.slug || (data.name || 'untitled').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const p = await this.prisma.project.create({
      data: {
        name: data.name || 'Untitled Project',
        slug,
        description: data.description || '',
        type: (data.type as any) || 'WEBSITE',
        workspaceId: data.workspaceId,
        framework: data.framework || 'Next.js 15 App Router',
        uiLibrary: data.uiLibrary || 'shadcn/ui',
        isBackendEnabled: Boolean(data.isBackendEnabled),
        projectSchema: (data.projectSchema as any) || { pages: ['/'] },
      },
    });

    this.logger.log(`✓ Project created in DB: ${p.name} (${p.id}) in workspace ${p.workspaceId}`);

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description || undefined,
      type: p.type as any,
      workspaceId: p.workspaceId,
      framework: p.framework,
      uiLibrary: p.uiLibrary,
      isBackendEnabled: p.isBackendEnabled,
      projectSchema: p.projectSchema as any,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }
}
