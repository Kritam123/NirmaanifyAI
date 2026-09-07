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
  isArchived?: boolean;
  status?: string;
  projectSchema: Record<string, any>;
  aiPlan?: any;
  storageDriver?: 'local' | 's3' | 'vercel-blob';
  storageConfig?: Record<string, any>;
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
  token?: string;
  otp?: string;
  email?: string;
}

export interface ResendVerificationDto {
  email: string;
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

// ==========================================
// PHASE 8 — BACKEND BUILDER & NESTJS TYPES
// ==========================================

export type PredefinedModuleId =
  | 'auth'
  | 'users'
  | 'products'
  | 'categories'
  | 'orders'
  | 'payments'
  | 'blog'
  | 'notifications'
  | 'uploads';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface BackendEndpointDefinition {
  method: HttpMethod;
  path: string;
  actionName: string;
  description: string;
  authRequired: boolean;
  requiredRole?: UserRole;
  requestBody?: Record<string, any>;
  responseExample?: Record<string, any>;
}

export interface BackendDatabaseFieldDefinition {
  name: string;
  type: 'String' | 'Int' | 'Float' | 'Boolean' | 'DateTime' | 'Json';
  isId?: boolean;
  isUnique?: boolean;
  isOptional?: boolean;
  defaultValue?: string;
  relationModel?: string;
  relationType?: 'one-to-one' | 'one-to-many' | 'many-to-one';
}

export interface BackendDatabaseModelDefinition {
  name: string;
  tableName: string;
  description: string;
  fields: BackendDatabaseFieldDefinition[];
}

export interface BackendModuleConfig {
  id: PredefinedModuleId;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  endpoints: BackendEndpointDefinition[];
  databaseModel?: BackendDatabaseModelDefinition;
  settings?: Record<string, any>;
}

export interface BackendServerSettings {
  port: number;
  globalPrefix: string;
  databaseEngine: 'postgresql' | 'mysql' | 'sqlite';
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiration: string;
  corsOrigin: string;
  enableSwagger: boolean;
  enableRedis: boolean;
  redisHost?: string;
  redisPort?: number;
}

export interface ProjectBackendSchema {
  enabled: boolean;
  framework: string;
  settings: BackendServerSettings;
  modules: Record<PredefinedModuleId, BackendModuleConfig>;
  customModules?: BackendModuleConfig[];
  updatedAt?: string;
}

export interface NestJsGeneratedFile {
  path: string;
  content: string;
  language: 'typescript' | 'prisma' | 'json' | 'yaml' | 'markdown' | 'env';
  description?: string;
}

export interface NestJsProjectCode {
  projectId: string;
  projectName: string;
  files: Record<string, NestJsGeneratedFile>;
  fileList: string[];
  totalFiles: number;
  generatedAt: string;
}

export const PREDEFINED_BACKEND_MODULES: Record<PredefinedModuleId, BackendModuleConfig> = {
  auth: {
    id: 'auth',
    name: 'Authentication & RBAC',
    description: 'JWT session tokens, password hashing with bcrypt, role-based guards, and OAuth providers.',
    icon: 'Shield',
    enabled: true,
    settings: {
      allowRegistration: true,
      tokenExpiration: '7d',
      providers: ['credentials', 'google', 'github'],
    },
    endpoints: [
      { method: 'POST', path: '/auth/register', actionName: 'register', description: 'Register new user with email & password', authRequired: false },
      { method: 'POST', path: '/auth/login', actionName: 'login', description: 'Authenticate credentials and obtain JWT', authRequired: false },
      { method: 'GET', path: '/auth/me', actionName: 'getProfile', description: 'Fetch authenticated user profile', authRequired: true },
      { method: 'POST', path: '/auth/refresh', actionName: 'refreshToken', description: 'Refresh expired JWT session', authRequired: true },
    ],
    databaseModel: {
      name: 'User',
      tableName: 'users',
      description: 'System user records with credentials and role hierarchy',
      fields: [
        { name: 'id', type: 'String', isId: true, defaultValue: 'uuid()' },
        { name: 'email', type: 'String', isUnique: true },
        { name: 'password', type: 'String' },
        { name: 'name', type: 'String' },
        { name: 'role', type: 'String', defaultValue: '"MEMBER"' },
        { name: 'createdAt', type: 'DateTime', defaultValue: 'now()' },
        { name: 'updatedAt', type: 'DateTime' },
      ],
    },
  },
  users: {
    id: 'users',
    name: 'Users Management',
    description: 'User profile management, user directory pagination, status activation, and administrative control.',
    icon: 'Users',
    enabled: true,
    settings: {
      defaultRole: 'MEMBER',
      requireEmailVerification: false,
    },
    endpoints: [
      { method: 'GET', path: '/users', actionName: 'findAll', description: 'List all users with pagination and search', authRequired: true, requiredRole: 'ADMIN' },
      { method: 'GET', path: '/users/:id', actionName: 'findOne', description: 'Retrieve single user by unique identifier', authRequired: true },
      { method: 'PATCH', path: '/users/:id', actionName: 'update', description: 'Update profile details or user settings', authRequired: true },
      { method: 'DELETE', path: '/users/:id', actionName: 'remove', description: 'Soft-delete or purge user account', authRequired: true, requiredRole: 'ADMIN' },
    ],
  },
  products: {
    id: 'products',
    name: 'Products Catalog',
    description: 'Product catalog CRUD with inventory tracking, category links, pricing, and rich descriptions.',
    icon: 'ShoppingBag',
    enabled: true,
    settings: {
      currency: 'USD',
      enableInventoryTracking: true,
    },
    endpoints: [
      { method: 'GET', path: '/products', actionName: 'findAll', description: 'List products with filtering, price sort, and category filters', authRequired: false },
      { method: 'GET', path: '/products/:id', actionName: 'findOne', description: 'Get detailed product information and stock', authRequired: false },
      { method: 'POST', path: '/products', actionName: 'create', description: 'Create new product item', authRequired: true, requiredRole: 'ADMIN' },
      { method: 'PUT', path: '/products/:id', actionName: 'update', description: 'Update product title, pricing, or stock', authRequired: true, requiredRole: 'ADMIN' },
      { method: 'DELETE', path: '/products/:id', actionName: 'remove', description: 'Delete product item from catalog', authRequired: true, requiredRole: 'ADMIN' },
    ],
    databaseModel: {
      name: 'Product',
      tableName: 'products',
      description: 'E-commerce and marketplace product inventory items',
      fields: [
        { name: 'id', type: 'String', isId: true, defaultValue: 'uuid()' },
        { name: 'title', type: 'String' },
        { name: 'slug', type: 'String', isUnique: true },
        { name: 'description', type: 'String', isOptional: true },
        { name: 'price', type: 'Float' },
        { name: 'stock', type: 'Int', defaultValue: '0' },
        { name: 'imageUrl', type: 'String', isOptional: true },
        { name: 'categoryId', type: 'String', isOptional: true, relationModel: 'Category', relationType: 'many-to-one' },
        { name: 'createdAt', type: 'DateTime', defaultValue: 'now()' },
        { name: 'updatedAt', type: 'DateTime' },
      ],
    },
  },
  categories: {
    id: 'categories',
    name: 'Categories Hierarchy',
    description: 'Hierarchical product and content categories for taxonomy and navigation trees.',
    icon: 'Tag',
    enabled: true,
    settings: {
      allowSubcategories: true,
    },
    endpoints: [
      { method: 'GET', path: '/categories', actionName: 'findAll', description: 'List all categories and nested taxonomy trees', authRequired: false },
      { method: 'GET', path: '/categories/:id', actionName: 'findOne', description: 'Fetch category details by ID or slug', authRequired: false },
      { method: 'POST', path: '/categories', actionName: 'create', description: 'Create category node', authRequired: true, requiredRole: 'ADMIN' },
      { method: 'PUT', path: '/categories/:id', actionName: 'update', description: 'Update category name or parent', authRequired: true, requiredRole: 'ADMIN' },
      { method: 'DELETE', path: '/categories/:id', actionName: 'remove', description: 'Delete category node', authRequired: true, requiredRole: 'ADMIN' },
    ],
    databaseModel: {
      name: 'Category',
      tableName: 'categories',
      description: 'Taxonomy categories for products and blog posts',
      fields: [
        { name: 'id', type: 'String', isId: true, defaultValue: 'uuid()' },
        { name: 'name', type: 'String' },
        { name: 'slug', type: 'String', isUnique: true },
        { name: 'description', type: 'String', isOptional: true },
        { name: 'parentId', type: 'String', isOptional: true },
        { name: 'createdAt', type: 'DateTime', defaultValue: 'now()' },
        { name: 'updatedAt', type: 'DateTime' },
      ],
    },
  },
  orders: {
    id: 'orders',
    name: 'Orders Processing',
    description: 'Order placement lifecycle, line items, status workflows (pending, paid, shipped), and customer invoices.',
    icon: 'ShoppingCart',
    enabled: true,
    settings: {
      taxRate: 0.08,
      defaultStatus: 'PENDING',
    },
    endpoints: [
      { method: 'GET', path: '/orders', actionName: 'findAll', description: 'List customer or administrative orders', authRequired: true },
      { method: 'GET', path: '/orders/:id', actionName: 'findOne', description: 'Fetch order receipt and line item breakdown', authRequired: true },
      { method: 'POST', path: '/orders', actionName: 'create', description: 'Place and checkout order from shopping cart', authRequired: true },
      { method: 'PATCH', path: '/orders/:id/status', actionName: 'updateStatus', description: 'Update order fulfillment status', authRequired: true, requiredRole: 'ADMIN' },
    ],
    databaseModel: {
      name: 'Order',
      tableName: 'orders',
      description: 'Checkout orders with total sum, status, and shipping info',
      fields: [
        { name: 'id', type: 'String', isId: true, defaultValue: 'uuid()' },
        { name: 'userId', type: 'String', relationModel: 'User', relationType: 'many-to-one' },
        { name: 'totalAmount', type: 'Float' },
        { name: 'status', type: 'String', defaultValue: '"PENDING"' },
        { name: 'shippingAddress', type: 'Json', isOptional: true },
        { name: 'items', type: 'Json' },
        { name: 'createdAt', type: 'DateTime', defaultValue: 'now()' },
        { name: 'updatedAt', type: 'DateTime' },
      ],
    },
  },
  payments: {
    id: 'payments',
    name: 'Payments Gateway',
    description: 'Stripe, PayPal, and credit card processing, payment intent creation, receipts, and secure webhook verification.',
    icon: 'CreditCard',
    enabled: false,
    settings: {
      provider: 'stripe',
      currency: 'usd',
      automaticFulfillment: true,
    },
    endpoints: [
      { method: 'POST', path: '/payments/intent', actionName: 'createIntent', description: 'Create Stripe or gateway client secret for checkout', authRequired: true },
      { method: 'POST', path: '/payments/webhook', actionName: 'handleWebhook', description: 'Receive signed gateway webhook callbacks', authRequired: false },
      { method: 'GET', path: '/payments/history', actionName: 'getHistory', description: 'View transaction receipts and payment ledger', authRequired: true },
    ],
    databaseModel: {
      name: 'Payment',
      tableName: 'payments',
      description: 'Transaction records and gateway transaction IDs',
      fields: [
        { name: 'id', type: 'String', isId: true, defaultValue: 'uuid()' },
        { name: 'orderId', type: 'String', relationModel: 'Order', relationType: 'many-to-one' },
        { name: 'amount', type: 'Float' },
        { name: 'currency', type: 'String', defaultValue: '"usd"' },
        { name: 'provider', type: 'String', defaultValue: '"stripe"' },
        { name: 'transactionId', type: 'String', isOptional: true },
        { name: 'status', type: 'String', defaultValue: '"PENDING"' },
        { name: 'createdAt', type: 'DateTime', defaultValue: 'now()' },
      ],
    },
  },
  blog: {
    id: 'blog',
    name: 'Blog & Articles',
    description: 'Article management with rich text Markdown/HTML, tags, slug routing, authors, and publishing workflow.',
    icon: 'FileText',
    enabled: false,
    settings: {
      defaultStatus: 'DRAFT',
      enableComments: false,
    },
    endpoints: [
      { method: 'GET', path: '/blog/posts', actionName: 'findAll', description: 'Fetch published blog posts with pagination', authRequired: false },
      { method: 'GET', path: '/blog/posts/:slug', actionName: 'findBySlug', description: 'Retrieve post article content by URL slug', authRequired: false },
      { method: 'POST', path: '/blog/posts', actionName: 'create', description: 'Author new article post', authRequired: true, requiredRole: 'EDITOR' },
      { method: 'PUT', path: '/blog/posts/:id', actionName: 'update', description: 'Update article title, body, or tags', authRequired: true, requiredRole: 'EDITOR' },
      { method: 'DELETE', path: '/blog/posts/:id', actionName: 'remove', description: 'Delete blog post entry', authRequired: true, requiredRole: 'ADMIN' },
    ],
    databaseModel: {
      name: 'BlogPost',
      tableName: 'blog_posts',
      description: 'Published content articles with author references and tags',
      fields: [
        { name: 'id', type: 'String', isId: true, defaultValue: 'uuid()' },
        { name: 'title', type: 'String' },
        { name: 'slug', type: 'String', isUnique: true },
        { name: 'content', type: 'String' },
        { name: 'excerpt', type: 'String', isOptional: true },
        { name: 'coverImage', type: 'String', isOptional: true },
        { name: 'published', type: 'Boolean', defaultValue: 'false' },
        { name: 'authorId', type: 'String', relationModel: 'User', relationType: 'many-to-one' },
        { name: 'createdAt', type: 'DateTime', defaultValue: 'now()' },
        { name: 'updatedAt', type: 'DateTime' },
      ],
    },
  },
  notifications: {
    id: 'notifications',
    name: 'Notifications Hub',
    description: 'Real-time in-app notifications, read/unread states, push delivery, and transactional email triggers.',
    icon: 'Bell',
    enabled: false,
    settings: {
      retentionDays: 30,
      enableEmailDigest: false,
    },
    endpoints: [
      { method: 'GET', path: '/notifications', actionName: 'findMyNotifications', description: 'Retrieve notification stream for authenticated user', authRequired: true },
      { method: 'PATCH', path: '/notifications/:id/read', actionName: 'markAsRead', description: 'Mark notification as read', authRequired: true },
      { method: 'POST', path: '/notifications/mark-all-read', actionName: 'markAllAsRead', description: 'Mark entire inbox as read', authRequired: true },
      { method: 'POST', path: '/notifications/send', actionName: 'dispatch', description: 'Send targeted notification', authRequired: true, requiredRole: 'ADMIN' },
    ],
    databaseModel: {
      name: 'Notification',
      tableName: 'notifications',
      description: 'In-app notification records per user',
      fields: [
        { name: 'id', type: 'String', isId: true, defaultValue: 'uuid()' },
        { name: 'userId', type: 'String', relationModel: 'User', relationType: 'many-to-one' },
        { name: 'title', type: 'String' },
        { name: 'message', type: 'String' },
        { name: 'read', type: 'Boolean', defaultValue: 'false' },
        { name: 'link', type: 'String', isOptional: true },
        { name: 'createdAt', type: 'DateTime', defaultValue: 'now()' },
      ],
    },
  },
  uploads: {
    id: 'uploads',
    name: 'File Uploads & Assets',
    description: 'Multipart file uploads, presigned cloud upload URLs (S3/R2/MinIO/Blob), CDN asset links, and mime-type validation.',
    icon: 'UploadCloud',
    enabled: true,
    settings: {
      maxFileSizeMb: 25,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf'],
    },
    endpoints: [
      { method: 'POST', path: '/uploads', actionName: 'uploadFile', description: 'Direct multipart file upload to storage driver', authRequired: true },
      { method: 'POST', path: '/uploads/presigned-url', actionName: 'getPresignedUrl', description: 'Generate direct-to-cloud upload authorization URL', authRequired: true },
      { method: 'GET', path: '/uploads', actionName: 'listFiles', description: 'List project uploaded assets', authRequired: true },
      { method: 'DELETE', path: '/uploads/:id', actionName: 'removeFile', description: 'Delete file from cloud storage and registry', authRequired: true },
    ],
    databaseModel: {
      name: 'UploadedFile',
      tableName: 'uploaded_files',
      description: 'Metadata records of stored assets across storage engines',
      fields: [
        { name: 'id', type: 'String', isId: true, defaultValue: 'uuid()' },
        { name: 'filename', type: 'String' },
        { name: 'originalName', type: 'String' },
        { name: 'mimeType', type: 'String' },
        { name: 'size', type: 'Int' },
        { name: 'url', type: 'String' },
        { name: 'uploadedById', type: 'String', isOptional: true },
        { name: 'createdAt', type: 'DateTime', defaultValue: 'now()' },
      ],
    },
  },
};

export const DEFAULT_BACKEND_SERVER_SETTINGS: BackendServerSettings = {
  port: 3001,
  globalPrefix: 'api/v1',
  databaseEngine: 'postgresql',
  databaseUrl: 'postgresql://postgres:postgres@localhost:5432/project_db?schema=public',
  jwtSecret: 'nirmaanify-jwt-secret-replace-in-production-token-32-chars',
  jwtExpiration: '7d',
  corsOrigin: 'http://localhost:3000',
  enableSwagger: true,
  enableRedis: false,
  redisHost: 'localhost',
  redisPort: 6379,
};

export function createDefaultProjectBackendSchema(): ProjectBackendSchema {
  return {
    enabled: true,
    framework: 'NestJS 11',
    settings: { ...DEFAULT_BACKEND_SERVER_SETTINGS },
    modules: JSON.parse(JSON.stringify(PREDEFINED_BACKEND_MODULES)),
    updatedAt: new Date().toISOString(),
  };
}

