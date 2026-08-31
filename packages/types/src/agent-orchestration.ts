import { z } from 'zod';

// ============================================================================
// 1. SPECIALIZED AGENT ROLES & TASK STATES
// ============================================================================

export type SpecializedAgentRole =
  | 'planner'
  | 'ui_designer'
  | 'backend_engineer'
  | 'db_architect'
  | 'cms_specialist'
  | 'package_librarian'
  | 'plugin_integrator';

export type AgentTaskStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'WAITING_APPROVAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'RETRYING';

export type DesignContextMode = 'platform' | 'project';

export interface AgentTaskStep {
  id: string;
  agentRole: SpecializedAgentRole;
  agentName: string;
  title: string;
  description: string;
  status: AgentTaskStatus;
  dependsOn?: string[];
  outputSummary?: string;
  generatedChanges?: {
    target: 'schema' | 'pages' | 'backend' | 'database' | 'cms' | 'packages' | 'plugins';
    diffDescription: string;
    data?: any;
  };
  requiresApproval?: boolean;
  retryCount?: number;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

// ============================================================================
// 2. DESIGN CONTEXT & MULTI-TIER MEMORY STACK
// ============================================================================

export interface AiAgentMemoryStack {
  designContext: {
    mode: DesignContextMode;
    tokens: Record<string, any>;
    description: string;
  };
  projectContext: {
    projectId: string;
    name: string;
    slug: string;
    workspaceId: string;
    description?: string;
  };
  architectureContext: {
    isBackendEnabled: boolean;
    framework: string;
    databaseEngine: string;
    orm: string;
  };
  componentContext: {
    pageCount: number;
    activePageId: string;
    activeNodeCount: number;
    registeredComponentCategories: string[];
  };
  packageContext: {
    installedPackagesCount: number;
    packages: string[];
  };
  backendContext: {
    enabledModules: string[];
    endpointCount: number;
  };
  databaseContext: {
    modelCount: number;
    models: string[];
  };
  conversationContext: {
    turnCount: number;
    recentMessages: { role: 'user' | 'assistant'; content: string }[];
  };
}

export interface AgentPlanExecution {
  id: string;
  prompt: string;
  status: 'PLANNING' | 'EXECUTING' | 'WAITING_USER' | 'COMPLETED' | 'FAILED';
  steps: AgentTaskStep[];
  createdAt: string;
  memoryStack: AiAgentMemoryStack;
}

export const SpecializedAgentRoleSchema = z.enum([
  'planner',
  'ui_designer',
  'backend_engineer',
  'db_architect',
  'cms_specialist',
  'package_librarian',
  'plugin_integrator',
]);

export const AgentTaskStatusSchema = z.enum([
  'QUEUED',
  'RUNNING',
  'WAITING_APPROVAL',
  'COMPLETED',
  'FAILED',
  'RETRYING',
]);

export const AgentTaskStepSchema = z.object({
  id: z.string(),
  agentRole: SpecializedAgentRoleSchema,
  agentName: z.string(),
  title: z.string(),
  description: z.string(),
  status: AgentTaskStatusSchema,
  dependsOn: z.array(z.string()).optional(),
  outputSummary: z.string().optional(),
  generatedChanges: z
    .object({
      target: z.enum([
        'schema',
        'pages',
        'backend',
        'database',
        'cms',
        'packages',
        'plugins',
      ]),
      diffDescription: z.string(),
      data: z.any().optional(),
    })
    .optional(),
  requiresApproval: z.boolean().optional(),
  retryCount: z.number().optional(),
  error: z.string().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
});
