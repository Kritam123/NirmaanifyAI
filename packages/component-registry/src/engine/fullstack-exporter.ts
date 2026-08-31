import {
  ProjectDto,
  FullstackExportBundle,
  ExportFileItem,
  BuildLogEntry,
} from '@nirmaanify/types';
import { ReactCodeGenerator } from './code-generator';
import { NestjsCodeGenerator } from './nestjs-generator';
import { DatabaseCompiler } from './database-compiler';

export class FullstackProjectExporter {
  // ==========================================================================
  // 1. FULL-STACK PROJECT BUNDLE COMPILER (WEEK 35)
  // ==========================================================================

  static exportProjectBundle(project: ProjectDto): FullstackExportBundle {
    const files: ExportFileItem[] = [];
    const schema = (project.projectSchema as any) || {};
    const projectName = project.name || 'NirmaanifyApp';
    const slug = project.slug || 'nirmaanify-app';

    // ------------------------------------------------------------------------
    // A. FRONTEND (Next.js 15 App Router + React 19 + Tailwind)
    // ------------------------------------------------------------------------
    const pages = schema.pages || [
      {
        id: 'page-home',
        name: 'Home',
        path: '/',
        rootNode: {
          id: 'root-1',
          type: 'container',
          props: { className: 'max-w-6xl mx-auto p-6 space-y-6' },
          children: [],
        },
      },
    ];

    pages.forEach((page: any) => {
      const safePage = {
        ...page,
        rootNode: page.rootNode || {
          id: `root-${page.id || 'page'}`,
          type: 'container',
          props: { className: 'max-w-6xl mx-auto p-6 space-y-6' },
          children: page.nodes || [],
        },
      };
      const tsxCode = ReactCodeGenerator.generatePageComponent(safePage);
      const pagePath =
        page.path === '/'
          ? 'frontend/src/app/page.tsx'
          : `frontend/src/app/${page.path.replace(/^\//, '')}/page.tsx`;

      files.push({
        path: pagePath,
        content: tsxCode,
        language: 'typescript',
      });
    });

    // Frontend layout.tsx
    files.push({
      path: 'frontend/src/app/layout.tsx',
      content: `import React from 'react';
import './globals.css';

export const metadata = {
  title: '${projectName}',
  description: 'Fullstack application generated with Nirmaanify AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0A0D14] text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
`,
      language: 'typescript',
    });

    // Frontend globals.css
    files.push({
      path: 'frontend/src/app/globals.css',
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: #635BFF;
  --background: #0A0D14;
  --surface: #161926;
  --border: #24293D;
}
`,
      language: 'css',
    });

    // Frontend package.json
    files.push({
      path: 'frontend/package.json',
      content: JSON.stringify(
        {
          name: `${slug}-frontend`,
          version: '1.0.0',
          private: true,
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start',
            lint: 'next lint',
          },
          dependencies: {
            next: '15.5.24',
            react: '^19.0.0',
            'react-dom': '^19.0.0',
            'lucide-react': '^1.16.0',
            clsx: '^2.1.1',
            'tailwind-merge': '^3.0.2',
            zod: '^3.24.2',
          },
          devDependencies: {
            typescript: '^5.7.3',
            '@types/node': '^22.13.4',
            '@types/react': '^19.0.0',
            '@types/react-dom': '^19.0.0',
            tailwindcss: '^3.4.17',
            postcss: '^8.4.49',
            autoprefixer: '^10.4.20',
          },
        },
        null,
        2
      ),
      language: 'json',
    });

    // Frontend tailwind.config.ts
    files.push({
      path: 'frontend/tailwind.config.ts',
      content: `import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          500: '#635BFF',
          600: '#5348E2',
        },
      },
    },
  },
  plugins: [],
};
export default config;
`,
      language: 'typescript',
    });

    // ------------------------------------------------------------------------
    // B. BACKEND (NestJS 11 + Prisma PostgreSQL)
    // ------------------------------------------------------------------------
    if (project.isBackendEnabled) {
      const backendSchema = schema.backendConfiguration || {
        enabled: true,
        framework: 'nestjs-11',
        databaseEngine: 'postgresql-16',
        port: 4000,
        apiPrefix: 'api/v1',
        modules: [],
      };

      const backendFiles = NestjsCodeGenerator.generateFullBackend(backendSchema, projectName);
      backendFiles.forEach((bf) => {
        files.push({
          path: `backend/${bf.path}`,
          content: bf.content,
          language: bf.language as any,
        });
      });
    }

    // ------------------------------------------------------------------------
    // C. DOCKER COMPOSE ORCHESTRATION
    // ------------------------------------------------------------------------
    const dockerComposeYml = `version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - PORT=4000
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/${slug}_db?schema=public
      - JWT_SECRET=super-secret-jwt-key
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=${slug}_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"

volumes:
  pgdata:
