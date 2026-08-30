export type UserRole = 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'EDITOR' | 'VIEWER' | 'MEMBER';

export interface UserDto {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface WorkspaceMemberDto {
  id: string;
  workspaceId: string;
  userId: string;
  role: UserRole;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
  };
  createdAt: string | Date;
}

export interface WorkspaceDto {
  id: string;
  name: string;
  slug: string;
  isPersonal: boolean;
  ownerId: string;
  role?: UserRole;
  projectCount?: number;
  memberCount?: number;
  members?: WorkspaceMemberDto[];
  createdAt: string | Date;
  updatedAt: string | Date;
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
  isArchived?: boolean;
  status?: string;
  projectSchema: Record<string, any>;
  aiPlan?: any;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AuthResponseDto {
  user: UserDto;
  accessToken: string;
  refreshToken?: string;
  activeWorkspace: WorkspaceDto;
  workspaces: WorkspaceDto[];
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
