# Standalone BaaS & Global Headless CMS Implementation Report

**Author:** Antigravity AI  
**Status:** Completed & Verified  
**Date:** September 05, 2026  
**Scope:** Workspace-Level Standalone Backend-as-a-Service (BaaS) and Headless CMS Engine  
**Implementation Plan:** [`implementation_plan/global_headless_cms_and_backend_services_plan.md`](../implementation_plan/global_headless_cms_and_backend_services_plan.md)

---

## 1. Executive Summary

This implementation transforms **Nirmaanify AI** into a dual-mode platform:
1. **Visual Builder Suite:** Full drag-and-drop website and web application visual design studio.
2. **Standalone BaaS & Headless CMS:** A powerful, developer-centric Backend-as-a-Service that can be utilized directly by external applications (Next.js 15 App Router on Vercel, mobile React Native/Flutter, Astro, Remix, Nuxt, cURL) without needing to create or maintain a visual project in Nirmaanify.

Developers can now configure schemas, publish content, create scoped API keys, subscribe to webhooks, generate presigned media upload URLs, and ingest data with zero project-scoping overhead.

---

## 2. Key Architecture & Deliverables

### A. Navigation & Shell Layout
- Added **"Services & BaaS"** section in the main navigation sidebar (`apps/web/src/components/layout/NavigationSidebar.tsx`).
- Integrated two top-level primary destinations:
  - **Content (CMS)**: `/cms` (`apps/web/src/app/(dashboard)/cms/page.tsx`)
  - **Backend & APIs**: `/backend` (`apps/web/src/app/(dashboard)/backend/page.tsx`)
- Routes registered in `apps/web/src/lib/routes.ts`.

### B. Database Schema & Migration (`packages/database`)
- **Prisma Models Extended:**
  - `Workspace`: Added relations `cmsCollections`, `cmsContentItems`, `apiKeys`, `webhookSubscriptions`.
  - `CmsCollection`: Added `workspaceId String` foreign key. Made `projectId String?` optional. Updated unique constraint to `@@unique([workspaceId, slug])`.
  - `CmsContentItem`: Added `workspaceId String` foreign key. Made `projectId String?` optional.
  - `ApiKey`: Added model (`id`, `workspaceId`, `name`, `keyPrefix`, `keyHash`, `scopes`, `lastUsedAt`, `expiresAt`, `createdAt`, `updatedAt`).
  - `WebhookSubscription`: Added model (`id`, `workspaceId`, `name`, `targetUrl`, `secret`, `events`, `isActive`, `createdAt`, `updatedAt`).
- **Data Preservation Backfill:**
  - Automated SQL backfill script populated `workspaceId` on all existing database records using join on `projects.workspaceId`.
  - Applied migration cleanly with Prisma Client regenerated.

### C. Types & API Client Packages
- **`@nirmaanify/types` (`packages/types/src/baas.ts`):**
  - Exported `ApiKeyDto`, `CreateApiKeyDto`, `WebhookSubscriptionDto`, `CreateWebhookDto`, `UpdateWebhookDto`, `ExternalServiceStatusDto`.
  - Updated `packages/types/src/cms.ts` to support optional `projectId` and required `workspaceId`.
- **`@nirmaanify/api-client` (`packages/api-client/src/services/baas.service.ts` & `cms.service.ts`):**
  - Configured REST endpoints in `packages/api-client/src/endpoints.ts`.
  - Implemented `apiClient.baas` service methods (`getStatus`, `listApiKeys`, `createApiKey`, `deleteApiKey`, `listWebhooks`, `createWebhook`, `updateWebhook`, `deleteWebhook`, `testWebhook`).
  - Added workspace-scoped methods to `apiClient.cms` (`listWorkspaceCollections`, `getWorkspaceCollection`, `createWorkspaceCollection`, `seedWorkspacePresetCollection`, `getWorkspaceDeliveryContent`, etc.).

### D. NestJS Backend API Engine (`apps/api`)
- **`BaasModule` (`apps/api/src/baas/baas.module.ts`):**
  - Registered in `apps/api/src/app.module.ts`.
  - `ApiKeysService` (`apps/api/src/baas/api-keys.service.ts`): Secure generation of `nrm_live_...` credentials with SHA-256 hash storage, prefix extraction, and scope verification.
  - `WebhooksService` (`apps/api/src/baas/webhooks.service.ts`): Target registry, HMAC SHA-256 signature generation (`x-nirmaanify-signature`), and ping test latency measurement.
  - `ApiKeyGuard` (`apps/api/src/baas/guards/api-key.guard.ts`): Validates incoming `x-api-key` headers and scope claims for external APIs.
  - `BaasController` (`apps/api/src/baas/baas.controller.ts`): Endpoints for telemetry status, API keys, webhooks, external authentication, and presigned media uploads.
- **Enhanced `CmsService` & `CmsController`:**
  - Tenant validation: `verifyWorkspaceAccess` verifies membership in the active workspace.
  - Public & Authenticated Delivery API:
    `GET /api/v1/cms/delivery/workspaces/:workspaceSlug/:collectionSlug`
  - Webhook Dispatcher: Auto-emits `content.published` event payloads to subscribed external webhooks upon publishing items.

### E. Frontend Components & Pages (`apps/web`)
- **Global CMS Page (`apps/web/src/app/(dashboard)/cms/page.tsx`):**
  - Leverages `useAuth()` to target `activeWorkspace`.
  - Supports collection presets (Blog Posts, Products, Authors, Categories, Testimonials, FAQs), custom schemas, and visual item management.
