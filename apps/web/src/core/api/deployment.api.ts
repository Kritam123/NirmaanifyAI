import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import {
  FullstackExportBundle,
  BuildLogEntry,
  DeploymentRecord,
  DeploymentTarget,
} from '@nirmaanify/types';

export const deploymentApi = {
  async getExportBundle(projectId: string): Promise<FullstackExportBundle> {
    return apiClient.get<FullstackExportBundle>(ENDPOINTS.DEPLOYMENT.EXPORT_BUNDLE(projectId));
  },

  async validateBuild(projectId: string): Promise<{ logs: BuildLogEntry[]; status: 'SUCCESS' | 'FAILED' }> {
    return apiClient.post<{ logs: BuildLogEntry[]; status: 'SUCCESS' | 'FAILED' }>(
      ENDPOINTS.DEPLOYMENT.VALIDATE_BUILD(projectId)
    );
  },

  async triggerDeployment(
    projectId: string,
    target: DeploymentTarget,
    customDomain?: string
  ): Promise<DeploymentRecord> {
    return apiClient.post<DeploymentRecord>(ENDPOINTS.DEPLOYMENT.DEPLOY(projectId), {
      target,
      customDomain,
    });
  },

  async getDeploymentHistory(projectId: string): Promise<DeploymentRecord[]> {
    return apiClient.get<DeploymentRecord[]>(ENDPOINTS.DEPLOYMENT.HISTORY(projectId));
  },
};
