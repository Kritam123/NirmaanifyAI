# PHASE 12 — PREVIEW, BUILD, EXPORT AND DEPLOYMENT

**Product:** Nirmaanify AI  
**Document:** Master Phase Implementation Plan  
**Phase:** 12 — Preview, Build, Export and Deployment  
**Duration:** Week 34–35 (Sprint Cycles 34 & 35)  
**Target:** Live Preview & Sandbox Hot-Reload, Automated Build Runner & Diagnostics, Clean Monorepo ZIP Export, GitHub Direct Push, and Multi-Cloud Deployment Orchestrator (Vercel, Render, Railway, Docker, Self-Hosted)  
**Audience:** Platform Architects, AI Engineers, Full-Stack Developers, DevOps/Cloud Engineers  
**Status:** ✅ FULLY IMPLEMENTED & VERIFIED  

---

## 1. Executive Summary & Architectural Overview

Phase 12 bridges the gap between AI generation in the Visual Studio canvas and real-world production deployment. Generated applications must not remain trapped inside the sandbox: developers must be able to test live builds with comprehensive diagnostics, export clean idiomatic codebases, push directly to GitHub repositories, and trigger 1-click deployments across major hosting providers.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       STUDIO WORKSPACE                                      │
│               Generated Project (Next.js 15 App Router + NestJS 11 + Prisma)                │
└───────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
┌───────────────────────────────────────┐       ┌───────────────────────────────────────┐
│        WEEK 34: PREVIEW & BUILD       │       │    WEEK 35: EXPORT & DEPLOYMENT       │
├───────────────────────────────────────┤       ├───────────────────────────────────────┤
│ • Virtual & Sandbox Build Runner      │       │ • Production Monorepo ZIP Exporter    │
│ • Step-by-Step Build Logs Streaming   │       │ • Direct GitHub Push (Octokit/API)    │
│ • AST & Syntax Validation Engine      │       │ • Docker & Compose Orchestration      │
│ • Environment Variable Validator      │       │ • Multi-Target Deploy Orchestrator    │
│ • Structured Error Diagnostics        │       │   (Vercel, Render, Railway, Docker)   │
└───────────────────────────────────────┘       └───────────────────────────────────────┘
```

---

## 2. Monorepo Export Structure Specification

Every exported project is structured as an enterprise-grade full-stack monorepo ready for immediate local development (`pnpm dev` or `docker compose up`) and CI/CD pipelines:

```text
my-project/
├── frontend/                     # Next.js 15 App Router + React 19
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Root layout with platform/project font & theme
│   │   │   ├── page.tsx          # Home page canvas
│   │   │   ├── globals.css       # Tailwind CSS v4 / tokens
│   │   │   └── providers.tsx     # Theme, QueryClient, Auth providers
│   │   └── components/           # Generated UI components
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── Dockerfile
│
├── backend/                      # NestJS 11 REST API + Prisma 6
│   ├── src/
│   │   ├── main.ts               # Swagger OpenAPI & CORS bootstrap
│   │   ├── app.module.ts         # Module wiring
│   │   └── modules/              # Resource modules (controllers, services, DTOs)
│   ├── prisma/
│   │   └── schema.prisma         # Database schema models
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── Dockerfile
│
├── docker-compose.yml            # Local development orchestration (Postgres + Redis + API + Web)
├── docker-compose.prod.yml       # Production multi-stage compose
├── vercel.json                   # Vercel deployment blueprint for frontend
├── render.yaml                   # Render Blueprint Infrastructure-as-Code
├── railway.json                  # Railway deployment manifest
├── README.md                     # Comprehensive onboarding guide
└── .env.example                  # Strictly typed environment template
```

---

## 3. Database Schema Models (`packages/database/prisma/schema.prisma`)

```prisma
// ==========================================
// PHASE 12: PREVIEW, BUILD, EXPORT & DEPLOY
// ==========================================

enum BuildStatus {
  QUEUED
  BUILDING
  SUCCESS
  FAILED
  CANCELLED
}

enum DeploymentTarget {
  VERCEL
  RENDER
  RAILWAY
  DOCKER
  SELF_HOSTED
  SANDBOX
}

enum DeploymentStatus {
  PENDING
  DEPLOYING
  DEPLOYED
  FAILED
  CANCELLED
}

model ProjectBuild {
  id            String       @id @default(uuid())
  projectId     String
  status        BuildStatus  @default(QUEUED)
  durationMs    Int?
  logs          Json         // Array of { timestamp: string, level: string, message: string, step: string }
  errors        Json?        // Array of { file: string, line?: number, message: string, code?: string, remediation?: string }
  envValidation Json?        // { isValid: boolean, missing: string[], warnings: string[] }
  commitHash    String?
  createdById   String?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  project     Project             @relation(fields: [projectId], references: [id], onDelete: Cascade)
  deployments ProjectDeployment[]

  @@index([projectId])
  @@index([status])
  @@map("project_builds")
}

