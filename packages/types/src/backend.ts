export type AuthProvider = 'CREDENTIALS' | 'GOOGLE' | 'GITHUB';

export type UserRole = 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'EDITOR' | 'VIEWER' | 'MEMBER';

export interface SocialAccountDto {
  id: string;
  userId: string;
  provider: AuthProvider;
  providerAccountId: string;
  email?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresAt?: number | null;
  tokenType?: string | null;
  scope?: string | null;
  idToken?: string | null;
  profileData?: Record<string, any>;
  lastLoginAt: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface UserDto {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  primaryProvider?: AuthProvider;
  socialAccounts?: SocialAccountDto[];
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type MembershipStatus = 'ACTIVE' | 'PENDING' | 'INVITED';

export interface WorkspaceMemberDto {
  id: string;
  workspaceId: string;
  userId: string;
  role: UserRole;
  status?: MembershipStatus;
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
  projectSchema: Record<string, any>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  avatarUrl?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface OAuthLoginDto {
  provider: AuthProvider;
  providerAccountId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  idToken?: string;
  profileData?: Record<string, any>;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface VerifyEmailDto {
  token: string;
}

export interface CreateWorkspaceDto {
  name: string;
  slug?: string;
  isPersonal?: boolean;
}

export interface InviteMemberDto {
  email: string;
  role: UserRole;
}

export interface AuthResponseDto {
  user: UserDto;
  accessToken: string;
  refreshToken?: string;
  activeWorkspace?: WorkspaceDto | null;
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

