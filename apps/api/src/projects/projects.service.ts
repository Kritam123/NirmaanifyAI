import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  ProjectDto,
  ProjectType,
  AIProjectPlan,
  GeneratePlanDto,
  ApprovePlanDto,
} from '@nirmaanify/types';
import { AiPlannerService } from './ai-planner.service';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  // In-memory fallback initial projects
  private memoryProjects: ProjectDto[] = [
    {
      id: 'proj-ecom-001',
      name: 'Fashion Hub Store',
      slug: 'fashion-hub',
      description: 'Modern luxury clothing boutique with Next.js frontend, NestJS API, and PostgreSQL.',
      type: 'ECOMMERCE',
      workspaceId: 'ws-personal-001',
      framework: 'Next.js 15 App Router',
      uiLibrary: 'shadcn/ui + Tailwind CSS',
      isBackendEnabled: true,
      isArchived: false,
      status: 'ACTIVE',
      projectSchema: {
        pages: ['/', '/products', '/products/[slug]', '/cart', '/checkout', '/account/orders'],
        modules: ['Products', 'Orders', 'Payments'],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'proj-saas-002',
      name: 'Nirmaan AI Video Studio',
      slug: 'ai-video-studio',
      description: 'Generative video SaaS platform with real-time preview and BullMQ background workers.',
      type: 'SAAS',
      workspaceId: 'ws-personal-001',
      framework: 'Next.js 15 App Router',
      uiLibrary: 'shadcn/ui + Framer Motion',
      isBackendEnabled: true,
      isArchived: false,
      status: 'ACTIVE',
      projectSchema: {
        pages: ['/dashboard', '/studio', '/team', '/billing'],
        modules: ['Generation', 'Billing', 'Storage'],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'proj-blog-003',
      name: 'Engineering Tech Blog',
      slug: 'engineering-blog',
      description: 'High-performance developer documentation and engineering journal with dynamic CMS.',
      type: 'BLOG',
      workspaceId: 'ws-personal-001',
      framework: 'Next.js 15 Static',
      uiLibrary: 'Tailwind CSS Typography',
      isBackendEnabled: false,
      isArchived: false,
      status: 'ACTIVE',
      projectSchema: {
        pages: ['/', '/blog/[slug]', '/category/[slug]', '/authors/[slug]'],
        cms: ['Articles', 'Authors'],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  constructor(
    private readonly aiPlannerService: AiPlannerService,
    private readonly prisma: PrismaService
  ) {}

  async listProjects(
    workspaceId?: string,
    isArchived?: boolean,
    search?: string,
    type?: ProjectType
  ): Promise<ProjectDto[]> {
    try {
      // 1. Try Prisma Database Query
      const where: any = {};
      if (workspaceId) where.workspaceId = workspaceId;
      if (isArchived !== undefined) where.isArchived = isArchived;
      if (type) where.type = type;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const dbProjects = await this.prisma.project.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
      });

      if (dbProjects.length > 0) {
        return dbProjects.map((p) => this.mapDbProject(p));
      }
    } catch (err: any) {
      this.logger.warn(`Prisma listProjects fallback to memory: ${err.message}`);
    }

    // 2. Memory Fallback
    let result = [...this.memoryProjects];
    if (workspaceId) result = result.filter((p) => p.workspaceId === workspaceId);
    if (isArchived !== undefined) result = result.filter((p) => Boolean(p.isArchived) === isArchived);
    if (type) result = result.filter((p) => p.type === type);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }
    return result;
  }

  async getProject(id: string): Promise<ProjectDto> {
    try {
      const dbProject = await this.prisma.project.findUnique({ where: { id } });
      if (dbProject) return this.mapDbProject(dbProject);
    } catch {
      // Fallback
    }

    const project = this.memoryProjects.find((p) => p.id === id);
    if (!project) throw new NotFoundException(`Project with ID ${id} not found`);
    return project;
  }

  async createProject(data: Partial<ProjectDto>): Promise<ProjectDto> {
    const slug = (data.slug || data.name || 'untitled')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    try {
      const dbProject = await this.prisma.project.create({
        data: {
          name: data.name || 'Untitled Project',
          slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
          description: data.description || 'Generated with Nirmaanify AI',
          type: (data.type || 'WEBSITE') as any,
          workspaceId: data.workspaceId || 'ws-personal-001',
          framework: data.framework || 'Next.js 15 App Router',
          uiLibrary: data.uiLibrary || 'shadcn/ui + Tailwind CSS',
          isBackendEnabled: Boolean(data.isBackendEnabled),
          isArchived: false,
          status: 'ACTIVE',
          projectSchema: (data.projectSchema || { pages: ['/'] }) as any,
          aiPlan: data.aiPlan ? (data.aiPlan as any) : undefined,
        },
      });

      this.logger.log(`✓ [Prisma DB] Created project: "${dbProject.name}" (${dbProject.id})`);
      return this.mapDbProject(dbProject);
    } catch (err: any) {
      this.logger.warn(`Prisma createProject fallback to memory: ${err.message}`);
    }

    const fallback: ProjectDto = {
      id: data.id || `proj-${Date.now()}`,
      name: data.name || 'Untitled Project',
      slug: data.slug || `${slug}-${Math.floor(Math.random() * 1000)}`,
      description: data.description || 'Generated with Nirmaanify AI',
      type: data.type || 'WEBSITE',
      workspaceId: data.workspaceId || 'ws-personal-001',
      framework: data.framework || 'Next.js 15 App Router',
      uiLibrary: data.uiLibrary || 'shadcn/ui + Tailwind CSS',
      isBackendEnabled: Boolean(data.isBackendEnabled),
      isArchived: false,
      status: 'ACTIVE',
      projectSchema: data.projectSchema || { pages: ['/'] },
      aiPlan: data.aiPlan,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.memoryProjects.unshift(fallback);
    return fallback;
  }

  async updateProject(id: string, data: Partial<ProjectDto>): Promise<ProjectDto> {
    try {
      const dbProject = await this.prisma.project.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug ? data.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined,
          description: data.description,
          type: data.type as any,
          framework: data.framework,
          uiLibrary: data.uiLibrary,
          isBackendEnabled: data.isBackendEnabled,
          isArchived: data.isArchived,
          status: data.status,
          projectSchema: data.projectSchema as any,
          aiPlan: data.aiPlan as any,
        },
      });
      this.logger.log(`✓ [Prisma DB] Updated project: "${dbProject.name}" (${id})`);
      return this.mapDbProject(dbProject);
    } catch (err: any) {
      this.logger.warn(`Prisma updateProject fallback to memory: ${err.message}`);
    }

    const idx = this.memoryProjects.findIndex((p) => p.id === id);
    if (idx === -1) throw new NotFoundException(`Project with ID ${id} not found`);

    const updated: ProjectDto = {
      ...this.memoryProjects[idx],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.memoryProjects[idx] = updated;
    return updated;
  }

  async deleteProject(id: string): Promise<{ success: boolean; id: string }> {
    try {
      await this.prisma.project.delete({ where: { id } });
      this.logger.log(`✓ [Prisma DB] Deleted project: (${id})`);
      return { success: true, id };
    } catch {
      // Fallback
    }

    const idx = this.memoryProjects.findIndex((p) => p.id === id);
    if (idx !== -1) this.memoryProjects.splice(idx, 1);
    return { success: true, id };
  }

  async duplicateProject(id: string): Promise<ProjectDto> {
    const source = await this.getProject(id);
    const newName = `${source.name} (Copy)`;
    const newSlug = `${source.slug}-copy-${Math.floor(Math.random() * 1000)}`;

    return this.createProject({
      ...source,
      id: undefined,
      name: newName,
      slug: newSlug,
      createdAt: undefined,
      updatedAt: undefined,
    });
  }

  async archiveProject(id: string): Promise<ProjectDto> {
    return this.updateProject(id, { isArchived: true, status: 'ARCHIVED' });
  }

  async unarchiveProject(id: string): Promise<ProjectDto> {
    return this.updateProject(id, { isArchived: false, status: 'ACTIVE' });
  }

  // --- AI Planner & Approval Flow ---

  async generateAiPlan(dto: GeneratePlanDto): Promise<AIProjectPlan> {
    return this.aiPlannerService.generatePlan(dto);
  }

  async modifyAiPlan(planId: string, updates: Partial<AIProjectPlan>): Promise<AIProjectPlan> {
    return this.aiPlannerService.updatePlan(planId, updates);
  }

  async approveAiPlan(dto: ApprovePlanDto): Promise<ProjectDto> {
    const plan = dto.plan;
    if (!plan) throw new Error('Valid AI Project Plan is required for approval');

    const approvedPlan: AIProjectPlan = {
      ...plan,
      status: 'APPROVED',
      updatedAt: new Date().toISOString(),
    };

    const projectName = dto.customName || plan.name;
    const projectSlug = dto.customSlug || plan.slug;

    return this.createProject({
      name: projectName,
      slug: projectSlug,
      description: plan.description,
      type: plan.type,
      workspaceId: dto.workspaceId || 'ws-personal-001',
      framework: plan.framework,
      uiLibrary: plan.uiLibrary,
      isBackendEnabled: plan.backendRequirements.enabled,
      isArchived: false,
      status: 'ACTIVE',
      projectSchema: {
        pages: plan.pages.map((p) => p.path),
        features: plan.features.map((f) => f.title),
        modules: plan.backendRequirements.modules.map((m) => m.name),
        databaseModels: plan.databaseRequirements.models.map((m) => m.name),
        cmsCollections: plan.cmsRequirements.collections.map((c) => c.name),
        plugins: plan.pluginRecommendations.filter((p) => p.isRecommended).map((p) => p.name),
      },
      aiPlan: approvedPlan,
    });
  }

  private mapDbProject(p: any): ProjectDto {
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description || '',
      type: p.type,
      workspaceId: p.workspaceId,
      framework: p.framework,
      uiLibrary: p.uiLibrary,
      isBackendEnabled: Boolean(p.isBackendEnabled),
      isArchived: Boolean(p.isArchived),
      status: p.status,
      projectSchema: (p.projectSchema as any) || {},
      aiPlan: (p.aiPlan as any) || null,
      createdAt: p.createdAt.toISOString ? p.createdAt.toISOString() : p.createdAt,
      updatedAt: p.updatedAt.toISOString ? p.updatedAt.toISOString() : p.updatedAt,
    };
  }
}
