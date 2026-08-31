import { HttpClient } from '../http-client';
import { API_ENDPOINTS } from '../endpoints';
import { ProjectDto } from '@nirmaanify/types';

export class ProjectsService {
  constructor(private readonly http: HttpClient) {}

  /**
   * List projects in workspace or all active projects
   */
  async listProjects(workspaceId?: string): Promise<ProjectDto[]> {
    return this.http.get<ProjectDto[]>(API_ENDPOINTS.PROJECTS.LIST(workspaceId));
  }

  /**
   * Create a new project
   */
  async createProject(dto: Partial<ProjectDto>): Promise<ProjectDto> {
    return this.http.post<ProjectDto>(API_ENDPOINTS.PROJECTS.CREATE, dto);
  }
}
