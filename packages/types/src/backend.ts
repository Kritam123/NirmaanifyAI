export type UserRole = 'ADMIN' | 'MEMBER' | 'VIEWER' | 'OWNER';

export interface UserDto {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceDto {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectType =
  | 'WEBSITE'
  | 'BLOG'
  | 'ECOMMERCE'
  | 'PORTFOLIO'
  | 'DASHBOARD'
  | 'SAAS'
  | 'CUSTOM';

export interface ProjectDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: ProjectType;
  workspaceId: string;
  framework: string;
  uiLibrary: string;
  isBackendEnabled: boolean;
  projectSchema: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  data: T;
  message?: string;
  timestamp: string;
  path?: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: any[];
  timestamp: string;
  path?: string;
}

export interface HealthCheckResult {
  status: 'ok' | 'error';
  info?: Record<string, { status: string; message?: string }>;
  error?: Record<string, { status: string; message?: string }>;
  details: Record<string, { status: string; message?: string }>;
}
