// ==========================================
// PHASE 10: PLUGIN SDK & MARKETPLACE TYPES
// ==========================================

export type PluginCategory =
  | 'UI'
  | 'ANIMATION'
  | 'PAYMENTS'
  | 'AUTHENTICATION'
  | 'ANALYTICS'
  | 'SEO'
  | 'FORMS'
  | 'CMS'
  | 'DEPLOYMENT'
  | 'CUSTOM';

export type PluginReviewStatus =
  | 'UNVERIFIED'
  | 'IN_REVIEW'
  | 'COMMUNITY_VERIFIED'
  | 'OFFICIAL_VERIFIED'
  | 'DEPRECATED'
  | 'FLAGGED_SECURITY';

export type PluginPermission =
  | 'ui:render_slot'           // Render inside Studio UI slots
  | 'cms:read'                // Read CMS collection items
  | 'cms:write'               // Create/modify CMS collections or items
  | 'backend:register_routes' // Inject NestJS controller routes
  | 'ai:inject_context'       // Add domain knowledge to AI planner/agent
  | 'network:outbound'        // Make outbound fetch requests to third-party APIs
  | 'storage:access'          // Read/write project media and assets
  | 'env:read_secrets';       // Access plugin-scoped encrypted secrets

export type StudioSlot =
  | 'studio:toolbar'
  | 'studio:sidebar'
  | 'studio:inspector_tab'
  | 'studio:canvas_overlay'
  | 'studio:settings_tab';

export interface PluginSlotDefinition {
  name: StudioSlot;
  title: string;
  icon?: string;
}

export interface PluginConfigProperty {
  type: 'string' | 'number' | 'boolean';
  title: string;
  description?: string;
  isSecret?: boolean;
  default?: any;
}

export interface PluginConfigurationSchema {
  type: 'object';
  properties: Record<string, PluginConfigProperty>;
  required?: string[];
}

export interface PluginManifest {
  id: string;                      // Unique slug e.g. "stripe-checkout"
  name: string;
  version: string;                 // SemVer e.g. "1.0.0"
  description: string;
  author: {
    name: string;
    url?: string;
  };
  iconUrl?: string;
  category: PluginCategory;
  permissions: PluginPermission[];
  entrypoints: {
    frontend?: string;             // "./frontend/index.js"
    backend?: string;              // "./backend/index.js"
    generator?: string;            // "./generator/index.js"
  };
  slots?: PluginSlotDefinition[];
  configurationSchema: PluginConfigurationSchema;
}

export interface PluginDto {
  id: string;
  slug: string;
  name: string;
  description: string;
  version: string;
  author: string;
  authorUrl?: string | null;
  iconUrl?: string | null;
  category: PluginCategory;
  reviewStatus: PluginReviewStatus;
  isOfficial: boolean;
  manifest: PluginManifest;
  permissions: PluginPermission[];
  downloadCount: number;
  rating: number;
  sourceUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectPluginDto {
  id: string;
  projectId: string;
  pluginId: string;
  version: string;
  isEnabled: boolean;
  grantedPermissions: PluginPermission[];
  configValues: Record<string, any>;
  hasSecretsConfigured: boolean;
  installedAt: string;
  updatedAt: string;
  plugin?: PluginDto;
}

export interface InstallPluginDto {
  pluginId: string;
  version?: string;
  grantedPermissions: PluginPermission[];
  configValues?: Record<string, any>;
  secrets?: Record<string, string>;
}

export interface UpdateProjectPluginDto {
  isEnabled?: boolean;
  grantedPermissions?: PluginPermission[];
  configValues?: Record<string, any>;
  secrets?: Record<string, string>;
}

export interface PluginRpcRequest<T = any> {
  id: string;
  type: 'RPC_REQUEST';
  action: string;
  payload: T;
}

export interface PluginRpcResponse<T = any> {
  id: string;
  type: 'RPC_RESPONSE';
  action: string;
  result?: T;
  error?: string;
}

export type PluginBridgeMessage = PluginRpcRequest | PluginRpcResponse;
