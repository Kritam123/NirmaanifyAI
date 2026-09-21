// ==========================================
// PHASE 10: PACKAGE & LIBRARY TYPES
// ==========================================

export type PackageCategory =
  | 'UI_FRAMEWORK'
  | 'ANIMATION_ENGINE'
  | 'FORM_ENGINE'
  | 'DATA_VISUALIZATION'
  | 'ICONS'
  | 'STATE_MANAGEMENT'
  | 'UTILITY'
  | 'CUSTOM_NPM';

export type PackageInstallStatus =
  | 'PENDING'
  | 'INSTALLING'
  | 'INSTALLED'
  | 'FAILED'
  | 'REMOVING';

export interface RequiredProviderDefinition {
  name: string;
  importPath: string;
  isClientOnly: boolean;
  props?: Record<string, any>;
}

export interface PackageDefinition {
  name: string;
  displayName: string;
  version: string;
  category: PackageCategory;
  description: string;
  homepage?: string;
  icon?: string;
  isOfficialPreset: boolean;
  requiredPeerDeps?: Record<string, string>;
  incompatibleWith?: string[];
  requiredProviders?: RequiredProviderDefinition[];
  cssRequirements?: Array<{
    type: 'stylesheet' | 'tailwind-plugin' | 'css-module';
    entry: string;
  }>;
}

export interface CompatibilityIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  affectedDependency?: string;
  suggestedFix?: string;
}

export interface CompatibilityCheckRequest {
  projectId: string;
  packageName: string;
  version?: string;
  targetEnvironment?: 'frontend' | 'backend';
}

export interface CompatibilityCheckResponse {
  compatible: boolean;
  score: number; // 0 to 100
  packageName: string;
  targetVersion: string;
  issues: CompatibilityIssue[];
  requiredPeerDependencies: Record<string, string>;
  rootProviderModifications: string[];
}

export interface ProjectPackageDto {
  id: string;
  projectId: string;
  name: string;
  version: string;
  resolvedVersion?: string | null;
  category: PackageCategory;
  isDevDependency: boolean;
  status: PackageInstallStatus;
  metadata?: Record<string, any>;
  installedAt: string;
  updatedAt: string;
}

export interface InstallPackageDto {
  name: string;
  version?: string;
  category?: PackageCategory;
  isDevDependency?: boolean;
}

export interface SwitchPresetDto {
  category: 'UI_FRAMEWORK' | 'ANIMATION_ENGINE' | 'FORM_ENGINE';
  targetPreset: string; // e.g. "shadcn/ui", "@mui/material", "framer-motion", "gsap"
}

export interface NpmRegistrySearchResult {
  name: string;
  version: string;
  description: string;
  keywords?: string[];
  date: string;
  links: {
    npm: string;
    homepage?: string;
    repository?: string;
  };
  publisher: {
    username: string;
    email: string;
  };
  compatibilityScore?: number;
  isOfficial?: boolean;
}
