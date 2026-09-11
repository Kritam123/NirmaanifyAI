import { PluginManifest, PluginPermission, PluginCategory, StudioSlot } from '@nirmaanify/types';

export function definePluginManifest(manifest: PluginManifest): PluginManifest {
  if (!manifest.id || typeof manifest.id !== 'string') {
    throw new Error('Plugin manifest requires a unique string id.');
  }
  if (!manifest.name || typeof manifest.name !== 'string') {
    throw new Error('Plugin manifest requires a string name.');
  }
  if (!manifest.version || typeof manifest.version !== 'string') {
    throw new Error('Plugin manifest requires a SemVer version string.');
  }
  if (!manifest.category) {
    throw new Error('Plugin manifest requires a valid category.');
  }
  if (!Array.isArray(manifest.permissions)) {
    manifest.permissions = [];
  }
  if (!manifest.configurationSchema) {
    manifest.configurationSchema = { type: 'object', properties: {} };
  }
  return manifest;
}

export const KNOWN_PLUGIN_PERMISSIONS: Record<PluginPermission, string> = {
  'ui:render_slot': 'Render components into Studio UI slots (toolbar, canvas overlay, inspector)',
  'cms:read': 'Read CMS collection entries and fields',
  'cms:write': 'Create or update CMS collections and content records',
  'backend:register_routes': 'Inject custom NestJS backend controllers and endpoints',
  'ai:inject_context': 'Inject custom guidelines and schema context into AI Planner',
  'network:outbound': 'Make outbound HTTP network requests from the sandbox',
  'storage:access': 'Read and write uploaded project assets and media',
  'env:read_secrets': 'Access decrypted plugin environment secrets and API keys',
};
