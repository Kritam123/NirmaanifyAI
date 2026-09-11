import { PluginManifest, PluginPermission, StudioSlot } from '@nirmaanify/types';
import { PluginRpcBridge } from './bridge/rpc';

export interface PluginExecutionContextOptions {
  projectId: string;
  pluginId: string;
  grantedPermissions: PluginPermission[];
  configValues: Record<string, any>;
  bridge?: PluginRpcBridge;
}

export class PluginExecutionContext {
  public readonly projectId: string;
  public readonly pluginId: string;
  private readonly permissions: Set<PluginPermission>;
  private readonly config: Record<string, any>;
  private readonly bridge: PluginRpcBridge;

  constructor(options: PluginExecutionContextOptions) {
    this.projectId = options.projectId;
    this.pluginId = options.pluginId;
    this.permissions = new Set(options.grantedPermissions);
    this.config = options.configValues;
    this.bridge = options.bridge || new PluginRpcBridge();
  }

  public hasPermission(permission: PluginPermission): boolean {
    return this.permissions.has(permission);
  }

  public getConfig<T = any>(key: string, defaultValue?: T): T {
    if (this.config && key in this.config) {
      return this.config[key] as T;
    }
    return defaultValue as T;
  }

  public async fetchCmsCollections(): Promise<any[]> {
    if (!this.hasPermission('cms:read')) {
      throw new Error(`Permission denied: "cms:read" required to access CMS collections.`);
    }
    if (typeof window !== 'undefined' && window.parent) {
      return this.bridge.callHost(window.parent, 'cms:listCollections', { projectId: this.projectId });
    }
    return [];
  }

  public async requestOutboundFetch(url: string, init?: RequestInit): Promise<Response> {
    if (!this.hasPermission('network:outbound')) {
      throw new Error(`Permission denied: "network:outbound" required to perform network calls.`);
    }
    return fetch(url, init);
  }

  public notifyHost(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    if (typeof window !== 'undefined' && window.parent) {
      this.bridge.callHost(window.parent, 'studio:notify', { message, type });
    }
  }

  public getBridge(): PluginRpcBridge {
    return this.bridge;
  }
}

export abstract class NirmaanifyPlugin {
  abstract readonly manifest: PluginManifest;

  async onInit?(context: PluginExecutionContext): Promise<void>;
  async onDestroy?(): Promise<void>;

  // Code generator AST hooks
  transformNextConfig?(config: Record<string, any>): Record<string, any>;
  injectRootProviders?(): Array<{ importStatement: string; providerJsx: string }>;
  registerBackendRoutes?(): Array<{ method: string; path: string; handlerName: string }>;
}
