import {
  PriorityFeatureItem,
  DevelopmentRuleItem,
  MasterProductFlowNode,
} from '@nirmaanify/types';

export class GovernanceRulesEngine {
  // ==========================================================================
  // 1. MVP PRIORITY MATRIX (P0 / P1 / P2)
  // ==========================================================================

  static getPriorityMatrix(): PriorityFeatureItem[] {
    return [
      // P0 — MUST HAVE (ALL 9 IMPLEMENTED)
      {
        id: 'p0-1',
        tier: 'P0',
        title: 'Nirmaanify Unified Design System',
        description: 'Stripe-inspired Indigo tokens (#635BFF), 12-col responsive grid, Inter typography, dark/light theme.',
        phase: 1,
        status: 'IMPLEMENTED',
      },
      {
        id: 'p0-2',
        tier: 'P0',
        title: 'Authentication & Session Engine',
        description: 'JWT Bearer token authentication, bcrypt password hashing, and user registration.',
        phase: 1,
        status: 'IMPLEMENTED',
      },
      {
        id: 'p0-3',
        tier: 'P0',
        title: 'Project Management & Workspaces',
        description: 'Multi-tenant workspaces with RBAC permissions (Owner, Admin, Dev, Editor, Viewer).',
        phase: 2,
        status: 'IMPLEMENTED',
      },
      {
        id: 'p0-4',
        tier: 'P0',
        title: 'AI Blueprint Planner & Prompt Wizard',
        description: 'Prompt-to-application wizard generating fullstack architectures in 1 click.',
        phase: 4,
        status: 'IMPLEMENTED',
      },
      {
        id: 'p0-5',
        tier: 'P0',
        title: 'Visual Drag-and-Drop Studio Canvas',
        description: 'Multi-viewport interactive canvas (Desktop, Tablet, Mobile) with property inspector and history stack.',
        phase: 6,
        status: 'IMPLEMENTED',
      },
      {
        id: 'p0-6',
        tier: 'P0',
        title: 'Component Registry (30+ Catalog Blocks)',
        description: 'Modular React 19 components with prop validation and ErrorBoundary fallbacks.',
        phase: 5,
        status: 'IMPLEMENTED',
      },
      {
        id: 'p0-7',
        tier: 'P0',
        title: 'Declarative ProjectSchema AST Engine',
        description: 'Single source of truth JSON schema driving renderers and code generators.',
        phase: 5,
        status: 'IMPLEMENTED',
      },
      {
        id: 'p0-8',
        tier: 'P0',
        title: 'Live Preview & Build Diagnostics',
        description: 'Multi-device live preview with real-time terminal stdout/stderr log streaming.',
        phase: 12,
        status: 'IMPLEMENTED',
      },
      {
        id: 'p0-9',
        tier: 'P0',
        title: 'Full-Stack Code Export (ZIP & Docker)',
        description: 'Clean Next.js 15 + NestJS 11 + PostgreSQL 16 + Redis monorepo in-memory packager.',
        phase: 12,
        status: 'IMPLEMENTED',
      },

      // P1 — HIGH PRIORITY (ALL 6 IMPLEMENTED)
      {
        id: 'p1-1',
        tier: 'P1',
        title: 'Dynamic Headless CMS & Field Builder',
        description: 'Collection schemas with 10 field types (Rich Text, Slug, Media, Boolean) and dynamic frontend repeaters.',
        phase: 7,
        status: 'IMPLEMENTED',
      },
      {
        id: 'p1-2',
        tier: 'P1',
        title: 'Optional Full-Stack Backend Toggle',
        description: 'Seamlessly switch between Frontend-Only static web vs Next.js + NestJS microservices.',
        phase: 8,
        status: 'IMPLEMENTED',
      },
      {
        id: 'p1-3',
        tier: 'P1',
        title: 'NestJS 11 Microservices Code Generator',
        description: 'Scaffolds 9 microservices with controllers, services, DTOs, and OpenAPI Swagger documentation.',
        phase: 8,
        status: 'IMPLEMENTED',
      },
      {
        id: 'p1-4',
        tier: 'P1',
        title: 'Database Schema & Prisma ORM Compiler',
        description: 'PostgreSQL relational entity designer with 1:1, 1:N cardinality and Mermaid ER diagrams.',
        phase: 9,
        status: 'IMPLEMENTED',
      },
      {
        id: 'p1-5',
        tier: 'P1',
        title: 'REST API CRUD Builder & Query Sandbox',
        description: 'Auto-generated REST endpoints with interactive Swagger-style sandbox query tester.',
        phase: 9,
        status: 'IMPLEMENTED',
      },
      {
        id: 'p1-6',
        tier: 'P1',
        title: 'Curated Package Library & Conflict Engine',
        description: 'Curated NPM catalog with peer compatibility checks against React 19 and merged package.json.',
        phase: 10,
        status: 'IMPLEMENTED',
      },

      // P2 — POST-MVP SCALING & ADVANCED ECOSYSTEM
      {
        id: 'p2-1',
        tier: 'P2',
        title: 'Advanced Plugin SDK & Sandboxed Marketplace',
        description: 'Third-party developer marketplace with granular capability tokens and webhook listeners.',
        phase: 10,
        status: 'ACTIVE',
      },
      {
        id: 'p2-2',
        tier: 'P2',
        title: 'Multi-Agent Autonomous AI Orchestration DAG',
        description: '7 specialized domain agents (Planner, DB, Backend, CMS, UI, Package, Plugin) with proposal approvals.',
        phase: 11,
        status: 'ACTIVE',
      },
      {
        id: 'p2-3',
        tier: 'P2',
        title: 'Direct GitHub Repository Auto-Sync',
        description: '2-way Git commit syncing with automated pull requests and branch isolation.',
        phase: 12,
        status: 'ACTIVE',
      },
      {
        id: 'p2-4',
        tier: 'P2',
        title: 'Multi-Cloud 1-Click Deployment Providers',
        description: 'Automated CI/CD pipelines to Vercel, Render, Railway, and AWS ECS.',
        phase: 12,
        status: 'ACTIVE',
      },
      {
        id: 'p2-5',
        tier: 'P2',
        title: 'Real-Time Multiplayer Studio Collaboration',
        description: 'Multi-cursor live co-editing canvas powered by CRDTs and WebSockets.',
        phase: 14,
        status: 'PLANNED',
      },
    ];
  }

