import { ProjectDto } from '@nirmaanify/types';

export type ProjectServerType = 'cms' | 'nestjs' | 'fullstack' | 'static';

export interface ServerArchitectureMeta {
  type: ProjectServerType;
  label: string;
  shortLabel: string;
  description: string;
  badgeVariant: 'indigo' | 'secondary' | 'violet' | 'cyan';
  hasCms: boolean;
  hasNestJs: boolean;
}

export const SERVER_ARCHITECTURES: Record<ProjectServerType, ServerArchitectureMeta> = {
  cms: {
    type: 'cms',
    label: 'Headless CMS',
    shortLabel: 'CMS Server',
    description: 'Dynamic content collections, schema field builder, and public content delivery API.',
    badgeVariant: 'indigo',
    hasCms: true,
    hasNestJs: false,
  },
  nestjs: {
    type: 'nestjs',
    label: 'Full NestJS REST API',
    shortLabel: 'NestJS API',
    description: 'Enterprise REST API gateway, Prisma ORM, PostgreSQL database, and BullMQ queues.',
    badgeVariant: 'indigo',
    hasCms: false,
    hasNestJs: true,
  },
  fullstack: {
    type: 'fullstack',
    label: 'Full-Stack (NestJS + CMS)',
    shortLabel: 'NestJS + CMS',
    description: 'Unified full-stack architecture combining custom NestJS API controllers with Headless CMS.',
    badgeVariant: 'violet',
    hasCms: true,
    hasNestJs: true,
  },
  static: {
    type: 'static',
    label: 'Static Frontend (No Server)',
    shortLabel: 'Static Export',
    description: 'Client-side Next.js 15 site without a persistent backend server or CMS.',
    badgeVariant: 'secondary',
    hasCms: false,
    hasNestJs: false,
  },
};

/**
 * Determine the dynamic server requirement for any project.
 * Checks projectSchema.serverType first, then aiPlan, then falls back to isBackendEnabled and CMS collections.
 */
export function getProjectServerType(project: Partial<ProjectDto> | null | undefined): ProjectServerType {
  if (!project) return 'static';

  // 1. Explicitly configured serverType in projectSchema
  const schemaServerType = project.projectSchema?.serverType as ProjectServerType | undefined;
  if (schemaServerType && SERVER_ARCHITECTURES[schemaServerType]) {
    return schemaServerType;
  }

  // 2. AI Plan backend specification
  const aiServerType = project.aiPlan?.backendRequirements?.serverType as ProjectServerType | undefined;
  if (aiServerType && SERVER_ARCHITECTURES[aiServerType]) {
    return aiServerType;
  }

  // 3. Infer from CMS collections
  const hasCmsCollections = Array.isArray((project as any).cmsCollections) && (project as any).cmsCollections.length > 0;
  if (hasCmsCollections && project.isBackendEnabled) {
    return 'fullstack';
  }
  if (hasCmsCollections) {
    return 'cms';
  }

  // 4. Inferred from isBackendEnabled
  if (project.isBackendEnabled) {
    return 'nestjs';
  }

  return 'static';
}
