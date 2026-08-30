import { ProjectType } from './backend';

export interface PlanPage {
  name: string;
  path: string;
  description: string;
  isProtected?: boolean;
  components: string[];
}

export interface PlanFeature {
  title: string;
  description: string;
  category: 'auth' | 'core' | 'billing' | 'admin' | 'ui' | 'integration';
}

export interface PlanComponent {
  name: string;
  type: 'ui' | 'layout' | 'feature' | 'form';
  source: 'shadcn' | 'custom' | 'radix';
  description: string;
}

export interface PlanPackage {
  name: string;
  version?: string;
  scope: 'dependencies' | 'devDependencies';
  purpose: string;
}

export interface PlanApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
}

export interface PlanBackendModule {
  name: string;
  description: string;
  endpoints: PlanApiEndpoint[];
}

export interface PlanQueueJob {
  queue: string;
  jobName: string;
  description: string;
}

export interface PlanBackendRequirements {
  enabled: boolean;
  framework: string;
  modules: PlanBackendModule[];
  auth: {
    type: 'jwt' | 'session' | 'oauth';
    providers: string[];
  };
  queueJobs?: PlanQueueJob[];
}

export interface PlanDatabaseField {
  name: string;
  type: string;
  isPrimary?: boolean;
  isUnique?: boolean;
  isNullable?: boolean;
  relation?: string;
}

export interface PlanDatabaseModel {
  name: string;
  description: string;
  fields: PlanDatabaseField[];
}

export interface PlanDatabaseRequirements {
  engine: string;
  models: PlanDatabaseModel[];
}

export interface PlanCmsCollection {
  name: string;
  fields: string[];
  description: string;
}

export interface PlanCmsRequirements {
  enabled: boolean;
  type: 'Dynamic Headless' | 'Markdown / MDX' | 'Static' | 'None';
  collections: PlanCmsCollection[];
}

export interface PlanPluginRecommendation {
  name: string;
  category: 'Payments' | 'Storage' | 'Auth' | 'Analytics' | 'AI / LLM' | 'Queue' | 'Email';
  reason: string;
  isRecommended: boolean;
}

export interface PlanArchitecture {
  summary: string;
  frontendStack: string[];
  backendStack: string[];
  databaseStack: string[];
  deploymentTarget: string;
  scalabilityNotes: string;
}

export type PlanApprovalStatus = 'DRAFT' | 'REVIEWING' | 'APPROVED' | 'REJECTED';

export interface AIProjectPlan {
  id: string;
  prompt: string;
  name: string;
  slug: string;
  description: string;
  type: ProjectType;
  framework: string;
  uiLibrary: string;
  pages: PlanPage[];
  features: PlanFeature[];
  components: PlanComponent[];
  requiredPackages: PlanPackage[];
  backendRequirements: PlanBackendRequirements;
  databaseRequirements: PlanDatabaseRequirements;
  cmsRequirements: PlanCmsRequirements;
  pluginRecommendations: PlanPluginRecommendation[];
  architecturePlan: PlanArchitecture;
  status: PlanApprovalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratePlanDto {
  prompt: string;
  workspaceId?: string;
  preferredType?: ProjectType;
}

export interface ApprovePlanDto {
  plan: AIProjectPlan;
  workspaceId: string;
  customName?: string;
  customSlug?: string;
}
