import { HttpClient } from '../http-client';
import { API_ENDPOINTS } from '../endpoints';
import {
  ProjectMessageDto,
  ProjectFragmentDto,
  ProjectSandboxDto,
  AgentPromptRequestDto,
  SwitchSandboxDto,
  SandboxProvider,
  InngestWorkflowRunDto,
  AgentOrchestrationRunDto,
  OrchestratePromptRequestDto,
} from '@nirmaanify/types';

export class AgentService {
  constructor(private readonly http: HttpClient) {}

  async sendMessage(
    projectId: string,
    prompt: string,
    preferredModel?: string,
  ): Promise<ProjectMessageDto> {
    const dto: AgentPromptRequestDto = { prompt, preferredModel };
    return this.http.post<ProjectMessageDto>(API_ENDPOINTS.AGENT.MESSAGES(projectId), dto);
  }

  async triggerInngestWorkflow(
    projectId: string,
    prompt: string,
    preferredModel?: string,
  ): Promise<InngestWorkflowRunDto> {
    const dto: AgentPromptRequestDto = { prompt, preferredModel, useInngest: true };
    return this.http.post<InngestWorkflowRunDto>(API_ENDPOINTS.AGENT.INNGEST_TRIGGER(projectId), dto);
  }

  async getMessages(projectId: string): Promise<ProjectMessageDto[]> {
    return this.http.get<ProjectMessageDto[]>(API_ENDPOINTS.AGENT.MESSAGES(projectId));
  }

  async switchSandbox(projectId: string, provider: SandboxProvider): Promise<ProjectSandboxDto> {
    const dto: SwitchSandboxDto = { provider };
    return this.http.patch<ProjectSandboxDto>(API_ENDPOINTS.AGENT.SWITCH_SANDBOX(projectId), dto);
  }

  async getSandboxStatus(projectId: string): Promise<ProjectSandboxDto> {
    return this.http.get<ProjectSandboxDto>(API_ENDPOINTS.AGENT.SANDBOX_STATUS(projectId));
  }

  async rollback(projectId: string, fragmentId: string): Promise<ProjectFragmentDto> {
    return this.http.post<ProjectFragmentDto>(API_ENDPOINTS.AGENT.ROLLBACK(projectId, fragmentId), {});
  }

  // ==========================================
  // PHASE 11: MULTI-AGENT ORCHESTRATION
  // ==========================================

  async orchestrate(
    projectId: string,
    prompt: string,
    preferredModel?: string,
  ): Promise<AgentOrchestrationRunDto> {
    const dto: OrchestratePromptRequestDto = { prompt, preferredModel };
    return this.http.post<AgentOrchestrationRunDto>(API_ENDPOINTS.AGENT.ORCHESTRATE(projectId), dto);
  }

  async listOrchestrationRuns(projectId: string): Promise<AgentOrchestrationRunDto[]> {
    const res = await this.http.get<{ runs: AgentOrchestrationRunDto[] }>(API_ENDPOINTS.AGENT.ORCHESTRATION_RUNS(projectId));
    return res.runs || [];
  }

  async getOrchestrationRun(projectId: string, runId: string): Promise<AgentOrchestrationRunDto> {
    const res = await this.http.get<{ run: AgentOrchestrationRunDto }>(API_ENDPOINTS.AGENT.ORCHESTRATION_RUN(projectId, runId));
    return res.run;
  }
}
