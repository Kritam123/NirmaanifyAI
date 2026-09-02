# Nirmaanify AI — Complete Features Report & Architecture Guide

## Index of Feature Reports

The table below provides links to the comprehensive engineering reports for each platform system:

| Feature Report | System | Highlights |
| :--- | :--- | :--- |
| [**Authentication & NextAuth**](./features/AUTHENTICATION_AND_NEXTAUTH.md) | Auth.js v5 + NestJS + Prisma | Google & GitHub OAuth, Credentials, `SocialAccount` model, Same-Email account linking, JWT encryption |
| [**Middleware & Route Protection**](./features/MIDDLEWARE_AND_ROUTE_PROTECTION.md) | Next.js 15 Edge Middleware | Network boundary route guards, unauthenticated redirect to `/login`, asset caching bypass |
| [**Role-Based Access Control (RBAC)**](./features/ROLE_BASED_ACCESS_CONTROL_RBAC.md) | Fullstack RBAC Engine | 6-tier role hierarchy (`OWNER` $\rightarrow$ `VIEWER`), NestJS `@Roles()` guard, React `<RoleGate />` and `useRBAC()` hook |
| [**Multi-Driver Storage Engine**](./features/MULTI_DRIVER_STORAGE_ENGINE.md) | Storage System | Local, AWS S3/MinIO, and Vercel Blob drivers with 1-click zero-downtime hot switching |
| [**Design System & UI Guidelines**](./design-system/DESIGN_SYSTEM.md) | `@nirmaanify/ui` + Design Tokens | Custom components, accessibility standards, color tokens, and layout patterns |
| [**Brand Identity Kit**](./brand/BRAND_KIT.md) | Brand Guidelines | Logo usage, typography, primary color palette, and visual hierarchy |

---

## Monorepo Architecture Overview

```
NirmaanifyAI/
├── apps/
│   ├── api/             # NestJS REST API with Swagger, JWT, RBAC guards & controllers
│   ├── web/             # Next.js 15 App Router frontend with NextAuth & Middleware
│   ├── worker/          # Background worker for asynchronous task execution
│   └── docs/            # Platform documentation workspace
├── packages/
│   ├── api-client/      # Strongly-typed Axios/Fetch SDK with automatic URL normalization
│   ├── config/          # Shared ESLint, Tailwind, and TypeScript configurations
│   ├── database/        # Prisma ORM schema, PostgreSQL migrations, and seed scripts
│   ├── design-tokens/   # Design system tokens (colors, spacing, typography)
│   ├── icons/           # Custom SVG icon library
│   ├── types/           # Shared TypeScript interfaces, DTOs, and RBAC matrix
│   └── ui/              # Reusable React UI component library
└── docs/                # Comprehensive architectural and feature documentation
    ├── brand/           # Brand kit guidelines
    ├── design-system/   # Design system rules and components
    └── features/        # In-depth engineering feature reports
```