model ProjectDeployment {
  id          String           @id @default(uuid())
  projectId   String
  buildId     String?
  target      DeploymentTarget @default(DOCKER)
  status      DeploymentStatus @default(PENDING)
  url         String?
  logs        Json             // Array of { timestamp: string, message: string, level: string }
  config      Json?            // Target specific parameters (domain, region, credentials, webhookId)
  createdById String?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  project Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  build   ProjectBuild? @relation(fields: [buildId], references: [id], onDelete: SetNull)

  @@index([projectId])
  @@index([target])
  @@index([status])
  @@map("project_deployments")
}
```

---

## 4. Architectural Components & Services

### 4.1 Build Validation & Diagnostics Service (`apps/api/src/builds/build-validation.service.ts`)
- **Syntax & AST Analysis**: Validates that all TypeScript, JSX, and JSON files parse cleanly.
- **Route Conflict Detection**: Ensures unique App Router paths in `frontend/src/app`.
- **Environment Variable Scanner**: Analyzes code for `process.env.XXX` usages and verifies they are mapped in `.env.example`.
- **Error Diagnostician**: Formats syntax errors and missing dependency warnings into actionable remediation suggestions.

### 4.2 Build Runner Service (`apps/api/src/builds/build-runner.service.ts`)
- **Step-by-Step Build Pipeline**:
  1. `RESOLVE_CONFIG`: Parse project framework, target, and file tree snapshot.
  2. `VALIDATE_ENVIRONMENT`: Check required database URLs, API endpoints, and secrets.
  3. `LINT_AND_TYPECHECK`: Perform syntax and AST type verification.
  4. `BUNDLE_ARTIFACTS`: Simulate/execute build steps, record duration, and generate deployment bundle.
- **Persistent Build Logs**: Stores structured log events with timestamps and log levels (`INFO`, `WARN`, `ERROR`).

### 4.3 Monorepo Exporter Service (`apps/api/src/export/project-export.service.ts`)
- **Streamed ZIP Generator**: Uses `archiver` to assemble and stream a clean monorepo archive directly to HTTP clients.
- **Scaffold Synthesis**: Injects boilerplate `package.json`, `tsconfig.json`, `docker-compose.yml`, `README.md`, and `.env.example`.
- **GitHub API Direct Push**: Direct integration with GitHub REST API (`https://api.github.com/user/repos` and commits) for creating or updating repositories with project files.

### 4.4 Deployment Orchestrator Service (`apps/api/src/deployments/deployments.service.ts`)
- **Target Manifest Generators**: Generates `vercel.json`, `render.yaml`, `railway.json`, and production `Dockerfile` configs.
- **Deployment Lifecycle**: Dispatches deployment tasks, records build linkages, updates status (`PENDING` -> `DEPLOYING` -> `DEPLOYED`), and stores live deployment URLs.

---

## 5. REST API Endpoints

```text
# Builds
POST /api/v1/projects/:id/builds/trigger        # Trigger a new build validation & compilation
GET  /api/v1/projects/:id/builds                # List recent project builds
GET  /api/v1/projects/:id/builds/:buildId       # Get build logs and diagnostic details

# Export
GET  /api/v1/projects/:id/export/zip            # Stream production-ready ZIP monorepo archive
POST /api/v1/projects/:id/export/github         # Direct push codebase to a GitHub repository

# Deployments
POST /api/v1/projects/:id/deployments/trigger   # Trigger deployment to Vercel, Render, Railway, Docker
GET  /api/v1/projects/:id/deployments           # List recent deployments with target and URL
GET  /api/v1/projects/:id/deployments/:deployId # Get deployment logs and health status
```

---

## 6. Implementation Checklist & Progress

### Week 34 — Preview & Build
- [x] Add `BuildStatus`, `DeploymentTarget`, `DeploymentStatus`, `ProjectBuild`, and `ProjectDeployment` to `packages/database/prisma/schema.prisma`.
- [x] Run `prisma db push --skip-generate` to synchronize PostgreSQL database tables.
- [x] Add DTOs and types to `packages/types/src/build-export.ts` and re-export in `packages/types/src/index.ts`.
- [x] Implement `BuildValidationService` (`apps/api/src/builds/build-validation.service.ts`).
- [x] Implement `BuildRunnerService` (`apps/api/src/builds/build-runner.service.ts`).
- [x] Implement `BuildsController` and register `BuildsModule` in `apps/api/src/app.module.ts`.

### Week 35 — Code Export & Deployment
- [x] Implement `ProjectExportService` (`apps/api/src/export/project-export.service.ts`) with ZIP streaming and GitHub direct push.
- [x] Implement `DeploymentsService` (`apps/api/src/deployments/deployments.service.ts`) supporting Vercel, Render, Railway, Docker, and Self-Hosted targets.
- [x] Implement `ExportController` and `DeploymentsController`, registered in `apps/api`.
- [x] Add API Client endpoints and methods in `packages/api-client`.
- [x] Build Studio `ExportDeployModal.tsx` in `apps/web/src/components/studio/export-deploy-modal.tsx`.
- [x] Wire "Export & Deploy" button in Studio topbar (`apps/web/src/components/studio/studio-topbar.tsx`).
- [x] Verify full monorepo typecheck (`pnpm --filter @nirmaanify/types build`, `pnpm --filter @nirmaanify/api-client build`, `api`, `web`).

---

## 7. Deliverable

```text
======================================================================
DELIVERABLE: PRODUCTION PREVIEW, BUILD, EXPORT & DEPLOYMENT SYSTEM
======================================================================
1. Live build validation runner with structured logs & error diagnostics.
2. Full-stack clean monorepo ZIP export (Next.js + NestJS + Docker Compose).
3. Direct GitHub repository export and push integration.
4. Multi-target cloud deployment orchestrator (Vercel, Render, Railway, Docker).
5. Comprehensive Studio UI modal for 1-click build, export, and deployment.
======================================================================
```
