import { HttpClient, HttpClientConfig, ErrorResponse } from './http-client';
import { AuthService } from './services/auth.service';
import { WorkspacesService } from './services/workspaces.service';
import { ProjectsService } from './services/projects.service';
import { StorageService } from './services/storage.service';
import { HealthService } from './services/health.service';
import { CmsService } from './services/cms.service';
import { BaasService } from './services/baas.service';
import { AgentService } from './services/agent.service';

export * from './endpoints';
export * from './http-client';
export * from './services/auth.service';
export * from './services/workspaces.service';
export * from './services/projects.service';
export * from './services/storage.service';
export * from './services/health.service';
export * from './services/cms.service';
export * from './services/baas.service';
export * from './services/agent.service';

/**
 * Unified Nirmaanify API Client Suite
 * Combines all REST API services into a single, cohesive SDK instance.
 */
export class NirmaanifyApiClient {
  public readonly http: HttpClient;
  public readonly auth: AuthService;
  public readonly workspaces: WorkspacesService;
  public readonly projects: ProjectsService;
  public readonly storage: StorageService;
  public readonly health: HealthService;
  public readonly cms: CmsService;
  public readonly baas: BaasService;
  public readonly agent: AgentService;

  constructor(config: HttpClientConfig = {}) {
    this.http = new HttpClient(config);
    this.auth = new AuthService(this.http);
    this.workspaces = new WorkspacesService(this.http);
    this.projects = new ProjectsService(this.http);
    this.storage = new StorageService(this.http);
    this.health = new HealthService(this.http);
    this.cms = new CmsService(this.http);
    this.baas = new BaasService(this.http);
    this.agent = new AgentService(this.http);
  }

  /**
   * Set JWT auth token across all services
   */
  public setToken(token: string | null): void {
    this.http.setToken(token);
  }

  /**
   * Set base URL for API requests
   */
  public setBaseUrl(url: string): void {
    this.http.setBaseUrl(url);
  }

  /**
   * Get current base URL
   */
  public getBaseUrl(): string {
    return this.http.getBaseUrl();
  }
}

/**
 * Factory function to create a configured API client
 */
export function createApiClient(config?: HttpClientConfig): NirmaanifyApiClient {
  return new NirmaanifyApiClient(config);
}

/**
 * Default singleton instance for general application usage
 */
export const apiClient = createApiClient();
