import { HttpClient } from '../http-client';
import {
  DiagramDto,
  CreateDiagramDto,
  UpdateDiagramDto,
  DiagramRevisionDto,
  ArchitectureTemplateDto,
  AiScaffoldDiagramRequest,
  AiScaffoldDiagramResponse,
  AiArchitectureReviewResponse,
  CanvasNode,
  CanvasEdge,
} from '@nirmaanify/types';

export class DiagramsService {
  constructor(private readonly http: HttpClient) {}

  /**
   * List all diagrams for a project
   */
  async listProjectDiagrams(projectId: string): Promise<DiagramDto[]> {
    return this.http.get<DiagramDto[]>(`/api/v1/projects/${projectId}/diagrams`);
  }

  /**
   * Get diagram by ID
   */
  async getDiagram(id: string): Promise<DiagramDto> {
    return this.http.get<DiagramDto>(`/api/v1/diagrams/${id}`);
  }

  /**
   * Create a new diagram in project
   */
  async createDiagram(projectId: string, dto: CreateDiagramDto): Promise<DiagramDto> {
    return this.http.post<DiagramDto>(`/api/v1/projects/${projectId}/diagrams`, dto);
  }

  /**
   * Update diagram canvas state
   */
  async updateDiagram(id: string, dto: UpdateDiagramDto): Promise<DiagramDto> {
    return this.http.put<DiagramDto>(`/api/v1/diagrams/${id}`, dto);
  }

  /**
   * Delete diagram
   */
  async deleteDiagram(id: string): Promise<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`/api/v1/diagrams/${id}`);
  }

  /**
   * Create checkpoint revision
   */
  async createRevision(id: string): Promise<DiagramRevisionDto> {
    return this.http.post<DiagramRevisionDto>(`/api/v1/diagrams/${id}/revisions`);
  }

  /**
   * List revisions for diagram
   */
  async listRevisions(id: string): Promise<DiagramRevisionDto[]> {
    return this.http.get<DiagramRevisionDto[]>(`/api/v1/diagrams/${id}/revisions`);
  }

  /**
   * Restore diagram to past revision
   */
  async restoreRevision(id: string, revisionId: string): Promise<DiagramDto> {
    return this.http.post<DiagramDto>(`/api/v1/diagrams/${id}/revisions/${revisionId}/restore`);
  }

  /**
   * Get built-in architecture boilerplate templates
   */
  async getTemplates(): Promise<ArchitectureTemplateDto[]> {
    return this.http.get<ArchitectureTemplateDto[]>('/api/v1/diagrams/templates');
  }

  /**
   * AI System Architecture Scaffolder
   */
  async scaffoldWithAi(request: AiScaffoldDiagramRequest): Promise<AiScaffoldDiagramResponse> {
    return this.http.post<AiScaffoldDiagramResponse>('/api/v1/diagrams/ai/scaffold', request);
  }

  /**
   * AI Architecture Reviewer
   */
  async reviewWithAi(nodes: CanvasNode[], edges: CanvasEdge[]): Promise<AiArchitectureReviewResponse> {
    return this.http.post<AiArchitectureReviewResponse>('/api/v1/diagrams/ai/review', {
      nodes,
      edges,
    });
  }
}
