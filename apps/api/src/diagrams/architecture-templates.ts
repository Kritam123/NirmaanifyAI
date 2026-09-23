import { ArchitectureTemplateDto } from '@nirmaanify/types';

export const ARCHITECTURE_TEMPLATES: ArchitectureTemplateDto[] = [
  {
    id: 'template-ecommerce-microservices',
    name: 'Event-Driven E-Commerce Microservices',
    category: 'SYSTEM_ARCHITECTURE',
    description: 'High-availability microservice mesh with Kafka event bus, PostgreSQL sharding, Redis cache, and API Gateway.',
    tags: ['Microservices', 'Kafka', 'Redis', 'PostgreSQL', 'API Gateway', 'Docker'],
    document: `# Event-Driven E-Commerce Architecture Spec

## System Summary
High-throughput distributed architecture designed for horizontal scalability, sub-50ms read latency, and at-least-once transactional order processing.

## Components & Responsibilities
- **API Gateway (Envoy / Kong)**: Single ingress point for SSL termination, JWT verification, rate limiting, and route orchestration.
- **Auth & Identity Service**: Handles user sessions, OAuth2 credentials, and RBAC token generation.
- **Product Catalog Service**: Serves product listings with Redis read-through cache for instant response times.
- **Order Processing Service**: Implements Saga orchestration pattern for reliable distributed transactions.
- **Payment Gateway Worker**: Interacts asynchronously with third-party payment providers (Stripe / Adyen).
- **Apache Kafka Event Bus**: Decoupled message streaming for \`order.created\`, \`payment.succeeded\`, and \`inventory.reserved\` events.
- **PostgreSQL Databases**: Dedicated database-per-service pattern ensuring loose coupling.

## Scalability & Resiliency
- Asynchronous decoupling prevents downstream order bottlenecks from degrading catalog browsing.
- Dead Letter Queues (DLQ) on payment failures enable automated retries.
`,
    nodes: [
      {
        id: 'node-client',
        type: 'cloud-service',
        position: { x: 50, y: 220 },
        data: {
          label: 'Client Web / Mobile',
          subtitle: 'React 19 / Native',
          icon: 'client',
          category: 'compute',
          provider: 'generic',
          status: 'active',
        },
      },
      {
        id: 'node-cdn',
        type: 'cloud-service',
        position: { x: 260, y: 220 },
        data: {
          label: 'CloudFront CDN',
          subtitle: 'Edge Caching & WAF',
          icon: 'cloudfront',
          category: 'networking',
          provider: 'aws',
          status: 'active',
        },
      },
      {
        id: 'node-gateway',
        type: 'cloud-service',
        position: { x: 500, y: 220 },
        data: {
          label: 'API Gateway',
          subtitle: 'Envoy / Rate Limiter',
          icon: 'api-gateway',
          category: 'networking',
          provider: 'generic',
          status: 'active',
        },
      },
      {
        id: 'node-auth-svc',
        type: 'cloud-service',
        position: { x: 780, y: 80 },
        data: {
          label: 'Auth Service',
          subtitle: 'Go / JWT / OAuth',
          icon: 'security',
          category: 'security',
          provider: 'generic',
          status: 'active',
        },
      },
      {
        id: 'node-catalog-svc',
        type: 'cloud-service',
        position: { x: 780, y: 220 },
        data: {
          label: 'Catalog Service',
          subtitle: 'Node.js / Express',
          icon: 'compute',
          category: 'compute',
          provider: 'generic',
          status: 'active',
        },
      },
      {
        id: 'node-order-svc',
        type: 'cloud-service',
        position: { x: 780, y: 380 },
        data: {
          label: 'Order Service',
          subtitle: 'NestJS Saga Engine',
          icon: 'compute',
          category: 'compute',
          provider: 'generic',
          status: 'active',
        },
      },
      {
        id: 'node-redis',
        type: 'cloud-service',
        position: { x: 1060, y: 150 },
        data: {
          label: 'Redis Cluster',
          subtitle: 'Catalog & Session Cache',
          icon: 'redis',
          category: 'database',
          provider: 'generic',
          status: 'active',
        },
      },
      {
        id: 'node-kafka',
        type: 'cloud-service',
        position: { x: 1060, y: 380 },
        data: {
          label: 'Kafka Cluster',
          subtitle: 'Topic: order-events',
          icon: 'kafka',
          category: 'queue',
          provider: 'generic',
          status: 'active',
        },
      },
      {
        id: 'node-postgres',
        type: 'cloud-service',
        position: { x: 1060, y: 520 },
        data: {
          label: 'PostgreSQL DB',
          subtitle: 'Primary / Replica',
          icon: 'postgres',
          category: 'database',
          provider: 'generic',
          status: 'active',
        },
      },
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'node-client',
        target: 'node-cdn',
        type: 'smoothstep',
        data: { label: 'HTTPS / TLS 1.3', animated: true },
      },
      {
        id: 'edge-2',
        source: 'node-cdn',
        target: 'node-gateway',
        type: 'smoothstep',
        data: { label: 'Origin Traffic', animated: true },
      },
      {
        id: 'edge-3',
        source: 'node-gateway',
        target: 'node-auth-svc',
        type: 'smoothstep',
        data: { label: 'Validate Token', protocol: 'gRPC' },
      },
      {
        id: 'edge-4',
        source: 'node-gateway',
        target: 'node-catalog-svc',
        type: 'smoothstep',
        data: { label: '/api/v1/products', animated: true },
      },
      {
        id: 'edge-5',
        source: 'node-gateway',
        target: 'node-order-svc',
        type: 'smoothstep',
        data: { label: '/api/v1/orders', animated: true },
      },
      {
        id: 'edge-6',
        source: 'node-catalog-svc',
        target: 'node-redis',
        type: 'smoothstep',
        data: { label: 'Cache Query', protocol: 'TCP' },
      },
      {
        id: 'edge-7',
        source: 'node-order-svc',
        target: 'node-kafka',
        type: 'smoothstep',
        data: { label: 'Publish Event', protocol: 'Kafka', animated: true },
      },
      {
        id: 'edge-8',
        source: 'node-order-svc',
        target: 'node-postgres',
        type: 'smoothstep',
        data: { label: 'ACID Commit', protocol: 'SQL' },
      },
    ],
  },
  {
    id: 'template-aws-serverless',
    name: 'AWS Production Serverless Architecture',
    category: 'CLOUD_INFRASTRUCTURE',
    description: 'Fully managed serverless tier using Route 53, CloudFront, S3, API Gateway, Lambda, and DynamoDB.',
    tags: ['AWS', 'Serverless', 'Lambda', 'DynamoDB', 'S3', 'Cognito'],
    document: `# AWS Serverless Architecture Specification

## Architecture Overview
An elastic, zero-idle-cost cloud architecture leveraging fully managed AWS services with automated scaling from 0 to 100,000+ requests per second.

## Key AWS Services
- **Amazon Route 53**: Geo-distributed DNS routing with health checks.
- **Amazon CloudFront**: Global content delivery network serving static assets from S3.
- **Amazon Cognito**: User identity pools, JWT issuance, and MFA support.
- **Amazon API Gateway**: HTTP API router with Cognito authorizer integration.
- **AWS Lambda**: Stateless execution units running Node.js / Python handlers with provisioned concurrency.
- **Amazon DynamoDB**: Low-latency NoSQL table with global secondary indexes (GSI) and on-demand capacity.
`,
    nodes: [
      {
        id: 'aws-route53',
        type: 'cloud-service',
        position: { x: 80, y: 220 },
        data: {
          label: 'Route 53',
          subtitle: 'DNS & Latency Routing',
          icon: 'route53',
          category: 'networking',
          provider: 'aws',
        },
      },
      {
        id: 'aws-cloudfront',
        type: 'cloud-service',
        position: { x: 300, y: 220 },
        data: {
          label: 'CloudFront',
          subtitle: 'Global CDN',
          icon: 'cloudfront',
          category: 'networking',
          provider: 'aws',
        },
      },
      {
        id: 'aws-s3',
        type: 'cloud-service',
        position: { x: 300, y: 60 },
        data: {
          label: 'S3 Static Bucket',
          subtitle: 'Frontend SPA Build',
          icon: 's3',
          category: 'storage',
          provider: 'aws',
        },
      },
      {
        id: 'aws-cognito',
        type: 'cloud-service',
        position: { x: 550, y: 60 },
        data: {
          label: 'Amazon Cognito',
          subtitle: 'User Pool & JWT Auth',
          icon: 'cognito',
          category: 'security',
          provider: 'aws',
        },
      },
      {
        id: 'aws-apigw',
        type: 'cloud-service',
        position: { x: 550, y: 220 },
        data: {
          label: 'HTTP API Gateway',
          subtitle: 'CORS & Auth Guard',
          icon: 'api-gateway',
          category: 'networking',
          provider: 'aws',
        },
      },
      {
        id: 'aws-lambda',
        type: 'cloud-service',
        position: { x: 800, y: 220 },
        data: {
          label: 'AWS Lambda',
          subtitle: 'REST Handler Runtime',
          icon: 'lambda',
          category: 'compute',
          provider: 'aws',
        },
      },
      {
        id: 'aws-dynamo',
        type: 'cloud-service',
        position: { x: 1050, y: 220 },
        data: {
          label: 'DynamoDB',
          subtitle: 'Single Table Design',
          icon: 'dynamodb',
          category: 'database',
          provider: 'aws',
        },
      },
    ],
    edges: [
      { id: 'ae-1', source: 'aws-route53', target: 'aws-cloudfront', type: 'smoothstep', data: { label: 'DNS Alias' } },
      { id: 'ae-2', source: 'aws-cloudfront', target: 'aws-s3', type: 'smoothstep', data: { label: 'Static Origin' } },
      { id: 'ae-3', source: 'aws-cloudfront', target: 'aws-apigw', type: 'smoothstep', data: { label: '/api/*' } },
      { id: 'ae-4', source: 'aws-apigw', target: 'aws-cognito', type: 'smoothstep', data: { label: 'Verify Bearer' } },
      { id: 'ae-5', source: 'aws-apigw', target: 'aws-lambda', type: 'smoothstep', data: { label: 'Proxy Event', animated: true } },
      { id: 'ae-6', source: 'aws-lambda', target: 'aws-dynamo', type: 'smoothstep', data: { label: 'GetItem / PutItem' } },
    ],
  },
  {
    id: 'template-clean-architecture-uml',
    name: 'Clean Architecture Domain Model (UML)',
    category: 'UML_CLASS',
    description: 'Hexagonal / Clean Architecture UML diagram delineating Domain Entities, Use Cases, Repositories, and Infrastructure Adapters.',
    tags: ['UML', 'Clean Architecture', 'Domain-Driven Design', 'OOP', 'Software Engineering'],
    document: `# Clean Architecture Specification

## Dependency Rule
Source code dependencies must point inward toward higher-level policies:
1. **Entities (Domain)**: Enterprise business rules, aggregate roots, value objects.
2. **Use Cases**: Application business rules orchestrating domain objects.
3. **Interface Adapters**: Controllers, presenters, and repository implementations.
4. **Frameworks & Drivers**: Web server (NestJS), database ORM (Prisma), external SDKs.
`,
    nodes: [
      {
        id: 'uml-entity-user',
        type: 'uml-class',
        position: { x: 500, y: 200 },
        data: {
          label: 'UserEntity',
          stereotype: '<<aggregate root>>',
          umlAttributes: [
            { name: 'id', type: 'UUID', visibility: '+' },
            { name: 'email', type: 'string', visibility: '+' },
            { name: 'passwordHash', type: 'string', visibility: '-' },
          ],
          umlMethods: [
            { name: 'verifyPassword', returnType: 'boolean', visibility: '+', params: 'raw: string' },
            { name: 'updateEmail', returnType: 'void', visibility: '+', params: 'newEmail: string' },
          ],
        },
      },
      {
        id: 'uml-usecase-register',
        type: 'uml-class',
        position: { x: 200, y: 200 },
        data: {
          label: 'RegisterUserUseCase',
          stereotype: '<<use case>>',
          umlAttributes: [
            { name: 'userRepo', type: 'IUserRepository', visibility: '-' },
            { name: 'hasher', type: 'IPasswordHasher', visibility: '-' },
          ],
          umlMethods: [
            { name: 'execute', returnType: 'Promise<UserDto>', visibility: '+', params: 'cmd: RegisterCommand' },
          ],
        },
      },
      {
        id: 'uml-repo-interface',
        type: 'uml-class',
        position: { x: 500, y: 440 },
        data: {
          label: 'IUserRepository',
          stereotype: '<<interface>>',
          umlMethods: [
            { name: 'findById', returnType: 'Promise<UserEntity>', visibility: '+', params: 'id: UUID' },
            { name: 'save', returnType: 'Promise<void>', visibility: '+', params: 'user: UserEntity' },
          ],
        },
      },
      {
        id: 'uml-repo-impl',
        type: 'uml-class',
        position: { x: 800, y: 440 },
        data: {
          label: 'PrismaUserRepository',
          stereotype: '<<adapter>>',
          umlAttributes: [
            { name: 'prisma', type: 'PrismaClient', visibility: '-' },
          ],
          umlMethods: [
            { name: 'findById', returnType: 'Promise<UserEntity>', visibility: '+' },
            { name: 'save', returnType: 'Promise<void>', visibility: '+' },
          ],
        },
      },
    ],
    edges: [
      { id: 'ue-1', source: 'uml-usecase-register', target: 'uml-entity-user', type: 'smoothstep', data: { label: 'instantiates' } },
      { id: 'ue-2', source: 'uml-usecase-register', target: 'uml-repo-interface', type: 'smoothstep', data: { label: 'calls' } },
      { id: 'ue-3', source: 'uml-repo-impl', target: 'uml-repo-interface', type: 'smoothstep', data: { label: 'implements' } },
    ],
  },
  {
    id: 'template-saas-erd',
    name: 'Multi-Tenant SaaS Relational ERD',
    category: 'DATABASE_ERD',
    description: 'Production database schema modeling Organizations, Workspaces, Members, Subscriptions, and Invoices with foreign keys.',
    tags: ['ERD', 'Database', 'PostgreSQL', 'SaaS', 'Prisma'],
    document: `# Multi-Tenant SaaS Database Schema

## Design Patterns
- Strict workspace-level data isolation via \`workspace_id\` foreign keys.
- Role-Based Access Control (RBAC) linking Users to Workspaces through \`workspace_members\`.
- Stripe subscription lifecycle state machine (ACTIVE, PAST_DUE, CANCELED).
`,
    nodes: [
      {
        id: 'erd-users',
        type: 'database-table',
        position: { x: 100, y: 150 },
        data: {
          label: 'users',
          columns: [
            { name: 'id', type: 'UUID', isPrimary: true },
            { name: 'email', type: 'VARCHAR(255)', nullable: false },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'created_at', type: 'TIMESTAMP' },
          ],
        },
      },
      {
        id: 'erd-workspaces',
        type: 'database-table',
        position: { x: 450, y: 150 },
        data: {
          label: 'workspaces',
          columns: [
            { name: 'id', type: 'UUID', isPrimary: true },
            { name: 'owner_id', type: 'UUID', isForeign: true },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'slug', type: 'VARCHAR(50)' },
          ],
        },
      },
      {
        id: 'erd-members',
        type: 'database-table',
        position: { x: 280, y: 380 },
        data: {
          label: 'workspace_members',
          columns: [
            { name: 'id', type: 'UUID', isPrimary: true },
            { name: 'workspace_id', type: 'UUID', isForeign: true },
            { name: 'user_id', type: 'UUID', isForeign: true },
            { name: 'role', type: 'VARCHAR(20)' },
          ],
        },
      },
      {
        id: 'erd-subscriptions',
        type: 'database-table',
        position: { x: 800, y: 150 },
        data: {
          label: 'subscriptions',
          columns: [
            { name: 'id', type: 'UUID', isPrimary: true },
            { name: 'workspace_id', type: 'UUID', isForeign: true },
            { name: 'plan_code', type: 'VARCHAR(50)' },
            { name: 'status', type: 'VARCHAR(30)' },
            { name: 'current_period_end', type: 'TIMESTAMP' },
          ],
        },
      },
    ],
    edges: [
      { id: 'ee-1', source: 'erd-workspaces', target: 'erd-users', type: 'smoothstep', data: { label: 'owner_id -> users.id' } },
      { id: 'ee-2', source: 'erd-members', target: 'erd-workspaces', type: 'smoothstep', data: { label: 'workspace_id' } },
      { id: 'ee-3', source: 'erd-members', target: 'erd-users', type: 'smoothstep', data: { label: 'user_id' } },
      { id: 'ee-4', source: 'erd-subscriptions', target: 'erd-workspaces', type: 'smoothstep', data: { label: 'workspace_id' } },
    ],
  },
];
