/**
 * Centralized API Endpoint Definitions for Nirmaanify Platform
 * Accessible by all applications and packages in the monorepo.
 */

export const API_PREFIX = '/api/v1';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_PREFIX}/auth/register`,
    LOGIN: `${API_PREFIX}/auth/login`,
    OAUTH: `${API_PREFIX}/auth/oauth`,
    ME: `${API_PREFIX}/auth/me`,
    FORGOT_PASSWORD: `${API_PREFIX}/auth/forgot-password`,
    RESET_PASSWORD: `${API_PREFIX}/auth/reset-password`,
    VERIFY_EMAIL: `${API_PREFIX}/auth/verify-email`,
    RESEND_VERIFICATION: `${API_PREFIX}/auth/resend-verification`,
  },
  WORKSPACES: {
    BASE: `${API_PREFIX}/workspaces`,
    LIST: `${API_PREFIX}/workspaces`,
    CREATE: `${API_PREFIX}/workspaces`,
    DETAIL: (id: string) => `${API_PREFIX}/workspaces/${id}`,
    MEMBERS: (id: string) => `${API_PREFIX}/workspaces/${id}/members`,
    INVITE: (id: string) => `${API_PREFIX}/workspaces/${id}/invites`,
    UPDATE_MEMBER_ROLE: (id: string, userId: string) => `${API_PREFIX}/workspaces/${id}/members/${userId}`,
    REMOVE_MEMBER: (id: string, userId: string) => `${API_PREFIX}/workspaces/${id}/members/${userId}`,
    INVITATION_DETAILS: (token: string) => `${API_PREFIX}/workspaces/invitations/${token}`,
    ACCEPT_INVITATION: (token: string) => `${API_PREFIX}/workspaces/invitations/${token}/accept`,
    LEAVE: (id: string) => `${API_PREFIX}/workspaces/${id}/leave`,
    DELETE: (id: string) => `${API_PREFIX}/workspaces/${id}`,
  },
  PROJECTS: {
    BASE: `${API_PREFIX}/projects`,
    LIST: (workspaceId?: string) =>
      workspaceId ? `${API_PREFIX}/projects?workspaceId=${encodeURIComponent(workspaceId)}` : `${API_PREFIX}/projects`,
    GET: (id: string) => `${API_PREFIX}/projects/${id}`,
    CREATE: `${API_PREFIX}/projects`,
    UPDATE: (id: string) => `${API_PREFIX}/projects/${id}`,
    DELETE: (id: string) => `${API_PREFIX}/projects/${id}`,
    DUPLICATE: (id: string) => `${API_PREFIX}/projects/${id}/duplicate`,
    ARCHIVE: (id: string) => `${API_PREFIX}/projects/${id}/archive`,
    UNARCHIVE: (id: string) => `${API_PREFIX}/projects/${id}/unarchive`,
    GENERATE_PLAN: `${API_PREFIX}/projects/ai/plan`,
    MODIFY_PLAN: (planId: string) => `${API_PREFIX}/projects/ai/plan/${planId}`,
    APPROVE_PLAN: `${API_PREFIX}/projects/ai/approve`,
  },
  STORAGE: {
    BASE: `${API_PREFIX}/storage`,
    STATUS: `${API_PREFIX}/storage/status`,
    SWITCH: `${API_PREFIX}/storage/switch`,
    CONFIG: `${API_PREFIX}/storage/config`,
    TEST_CONNECTION: `${API_PREFIX}/storage/test-connection`,
    FILES: `${API_PREFIX}/storage/files`,
    UPLOAD: `${API_PREFIX}/storage/upload`,
    FILE: (key: string) => `${API_PREFIX}/storage/files/${encodeURIComponent(key)}`,
    DELETE: (key: string) => `${API_PREFIX}/storage/files/${encodeURIComponent(key)}`,
  },
  HEALTH: {
    CHECK: `${API_PREFIX}/health`,
  },
  CMS: {
    COLLECTIONS: (projectId: string) => `${API_PREFIX}/cms/projects/${projectId}/collections`,
    COLLECTION: (projectId: string, collectionIdOrSlug: string) =>
      `${API_PREFIX}/cms/projects/${projectId}/collections/${collectionIdOrSlug}`,
    FIELDS: (projectId: string, collectionId: string) =>
      `${API_PREFIX}/cms/projects/${projectId}/collections/${collectionId}/fields`,
    FIELD: (projectId: string, collectionId: string, fieldId: string) =>
      `${API_PREFIX}/cms/projects/${projectId}/collections/${collectionId}/fields/${fieldId}`,
    CONTENT: (projectId: string, collectionIdOrSlug: string) =>
      `${API_PREFIX}/cms/projects/${projectId}/collections/${collectionIdOrSlug}/items`,
    CONTENT_ITEM: (projectId: string, collectionIdOrSlug: string, itemId: string) =>
      `${API_PREFIX}/cms/projects/${projectId}/collections/${collectionIdOrSlug}/items/${itemId}`,
    PUBLISH: (projectId: string, collectionIdOrSlug: string, itemId: string) =>
      `${API_PREFIX}/cms/projects/${projectId}/collections/${collectionIdOrSlug}/items/${itemId}/publish`,
    UNPUBLISH: (projectId: string, collectionIdOrSlug: string, itemId: string) =>
      `${API_PREFIX}/cms/projects/${projectId}/collections/${collectionIdOrSlug}/items/${itemId}/unpublish`,
    SCHEDULE: (projectId: string, collectionIdOrSlug: string, itemId: string) =>
      `${API_PREFIX}/cms/projects/${projectId}/collections/${collectionIdOrSlug}/items/${itemId}/schedule`,
    SEED_PRESET: (projectId: string) =>
      `${API_PREFIX}/cms/projects/${projectId}/collections/seed-preset`,
    PUBLIC_CONTENT: (projectId: string, collectionSlug: string) =>
      `${API_PREFIX}/cms/public/${projectId}/${collectionSlug}`,

    // Global Workspace-Scoped CMS Endpoints
    WORKSPACE_COLLECTIONS: (workspaceId: string) =>
      `${API_PREFIX}/cms/workspaces/${workspaceId}/collections`,
    WORKSPACE_COLLECTION: (workspaceId: string, collectionIdOrSlug: string) =>
      `${API_PREFIX}/cms/workspaces/${workspaceId}/collections/${collectionIdOrSlug}`,
    WORKSPACE_FIELDS: (workspaceId: string, collectionId: string) =>
      `${API_PREFIX}/cms/workspaces/${workspaceId}/collections/${collectionId}/fields`,
    WORKSPACE_FIELD: (workspaceId: string, collectionId: string, fieldId: string) =>
      `${API_PREFIX}/cms/workspaces/${workspaceId}/collections/${collectionId}/fields/${fieldId}`,
    WORKSPACE_CONTENT: (workspaceId: string, collectionIdOrSlug: string) =>
      `${API_PREFIX}/cms/workspaces/${workspaceId}/collections/${collectionIdOrSlug}/items`,
    WORKSPACE_CONTENT_ITEM: (workspaceId: string, collectionIdOrSlug: string, itemId: string) =>
      `${API_PREFIX}/cms/workspaces/${workspaceId}/collections/${collectionIdOrSlug}/items/${itemId}`,
    WORKSPACE_PUBLISH: (workspaceId: string, collectionIdOrSlug: string, itemId: string) =>
      `${API_PREFIX}/cms/workspaces/${workspaceId}/collections/${collectionIdOrSlug}/items/${itemId}/publish`,
    WORKSPACE_UNPUBLISH: (workspaceId: string, collectionIdOrSlug: string, itemId: string) =>
      `${API_PREFIX}/cms/workspaces/${workspaceId}/collections/${collectionIdOrSlug}/items/${itemId}/unpublish`,
    WORKSPACE_SCHEDULE: (workspaceId: string, collectionIdOrSlug: string, itemId: string) =>
      `${API_PREFIX}/cms/workspaces/${workspaceId}/collections/${collectionIdOrSlug}/items/${itemId}/schedule`,
    WORKSPACE_SEED_PRESET: (workspaceId: string) =>
      `${API_PREFIX}/cms/workspaces/${workspaceId}/collections/seed-preset`,
    WORKSPACE_DELIVERY: (workspaceSlug: string, collectionSlug: string) =>
      `${API_PREFIX}/cms/delivery/workspaces/${workspaceSlug}/${collectionSlug}`,
  },
  BAAS: {
    STATUS: (workspaceId: string) => `${API_PREFIX}/workspaces/${workspaceId}/services/status`,
    API_KEYS: (workspaceId: string) => `${API_PREFIX}/workspaces/${workspaceId}/api-keys`,
    API_KEY: (workspaceId: string, keyId: string) => `${API_PREFIX}/workspaces/${workspaceId}/api-keys/${keyId}`,
    WEBHOOKS: (workspaceId: string) => `${API_PREFIX}/workspaces/${workspaceId}/webhooks`,
    WEBHOOK: (workspaceId: string, webhookId: string) => `${API_PREFIX}/workspaces/${workspaceId}/webhooks/${webhookId}`,
    WEBHOOK_TEST: (workspaceId: string, webhookId: string) => `${API_PREFIX}/workspaces/${workspaceId}/webhooks/${webhookId}/test`,
    EXTERNAL_AUTH_SIGNUP: `${API_PREFIX}/external/auth/signup`,
    EXTERNAL_AUTH_LOGIN: `${API_PREFIX}/external/auth/login`,
    EXTERNAL_AUTH_VERIFY: `${API_PREFIX}/external/auth/verify`,
    EXTERNAL_STORAGE_PRESIGNED: `${API_PREFIX}/external/storage/presigned-url`,
  },
  AGENT: {
    MESSAGES: (projectId: string) => `${API_PREFIX}/projects/${projectId}/agent/messages`,
    SWITCH_SANDBOX: (projectId: string) => `${API_PREFIX}/projects/${projectId}/agent/sandbox/switch`,
    SANDBOX_STATUS: (projectId: string) => `${API_PREFIX}/projects/${projectId}/agent/sandbox/status`,
    ROLLBACK: (projectId: string, fragmentId: string) => `${API_PREFIX}/projects/${projectId}/agent/rollback/${fragmentId}`,
    INNGEST_TRIGGER: (projectId: string) => `${API_PREFIX}/projects/${projectId}/agent/inngest/trigger`,
    ORCHESTRATE: (projectId: string) => `${API_PREFIX}/projects/${projectId}/agent/orchestrate`,
    ORCHESTRATION_RUNS: (projectId: string) => `${API_PREFIX}/projects/${projectId}/agent/orchestration-runs`,
    ORCHESTRATION_RUN: (projectId: string, runId: string) => `${API_PREFIX}/projects/${projectId}/agent/orchestration-runs/${runId}`,
  },
  PACKAGES: {
    PRESETS: (projectId: string) => `${API_PREFIX}/projects/${projectId}/packages/presets`,
    LIST: (projectId: string) => `${API_PREFIX}/projects/${projectId}/packages`,
    CHECK_COMPATIBILITY: (projectId: string) => `${API_PREFIX}/projects/${projectId}/packages/check-compatibility`,
    INSTALL: (projectId: string) => `${API_PREFIX}/projects/${projectId}/packages/install`,
    REMOVE: (projectId: string, packageName: string) => `${API_PREFIX}/projects/${projectId}/packages/${encodeURIComponent(packageName)}`,
    SWITCH_PRESET: (projectId: string) => `${API_PREFIX}/projects/${projectId}/packages/switch-preset`,
    SEARCH_NPM: (projectId: string, q: string) => `${API_PREFIX}/projects/${projectId}/packages/search-npm?q=${encodeURIComponent(q)}`,
  },
  PLUGINS: {
    MARKETPLACE: `${API_PREFIX}/plugins/marketplace`,
    MARKETPLACE_DETAIL: (slug: string) => `${API_PREFIX}/plugins/marketplace/${slug}`,
    PROJECT_PLUGINS: (projectId: string) => `${API_PREFIX}/projects/${projectId}/plugins`,
    INSTALL: (projectId: string) => `${API_PREFIX}/projects/${projectId}/plugins/install`,
    UPDATE: (projectId: string, pluginId: string) => `${API_PREFIX}/projects/${projectId}/plugins/${pluginId}`,
    UNINSTALL: (projectId: string, pluginId: string) => `${API_PREFIX}/projects/${projectId}/plugins/${pluginId}`,
  },
  BUILDS: {
    TRIGGER: (projectId: string) => `${API_PREFIX}/projects/${projectId}/builds/trigger`,
    LIST: (projectId: string) => `${API_PREFIX}/projects/${projectId}/builds`,
    DETAIL: (projectId: string, buildId: string) => `${API_PREFIX}/projects/${projectId}/builds/${buildId}`,
  },
  EXPORT: {
    ZIP: (projectId: string) => `${API_PREFIX}/projects/${projectId}/export/zip`,
    GITHUB: (projectId: string) => `${API_PREFIX}/projects/${projectId}/export/github`,
  },
  DEPLOYMENTS: {
    TRIGGER: (projectId: string) => `${API_PREFIX}/projects/${projectId}/deployments/trigger`,
    LIST: (projectId: string) => `${API_PREFIX}/projects/${projectId}/deployments`,
    DETAIL: (projectId: string, deployId: string) => `${API_PREFIX}/projects/${projectId}/deployments/${deployId}`,
  },
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
