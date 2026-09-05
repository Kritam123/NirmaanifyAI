/**
 * Standalone BaaS (Backend-as-a-Service) & External API Types
 * Scoped at Workspace level for external websites, mobile apps, and third-party integrations.
 */

export interface ApiKeyDto {
  id: string;
  workspaceId: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt?: string | Date | null;
  expiresAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  // Included in response only when first created
  secretKey?: string;
}

export interface CreateApiKeyDto {
  name: string;
  scopes?: string[];
  expiresInDays?: number;
}

export interface WebhookSubscriptionDto {
  id: string;
  workspaceId: string;
  name: string;
  targetUrl: string;
  secret?: string | null;
  events: string[];
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateWebhookDto {
  name: string;
  targetUrl: string;
  secret?: string;
  events: string[];
}

export interface UpdateWebhookDto {
  name?: string;
  targetUrl?: string;
  secret?: string;
  events?: string[];
  isActive?: boolean;
}

export interface ExternalServiceStatusDto {
  gateway: {
    status: 'online' | 'degraded' | 'offline';
    version: string;
    uptime: number;
    apiUrl: string;
    docsUrl: string;
  };
  auth: {
    enabled: boolean;
    jwtIssuer: string;
    endpoints: {
      signup: string;
      login: string;
      verify: string;
    };
  };
  database: {
    connected: boolean;
    provider: 'postgresql';
    totalCollections: number;
    totalItems: number;
  };
  storage: {
    driver: string;
    endpoint?: string;
  };
}