  // ==========================================================================
  // 2. THE 5 GOLDEN ARCHITECTURE & DEVELOPMENT RULES
  // ==========================================================================

  static getDevelopmentRules(): DevelopmentRuleItem[] {
    return [
      {
        ruleNumber: 1,
        title: 'Build System, Not One-Time Code',
        shortLaw: 'Do not build features directly into the main app without reusable architecture.',
        description: 'Every UI element belongs in @nirmaanify/ui or @nirmaanify/component-registry. Code must be reusable, composable, and type-safe.',
        enforcementMechanism: 'Monorepo package boundaries and TypeScript compiler barriers.',
        isCompliant: true,
      },
      {
        ruleNumber: 2,
        title: 'Internal Design System Adherence',
        shortLaw: 'Do not let AI generate arbitrary UI for the Nirmaanify platform.',
        description: 'All internal dashboard views, studio panels, and modals must strictly follow Nirmaanify Unified Design Tokens (#635BFF, Inter, dark/light theme).',
        enforcementMechanism: 'AI Agent designContext mode set to "platform" with fixed token injection.',
        isCompliant: true,
      },
      {
        ruleNumber: 3,
        title: 'Schema AST vs Generated Code Separation',
        shortLaw: 'PROJECT STATE ≠ GENERATED REACT CODE',
        description: 'Project state is strictly stored as declarative JSON AST (ProjectSchema). The Renderer and Code Generator are pure deterministic functions.',
        enforcementMechanism: 'ProjectSchema → ReactCodeGenerator / NestjsCodeGenerator pipeline.',
        isCompliant: true,
      },
      {
        ruleNumber: 4,
        title: 'Modular & Optional Backend',
        shortLaw: 'Backend is optional — scale from simple static web to enterprise SaaS.',
        description: 'Simple Website (Frontend Only) vs Blog (Frontend + CMS) vs E-Commerce (Fullstack + Stripe) vs SaaS (Fullstack + PostgreSQL + Microservices).',
        enforcementMechanism: 'isBackendEnabled flag in Project schema and conditional code generators.',
        isCompliant: true,
      },
      {
        ruleNumber: 5,
        title: 'Dual Design Context Separation',
        shortLaw: 'Every generated project owns its own design context.',
        description: 'Nirmaanify Platform enforces a fixed unified design system, while user-generated apps enjoy full theme customization and branding freedom.',
        enforcementMechanism: 'Dual Design Context Architecture ("platform" vs "project").',
        isCompliant: true,
      },
    ];
  }

