export const QUEUE_NAMES = {
  CODE_GENERATION: 'code-generation',
  AI_PLANNER: 'ai-planner',
  PROJECT_EXPORT: 'project-export',
  DATABASE_MIGRATION: 'database-migration',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export interface CodeGenJobData {
  projectId: string;
  workspaceId: string;
  modules: string[];
  options?: {
    target: 'nextjs' | 'nestjs' | 'fullstack';
    generateTests?: boolean;
  };
}

export interface AiPlannerJobData {
  prompt: string;
  workspaceId: string;
  userId: string;
  templatePreference?: string;
}

export interface ProjectExportJobData {
  projectId: string;
  format: 'zip' | 'git' | 'docker';
  destination?: string;
}
