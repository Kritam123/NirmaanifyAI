import { z } from 'zod';

// ============================================================================
// 1. BUILD & LOGGING TYPES
// ============================================================================

export type BuildStatus =
  | 'IDLE'
  | 'VALIDATING'
  | 'BUILDING'
  | 'SUCCESS'
  | 'FAILED';

export interface BuildLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  phase: 'VALIDATION' | 'NEXT_BUILD' | 'NEST_BUILD' | 'PRISMA' | 'DOCKER' | 'DEPLOY';
  message: string;
}

// ============================================================================
// 2. EXPORT BUNDLE SPECIFICATION
// ============================================================================

export interface ExportFileItem {
  path: string;
  content: string;
  language: 'typescript' | 'prisma' | 'json' | 'yaml' | 'markdown' | 'env' | 'css';
  sizeBytes?: number;
}

export interface FullstackExportBundle {
  projectName: string;
  slug: string;
  totalFiles: number;
  totalSizeBytes: number;
  files: ExportFileItem[];
  dockerComposeYml: string;
  readmeMd: string;
  envExample: string;
}

// ============================================================================
// 3. DEPLOYMENT TARGETS & CONFIGURATION
// ============================================================================

export type DeploymentTarget =
  | 'vercel'
  | 'docker'
  | 'railway'
  | 'render'
  | 'self-hosted';

export interface DeploymentRecord {
  id: string;
  projectId: string;
  target: DeploymentTarget;
  status: 'PENDING' | 'BUILDING' | 'LIVE' | 'FAILED';
  url?: string;
  customDomain?: string;
  commitHash?: string;
  durationSeconds?: number;
  createdAt: string;
}

export const BuildStatusSchema = z.enum([
  'IDLE',
  'VALIDATING',
  'BUILDING',
  'SUCCESS',
  'FAILED',
]);

export const DeploymentTargetSchema = z.enum([
  'vercel',
  'docker',
  'railway',
  'render',
  'self-hosted',
]);

export const DeploymentRecordSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  target: DeploymentTargetSchema,
  status: z.enum(['PENDING', 'BUILDING', 'LIVE', 'FAILED']),
  url: z.string().optional(),
  customDomain: z.string().optional(),
  commitHash: z.string().optional(),
  durationSeconds: z.number().optional(),
  createdAt: z.string(),
});