  // ==========================================================================
  // 3. MASTER PRODUCT FLOW (SECTION 10 DIRECTED GRAPH)
  // ==========================================================================

  static getMasterProductFlow(): MasterProductFlowNode[] {
    return [
      {
        id: 'flow-1',
        stepNumber: 1,
        label: 'User Intent & Idea',
        sublabel: 'User describes app vision in natural language',
        domain: 'USER',
        icon: 'User',
        routeTab: 'dashboard',
      },
      {
        id: 'flow-2',
        stepNumber: 2,
        label: 'AI Project Planner',
        sublabel: 'Evaluates prompt & generates architecture blueprint',
        domain: 'PLANNER',
        icon: 'Brain',
        routeTab: 'dashboard',
      },
      {
        id: 'flow-3',
        stepNumber: 3,
        label: 'Architecture Plan & Approval',
        sublabel: 'Interactive review of generated schema & tech stack',
        domain: 'PLANNER',
        icon: 'CheckCircle2',
        routeTab: 'dashboard',
      },
      {
        id: 'flow-4',
        stepNumber: 4,
        label: 'Visual Studio & Canvas',
        sublabel: 'Interactive drag & drop editing with 30+ block catalog',
        domain: 'FRONTEND',
        icon: 'Layout',
        routeTab: 'projects',
      },
      {
        id: 'flow-5',
        stepNumber: 5,
        label: 'Dynamic Headless CMS',
        sublabel: 'Define collections, custom fields & seed content',
        domain: 'CMS',
        icon: 'FileCode',
        routeTab: 'cms',
      },
      {
        id: 'flow-6',
        stepNumber: 6,
        label: 'NestJS Microservices',
        sublabel: 'Configure 9 backend modules, auth & controllers',
        domain: 'BACKEND',
        icon: 'Server',
        routeTab: 'backend',
      },
      {
        id: 'flow-7',
        stepNumber: 7,
        label: 'PostgreSQL Relational DB',
        sublabel: 'Prisma data modeling, ER diagrams & foreign keys',
        domain: 'DATABASE',
        icon: 'Database',
        routeTab: 'database-builder',
      },
      {
        id: 'flow-8',
        stepNumber: 8,
        label: 'Package Library & Plugins',
        sublabel: 'Peer dependency check & sandboxed capabilities',
        domain: 'EXTENSIONS',
        icon: 'Boxes',
        routeTab: 'plugins',
      },
      {
        id: 'flow-9',
        stepNumber: 9,
        label: 'AI Multi-Agent DAG',
        sublabel: 'Specialized domain agents handle complex tasks',
        domain: 'PLANNER',
        icon: 'Sparkles',
        routeTab: 'dashboard',
      },
      {
        id: 'flow-10',
        stepNumber: 10,
        label: 'Live Multi-Device Preview',
        sublabel: 'Real-time test across Desktop, Tablet & Mobile',
        domain: 'DEPLOY',
        icon: 'Eye',
        routeTab: 'deploy',
      },
      {
        id: 'flow-11',
        stepNumber: 11,
        label: 'Build & Terminal Logs',
        sublabel: 'Compiler diagnostics & environment validation',
        domain: 'DEPLOY',
        icon: 'Terminal',
        routeTab: 'deploy',
      },
      {
        id: 'flow-12',
        stepNumber: 12,
        label: 'Export & Multi-Cloud Deploy',
        sublabel: 'Download ZIP, Docker Compose, Vercel, Railway',
        domain: 'DEPLOY',
        icon: 'Rocket',
        routeTab: 'deploy',
      },
    ];
  }
}