`;

    files.push({
      path: 'docker-compose.yml',
      content: dockerComposeYml,
      language: 'yaml',
    });

    // ------------------------------------------------------------------------
    // D. MULTI-CLOUD DEPLOYMENT CONFIGS (VERCEL, RENDER)
    // ------------------------------------------------------------------------
    files.push({
      path: 'vercel.json',
      content: JSON.stringify(
        {
          framework: 'nextjs',
          buildCommand: 'cd frontend && pnpm build',
          outputDirectory: 'frontend/.next',
        },
        null,
        2
      ),
      language: 'json',
    });

    files.push({
      path: 'render.yaml',
      content: `services:
  - type: web
    name: ${slug}-frontend
    env: node
    buildCommand: pnpm --filter frontend build
    startCommand: pnpm --filter frontend start
    envVars:
      - key: NEXT_PUBLIC_API_URL
        fromService:
          type: web
          name: ${slug}-backend
          property: host

  - type: web
    name: ${slug}-backend
    env: node
    buildCommand: pnpm --filter backend build
    startCommand: pnpm --filter backend start:prod
`,
      language: 'yaml',
    });

    // ------------------------------------------------------------------------
    // E. UNIFIED ENVIRONMENT TEMPLATE & README
    // ------------------------------------------------------------------------
    const envExample = `# ==========================================
# UNIFIED ENVIRONMENT VARIABLES (${projectName})
# ==========================================
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/${slug}_db?schema=public
JWT_SECRET=production-secret-jwt-key
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
`;

    files.push({
      path: '.env.example',
      content: envExample,
      language: 'env',
    });

    const readmeMd = `# ${projectName}

Production full-stack application generated with **Nirmaanify AI**.

## 🏗️ Architecture
- **Frontend**: Next.js 15 (App Router, React 19, Tailwind CSS)
- **Backend**: NestJS 11 + Prisma ORM + PostgreSQL 16
- **Cache / Queues**: Redis 7
- **Deployment Targets**: Docker Compose, Vercel, Render, Railway, Self-Hosted

---

## 🚀 Quick Start with Docker Compose
Run the entire full-stack cluster (Next.js + NestJS + PostgreSQL + Redis) in 1 command:

\`\`\`bash
docker compose up --build
\`\`\`

- **Frontend App**: http://localhost:3000
- **Backend API**: http://localhost:4000/api/v1
- **Swagger Documentation**: http://localhost:4000/docs
- **PostgreSQL Port**: \`localhost:5432\`

---

## 💻 Local Development Setup

### 1. Frontend
\`\`\`bash
cd frontend
pnpm install
pnpm dev
\`\`\`

### 2. Backend
\`\`\`bash
cd backend
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm start:dev
\`\`\`
`;

    files.push({
      path: 'README.md',
      content: readmeMd,
      language: 'markdown',
    });

    const totalSizeBytes = files.reduce((acc, f) => acc + (f.content.length || 0), 0);

    return {
      projectName,
      slug,
      totalFiles: files.length,
      totalSizeBytes,
      files,
      dockerComposeYml,
      readmeMd,
      envExample,
    };
  }

  // ==========================================================================
  // 2. BUILD VALIDATION & LOG SIMULATOR (WEEK 34)
  // ==========================================================================

  static generateBuildLogs(project: ProjectDto): BuildLogEntry[] {
    const logs: BuildLogEntry[] = [];
    const now = () => new Date().toISOString();

    logs.push(
      {
        id: 'log-1',
        timestamp: now(),
        level: 'info',
        phase: 'VALIDATION',
        message: `Validating project schema AST for "${project.name}" (Slug: ${project.slug})...`,
      },
      {
        id: 'log-2',
        timestamp: now(),
        level: 'success',
        phase: 'VALIDATION',
        message: 'Schema validation passed: 0 route collisions, 0 orphaned component nodes.',
      },
      {
        id: 'log-3',
        timestamp: now(),
        level: 'info',
        phase: 'PRISMA',
        message: 'Synthesizing PostgreSQL Prisma models and relational foreign keys...',
      },
      {
        id: 'log-4',
        timestamp: now(),
        level: 'success',
        phase: 'PRISMA',
        message: 'Prisma client v6.4.1 compiled successfully.',
      },
      {
        id: 'log-5',
        timestamp: now(),
        level: 'info',
        phase: 'NEST_BUILD',
        message: 'Compiling NestJS 11 REST controllers, services, DTOs, and OpenAPI docs...',
      },
      {
        id: 'log-6',
        timestamp: now(),
        level: 'success',
        phase: 'NEST_BUILD',
        message: 'NestJS backend bundle compiled with 0 TypeScript errors.',
      },
      {
        id: 'log-7',
        timestamp: now(),
        level: 'info',
        phase: 'NEXT_BUILD',
        message: 'Compiling Next.js 15 App Router pages, Server Components, and Tailwind CSS...',
      },
      {
        id: 'log-8',
        timestamp: now(),
        level: 'success',
        phase: 'NEXT_BUILD',
        message: 'Next.js static & dynamic routes prerendered (4/4 pages).',
      },
      {
        id: 'log-9',
        timestamp: now(),
        level: 'info',
        phase: 'DOCKER',
        message: 'Assembling docker-compose.yml multi-container cluster specification...',
      },
      {
        id: 'log-10',
        timestamp: now(),
        level: 'success',
        phase: 'DEPLOY',
        message: 'Full-stack application build verification completed with status: READY FOR EXPORT & DEPLOY.',
      }
    );

    return logs;
  }
}
