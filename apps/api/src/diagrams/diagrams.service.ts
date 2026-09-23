import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import {
  DiagramDto,
  CreateDiagramDto,
  UpdateDiagramDto,
  DiagramRevisionDto,
  ArchitectureTemplateDto,
} from '@nirmaanify/types';
import { PrismaService } from '../database/prisma.service';
import { ARCHITECTURE_TEMPLATES } from './architecture-templates';

@Injectable()
export class DiagramsService {
  private readonly logger = new Logger(DiagramsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verify workspace permissions for project access
   */
  private async verifyProjectAccess(projectId: string, userId?: string, requireWrite = false) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workspace: {
          include: { members: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    if (userId) {
      const isOwner = project.workspace.ownerId === userId;
      const membership = project.workspace.members.find((m) => m.userId === userId);

      if (!isOwner && !membership) {
        throw new ForbiddenException('Access denied: You are not a member of this workspace');
      }

      if (requireWrite && membership?.role === 'VIEWER') {
        throw new ForbiddenException('Read-only access: Viewers cannot modify diagrams');
      }
    }

    return project;
  }

  /**
   * List all diagrams for a project (creates default canvas if empty)
   */
  async listProjectDiagrams(projectId: string, userId?: string): Promise<DiagramDto[]> {
    await this.verifyProjectAccess(projectId, userId);

    let diagrams = await this.prisma.diagram.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });

    // Auto-initialize primary architecture diagram if empty
    if (diagrams.length === 0) {
      const initial = await this.createDefaultDiagram(projectId);
      diagrams = [initial];
    }

    return diagrams.map((d) => this.mapDiagram(d));
  }

  /**
   * Get diagram by ID
   */
  async getDiagram(id: string, userId?: string): Promise<DiagramDto> {
    const diagram = await this.prisma.diagram.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!diagram) {
      throw new NotFoundException(`Diagram ${id} not found`);
    }

