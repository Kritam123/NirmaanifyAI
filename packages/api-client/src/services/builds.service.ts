import { HttpClient } from '../http-client';
import { API_ENDPOINTS } from '../endpoints';
import { ProjectBuildDto, TriggerBuildDto } from '@nirmaanify/types';

export class BuildsService {
  constructor(private readonly http: HttpClient) {}

  async triggerBuild(projectId: string, dto: TriggerBuildDto = {}): Promise<ProjectBuildDto> {
    return this.http.post<ProjectBuildDto>(API_ENDPOINTS.BUILDS.TRIGGER(projectId), dto);
  }

  async listBuilds(projectId: string): Promise<ProjectBuildDto[]> {
    const res = await this.http.get<{ builds: ProjectBuildDto[] }>(API_ENDPOINTS.BUILDS.LIST(projectId));
    return res.builds || [];
  }

  async getBuild(projectId: string, buildId: string): Promise<ProjectBuildDto> {
    const res = await this.http.get<{ build: ProjectBuildDto }>(API_ENDPOINTS.BUILDS.DETAIL(projectId, buildId));
    return res.build;
  }
}
