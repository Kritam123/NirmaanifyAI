/**
 * Centralized Route Map for Nirmaanify Web Application
 */

export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
  },
  DASHBOARD: {
    OVERVIEW: '/dashboard',
    PROJECTS: '/projects',
    PROJECT_DETAIL: (id: string) => `/projects/${id}`,
    WORKSPACES: '/workspaces',
    WORKSPACE_DETAIL: (id: string) => `/workspaces/${id}`,
    STORAGE: '/storage',
  },
  EXTERNAL: {
    API_DOCS: 'http://localhost:4000/api/docs',
    DOCS: 'https://docs.nirmaanify.ai',
    GITHUB: 'https://github.com/nirmaanify',
  },
} as const;