    await this.verifyProjectAccess(diagram.projectId, userId);
    return this.mapDiagram(diagram);
  }

  /**
   * Create a new diagram in project
   */
  async createDiagram(
    projectId: string,
    dto: CreateDiagramDto,
    userId?: string,
  ): Promise<DiagramDto> {
    await this.verifyProjectAccess(projectId, userId, true);

    const diagram = await this.prisma.diagram.create({
      data: {
        projectId,
        name: dto.name || 'Untitled Architecture',
        description: dto.description || undefined,
        type: (dto.type as any) || 'SYSTEM_ARCHITECTURE',
        nodes: (dto.nodes as any) || [],
        edges: (dto.edges as any) || [],
        viewport: (dto.viewport as any) || { x: 0, y: 0, zoom: 1 },
        settings: (dto.settings as any) || { grid: true, snapToGrid: true, theme: 'dark' },
        document: dto.document || undefined,
      },
    });

    this.logger.log(`Created diagram "${diagram.name}" (${diagram.id}) in project ${projectId}`);
    return this.mapDiagram(diagram);
  }

  /**
   * Save / Update diagram state (Nodes, Edges, Viewport, Markdown Specs)
   */
  async updateDiagram(
    id: string,
    dto: UpdateDiagramDto,
    userId?: string,
  ): Promise<DiagramDto> {
    const existing = await this.prisma.diagram.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!existing) {
      throw new NotFoundException(`Diagram ${id} not found`);
    }

    await this.verifyProjectAccess(existing.projectId, userId, true);

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.nodes !== undefined) data.nodes = dto.nodes;
    if (dto.edges !== undefined) data.edges = dto.edges;
    if (dto.viewport !== undefined) data.viewport = dto.viewport;
    if (dto.settings !== undefined) data.settings = dto.settings;
    if (dto.document !== undefined) data.document = dto.document;
    if (dto.thumbnail !== undefined) data.thumbnail = dto.thumbnail;

    const updated = await this.prisma.diagram.update({
      where: { id },
      data,
    });

    return this.mapDiagram(updated);
  }

  /**
   * Delete a diagram
   */
  async deleteDiagram(id: string, userId?: string): Promise<{ success: boolean }> {
    const existing = await this.prisma.diagram.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Diagram ${id} not found`);
    }

    await this.verifyProjectAccess(existing.projectId, userId, true);

    await this.prisma.diagram.delete({
      where: { id },
    });

    return { success: true };
  }

  /**
   * Save snapshot checkpoint revision
   */
  async createRevision(id: string, userId?: string): Promise<DiagramRevisionDto> {
    const diagram = await this.prisma.diagram.findUnique({
      where: { id },
    });

    if (!diagram) {
      throw new NotFoundException(`Diagram ${id} not found`);
    }

    await this.verifyProjectAccess(diagram.projectId, userId, true);

    const nextVersion = diagram.version + 1;

    const [revision] = await this.prisma.$transaction([
      this.prisma.diagramRevision.create({
        data: {
          diagramId: id,
          version: nextVersion,
          nodes: diagram.nodes as any,
          edges: diagram.edges as any,
          document: diagram.document || undefined,
          createdById: userId || undefined,
        },
      }),
      this.prisma.diagram.update({
        where: { id },
        data: { version: nextVersion },
      }),
    ]);

    return {
      id: revision.id,
      diagramId: revision.diagramId,
      version: revision.version,
      nodes: revision.nodes as any,
      edges: revision.edges as any,
      document: revision.document || undefined,
      snapshotUrl: revision.snapshotUrl || undefined,
      createdById: revision.createdById || undefined,
      createdAt: revision.createdAt,
    };
  }

  /**
   * List revisions for diagram
   */
  async listRevisions(id: string, userId?: string): Promise<DiagramRevisionDto[]> {
    const diagram = await this.prisma.diagram.findUnique({
      where: { id },
    });

    if (!diagram) {
      throw new NotFoundException(`Diagram ${id} not found`);
    }

    await this.verifyProjectAccess(diagram.projectId, userId);

    const revs = await this.prisma.diagramRevision.findMany({
      where: { diagramId: id },
      orderBy: { version: 'desc' },
      take: 20,
    });

    return revs.map((r) => ({
      id: r.id,
      diagramId: r.diagramId,
      version: r.version,
      nodes: r.nodes as any,
      edges: r.edges as any,
      document: r.document || undefined,
      snapshotUrl: r.snapshotUrl || undefined,
      createdById: r.createdById || undefined,
      createdAt: r.createdAt,
    }));
  }

  /**
   * Restore diagram to a past revision
   */
  async restoreRevision(
    id: string,
    revisionId: string,
    userId?: string,
  ): Promise<DiagramDto> {
    const diagram = await this.prisma.diagram.findUnique({
      where: { id },
    });

    if (!diagram) {
      throw new NotFoundException(`Diagram ${id} not found`);
    }

    await this.verifyProjectAccess(diagram.projectId, userId, true);

    const rev = await this.prisma.diagramRevision.findUnique({
      where: { id: revisionId },
    });

    if (!rev || rev.diagramId !== id) {
      throw new NotFoundException(`Revision ${revisionId} not found for diagram ${id}`);
    }

    const updated = await this.prisma.diagram.update({
      where: { id },
      data: {
        nodes: rev.nodes as any,
        edges: rev.edges as any,
        document: rev.document || undefined,
      },
    });

    return this.mapDiagram(updated);
  }

  /**
   * Get built-in architecture boilerplate templates
   */
  getTemplates(): ArchitectureTemplateDto[] {
    return ARCHITECTURE_TEMPLATES;
  }

  /**
   * Create initial default diagram
   */
  private async createDefaultDiagram(projectId: string) {
    const defaultTemplate = ARCHITECTURE_TEMPLATES[0]; // E-Commerce Microservices
    return this.prisma.diagram.create({
      data: {
        projectId,
        name: 'System Architecture Overview',
        description: 'Main architecture design canvas',
        type: 'SYSTEM_ARCHITECTURE',
        nodes: defaultTemplate.nodes as any,
        edges: defaultTemplate.edges as any,
        viewport: { x: 50, y: 100, zoom: 0.85 },
        settings: { grid: true, snapToGrid: true, theme: 'dark' },
        document: defaultTemplate.document,
      },
    });
  }

  private mapDiagram(d: any): DiagramDto {
    return {
      id: d.id,
      projectId: d.projectId,
      name: d.name,
      description: d.description || undefined,
      type: d.type,
      nodes: (d.nodes as any) || [],
      edges: (d.edges as any) || [],
      viewport: (d.viewport as any) || { x: 0, y: 0, zoom: 1 },
      settings: (d.settings as any) || { grid: true, snapToGrid: true, theme: 'dark' },
      document: d.document || undefined,
      thumbnail: d.thumbnail || undefined,
      version: d.version,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  }
}
