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
    FILES: `${API_PREFIX}/storage/files`,
    UPLOAD: `${API_PREFIX}/storage/upload`,
    FILE: (key: string) => `${API_PREFIX}/storage/files/${encodeURIComponent(key)}`,
    DELETE: (key: string) => `${API_PREFIX}/storage/files/${encodeURIComponent(key)}`,
  },
  HEALTH: {
    CHECK: `${API_PREFIX}/health`,
  },
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
