export declare const QUEUE_NAMES: {
    readonly CODE_GENERATION: "code-generation";
    readonly AI_PLANNER: "ai-planner";
    readonly PROJECT_EXPORT: "project-export";
    readonly DATABASE_MIGRATION: "database-migration";
};
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
//# sourceMappingURL=queues.d.ts.map