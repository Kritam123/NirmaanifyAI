import { z } from 'zod';

// ============================================================================
// 1. BACKEND MODULE DEFINITIONS
// ============================================================================

export type BackendModuleId =
  | 'auth'
  | 'users'
  | 'products'
  | 'categories'
  | 'orders'
  | 'payments'
  | 'blog'
  | 'notifications'
  | 'uploads';

export interface BackendEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  auth: boolean;
  roles?: string[];
  summary?: string;
}

export interface BackendModuleConfig {
  id: BackendModuleId;
  name: string;
  description: string;
  enabled: boolean;
  routePrefix: string;
  requiresAuth: boolean;
  roles?: string[];
  entities: string[];
  endpoints: BackendEndpoint[];
}

export interface BackendEnvVar {
  key: string;
  value: string;
  isSecret: boolean;
  description?: string;
}

export interface ProjectBackendSchema {
  enabled: boolean;
  framework: 'nestjs-11';
  databaseEngine: 'postgresql-16';
  orm: 'prisma-6';
  port: number;
  apiPrefix: string;
  modules: BackendModuleConfig[];
  envVariables: BackendEnvVar[];
}

export interface GeneratedFile {
  path: string;
  content: string;
  language: 'typescript' | 'prisma' | 'json' | 'env' | 'markdown';
  description?: string;
}

export const BackendModuleConfigSchema = z.object({
  id: z.enum([
    'auth',
    'users',
    'products',
    'categories',
    'orders',
    'payments',
    'blog',
    'notifications',
    'uploads',
  ]),
  name: z.string(),
  description: z.string(),
  enabled: z.boolean().default(true),
  routePrefix: z.string(),
  requiresAuth: z.boolean().default(false),
  roles: z.array(z.string()).optional(),
  entities: z.array(z.string()).default([]),
  endpoints: z.array(
    z.object({
      path: z.string(),
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
      description: z.string(),
      auth: z.boolean().default(false),
      roles: z.array(z.string()).optional(),
      summary: z.string().optional(),
    })
  ),
});

export const ProjectBackendSchemaValidator = z.object({
  enabled: z.boolean().default(true),
  framework: z.literal('nestjs-11').default('nestjs-11'),
  databaseEngine: z.literal('postgresql-16').default('postgresql-16'),
  orm: z.literal('prisma-6').default('prisma-6'),
  port: z.number().default(4000),
  apiPrefix: z.string().default('api/v1'),
  modules: z.array(BackendModuleConfigSchema).default([]),
  envVariables: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
        isSecret: z.boolean().default(false),
        description: z.string().optional(),
      })
    )
    .default([]),
});

