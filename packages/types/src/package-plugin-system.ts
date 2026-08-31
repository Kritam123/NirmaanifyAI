import { z } from 'zod';

// ============================================================================
// 1. PACKAGE & LIBRARY DEFINITIONS
// ============================================================================

export type PackageCategory =
  | 'ui'
  | 'animation'
  | 'forms'
  | 'state'
  | 'charts'
  | 'utils';

export interface PackageDefinition {
  id: string;
  name: string;
  npmPackage: string;
  version: string;
  description: string;
  category: PackageCategory;
  frameworks: ('nextjs-15' | 'react-19' | 'nestjs-11')[];
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  conflictsWith?: string[];
  isInstalled?: boolean;
  author?: string;
  downloads?: string;
  icon?: string;
}

export interface InstalledPackageRecord {
  npmPackage: string;
  version: string;
  category: PackageCategory;
  installedAt: string;
}

// ============================================================================
// 2. PLUGIN SDK & MARKETPLACE SPECIFICATION
// ============================================================================

export type PluginCategory =
  | 'UI'
  | 'Animation'
  | 'Payments'
  | 'Authentication'
  | 'Analytics'
  | 'SEO'
  | 'Forms'
  | 'CMS'
  | 'Deployment';

export type PluginPermission =
  | 'read:project'
  | 'write:schema'
  | 'inject:dependencies'
  | 'network:access'
  | 'storage:access'
  | 'custom:backend';

export type PluginStatus = 'INSTALLED' | 'ACTIVE' | 'INACTIVE' | 'UNINSTALLED';

export interface PluginConfigField {
  type: 'string' | 'number' | 'boolean' | 'secret';
  label: string;
  defaultValue?: any;
  description?: string;
  required?: boolean;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: PluginCategory;
  icon?: string;
  rating?: number;
  downloads?: string;
  permissions: PluginPermission[];
  configSchema?: Record<string, PluginConfigField>;
  hooks?: {
    onInit?: string;
    onGenerateCode?: string;
    onDeploy?: string;
  };
}

export interface InstalledPlugin {
  pluginId: string;
  manifest: PluginManifest;
  status: PluginStatus;
  config: Record<string, any>;
  installedAt: string;
}

export interface ProjectPackagesAndPlugins {
  installedPackages: InstalledPackageRecord[];
  installedPlugins: InstalledPlugin[];
}

export const PackageDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  npmPackage: z.string(),
  version: z.string(),
  description: z.string(),
  category: z.enum(['ui', 'animation', 'forms', 'state', 'charts', 'utils']),
  frameworks: z.array(z.enum(['nextjs-15', 'react-19', 'nestjs-11'])),
  dependencies: z.record(z.string()).optional(),
  peerDependencies: z.record(z.string()).optional(),
  conflictsWith: z.array(z.string()).optional(),
  isInstalled: z.boolean().optional(),
  author: z.string().optional(),
  downloads: z.string().optional(),
  icon: z.string().optional(),
});

export const PluginManifestSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  author: z.string(),
  description: z.string(),
  category: z.enum([
    'UI',
    'Animation',
    'Payments',
    'Authentication',
    'Analytics',
    'SEO',
    'Forms',
    'CMS',
    'Deployment',
  ]),
  icon: z.string().optional(),
  rating: z.number().optional(),
  downloads: z.string().optional(),
  permissions: z.array(
    z.enum([
      'read:project',
      'write:schema',
      'inject:dependencies',
      'network:access',
      'storage:access',
      'custom:backend',
    ])
  ),
  configSchema: z
    .record(
      z.object({
        type: z.enum(['string', 'number', 'boolean', 'secret']),
        label: z.string(),
        defaultValue: z.any().optional(),
        description: z.string().optional(),
        required: z.boolean().optional(),
      })
    )
    .optional(),
  hooks: z
    .object({
      onInit: z.string().optional(),
      onGenerateCode: z.string().optional(),
      onDeploy: z.string().optional(),
    })
    .optional(),
});

export const ProjectPackagesAndPluginsValidator = z.object({
  installedPackages: z.array(
    z.object({
      npmPackage: z.string(),
      version: z.string(),
      category: z.enum(['ui', 'animation', 'forms', 'state', 'charts', 'utils']),
      installedAt: z.string(),
    })
  ).default([]),
  installedPlugins: z.array(
    z.object({
      pluginId: z.string(),
      manifest: PluginManifestSchema,
      status: z.enum(['INSTALLED', 'ACTIVE', 'INACTIVE', 'UNINSTALLED']),
      config: z.record(z.any()),
      installedAt: z.string(),
    })
  ).default([]),
});

export function getDefaultPackagesAndPlugins(): ProjectPackagesAndPlugins {
  return {
    installedPackages: [
      { npmPackage: 'lucide-react', version: '^1.16.0', category: 'ui', installedAt: new Date().toISOString() },
      { npmPackage: 'clsx', version: '^2.1.1', category: 'utils', installedAt: new Date().toISOString() },
      { npmPackage: 'tailwind-merge', version: '^3.0.2', category: 'utils', installedAt: new Date().toISOString() },
      { npmPackage: 'zod', version: '^3.24.2', category: 'forms', installedAt: new Date().toISOString() },
    ],
    installedPlugins: [
      {
        pluginId: 'plugin-seo-optimizer',
        manifest: {
          id: 'plugin-seo-optimizer',
          name: 'AI SEO & OpenGraph Optimizer',
          version: '1.2.0',
          author: 'Nirmaanify Labs',
          description: 'Auto-generates meta tags, OpenGraph previews, JSON-LD schemas, and sitemap.xml.',
          category: 'SEO',
          icon: 'Sparkles',
          rating: 4.9,
          downloads: '14.2k',
          permissions: ['read:project', 'write:schema'],
          configSchema: {
            siteTitle: { type: 'string', label: 'Default Site Title', defaultValue: 'My Nirmaanify App' },
            twitterHandle: { type: 'string', label: 'Twitter / X Handle', defaultValue: '@nirmaanify' },
            enableSitemap: { type: 'boolean', label: 'Generate sitemap.xml', defaultValue: true },
          },
        },
        status: 'ACTIVE',
        config: {
          siteTitle: 'My Fullstack Nirmaanify Application',
          twitterHandle: '@nirmaanify',
          enableSitemap: true,
        },
        installedAt: new Date().toISOString(),
      },
    ],
  };
}
