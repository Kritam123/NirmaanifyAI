# Implementation Plan: Standalone Global Headless CMS & NestJS Backend Services (BaaS)

**Product:** Nirmaanify AI  
**Document:** Standalone Services Architecture Plan  
**Target:** Global Workspace-Scoped Headless CMS & NestJS Backend-as-a-Service  
**Audience:** External Apps, External Websites, Mobile Apps (React Native/Flutter), Static Sites, Third-party Frameworks  
**Author:** Nirmaanify Core Engineering Team  
**Status:** 📋 PROPOSED & READY FOR IMPLEMENTATION  

---

## 1. Executive Summary & Vision

### The Problem
Currently, all dynamic CMS collections, content items, and NestJS server configurations in Nirmaanify AI are strictly scoped to individual **Projects** (`projectId`). Users must first scaffold a visual Next.js web application inside Nirmaanify to utilize CMS collections or view backend server configurations.

Many developers, agencies, and businesses:
- Already have an existing frontend or production website (e.g. Next.js on Vercel, Astro, Nuxt, SvelteKit, or Shopify).
- Are building cross-platform mobile apps (React Native, Flutter, Swift, Kotlin).
- Only want to use Nirmaanify as a **Headless CMS** or **Backend-as-a-Service (BaaS)** without creating or maintaining a visual project in Nirmaanify.

### The Solution
Introduce **Global Standalone Services** directly accessible from the main navigation sidebar:
1. **Global Headless CMS (`/cms`)**: Create, manage, and publish content collections (Blogs, Products, Authors, Custom schemas) at the Workspace level. Expose high-performance, public/authenticated delivery APIs with zero-project overhead.
2. **Global Backend & API Services (`/backend`)**: Configure and access enterprise NestJS backend capabilities (Auth services, Managed PostgreSQL/Prisma, Object Storage/CDN, API Keys, Webhook pipelines, and Swagger/OpenAPI documentation) to power external applications.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                NIRMAANIFY WORKSPACE                                    │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│         VISUAL PROJECTS ENGINE            │         STANDALONE SERVICES (BaaS)         │
│                                           │                                            │
│  ┌──────────────┐     ┌──────────────┐    │  ┌───────────────────┐ ┌────────────────┐  │
│  │ SaaS Project │     │ E-Com Store  │    │  │ Global CMS Engine │ │ NestJS Backend │  │
│  │ (Studio/UI)  │     │ (Studio/UI)  │    │  │ (Collections/API) │ │ (Auth/DB/S3)   │  │
│  └──────┬───────┘     └──────┬───────┘    │  └─────────┬─────────┘ └───────┬────────┘  │
└─────────┼────────────────────┼────────────┴────────────┼───────────────────┼───────────┘
          │                    │                         │                   │
   Project Exporter     Internal Canvas                  │                   │
                                                         ▼                   ▼
                                                ┌────────────────────────────────────────┐
                                                │         EXTERNAL APPLICATIONS          │
                                                │  • External Next.js 15 Website (Vercel)│
                                                │  • React Native / Flutter Mobile App   │
                                                │  • Astro / Nuxt / SvelteKit Frontend   │
                                                │  • External Node.js / Python Service   │
                                                └────────────────────────────────────────┘
```

---

## 2. Navigation & User Experience Architecture

### 2.1 Sidebar Navigation Updates (`apps/web/src/components/layout/NavigationSidebar.tsx`)
The main application sidebar will feature a dedicated **"Services & Cloud"** navigation group:

```text
[Nirmaanify Logo]

PLATFORM
  ├── Dashboard          (/dashboard)
  ├── Projects           (/projects)
  └── Workspaces & Team  (/workspaces)

SERVICES & BAAS (External Apps)
  ├── Content (CMS)      (/cms)      <-- NEW: Global Headless CMS
  └── Backend & APIs     (/backend)  <-- NEW: Standalone NestJS Backend Services
