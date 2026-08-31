import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';
import {
  ProjectDto,
  ProjectType,
  AIProjectPlan,
  GeneratePlanDto,
  ApprovePlanDto,
} from '@nirmaanify/types';

export interface ListProjectsParams {
  workspaceId?: string;
  isArchived?: boolean;
  search?: string;
  type?: ProjectType;
}

export const projectsApi = {
  async list(params?: ListProjectsParams): Promise<ProjectDto[]> {
    return apiClient.get<ProjectDto[]>(ENDPOINTS.PROJECTS.LIST, { params: params as any });
  },

  async get(id: string): Promise<ProjectDto> {
    return apiClient.get<ProjectDto>(ENDPOINTS.PROJECTS.GET(id));
  },

  async create(project: Partial<ProjectDto>): Promise<ProjectDto> {
    return apiClient.post<ProjectDto>(ENDPOINTS.PROJECTS.CREATE, project);
  },

  async update(id: string, updates: Partial<ProjectDto>): Promise<ProjectDto> {
    return apiClient.put<ProjectDto>(ENDPOINTS.PROJECTS.UPDATE(id), updates);
  },

  async delete(id: string): Promise<{ success: boolean; id: string }> {
    return apiClient.delete<{ success: boolean; id: string }>(ENDPOINTS.PROJECTS.DELETE(id));
  },

  async duplicate(id: string): Promise<ProjectDto> {
    return apiClient.post<ProjectDto>(ENDPOINTS.PROJECTS.DUPLICATE(id));
  },

  async archive(id: string): Promise<ProjectDto> {
    return apiClient.patch<ProjectDto>(ENDPOINTS.PROJECTS.ARCHIVE(id));
  },

  async unarchive(id: string): Promise<ProjectDto> {
    return apiClient.patch<ProjectDto>(ENDPOINTS.PROJECTS.UNARCHIVE(id));
  },

  async generateAiPlan(dto: GeneratePlanDto): Promise<AIProjectPlan> {
    return apiClient.post<AIProjectPlan>(ENDPOINTS.PROJECTS.AI_PLAN, dto);
  },

  async modifyAiPlan(planId: string, updates: Partial<AIProjectPlan>): Promise<AIProjectPlan> {
    return apiClient.patch<AIProjectPlan>(ENDPOINTS.PROJECTS.AI_PLAN_MODIFY(planId), updates);
  },

  async approveAiPlan(dto: ApprovePlanDto): Promise<ProjectDto> {
    return apiClient.post<ProjectDto>(ENDPOINTS.PROJECTS.AI_APPROVE, dto);
  },
};
