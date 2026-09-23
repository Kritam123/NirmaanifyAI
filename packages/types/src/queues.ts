export const QUEUE_NAMES = {
  CODE_GENERATION: 'code-generation',
  AI_PLANNER: 'ai-planner',
  PROJECT_EXPORT: 'project-export',
  DATABASE_MIGRATION: 'database-migration',
  DIAGRAM_EXPORT: 'diagram-export',
  DIAGRAM_AI_GENERATION: 'diagram-ai-generation',
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

export interface DiagramExportJobData {
  diagramId: string;
  projectId: string;
  format: 'svg' | 'png' | 'pdf' | 'json';
}

export interface DiagramAIGenJobData {
  projectId: string;
  prompt: string;
  diagramType?: string;
}
