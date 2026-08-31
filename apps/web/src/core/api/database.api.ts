import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import { DatabaseApiSchema, DataModel } from '@nirmaanify/types';

export const databaseApi = {
  async getSchema(projectId: string): Promise<DatabaseApiSchema> {
    return apiClient.get<DatabaseApiSchema>(ENDPOINTS.DATABASE.SCHEMA(projectId));
  },

  async updateSchema(projectId: string, schema: DatabaseApiSchema): Promise<DatabaseApiSchema> {
    return apiClient.put<DatabaseApiSchema>(ENDPOINTS.DATABASE.UPDATE_SCHEMA(projectId), schema);
  },

  async createModel(projectId: string, model: DataModel): Promise<DatabaseApiSchema> {
    return apiClient.post<DatabaseApiSchema>(ENDPOINTS.DATABASE.MODELS(projectId), model);
  },

  async updateModel(projectId: string, modelId: string, model: DataModel): Promise<DatabaseApiSchema> {
    return apiClient.put<DatabaseApiSchema>(ENDPOINTS.DATABASE.MODEL_DETAIL(projectId, modelId), model);
  },

  async deleteModel(projectId: string, modelId: string): Promise<DatabaseApiSchema> {
    return apiClient.delete<DatabaseApiSchema>(ENDPOINTS.DATABASE.MODEL_DETAIL(projectId, modelId));
  },

  async getErDiagram(projectId: string): Promise<{ mermaid: string }> {
    return apiClient.get<{ mermaid: string }>(ENDPOINTS.DATABASE.ER_DIAGRAM(projectId));
  },

  async getCompiledPrisma(projectId: string): Promise<{ prismaSchema: string }> {
    return apiClient.get<{ prismaSchema: string }>(ENDPOINTS.DATABASE.COMPILED_PRISMA(projectId));
  },

  async executeQuery(
    projectId: string,
    payload: { modelName: string; method: string; path: string; query?: any; body?: any }
  ): Promise<{ status: number; data: any; durationMs: number }> {
    return apiClient.post<{ status: number; data: any; durationMs: number }>(
      ENDPOINTS.DATABASE.EXECUTE_QUERY(projectId),
      payload
    );
  },
};
