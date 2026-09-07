import { HttpClient } from '../http-client';
import { API_ENDPOINTS } from '../endpoints';
import {
  ProjectDto,
  GeneratePlanDto,
  ApprovePlanDto,
  AIProjectPlan,
  ProjectBackendSchema,
} from '@nirmaanify/types';

export class ProjectsService {
  constructor(private readonly http: HttpClient) {}

  /**
   * List projects in workspace or all active projects
   */
  async listProjects(workspaceId?: string): Promise<ProjectDto[]> {
    return this.http.get<ProjectDto[]>(API_ENDPOINTS.PROJECTS.LIST(workspaceId));
  }

  /**
   * Get project details by ID
   */
  async getProject(id: string): Promise<ProjectDto> {
    return this.http.get<ProjectDto>(API_ENDPOINTS.PROJECTS.GET(id));
  }

  /**
   * Create a new project
   */
  async createProject(dto: Partial<ProjectDto>): Promise<ProjectDto> {
    return this.http.post<ProjectDto>(API_ENDPOINTS.PROJECTS.CREATE, dto);
  }

  /**
   * Update an existing project
   */
  async updateProject(id: string, dto: Partial<ProjectDto>): Promise<ProjectDto> {
    return this.http.put<ProjectDto>(API_ENDPOINTS.PROJECTS.UPDATE(id), dto);
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<{ success: boolean; id: string }> {
    return this.http.delete<{ success: boolean; id: string }>(API_ENDPOINTS.PROJECTS.DELETE(id));
  }

  /**
   * Duplicate an existing project
   */
  async duplicateProject(id: string): Promise<ProjectDto> {
    return this.http.post<ProjectDto>(API_ENDPOINTS.PROJECTS.DUPLICATE(id), {});
  }

  /**
   * Archive project
   */
  async archiveProject(id: string): Promise<ProjectDto> {
    return this.http.patch<ProjectDto>(API_ENDPOINTS.PROJECTS.ARCHIVE(id), {});
  }

  /**
   * Unarchive project
   */
  async unarchiveProject(id: string): Promise<ProjectDto> {
    return this.http.patch<ProjectDto>(API_ENDPOINTS.PROJECTS.UNARCHIVE(id), {});
  }

  /**
   * Generate AI Project Plan
   */
  async generateAiPlan(dto: GeneratePlanDto): Promise<AIProjectPlan> {
    return this.http.post<AIProjectPlan>(API_ENDPOINTS.PROJECTS.GENERATE_PLAN, dto);
  }

  /**
   * Modify AI Project Plan
   */
  async modifyAiPlan(planId: string, updates: Partial<AIProjectPlan>): Promise<AIProjectPlan> {
    return this.http.patch<AIProjectPlan>(API_ENDPOINTS.PROJECTS.MODIFY_PLAN(planId), updates);
  }

  /**
   * Approve AI Project Plan
   */
  async approveAiPlan(dto: ApprovePlanDto): Promise<ProjectDto> {
    return this.http.post<ProjectDto>(API_ENDPOINTS.PROJECTS.APPROVE_PLAN, dto);
  }

  /**
   * Get project backend configuration and modules
   */
  async getBackendSchema(projectId: string): Promise<ProjectBackendSchema> {
    return this.http.get<ProjectBackendSchema>(API_ENDPOINTS.PROJECTS.GET_BACKEND_SCHEMA(projectId));
  }

  /**
   * Update backend configuration and synchronize API data sources
   */
  async updateBackendSchema(
    projectId: string,
    schema: ProjectBackendSchema
  ): Promise<{ project: ProjectDto; schema: ProjectBackendSchema }> {
    return this.http.put<{ project: ProjectDto; schema: ProjectBackendSchema }>(
      API_ENDPOINTS.PROJECTS.UPDATE_BACKEND_SCHEMA(projectId),
      schema
    );
  }

  /**
   * Toggle backend enabled state
   */
  async toggleBackend(
    projectId: string,
    enabled: boolean
  ): Promise<{ project: ProjectDto; schema: ProjectBackendSchema }> {
    return this.http.post<{ project: ProjectDto; schema: ProjectBackendSchema }>(
      API_ENDPOINTS.PROJECTS.TOGGLE_BACKEND(projectId),
      { enabled }
    );
  }
}
