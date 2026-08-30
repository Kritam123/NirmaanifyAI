import { Injectable, Logger } from '@nestjs/common';
import { ProjectDto } from '@nirmaanify/types';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

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
      projectSchema: { pages: ['/', '/products', '/cart', '/checkout'], modules: ['Products', 'Orders', 'Payments'] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'proj-saas-002',
      name: 'Nirmaan AI Video Studio',
      slug: 'ai-video-studio',
      description: 'Generative video SaaS platform with real-time preview and BullMQ background workers.',
      type: 'SAAS',
      workspaceId: 'ws-team-002',
      framework: 'Next.js 15 App Router',
      uiLibrary: 'shadcn/ui + Framer Motion',
      isBackendEnabled: true,
      projectSchema: { pages: ['/dashboard', '/studio', '/editor'], modules: ['VideoGen', 'Storage', 'Billing'] },
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
      projectSchema: { pages: ['/', '/blog', '/about'], cms: ['Posts', 'Authors', 'Categories'] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  async listProjects(workspaceId?: string): Promise<ProjectDto[]> {
    if (workspaceId) {
      return this.projects.filter((p) => p.workspaceId === workspaceId);
    }
    return this.projects;
  }

  async createProject(data: Partial<ProjectDto>): Promise<ProjectDto> {
    const newProject: ProjectDto = {
      id: `proj-${Date.now()}`,
      name: data.name || 'Untitled Project',
      slug: data.slug || (data.name || 'untitled').toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: data.description || 'Generated with Nirmaanify AI',
      type: data.type || 'WEBSITE',
      workspaceId: data.workspaceId || 'ws-personal-001',
      framework: data.framework || 'Next.js 15 App Router',
      uiLibrary: data.uiLibrary || 'shadcn/ui',
      isBackendEnabled: Boolean(data.isBackendEnabled),
      projectSchema: data.projectSchema || { pages: ['/'] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.projects.unshift(newProject);
    this.logger.log(`✓ Project created: ${newProject.name} (${newProject.id}) in workspace ${newProject.workspaceId}`);
    return newProject;
  }
}