- **Polymorphic CMS Hook (`apps/web/src/hooks/use-cms.ts`):**
  - Supports both project-specific mode (`useCms(projectId)`) and standalone workspace mode (`useCms({ workspaceId })`).
- **Global Backend & APIs Page (`apps/web/src/app/(dashboard)/backend/page.tsx`):**
  - Telemetry grid (API Gateway status, PostgreSQL engine state, Auth service, Media storage driver).
  - Tabbed control center for SDK & Quickstart, API Keys, Webhooks, and Endpoints & Gateway.
- **`ApiKeyManagerCard.tsx` (`apps/web/src/components/backend/ApiKeyManagerCard.tsx`):**
  - Creation modal with scope checkboxes (`cms:read`, `cms:write`, `storage:upload`, `auth:manage`) and expiration dates.
  - One-time secret key copy reveal modal with security warnings.
- **`WebhookManagerCard.tsx` (`apps/web/src/components/backend/WebhookManagerCard.tsx`):**
  - Endpoint registration with target URL, secret token, and event triggers.
  - Real-time test ping dispatcher displaying response status code and latency in milliseconds.
- **`DeveloperIntegrationHub.tsx` (`apps/web/src/components/backend/DeveloperIntegrationHub.tsx`):**
  - Ready-to-copy code snippets customized with the live workspace slug:
    1. Next.js 15 App Router Server Component with ISR (`revalidate: 3600`, tags).
    2. Next.js On-Demand Revalidation Webhook route (`app/api/revalidate/route.ts`) with HMAC SHA-256 verification.
    3. cURL commands for fetching delivery content, querying telemetry, and presigned uploads.
    4. React Native / Flutter / Mobile Axios integration.
    5. Environment variables configuration (`.env.local`).

---

## 3. Verification & Testing Evidence

### A. Monorepo Typecheck
Executed `turbo run typecheck` across all 12 monorepo packages and applications:
```bash
• turbo 2.10.12
   • Packages in scope: @nirmaanify/api-client, @nirmaanify/component-registry, @nirmaanify/config, @nirmaanify/css-engine, @nirmaanify/database, @nirmaanify/design-tokens, @nirmaanify/icons, @nirmaanify/types, @nirmaanify/ui, api, web, worker
   • Running typecheck in 12 packages

 Tasks:    19 successful, 19 total
Cached:    4 cached, 19 total
  Time:    16.124s
```

### B. Production Builds
- **NestJS API (`pnpm --filter api build`):**
  ```bash
  $ nest build
  Exit status 0 (Success)
  ```
- **Next.js Web App (`pnpm --filter web build`):**
  ```bash
  $ next build
  ▲ Next.js 15.5.24
  ✓ Compiled successfully in 27.4s
  ✓ Generating static pages (16/16)
  Route (app)
  ├ ○ /backend   11.7 kB   144 kB
  ├ ○ /cms        2.6 kB   146 kB
  └ ...
  Exit status 0 (Success)
  ```

### C. Live End-to-End API Verifications
1. **Public CMS Delivery Query (`GET /api/v1/cms/delivery/workspaces/kritam-s-studio/posts`):**
   - Result: `200 OK`
   - Retrieved 2 published articles (`slug: "design-systems-that-scale"`, `slug: "mastering-modern-web-development-2026"`) with metadata, tags, and formatted Markdown content.
2. **API Key Security Guard (`ApiKeyGuard`):**
   - Unauthenticated request to `/api/v1/external/auth/login`: Returned `401 Unauthorized` with `"message": "Missing x-api-key header"`.
3. **Scoped BaaS Upload Request (`POST /api/v1/external/storage/presigned-url`):**
   - Header: `x-api-key: nrm_live_...`
   - Result: `201 Created`
   - Returned presigned upload URL and public asset URL.
   - Database `ApiKey.lastUsedAt` timestamp updated to the exact millisecond of the request.

---

## 4. Backward Compatibility

- **Existing Projects:** All project-scoped CMS collections and project details views continue to operate unmodified.
- **Polymorphic Handling:** Queries check for `workspaceId` first, falling back to `projectId` if workspace context is not explicitly passed.
- **Zero Breaking Changes:** Existing visual editor, drag-and-drop canvas, and project deployment routes remain fully operational.

---

## 5. Artifacts Inventory

| File | Purpose |
| :--- | :--- |
| `packages/database/prisma/schema.prisma` | Added `ApiKey`, `WebhookSubscription`, workspace relations |
| `packages/types/src/baas.ts` | Types for BaaS keys, webhooks, status telemetry |
| `packages/api-client/src/services/baas.service.ts` | Frontend client for standalone BaaS operations |
| `apps/api/src/baas/*` | NestJS module, guards, and services for API keys & webhooks |
| `apps/web/src/app/(dashboard)/cms/page.tsx` | Standalone workspace Headless CMS page |
| `apps/web/src/app/(dashboard)/backend/page.tsx` | Standalone BaaS control center page |
| `apps/web/src/components/backend/ApiKeyManagerCard.tsx` | UI for generating & revoking scoped API keys |
| `apps/web/src/components/backend/WebhookManagerCard.tsx` | UI for subscribing to webhooks and testing latency |
| `apps/web/src/components/backend/DeveloperIntegrationHub.tsx` | Code snippet hub for Next.js 15, mobile, and cURL |
| `apps/web/src/components/layout/NavigationSidebar.tsx` | Sidebar with "Services & BaaS" navigation section |
