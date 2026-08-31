/**
 * Safe client-side storage management for JWT Authentication and Workspace Context.
 */

const AUTH_TOKEN_KEY = 'nirmaanify_auth_token';
const REFRESH_TOKEN_KEY = 'nirmaanify_refresh_token';
const ACTIVE_WORKSPACE_KEY = 'nirmaanify_active_workspace_id';
const USER_CACHE_KEY = 'nirmaanify_cached_user';

export const tokenStorage = {
  getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem('auth_token');
  },

  setAuthToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem('auth_token', token); // backward compatibility
    // Set cookie for server-side Next.js route middleware if needed
    document.cookie = `nirmaanify_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  },

  clearAuthToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem('auth_token');
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_CACHE_KEY);
    document.cookie = 'nirmaanify_token=; path=/; max-age=0; SameSite=Lax';
  },

  getActiveWorkspaceId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACTIVE_WORKSPACE_KEY);
  },

  setActiveWorkspaceId(workspaceId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspaceId);
  },

  getCachedUser<T>(): T | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_CACHE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  setCachedUser<T>(user: T): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  },
};
