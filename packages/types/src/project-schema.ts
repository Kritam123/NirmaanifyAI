import { z } from 'zod';
import { ProjectType } from './backend';

// ==========================================
// 1. COMPONENT NODE SCHEMA
// ==========================================

export interface ComponentNodeStyle {
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  color?: string;
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  boxShadow?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  width?: string;
  maxWidth?: string;
  height?: string;
  minHeight?: string;
  display?: 'flex' | 'grid' | 'block' | 'inline-block' | 'inline-flex';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  gap?: string;
  gridTemplateColumns?: string;
  opacity?: number;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  customCss?: string;
  [key: string]: any;
}

export interface ComponentNode {
  id: string;
  type: string;
  name: string;
  props: Record<string, any>;
  style?: ComponentNodeStyle;
  children?: ComponentNode[];
  slots?: Record<string, ComponentNode[]>;
  parent?: string | null;
  isLocked?: boolean;
  isHidden?: boolean;
}

export const ComponentNodeStyleSchema = z.record(z.any());

export const ComponentNodeSchema: z.ZodType<ComponentNode, any, any> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    type: z.string().min(1),
    name: z.string().min(1),
    props: z.record(z.any()).default({}),
    style: ComponentNodeStyleSchema.optional(),
    children: z.array(z.lazy(() => ComponentNodeSchema)).optional(),
    slots: z.record(z.array(z.lazy(() => ComponentNodeSchema))).optional(),
    parent: z.string().nullable().optional(),
    isLocked: z.boolean().optional(),
    isHidden: z.boolean().optional(),
  })
);

// ==========================================
// 2. PAGE SCHEMA
// ==========================================

export interface PageSeo {
  title?: string;
  description?: string;
  ogImage?: string;
  keywords?: string[];
  canonicalUrl?: string;
  noIndex?: boolean;
}

export interface PageSchema {
  id: string;
  name: string;
  path: string;
  title: string;
  description?: string;
  isProtected?: boolean;
  layout?: 'default' | 'blank' | 'dashboard' | 'sidebar' | 'centered';
  seo?: PageSeo;
  rootNode: ComponentNode;
  createdAt?: string;
  updatedAt?: string;
}

export const PageSeoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  ogImage: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  canonicalUrl: z.string().optional(),
  noIndex: z.boolean().optional(),
});

export const PageSchemaValidator = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  path: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  isProtected: z.boolean().optional().default(false),
  layout: z.enum(['default', 'blank', 'dashboard', 'sidebar', 'centered']).optional().default('default'),
  seo: PageSeoSchema.optional(),
  rootNode: ComponentNodeSchema,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// ==========================================
// 3. THEME & SETTINGS SCHEMA
// ==========================================

export interface ThemeSchema {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily: {
    heading: string;
    body: string;
    mono: string;
  };
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  tokens?: Record<string, string>;
}

export const ThemeSchemaValidator = z.object({
  mode: z.enum(['light', 'dark', 'system']).default('dark'),
  primaryColor: z.string().default('#635BFF'),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  fontFamily: z.object({
    heading: z.string().default('Inter'),
    body: z.string().default('Inter'),
    mono: z.string().default('JetBrains Mono'),
  }),
  borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'xl', 'full']).default('md'),
  tokens: z.record(z.string()).optional(),
});

export interface ProjectSettingsSchema {
  name: string;
  slug: string;
  description?: string;
  favicon?: string;
  responsive: {
    mobile: number;
    tablet: number;
    desktop: number;
    widescreen: number;
  };
  analyticsId?: string;
  customHeadTags?: string;
}

export const ProjectSettingsValidator = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  favicon: z.string().optional(),
  responsive: z.object({
    mobile: z.number().default(375),
    tablet: z.number().default(768),
    desktop: z.number().default(1280),
    widescreen: z.number().default(1536),
  }).default({
    mobile: 375,
    tablet: 768,
    desktop: 1280,
    widescreen: 1536,
  }),
  analyticsId: z.string().optional(),
  customHeadTags: z.string().optional(),
});

// ==========================================
// 4. ASSETS & DATA SOURCES SCHEMA
// ==========================================

export interface ProjectAsset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'font' | 'icon' | 'document';
  size?: number;
  dimensions?: { width: number; height: number };
}

export interface ProjectDataSource {
  id: string;
  name: string;
  type: 'rest' | 'graphql' | 'static' | 'mock';
  endpoint?: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  data?: any;
}

export interface ProjectPluginConfig {
  name: string;
  category: string;
  enabled: boolean;
  config?: Record<string, any>;
}

export interface ProjectPackageConfig {
  name: string;
  version: string;
  scope: 'dependencies' | 'devDependencies';
}

export interface ProjectBackendConfig {
  enabled: boolean;
  framework: string;
  modules: string[];
  databaseEngine: string;
}

// ==========================================
// 5. MASTER PROJECT JSON SCHEMA
// ==========================================

export interface ProjectSchema {
  version: string; // e.g. "1.0.0"
  id: string;
  settings: ProjectSettingsSchema;
  theme: ThemeSchema;
  pages: PageSchema[];
  assets: ProjectAsset[];
  dataSources: ProjectDataSource[];
  packages: ProjectPackageConfig[];
  plugins: ProjectPluginConfig[];
  backendConfiguration: ProjectBackendConfig;
  createdAt: string;
  updatedAt: string;
}

export const ProjectSchemaValidator = z.object({
  version: z.string().default('1.0.0'),
  id: z.string().min(1),
  settings: ProjectSettingsValidator,
  theme: ThemeSchemaValidator,
  pages: z.array(PageSchemaValidator),
  assets: z.array(z.any()).default([]),
  dataSources: z.array(z.any()).default([]),
  packages: z.array(z.any()).default([]),
  plugins: z.array(z.any()).default([]),
  backendConfiguration: z.object({
    enabled: z.boolean().default(false),
    framework: z.string().default('NestJS 11'),
    modules: z.array(z.string()).default([]),
    databaseEngine: z.string().default('PostgreSQL 16'),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});
