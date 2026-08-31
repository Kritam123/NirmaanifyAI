import { apiClient } from './client';
import {
  AgentPlanExecution,
  AiAgentMemoryStack,
  DesignContextMode,
} from '@nirmaanify/types';

export const orchestratorApi = {
  async plan(projectId: string, prompt: string, designMode: DesignContextMode = 'platform'): Promise<AgentPlanExecution> {
    return apiClient.post<AgentPlanExecution>(`/projects/${projectId}/orchestrator/plan`, {
      prompt,
      designMode,
    });
  },

  async executeStep(projectId: string, planId: string, stepId: string): Promise<AgentPlanExecution> {
    return apiClient.post<AgentPlanExecution>(`/projects/${projectId}/orchestrator/execute-step`, {
      planId,
      stepId,
    });
  },

  async approveStep(projectId: string, planId: string, stepId: string): Promise<AgentPlanExecution> {
    return apiClient.post<AgentPlanExecution>(`/projects/${projectId}/orchestrator/approve-step`, {
      planId,
      stepId,
    });
  },

  async getMemory(projectId: string, designMode: DesignContextMode = 'platform'): Promise<AiAgentMemoryStack> {
    return apiClient.get<AiAgentMemoryStack>(`/projects/${projectId}/orchestrator/memory`, {
      params: { designMode },
    });
  },
};
