export type BuildStatus =
  | 'QUEUED'
  | 'BUILDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'CANCELLED';

export type DeploymentTarget =
  | 'VERCEL'
  | 'RENDER'
  | 'RAILWAY'
  | 'DOCKER'
  | 'SELF_HOSTED'
  | 'SANDBOX';

export type DeploymentStatus =
  | 'PENDING'
  | 'DEPLOYING'
  | 'DEPLOYED'
  | 'FAILED'
  | 'CANCELLED';

export interface BuildLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  step?: string;
}

export interface BuildErrorDiagnostic {
  file: string;
  line?: number;
  column?: number;
  message: string;
  code?: string;
  remediation?: string;
}

export interface EnvironmentValidationResult {
  isValid: boolean;
  missing: string[];
  warnings: string[];
  detectedVars: string[];
}

export interface ProjectBuildDto {
  id: string;
  projectId: string;
  status: BuildStatus;
  durationMs?: number | null;
  logs: BuildLogEntry[];
  errors?: BuildErrorDiagnostic[];
  envValidation?: EnvironmentValidationResult;
  commitHash?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TriggerBuildDto {
  target?: 'production' | 'preview';
  environment?: Record<string, string>;
}

export interface DeploymentLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface ProjectDeploymentDto {
  id: string;
  projectId: string;
  buildId?: string | null;
  target: DeploymentTarget;
  status: DeploymentStatus;
  url?: string | null;
  logs: DeploymentLogEntry[];
  config?: Record<string, any>;
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TriggerDeploymentDto {
  target: DeploymentTarget;
  buildId?: string;
  environmentVariables?: Record<string, string>;
  customDomain?: string;
  deployToken?: string;
}

export interface ExportGithubDto {
  repoName: string;
  isPrivate?: boolean;
  personalAccessToken: string;
  commitMessage?: string;
  branch?: string;
}

export interface GithubExportResultDto {
  success: boolean;
  repoUrl: string;
  commitHash?: string;
  branch: string;
  filesPushed: number;
  message?: string;
}
