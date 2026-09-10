import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  ProjectDto,
  ProjectType,
  AIProjectPlan,
  GeneratePlanDto,
  ApprovePlanDto,
} from '@nirmaanify/types';
import { PrismaService } from '../database/prisma.service';
import { AiPlannerService } from './ai-planner.service';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiPlannerService: AiPlannerService,
  ) {}

  /**
   * List projects scoped strictly to user's authorized workspaces (Tenant Isolation)
   */
  async listProjects(
    workspaceId?: string,
    userId?: string,
    isArchived?: boolean,
    search?: string,
    type?: ProjectType,
  ): Promise<ProjectDto[]> {
    if (!userId) {
      throw new ForbiddenException('User authentication required to list projects');
    }

    let targetWorkspaceIds: string[] = [];

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

      targetWorkspaceIds = [workspaceId];
    } else {
      // If workspaceId is not specified, fetch projects from all user's accessible workspaces
      const accessibleWorkspaces = await this.prisma.workspace.findMany({
        where: {
          OR: [{ ownerId: userId }, { members: { some: { userId } } }],
        },
        select: { id: true },
      });

      targetWorkspaceIds = accessibleWorkspaces.map((w) => w.id);
    }

    const whereClause: any = {
      workspaceId: { in: targetWorkspaceIds },
    };

    if (isArchived !== undefined) {
      whereClause.isArchived = isArchived;
    }

    if (type) {
      whereClause.type = type;
    }

    if (search && search.trim()) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const projects = await this.prisma.project.findMany({
      where: whereClause,
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
      isArchived: p.isArchived,
      status: p.status,
      aiPlan: p.aiPlan as any,
      storageDriver: (p.storageDriver as any) || 'local',
      storageConfig: ((p as any).storageConfig as any) || undefined,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  /**
   * Get project details by ID with tenant isolation verification
   */
  async getProject(id: string, userId?: string): Promise<ProjectDto> {
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

    if (!p) {
      throw new NotFoundException(`Project ${id} not found`);
    }

    if (userId) {
      const hasAccess =
        p.workspace.ownerId === userId ||
        p.workspace.members.some((m) => m.userId === userId);

      if (!hasAccess) {
        throw new ForbiddenException('Access denied: You do not have permission to view this project');
      }
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
      isArchived: p.isArchived,
      status: p.status,
      aiPlan: p.aiPlan as any,
      storageDriver: (p.storageDriver as any) || 'local',
      storageConfig: ((p as any).storageConfig as any) || undefined,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  async getProjectById(id: string, userId?: string): Promise<ProjectDto> {
    return this.getProject(id, userId);
  }

  /**
   * Create new project (Verifying workspace write permissions)
   */
  async createProject(data: Partial<ProjectDto>, userId?: string): Promise<ProjectDto> {
    let workspaceId = data.workspaceId;

    if (!workspaceId && userId) {
      const userWs = await this.prisma.workspace.findFirst({
        where: {
          OR: [{ ownerId: userId }, { members: { some: { userId } } }],
        },
        orderBy: { createdAt: 'asc' },
      });
      if (userWs) {
        workspaceId = userWs.id;
      }
    }

    if (!workspaceId) {
      throw new BadRequestException('Workspace ID is required to create a project');
    }

    // Verify user can create projects in target workspace
    if (userId) {
      const ws = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: { members: true },
      });

      if (!ws) {
        throw new NotFoundException(`Workspace ${workspaceId} not found`);
      }

      const isOwner = ws.ownerId === userId;
      const member = ws.members.find((m) => m.userId === userId);

      if (!isOwner && (!member || member.role === 'VIEWER')) {
        throw new ForbiddenException('You do not have permission to create projects in this workspace');
      }
    }

    const baseSlug = data.slug || (data.name || 'untitled').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const createData: any = {
      name: data.name || 'Untitled Project',
      slug,
      description: data.description || '',
      type: (data.type as any) || 'WEBSITE',
      workspaceId,
      framework: data.framework || 'Next.js 15 App Router',
      uiLibrary: data.uiLibrary || 'shadcn/ui',
      isBackendEnabled: Boolean(data.isBackendEnabled),
      isArchived: Boolean(data.isArchived),
      status: data.status || 'ACTIVE',
      aiPlan: (data.aiPlan as any) || undefined,
      storageDriver: data.storageDriver || 'local',
      storageConfig: (data.storageConfig as any) || undefined,
    };

    const p: any = await (this.prisma.project as any).create({
      data: createData,
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
      isArchived: p.isArchived,
      status: p.status,
      aiPlan: p.aiPlan as any,
      storageDriver: (p.storageDriver as any) || 'local',
      storageConfig: ((p as any).storageConfig as any) || undefined,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  /**
   * Update existing project
   */
  async updateProject(id: string, data: Partial<ProjectDto>, userId?: string): Promise<ProjectDto> {
    await this.getProject(id, userId);

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.framework !== undefined) updateData.framework = data.framework;
    if (data.uiLibrary !== undefined) updateData.uiLibrary = data.uiLibrary;
    if (data.isBackendEnabled !== undefined) updateData.isBackendEnabled = data.isBackendEnabled;
    if (data.isArchived !== undefined) updateData.isArchived = data.isArchived;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.aiPlan !== undefined) updateData.aiPlan = data.aiPlan;
    if (data.storageDriver !== undefined) updateData.storageDriver = data.storageDriver;
    if (data.storageConfig !== undefined) updateData.storageConfig = data.storageConfig;

    const p: any = await (this.prisma.project as any).update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`✓ Project updated: ${p.name} (${p.id})`);

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
      isArchived: p.isArchived,
      status: p.status,
      aiPlan: p.aiPlan as any,
      storageDriver: (p.storageDriver as any) || 'local',
      storageConfig: ((p as any).storageConfig as any) || undefined,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  /**
   * Delete project
   */
  async deleteProject(id: string, userId?: string): Promise<{ success: boolean; id: string }> {
    await this.getProject(id, userId);
    await this.prisma.project.delete({ where: { id } });
    this.logger.log(`✓ Project deleted: (${id})`);
    return { success: true, id };
  }

  /**
   * Duplicate project
   */
  async duplicateProject(id: string, userId?: string): Promise<ProjectDto> {
    const source = await this.getProject(id, userId);
    return this.createProject(
      {
        name: `${source.name} (Copy)`,
        description: source.description,
        type: source.type,
        workspaceId: source.workspaceId,
        framework: source.framework,
        uiLibrary: source.uiLibrary,
        isBackendEnabled: source.isBackendEnabled,
        isArchived: false,
        status: 'ACTIVE',
        aiPlan: source.aiPlan,
        storageDriver: source.storageDriver || 'local',
        storageConfig: source.storageConfig,
      },
      userId,
    );
  }

  /**
   * Archive project
   */
  async archiveProject(id: string, userId?: string): Promise<ProjectDto> {
    return this.updateProject(id, { isArchived: true, status: 'ARCHIVED' }, userId);
  }

  /**
   * Unarchive project
   */
  async unarchiveProject(id: string, userId?: string): Promise<ProjectDto> {
    return this.updateProject(id, { isArchived: false, status: 'ACTIVE' }, userId);
  }

  // --- AI Planner & Approval Flow ---

  async generateAiPlan(dto: GeneratePlanDto, userId?: string): Promise<AIProjectPlan> {
    return this.aiPlannerService.generatePlan(dto, userId);
  }

  async modifyAiPlan(planId: string, updates: Partial<AIProjectPlan>): Promise<AIProjectPlan> {
    return this.aiPlannerService.updatePlan(planId, updates);
  }

  async approveAiPlan(dto: ApprovePlanDto, userId?: string): Promise<ProjectDto> {
    const plan = dto.plan;
    if (!plan) {
      throw new BadRequestException('Valid AI Project Plan is required for approval');
    }

    const approvedPlan: AIProjectPlan = {
      ...plan,
      status: 'APPROVED',
      updatedAt: new Date().toISOString(),
    };

    const projectName = dto.customName || plan.name;
    const projectSlug = dto.customSlug || plan.slug;

    const project = await this.createProject(
      {
        name: projectName,
        slug: projectSlug,
        description: plan.description,
        type: plan.type,
        workspaceId: dto.workspaceId,
        framework: plan.framework,
        uiLibrary: plan.uiLibrary,
        isBackendEnabled: plan.backendRequirements.enabled,
        isArchived: false,
        status: 'ACTIVE',
        aiPlan: approvedPlan,
      },
      userId,
    );

    try {
      await this.prisma.aIProjectPlan.delete({ where: { id: plan.id } }).catch(() => undefined);
    } catch {
      // Best-effort cleanup; the plan stays valid even if delete fails
    }

    this.logger.log(`🚀 AI Project Plan Approved & Scaffolding Generated: "${project.name}" (${project.id})`);
    return project;
  }
}
