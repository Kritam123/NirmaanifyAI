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
  },
  WORKSPACES: {
    BASE: `${API_PREFIX}/workspaces`,
    LIST: `${API_PREFIX}/workspaces`,
    CREATE: `${API_PREFIX}/workspaces`,
    DETAIL: (id: string) => `${API_PREFIX}/workspaces/${id}`,
    MEMBERS: (id: string) => `${API_PREFIX}/workspaces/${id}/members`,
    INVITE: (id: string) => `${API_PREFIX}/workspaces/${id}/invites`,
    REMOVE_MEMBER: (id: string, userId: string) => `${API_PREFIX}/workspaces/${id}/members/${userId}`,
  },
  PROJECTS: {
    BASE: `${API_PREFIX}/projects`,
    LIST: (workspaceId?: string) =>
      workspaceId ? `${API_PREFIX}/projects?workspaceId=${encodeURIComponent(workspaceId)}` : `${API_PREFIX}/projects`,
    CREATE: `${API_PREFIX}/projects`,
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
