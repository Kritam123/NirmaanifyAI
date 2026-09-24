import { createApiClient, NirmaanifyApiClient } from '@nirmaanify/api-client';

const TOKEN_KEY = 'nirmaanify_auth_token';

// Safely access localStorage in SSR environments
export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setStoredToken = (token: string | null): void => {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      document.cookie = `nirmaanify_token=${token}; path=/; max-age=604800; SameSite=Lax`;
    } else {
      localStorage.removeItem(TOKEN_KEY);
      document.cookie = `nirmaanify_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  } catch {
    // Ignore localStorage write failures in restricted environments
  }
};

export const getApiBaseUrl = (): string => {
  // Browser context: dynamically resolve against current window origin
  if (typeof window !== 'undefined') {
    const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (envUrl) {
      if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
        return envUrl.replace(/\/+$/, '');
      }
      const cleanPath = envUrl.startsWith('/') ? envUrl : `/${envUrl}`;
      return `${window.location.origin}${cleanPath}`.replace(/\/+$/, '');
    }
    return `${window.location.origin}/api/v1`;
  }

  // Server context (SSR / NextAuth in Node.js):
  const serverUrl =
    process.env.INTERNAL_API_URL?.trim() ||
    process.env.API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim();

  if (serverUrl) {
    if (serverUrl.startsWith('http://') || serverUrl.startsWith('https://')) {
      return serverUrl.replace(/\/+$/, '');
    }
    const cleanPath = serverUrl.startsWith('/') ? serverUrl : `/${serverUrl}`;
    const host = process.env.NODE_ENV === 'production' ? 'http://api:4000' : 'http://localhost:4000';
    return `${host}${cleanPath}`.replace(/\/+$/, '');
  }

  return process.env.NODE_ENV === 'production' ? 'http://api:4000/api/v1' : 'http://localhost:4000/api/v1';
};

export const apiClient: NirmaanifyApiClient = createApiClient({
  baseUrl: getApiBaseUrl,
  getToken: getStoredToken,
  setToken: setStoredToken,
});
