import { HttpClient } from '../http-client';
import { API_ENDPOINTS } from '../endpoints';
import {
  ApiKeyDto,
  CreateApiKeyDto,
  WebhookSubscriptionDto,
  CreateWebhookDto,
  UpdateWebhookDto,
  ExternalServiceStatusDto,
} from '@nirmaanify/types';

export class BaasService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get health, gateway, and service status for workspace BaaS
   */
  async getStatus(workspaceId: string): Promise<ExternalServiceStatusDto> {
    return this.http.get<ExternalServiceStatusDto>(API_ENDPOINTS.BAAS.STATUS(workspaceId));
  }

  /**
   * List API keys for workspace
   */
  async listApiKeys(workspaceId: string): Promise<ApiKeyDto[]> {
    return this.http.get<ApiKeyDto[]>(API_ENDPOINTS.BAAS.API_KEYS(workspaceId));
  }

  /**
   * Create a new scoped API key
   */
  async createApiKey(workspaceId: string, dto: CreateApiKeyDto): Promise<ApiKeyDto> {
    return this.http.post<ApiKeyDto>(API_ENDPOINTS.BAAS.API_KEYS(workspaceId), dto);
  }

  /**
   * Revoke an API key
   */
  async deleteApiKey(workspaceId: string, keyId: string): Promise<{ success: boolean; id: string }> {
    return this.http.delete<{ success: boolean; id: string }>(API_ENDPOINTS.BAAS.API_KEY(workspaceId, keyId));
  }

  /**
   * List webhooks for workspace
   */
  async listWebhooks(workspaceId: string): Promise<WebhookSubscriptionDto[]> {
    return this.http.get<WebhookSubscriptionDto[]>(API_ENDPOINTS.BAAS.WEBHOOKS(workspaceId));
  }

  /**
   * Create a webhook subscription
   */
  async createWebhook(workspaceId: string, dto: CreateWebhookDto): Promise<WebhookSubscriptionDto> {
    return this.http.post<WebhookSubscriptionDto>(API_ENDPOINTS.BAAS.WEBHOOKS(workspaceId), dto);
  }

  /**
   * Update a webhook subscription
   */
  async updateWebhook(
    workspaceId: string,
    webhookId: string,
    dto: UpdateWebhookDto
  ): Promise<WebhookSubscriptionDto> {
    return this.http.patch<WebhookSubscriptionDto>(
      API_ENDPOINTS.BAAS.WEBHOOK(workspaceId, webhookId),
      dto
    );
  }

  /**
   * Delete a webhook subscription
   */
  async deleteWebhook(
    workspaceId: string,
    webhookId: string
  ): Promise<{ success: boolean; id: string }> {
    return this.http.delete<{ success: boolean; id: string }>(
      API_ENDPOINTS.BAAS.WEBHOOK(workspaceId, webhookId)
    );
  }

  /**
   * Send a test ping payload to a webhook target
   */
  async testWebhook(
    workspaceId: string,
    webhookId: string
  ): Promise<{ success: boolean; statusCode?: number; responseTimeMs?: number; error?: string }> {
    return this.http.post<{ success: boolean; statusCode?: number; responseTimeMs?: number; error?: string }>(
      API_ENDPOINTS.BAAS.WEBHOOK_TEST(workspaceId, webhookId),
      {}
    );
  }
}
