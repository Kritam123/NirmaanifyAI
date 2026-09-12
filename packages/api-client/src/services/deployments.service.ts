import { HttpClient } from '../http-client';
import { API_ENDPOINTS } from '../endpoints';
import { ProjectDeploymentDto, TriggerDeploymentDto } from '@nirmaanify/types';

export class DeploymentsService {
  constructor(private readonly http: HttpClient) {}

  async triggerDeployment(projectId: string, dto: TriggerDeploymentDto): Promise<ProjectDeploymentDto> {
    return this.http.post<ProjectDeploymentDto>(API_ENDPOINTS.DEPLOYMENTS.TRIGGER(projectId), dto);
  }

  async listDeployments(projectId: string): Promise<ProjectDeploymentDto[]> {
    const res = await this.http.get<{ deployments: ProjectDeploymentDto[] }>(API_ENDPOINTS.DEPLOYMENTS.LIST(projectId));
    return res.deployments || [];
  }

  async getDeployment(projectId: string, deployId: string): Promise<ProjectDeploymentDto> {
    const res = await this.http.get<{ deployment: ProjectDeploymentDto }>(API_ENDPOINTS.DEPLOYMENTS.DETAIL(projectId, deployId));
    return res.deployment;
  }
}