```

### 2.2 Global Headless CMS Route (`/cms`)
- **Direct Workspace Access**: Operates on `activeWorkspace.id` without needing an active project.
- **Starter Template Gallery**: 1-click preset seeding for **Blog & Articles**, **Store Products**, **Categories & Tags**, **Team & Authors**, or **Custom Schema Builder**.
- **Content Studio**: Full dynamic content table, rich text/markdown authoring, status lifecycle (**Draft**, **Published**, **Scheduled**, **Archived**), and automated publishing.
- **Developer Delivery Hub**:
  - Direct endpoint: `GET /api/v1/cms/delivery/workspaces/:workspaceSlug/:collectionSlug`
  - 1-click API Key generation for secure read/write access.
  - Interactive API Playground with response viewer.
  - 1-click TypeScript interface exporter (auto-generated TS definitions for external codebases).

### 2.3 Global Backend & APIs Route (`/backend`)
A unified BaaS control center for external applications organized into 6 tabs:
1. **Overview & Gateway**: Real-time status, API Gateway URL (`/api/v1`), live health ping monitor, and link to interactive Swagger OpenAPI documentation (`/api/docs`).
2. **Authentication Service**: Ready-to-use Auth APIs (`/api/v1/external/auth/*`) for external apps to register users, authenticate credentials, and verify JWT sessions.
3. **Database & ORM**: Managed PostgreSQL 16 schema viewer, Prisma model definitions, connection pooling URI, and SQL query runner.
4. **Storage & Media CDN**: S3 / MinIO / Vercel Blob credentials with presigned upload URL endpoints for external frontend/mobile apps.
5. **API Keys & Credentials**: Generate, monitor, and revoke scoped API keys (`nrm_live_...`) with rate-limiting controls.
6. **Webhooks & Events**: Configure webhook targets (e.g. Vercel On-Demand ISR revalidation, Netlify build hooks, Slack alerts) triggered on content publishing or user activity.
7. **SDK & Code Snippets**: Copy-paste integration snippets in Next.js 15, React, Node.js, Python, cURL, and Flutter.

---

## 3. Database Schema Modifications (`packages/database/prisma/schema.prisma`)

To support both project-scoped and standalone workspace-scoped CMS and services, we update the Prisma schema:

### 3.1 Decouple `CmsCollection` to Support Workspace Ownership
```prisma
model CmsCollection {
  id          String            @id @default(uuid())
  workspaceId String            // Required: Every collection belongs to a workspace
  projectId   String?           // Optional: null for Standalone Global CMS, populated for Project-scoped
  name        String
  slug        String
  description String?           @db.Text
  type        CmsCollectionType @default(CUSTOM)
  isSystem    Boolean           @default(false)
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  workspace   Workspace         @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  project     Project?          @relation(fields: [projectId], references: [id], onDelete: Cascade)
  fields      CmsField[]
  items       CmsContentItem[]

  @@unique([workspaceId, slug])
  @@index([workspaceId])
  @@index([projectId])
  @@map("cms_collections")
}
```

### 3.2 Decouple `CmsContentItem`
```prisma
model CmsContentItem {
  id           String           @id @default(uuid())
  collectionId String
  workspaceId  String           // Required: Tenant boundary
  projectId    String?          // Optional: null for Standalone Global CMS
  slug         String?
  data         Json             @default("{}")
  status       CmsContentStatus @default(DRAFT)
  scheduledAt  DateTime?
  publishedAt  DateTime?
  authorId     String?
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  collection   CmsCollection    @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  workspace    Workspace        @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  project      Project?         @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([collectionId])
  @@index([workspaceId])
  @@index([projectId])
  @@index([status])
  @@index([scheduledAt])
  @@map("cms_content_items")
}
```

### 3.3 New Model: `ApiKey` for External App Authentication
```prisma
model ApiKey {
  id          String    @id @default(uuid())
  workspaceId String
  name        String    // e.g. "External Next.js Blog", "Mobile App iOS"
  keyPrefix   String    // e.g. "nrm_live_a1b2..."
  keyHash     String    @unique
  scopes      String[]  // ["cms:read", "cms:write", "auth:verify", "storage:upload"]
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@index([workspaceId])
  @@map("api_keys")
}
```

### 3.4 New Model: `WebhookSubscription` for External Cache Revalidation
```prisma
model WebhookSubscription {
  id          String   @id @default(uuid())
  workspaceId String
  name        String   // e.g. "Vercel Revalidate Hook"
  targetUrl   String
  secret      String?
  events      String[] // ["content.published", "content.deleted", "user.created"]
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@index([workspaceId])
  @@map("webhook_subscriptions")
}
```

---

## 4. Backend API Architecture (`apps/api`)

### 4.1 Global CMS Endpoints
| HTTP Method | Route | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/cms/workspaces/:workspaceId/collections` | List standalone workspace collections | JWT / API Key |
| `POST` | `/api/v1/cms/workspaces/:workspaceId/collections` | Create standalone collection | JWT / API Key |
| `POST` | `/api/v1/cms/workspaces/:workspaceId/presets/:presetType` | Seed template (Posts, Products, etc.) | JWT / API Key |
| `GET` | `/api/v1/cms/workspaces/:workspaceId/collections/:slug/items` | List content items with status filter | JWT / API Key |
| `POST` | `/api/v1/cms/workspaces/:workspaceId/collections/:slug/items` | Create content item | JWT / API Key |
| `PUT` | `/api/v1/cms/workspaces/:workspaceId/collections/:slug/items/:id` | Update content item | JWT / API Key |
| `DELETE`| `/api/v1/cms/workspaces/:workspaceId/collections/:slug/items/:id` | Delete content item | JWT / API Key |
| `POST` | `/api/v1/cms/workspaces/:workspaceId/items/:id/publish` | 1-click publish item | JWT / API Key |
| `POST` | `/api/v1/cms/workspaces/:workspaceId/items/:id/schedule` | Schedule automated publishing | JWT / API Key |

### 4.2 External Public Delivery API
```http
GET /api/v1/cms/delivery/workspaces/:workspaceSlug/:collectionSlug
Headers:
  x-api-key: nrm_live_... (optional for public collections)
Query Params:
  ?page=1&limit=20&search=keyword&sort=publishedAt:desc
```
- Returns clean JSON ready for Next.js App Router, Astro, or mobile apps.
- Includes HTTP cache headers (`Cache-Control: public, s-maxage=60, stale-while-revalidate=300`).

### 4.3 External Backend Services Endpoints (BaaS)
| HTTP Method | Route | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/workspaces/:workspaceId/services/status` | Global gateway health, metrics & uptime | JWT |
| `GET` | `/api/v1/workspaces/:workspaceId/api-keys` | List workspace API keys | JWT (Admin) |
| `POST` | `/api/v1/workspaces/:workspaceId/api-keys` | Generate new scoped API key | JWT (Admin) |
| `DELETE`| `/api/v1/workspaces/:workspaceId/api-keys/:id` | Revoke API key | JWT (Admin) |
| `GET` | `/api/v1/workspaces/:workspaceId/webhooks` | List webhook subscriptions | JWT (Admin) |
| `POST` | `/api/v1/workspaces/:workspaceId/webhooks` | Create webhook subscription | JWT (Admin) |
| `POST` | `/api/v1/workspaces/:workspaceId/webhooks/:id/test` | Ping test webhook endpoint | JWT (Admin) |
| `POST` | `/api/v1/external/auth/signup` | Register user for external app | API Key |
| `POST` | `/api/v1/external/auth/login` | Login user for external app | API Key |
| `GET` | `/api/v1/external/auth/verify` | Verify JWT session for external app | Bearer Token |
| `POST` | `/api/v1/external/storage/presigned-url` | Generate direct upload URL for external clients | API Key |

---

## 5. Frontend Architecture & New Pages (`apps/web`)

### 5.1 Route Map Updates (`apps/web/src/lib/routes.ts`)
```ts
export const ROUTES = {
  ...
  DASHBOARD: {
    OVERVIEW: '/dashboard',
    PROJECTS: '/projects',
    PROJECT_DETAIL: (id: string) => `/projects/${id}`,
    WORKSPACES: '/workspaces',
    WORKSPACE_DETAIL: (id: string) => `/workspaces/${id}`,
    STORAGE: '/storage',
    // New Standalone Service Routes:
    CMS: '/cms',
    BACKEND_SERVICES: '/backend',
  },
  ...
};
```

### 5.2 Standalone CMS Page (`apps/web/src/app/(dashboard)/cms/page.tsx`)
- Container page wrapped in `DashboardShell`.
- Leverages the workspace context: passes `workspaceId: activeWorkspace.id` and `projectId: null` to the CMS engine.
- Features:
  - Header: **"Headless CMS (Standalone)"** with Workspace Badge and API Key quick-copy.
  - 4-Card Template Gallery: Blog & Articles, Store Products, Categories, Authors, Custom.
  - Collections sidebar & Content tables.
  - "Developer Integration" drawer with live Next.js / cURL snippets.

### 5.3 Standalone Backend Services Page (`apps/web/src/app/(dashboard)/backend/page.tsx`)
- Container page with tabbed interface:
  - **Tab 1: Gateway & Overview**: Health check ping button, Swagger UI embed/link, live telemetry.
  - **Tab 2: Auth Service (BaaS)**: External signup/login endpoints, JWT configuration, external user directory.
  - **Tab 3: Database & Models**: Schema visualizer, PostgreSQL URI pooling guide, Prisma model definitions.
  - **Tab 4: Storage & CDN**: Configure S3/MinIO/Vercel Blob credentials and test upload.
  - **Tab 5: API Keys**: Generate keys with granular checkboxes (`cms:read`, `cms:write`, `auth:manage`, `storage:upload`).
  - **Tab 6: Webhooks**: Register endpoints, select triggers (`content.published`, etc.), and view delivery logs.
  - **Tab 7: Quickstart & SDK**: Code generator for Next.js, Node.js, Python, Flutter, React, cURL.

---

## 6. External Developer Integration Hub & Code Generator

To give external developers an instant "plug-and-play" experience, the standalone pages will feature copyable code snippets customized with their live workspace slug and API keys:

### 6.1 Next.js 15 App Router (Server Component)
```tsx
// app/blog/page.tsx (External Next.js Application)
export default async function BlogPage() {
  const res = await fetch(
    'https://api.nirmaanify.ai/api/v1/cms/delivery/workspaces/my-workspace/posts',
    {
      headers: {
        'x-api-key': process.env.NIRMAANIFY_API_KEY!,
      },
      next: { revalidate: 60 }, // ISR Cache
    }
  );
  const { items: posts } = await res.json();

  return (
    <main className="max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold">Latest Articles</h1>
      <div className="grid gap-6 mt-8">
        {posts.map((post: any) => (
          <article key={post.id} className="p-6 border rounded-xl">
            <h2 className="text-xl font-semibold">{post.data.title}</h2>
            <p className="text-slate-600 mt-2">{post.data.excerpt}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
```

### 6.2 Mobile App / cURL Fetch
```bash
# Query published products directly from terminal or mobile app
curl -X GET "https://api.nirmaanify.ai/api/v1/cms/delivery/workspaces/my-workspace/products?limit=10" \
  -H "x-api-key: nrm_live_38bf8291f0a2"
```

### 6.3 On-Demand Cache Revalidation Webhook (Next.js)
```ts
// app/api/revalidate/route.ts (External Next.js App)
import { revalidateTag, revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  if (body.event === 'content.published') {
    revalidatePath('/blog');
    return NextResponse.json({ revalidated: true, now: Date.now() });
  }
  return NextResponse.json({ received: true });
}
```

---

## 7. Phased Implementation Milestones

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             IMPLEMENTATION PHASES                                │
├──────────────┬───────────────────────────────────────────────────────────────────┤
│ Phase A      │ Database Schema Updates (Workspace CMS, ApiKey, Webhook models)   │
├──────────────┼───────────────────────────────────────────────────────────────────┤
│ Phase B      │ Backend Services & Controller Extension (Workspace-scoped BaaS)   │
├──────────────┼───────────────────────────────────────────────────────────────────┤
│ Phase C      │ Types & API Client Package Updates (@nirmaanify/types, api-client)│
├──────────────┼───────────────────────────────────────────────────────────────────┤
│ Phase D      │ Main Sidebar Navigation & Standalone Routes (/cms, /backend)      │
├──────────────┼───────────────────────────────────────────────────────────────────┤
│ Phase E      │ API Keys & Webhooks Management UI                                 │
├──────────────┼───────────────────────────────────────────────────────────────────┤
│ Phase F      │ Developer Integration Hub, Code Snippets & Verification           │
└──────────────┴───────────────────────────────────────────────────────────────────┘
```

### Phase A — Database Migration
- [ ] Update `packages/database/prisma/schema.prisma` with:
  - `CmsCollection.workspaceId` and optional `projectId`.
  - `CmsContentItem.workspaceId` and optional `projectId`.
  - `ApiKey` model with hashed storage.
  - `WebhookSubscription` model.
- [ ] Write migration/seed script to link existing collections to their project's workspace.
- [ ] Run `prisma db push` and `prisma generate`.

### Phase B — API Backend (`apps/api`)
- [ ] Extend `CmsService` to handle workspace-scoped queries (`listWorkspaceCollections`, `createWorkspaceCollection`).
- [ ] Extend `CmsController` with `/api/v1/cms/workspaces/:workspaceId/*`.
- [ ] Update public delivery controller to support `/api/v1/cms/delivery/workspaces/:workspaceSlug/:collectionSlug`.
- [ ] Implement `ApiKeysService` and `ApiKeyGuard` (`x-api-key` validation).
- [ ] Implement `WebhooksService` and BullMQ dispatch job on `content.published`.
- [ ] Create `ExternalServicesController` for BaaS auth and storage presigned URLs.

### Phase C — Types & API Client Packages
- [ ] In `@nirmaanify/types`: Add `ApiKeyDto`, `CreateApiKeyDto`, `WebhookSubscriptionDto`, `CreateWebhookDto`.
- [ ] In `@nirmaanify/api-client`: Add methods to `apiClient.cms` for workspace-level CRUD and `apiClient.services` for API keys and webhooks.

### Phase D — Main Navigation & Frontend Pages (`apps/web`)
- [ ] In `NavigationSidebar.tsx`: Add **"Content (CMS)"** and **"Backend & APIs"** items with Lucide icons (`Database`, `Server`).
- [ ] Create `apps/web/src/app/(dashboard)/cms/page.tsx`: Workspace-level CMS dashboard.
- [ ] Create `apps/web/src/app/(dashboard)/backend/page.tsx`: Workspace-level BaaS & API management dashboard.

### Phase E — Security & Management UI
- [ ] Build `ApiKeyManagerCard` (list keys, copy key on create, revoke).
- [ ] Build `WebhookManagerCard` (add endpoint URL, select events, test ping).
- [ ] Build `ExternalAuthCard` (configure external auth, copy JWT signup/login URLs).

### Phase F — Verification & Documentation
- [ ] Test creating a CMS collection without creating any project.
- [ ] Test querying the public delivery endpoint with `curl` using an API key.
- [ ] Verify existing projects continue to function with 100% backward compatibility.
- [ ] Run `turbo run typecheck` across all 19 monorepo tasks.
- [ ] Store completion report in `reports/global_headless_cms_and_backend_services_report.md`.

---

## 8. Non-Breaking Backward Compatibility Guarantee

1. **Existing Projects**: All existing projects with CMS collections or NestJS backends will retain their associations via `projectId`.
2. **Delivery Routes**: Existing route `/api/v1/cms/delivery/:projectId/:collectionSlug` remains fully operational.
3. **Studio Visual Bindings**: Studio visual canvas and code generator will continue resolving project-scoped collections seamlessly.
4. **Zero Forced Migration**: Users who prefer working inside visual projects can continue doing so with no disruption.

---

## 9. Sign-off & Execution Readiness

This implementation plan provides the complete blueprint to elevate Nirmaanify AI from a website generator to an all-in-one **Universal Cloud Platform**:
- Visual AI Website Builder for no-code/low-code builders.
- Standalone Headless CMS for modern frontend developers.
- Standalone NestJS Backend-as-a-Service for external web & mobile applications.

Ready for Phase A execution upon user confirmation.
