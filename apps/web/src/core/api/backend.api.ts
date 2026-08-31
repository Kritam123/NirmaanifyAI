import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { ProjectBackendSchema, GeneratedFile } from '@nirmaanify/types';

export const backendApi = {
  async getConfig(projectId: string): Promise<ProjectBackendSchema> {
    return apiClient.get<ProjectBackendSchema>(ENDPOINTS.BACKEND.CONFIG(projectId));
  },

  async updateConfig(projectId: string, config: ProjectBackendSchema): Promise<ProjectBackendSchema> {
    return apiClient.put<ProjectBackendSchema>(ENDPOINTS.BACKEND.UPDATE_CONFIG(projectId), config);
  },

  async getGeneratedFiles(projectId: string): Promise<{ files: GeneratedFile[]; totalFiles: number }> {
    return apiClient.get<{ files: GeneratedFile[]; totalFiles: number }>(ENDPOINTS.BACKEND.CODEGEN(projectId));
  },

  async testEndpoint(
    projectId: string,
    payload: { method: string; path: string; body?: any; headers?: any }
  ): Promise<{ status: number; data: any; durationMs: number }> {
    return apiClient.post<{ status: number; data: any; durationMs: number }>(
      ENDPOINTS.BACKEND.TEST_ENDPOINT(projectId),
      payload
    );
  },
};
