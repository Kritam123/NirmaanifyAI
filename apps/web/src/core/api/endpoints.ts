/**
 * Centralized API Endpoint Constants for Nirmaanify AI Master Platform.
 * All API routes automatically prefix with /api/v1.
 */

export const ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    PROFILE: '/auth/profile',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },

  // Workspaces
  WORKSPACES: {
    LIST: '/workspaces',
    GET: (id: string) => `/workspaces/${id}`,
    CREATE: '/workspaces',
    UPDATE: (id: string) => `/workspaces/${id}`,
    DELETE: (id: string) => `/workspaces/${id}`,
    MEMBERS: (id: string) => `/workspaces/${id}/members`,
    INVITE: (id: string) => `/workspaces/${id}/invitations`,
  },

  // Projects
  PROJECTS: {
    LIST: '/projects',
    GET: (id: string) => `/projects/${id}`,
    CREATE: '/projects',
    UPDATE: (id: string) => `/projects/${id}`,
    DELETE: (id: string) => `/projects/${id}`,
    DUPLICATE: (id: string) => `/projects/${id}/duplicate`,
    ARCHIVE: (id: string) => `/projects/${id}/archive`,
    UNARCHIVE: (id: string) => `/projects/${id}/unarchive`,
    AI_PLAN: '/projects/ai/plan',
    AI_PLAN_MODIFY: (planId: string) => `/projects/ai/plan/${planId}`,
    AI_APPROVE: '/projects/ai/approve',
  },

  // Headless CMS
  CMS: {
    TEMPLATES: (projectId: string) => `/projects/${projectId}/cms/templates`,
    COLLECTIONS: (projectId: string) => `/projects/${projectId}/cms/collections`,
    COLLECTION_DETAIL: (projectId: string, collectionId: string) => `/projects/${projectId}/cms/collections/${collectionId}`,
    ENTRIES: (projectId: string, collectionId: string) => `/projects/${projectId}/cms/collections/${collectionId}/entries`,
    ENTRY_DETAIL: (projectId: string, entryId: string) => `/projects/${projectId}/cms/entries/${entryId}`,
    ENTRY_PUBLISH: (projectId: string, entryId: string) => `/projects/${projectId}/cms/entries/${entryId}/publish`,
    ENTRY_ARCHIVE: (projectId: string, entryId: string) => `/projects/${projectId}/cms/entries/${entryId}/archive`,
    PUBLIC_QUERY: (projectSlug: string, collectionSlug: string) => `/cms/public/${projectSlug}/${collectionSlug}`,
  },

  // Backend Builder
  BACKEND: {
    CONFIG: (projectId: string) => `/projects/${projectId}/backend/config`,
    UPDATE_CONFIG: (projectId: string) => `/projects/${projectId}/backend/config`,
    CODEGEN: (projectId: string) => `/projects/${projectId}/backend/codegen`,
    TEST_ENDPOINT: (projectId: string) => `/projects/${projectId}/backend/test-endpoint`,
  },

  // Database & REST API Builder
  DATABASE: {
    SCHEMA: (projectId: string) => `/projects/${projectId}/database/schema`,
    UPDATE_SCHEMA: (projectId: string) => `/projects/${projectId}/database/schema`,
    MODELS: (projectId: string) => `/projects/${projectId}/database/models`,
    MODEL_DETAIL: (projectId: string, modelId: string) => `/projects/${projectId}/database/models/${modelId}`,
    ER_DIAGRAM: (projectId: string) => `/projects/${projectId}/database/er-diagram`,
    COMPILED_PRISMA: (projectId: string) => `/projects/${projectId}/database/compiled-prisma`,
    EXECUTE_QUERY: (projectId: string) => `/projects/${projectId}/database/execute-query`,
  },

  // Packages & Plugins
  PLUGINS: {
    ECOSYSTEM: (projectId: string) => `/projects/${projectId}/packages-plugins`,
    INSTALL_PACKAGE: (projectId: string) => `/projects/${projectId}/packages/install`,
    UNINSTALL_PACKAGE: (projectId: string, pkgName: string) => `/projects/${projectId}/packages/${encodeURIComponent(pkgName)}`,
    INSTALL_PLUGIN: (projectId: string) => `/projects/${projectId}/plugins/install`,
    UNINSTALL_PLUGIN: (projectId: string, pluginId: string) => `/projects/${projectId}/plugins/${pluginId}`,
    TOGGLE_PLUGIN: (projectId: string, pluginId: string) => `/projects/${projectId}/plugins/${pluginId}/toggle`,
    CONFIG_PLUGIN: (projectId: string, pluginId: string) => `/projects/${projectId}/plugins/${pluginId}/config`,
  },

  // AI Multi-Agent Orchestrator
  ORCHESTRATOR: {
    PLAN: (projectId: string) => `/projects/${projectId}/orchestrator/plan`,
    EXECUTE_STEP: (projectId: string, planId: string, stepId: string) => `/projects/${projectId}/orchestrator/plans/${planId}/steps/${stepId}/execute`,
    APPROVE_STEP: (projectId: string, planId: string, stepId: string) => `/projects/${projectId}/orchestrator/plans/${planId}/steps/${stepId}/approve`,
    MEMORY: (projectId: string) => `/projects/${projectId}/orchestrator/memory`,
  },

  // Preview, Build & Deployment
  DEPLOYMENT: {
    EXPORT_BUNDLE: (projectId: string) => `/projects/${projectId}/export/bundle`,
    VALIDATE_BUILD: (projectId: string) => `/projects/${projectId}/build/validate`,
    DEPLOY: (projectId: string) => `/projects/${projectId}/deploy`,
    HISTORY: (projectId: string) => `/projects/${projectId}/deployments`,
  },

  // Audit & Testing
  AUDIT: {
    TESTS_RUN: '/audit/tests/run',
    SECURITY_AUDIT: '/audit/security',
    MVP_CHECKLIST: '/audit/mvp-checklist',
  },

  // Storage
  STORAGE: {
    CONFIG: '/storage/config',
    UPLOAD: '/storage/upload',
    PRESIGN: '/storage/presign',
  },
} as const;
