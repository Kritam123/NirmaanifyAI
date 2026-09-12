export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

export type SandboxProvider = 'E2B_CLOUD' | 'LOCAL_DOCKER' | 'WEBCONTAINER';

export type SandboxStatus = 'INITIALIZING' | 'READY' | 'BUSY' | 'ERROR' | 'TERMINATED';

export type StudioViewMode = 'split' | 'agent' | 'code' | 'preview';

export interface ToolCallExecution {
  id?: string;
  name: string;
  args: Record<string, any>;
  output?: any;
  status: 'pending' | 'success' | 'failed';
  error?: string;
}

export interface ProjectMessageDto {
  id: string;
  projectId: string;
  role: MessageRole;
  content: string;
  thought?: string | null;
  toolCalls: ToolCallExecution[];
  modelUsed: string;
  createdAt: string;
  fragment?: ProjectFragmentDto | null;
}

export interface ProjectFragmentDto {
  id: string;
  messageId: string;
  projectId?: string | null;
  sandboxUrl: string;
  apiSandboxUrl?: string | null;
  title: string;
  files: Record<string, string>;
  diffs?: Record<string, { type: 'added' | 'modified' | 'deleted'; diff?: string }> | null;
  createdAt: string;
}

export interface ProjectSandboxDto {
  id: string;
  projectId: string;
  provider: SandboxProvider;
  sandboxId: string;
  status: SandboxStatus;
  hostUrl: string;
  apiHostUrl?: string | null;
  lastActiveAt: string;
  metadata?: Record<string, any> | null;
}

export interface AgentPromptRequestDto {
  prompt: string;
  preferredModel?: AgentCodingModel | string; // default: 'gemini-3.8-flash'
  useInngest?: boolean;
}

export type AgentCodingModel =
  | 'gemini-3.8-flash'
  | 'gemini-3.0-pro'
  | 'gemini-2.5-flash'
  | 'gemini-2.0-flash';

export interface AgentModelConfig {
  id: AgentCodingModel;
  name: string;
  badge: string;
  description: string;
  isDefault?: boolean;
}

export const AVAILABLE_AGENT_MODELS: AgentModelConfig[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    badge: 'Ultra-Fast & Smart',
    description: 'Sub-second coding model for fast interactive full-stack iterations',
    isDefault: true,
  },
  {
    id: 'gemini-3.0-pro',
    name: 'Gemini 3.0 Pro',
    badge: 'Deep Architecture',
    description: 'Advanced reasoning for complex multi-file full-stack architecture',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    badge: 'Rapid',
    description: 'High-speed utility code edits and summaries',
  },
];

export interface InngestWorkflowRunDto {
  eventId: string;
  runId?: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  projectId: string;
  stepName?: string;
  message?: string;
  result?: ProjectMessageDto;
}

export interface SwitchSandboxDto {
  provider: SandboxProvider;
}

export interface RollbackSnapshotDto {
  fragmentId: string;
}

// ==========================================
// PHASE 11: MULTI-AGENT ORCHESTRATION TYPES
// ==========================================

export type SpecializedAgentType =
  | 'ORCHESTRATOR'
  | 'PROJECT_PLANNER'
  | 'UI_AGENT'
  | 'BACKEND_AGENT'
  | 'DATABASE_AGENT'
  | 'CMS_AGENT'
  | 'PACKAGE_AGENT'
  | 'PLUGIN_AGENT';

export type TaskExecutionStatus =
  | 'QUEUED'
  | 'IN_PROGRESS'
  | 'AWAITING_APPROVAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'SKIPPED';

export interface OrchestrationTask {
  id: string;
  agent: SpecializedAgentType;
  title: string;
  description: string;
  dependencies: string[];
  status: TaskExecutionStatus;
  requiresApproval?: boolean;
  isApproved?: boolean;
  outputSummary?: string;
  affectedFiles?: string[];
}

export interface AgentDesignContext {
  mode: 'platform' | 'project';
  brandTokens: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    borderRadius: string;
  };
  uiFramework: string;
  animationEngine: string;
  formEngine: string;
}

export interface AgentMemoryContext {
  project: {
    id: string;
    name: string;
    slug: string;
    type: string;
    serverType: string;
    framework: string;
  };
  architecture: {
    routes: string[];
    filesCount: number;
    sandboxUrl?: string;
    apiSandboxUrl?: string;
  };
  packages: Array<{ name: string; version: string; category: string }>;
  backend: {
    hasNestJs: boolean;
    hasCms: boolean;
    entities: string[];
  };
  designContext: AgentDesignContext;
}

export interface AgentOrchestrationRunDto {
  id: string;
  projectId: string;
  messageId?: string | null;
  prompt: string;
  status: TaskExecutionStatus;
  plan: OrchestrationTask[];
  contextSnapshot: AgentMemoryContext;
  currentAgent: SpecializedAgentType;
  logs: Array<{ timestamp: string; agent: SpecializedAgentType; message: string }>;
  error?: string | null;
  startedAt: string;
  completedAt?: string | null;
}

export interface OrchestratePromptRequestDto {
  prompt: string;
  preferredModel?: string;
  requireApprovalForMigrations?: boolean;
}

export interface ApproveTaskDto {
  taskId: string;
  approved: boolean;
}

