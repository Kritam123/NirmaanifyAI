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

  // In-memory backing fallback when DB is connecting or in dev
  private projects: ProjectDto[] = [
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
    private readonly prisma: PrismaService,
  ) {}

  async listProjects(
    workspaceId?: string,
    isArchived?: boolean,
    search?: string,
    type?: ProjectType,
  ): Promise<ProjectDto[]> {
    let result = [...this.projects];

    if (workspaceId) {
      result = result.filter((p) => p.workspaceId === workspaceId);
    }

    if (isArchived !== undefined) {
      result = result.filter((p) => Boolean(p.isArchived) === isArchived);
    }

    if (type) {
      result = result.filter((p) => p.type === type);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)),
      );
    }

    return result;
  }

  async getProject(id: string): Promise<ProjectDto> {
    const project = this.projects.find((p) => p.id === id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async createProject(data: Partial<ProjectDto>): Promise<ProjectDto> {
    const newProject: ProjectDto = {
      id: data.id || `proj-${Date.now()}`,
      name: data.name || 'Untitled Project',
      slug: data.slug || (data.name || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
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

    this.projects.unshift(newProject);
    this.logger.log(`✓ Project created: "${newProject.name}" (${newProject.id})`);
    return newProject;
  }

  async updateProject(id: string, data: Partial<ProjectDto>): Promise<ProjectDto> {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const updated: ProjectDto = {
      ...this.projects[index],
      ...data,
      id, // Preserve ID
      updatedAt: new Date().toISOString(),
    };

    this.projects[index] = updated;
    this.logger.log(`✓ Project updated: "${updated.name}" (${id})`);
    return updated;
  }

  async deleteProject(id: string): Promise<{ success: boolean; id: string }> {
    const index = this.projects.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const deleted = this.projects.splice(index, 1)[0];
    this.logger.log(`✓ Project deleted: "${deleted.name}" (${id})`);
    return { success: true, id };
  }

  async duplicateProject(id: string): Promise<ProjectDto> {
    const source = await this.getProject(id);
    const duplicated: ProjectDto = {
      ...source,
      id: `proj-${Date.now()}`,
      name: `${source.name} (Copy)`,
      slug: `${source.slug}-copy-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.projects.unshift(duplicated);
    this.logger.log(`✓ Project duplicated: "${duplicated.name}" from ${id}`);
    return duplicated;
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
    if (!plan) {
      throw new Error('Valid AI Project Plan is required for approval');
    }

    const approvedPlan: AIProjectPlan = {
      ...plan,
      status: 'APPROVED',
      updatedAt: new Date().toISOString(),
    };

    const projectName = dto.customName || plan.name;
    const projectSlug = dto.customSlug || plan.slug;

    const project = await this.createProject({
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

    this.logger.log(`🚀 AI Project Plan Approved & Scaffolding Generated: "${project.name}" (${project.id})`);
    return project;
  }
}