export function getDefaultBackendSchema(projectName: string = 'MyApp'): ProjectBackendSchema {
  return {
    enabled: true,
    framework: 'nestjs-11',
    databaseEngine: 'postgresql-16',
    orm: 'prisma-6',
    port: 4000,
    apiPrefix: 'api/v1',
    modules: [
      {
        id: 'auth',
        name: 'Authentication Module',
        description: 'JWT Authentication, password hashing (bcrypt), and role authorization guards.',
        enabled: true,
        routePrefix: 'auth',
        requiresAuth: false,
        entities: ['User', 'RefreshToken'],
        endpoints: [
          { path: '/register', method: 'POST', description: 'Register new user account with hashed password', auth: false },
          { path: '/login', method: 'POST', description: 'Authenticate user credentials and return JWT bearer token', auth: false },
          { path: '/profile', method: 'GET', description: 'Retrieve authenticated user session profile', auth: true },
          { path: '/refresh', method: 'POST', description: 'Refresh expired access token with refresh token', auth: false },
        ],
      },
      {
        id: 'users',
        name: 'Users Management',
        description: 'User profile management, role assignment, and account settings.',
        enabled: true,
        routePrefix: 'users',
        requiresAuth: true,
        roles: ['ADMIN', 'DEVELOPER'],
        entities: ['User'],
        endpoints: [
          { path: '/', method: 'GET', description: 'List all registered users (paginated)', auth: true, roles: ['ADMIN'] },
          { path: '/:id', method: 'GET', description: 'Get user details by ID', auth: true },
          { path: '/:id', method: 'PUT', description: 'Update user profile & role', auth: true },
          { path: '/:id', method: 'DELETE', description: 'Delete user account', auth: true, roles: ['ADMIN'] },
        ],
      },
      {
        id: 'products',
        name: 'E-Commerce Products',
        description: 'Product catalog, pricing, inventory stock, and categories.',
        enabled: true,
        routePrefix: 'products',
        requiresAuth: false,
        entities: ['Product', 'Category'],
        endpoints: [
          { path: '/', method: 'GET', description: 'List all catalog products with search and category filters', auth: false },
          { path: '/:id', method: 'GET', description: 'Get single product by ID or slug', auth: false },
          { path: '/', method: 'POST', description: 'Create new catalog item', auth: true, roles: ['ADMIN'] },
          { path: '/:id', method: 'PUT', description: 'Update product information and stock', auth: true, roles: ['ADMIN'] },
          { path: '/:id', method: 'DELETE', description: 'Remove product from catalog', auth: true, roles: ['ADMIN'] },
        ],
      },
      {
        id: 'categories',
        name: 'Categories & Taxonomies',
        description: 'Hierarchical taxonomies and category groupings for items.',
        enabled: true,
        routePrefix: 'categories',
        requiresAuth: false,
        entities: ['Category'],
        endpoints: [
          { path: '/', method: 'GET', description: 'List all category taxonomies', auth: false },
          { path: '/', method: 'POST', description: 'Create new category', auth: true, roles: ['ADMIN'] },
          { path: '/:id', method: 'DELETE', description: 'Delete category', auth: true, roles: ['ADMIN'] },
        ],
      },
      {
        id: 'orders',
        name: 'Orders & Checkout',
        description: 'Order placement, customer association, order status tracking, and line items.',
        enabled: true,
        routePrefix: 'orders',
        requiresAuth: true,
        entities: ['Order', 'OrderItem'],
        endpoints: [
          { path: '/', method: 'GET', description: 'List customer orders', auth: true },
          { path: '/:id', method: 'GET', description: 'Get order breakdown and receipt by ID', auth: true },
          { path: '/checkout', method: 'POST', description: 'Create new order and reserve inventory items', auth: true },
          { path: '/:id/status', method: 'PUT', description: 'Update order status (PENDING, PAID, SHIPPED, COMPLETED)', auth: true, roles: ['ADMIN'] },
        ],
      },
      {
        id: 'payments',
        name: 'Payments & Stripe Webhooks',
        description: 'Payment intent creation, checkout sessions, and webhook processing.',
        enabled: true,
        routePrefix: 'payments',
        requiresAuth: true,
        entities: ['Payment'],
        endpoints: [
          { path: '/create-intent', method: 'POST', description: 'Create Stripe PaymentIntent for client checkout', auth: true },
          { path: '/webhook', method: 'POST', description: 'Stripe signature webhook listener', auth: false },
        ],
      },
      {
        id: 'blog',
        name: 'Blog & Articles',
        description: 'Rich-text article publications, categories, author associations, and publishing.',
        enabled: true,
        routePrefix: 'blog',
        requiresAuth: false,
        entities: ['Post', 'Author'],
        endpoints: [
          { path: '/posts', method: 'GET', description: 'List published articles with pagination and tags', auth: false },
          { path: '/posts/:slug', method: 'GET', description: 'Get single article content by slug', auth: false },
          { path: '/posts', method: 'POST', description: 'Create new draft blog post', auth: true },
          { path: '/posts/:id/publish', method: 'PUT', description: 'Publish post live', auth: true },
        ],
      },
      {
        id: 'notifications',
        name: 'Notifications & Dispatcher',
        description: 'Email dispatching, push alerts, and in-app message notifications.',
        enabled: false,
        routePrefix: 'notifications',
        requiresAuth: true,
        entities: ['Notification'],
        endpoints: [
          { path: '/', method: 'GET', description: 'Get user notifications feed', auth: true },
          { path: '/:id/read', method: 'PUT', description: 'Mark notification as read', auth: true },
        ],
      },
      {
        id: 'uploads',
        name: 'File & Media Storage',
        description: 'Multipart file uploads with AWS S3 / local disk drivers and signed URLs.',
        enabled: true,
        routePrefix: 'uploads',
        requiresAuth: true,
        entities: ['FileAsset'],
        endpoints: [
          { path: '/file', method: 'POST', description: 'Upload file / image with multer parser', auth: true },
          { path: '/signed-url', method: 'GET', description: 'Generate presigned S3 upload URL', auth: true },
        ],
      },
    ],
    envVariables: [
      { key: 'PORT', value: '4000', isSecret: false, description: 'Application HTTP listening port' },
      { key: 'DATABASE_URL', value: 'postgresql://postgres:postgres@localhost:5432/nirmaanify_app?schema=public', isSecret: true, description: 'PostgreSQL connection string' },
      { key: 'JWT_SECRET', value: 'super-secret-jwt-key-change-in-production', isSecret: true, description: 'JWT signing secret key' },
      { key: 'JWT_EXPIRATION', value: '7d', isSecret: false, description: 'Access token duration' },
      { key: 'NODE_ENV', value: 'development', isSecret: false, description: 'Node runtime environment' },
    ],
  };
}
