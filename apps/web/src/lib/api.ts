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

const getApiBaseUrl = (): string => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  url = url.trim();
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url;
};

export const apiClient: NirmaanifyApiClient = createApiClient({
  baseUrl: getApiBaseUrl(),
  getToken: getStoredToken,
  setToken: setStoredToken,
});
