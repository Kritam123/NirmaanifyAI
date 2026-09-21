import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../database/prisma.service';
import { ExportGithubDto, GithubExportResultDto } from '@nirmaanify/types';

@Injectable()
export class ProjectExportService {
  private readonly logger = new Logger(ProjectExportService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Builds an enterprise full-stack monorepo file tree
   */
  async buildExportMonorepo(projectId: string): Promise<{
    project: any;
    files: Record<string, string>;
  }> {
    let project: any;
    try {
      project = await this.prisma.project.findUnique({
        where: { id: projectId },
        include: {
          fragments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          packages: true,
          plugins: true,
        },
      });
    } catch (err: any) {
      this.logger.warn(`Could not query project relations via Prisma delegate: ${err.message}`);
      const rows: any[] = await this.prisma.$queryRawUnsafe(
        `SELECT * FROM public.projects WHERE "id" = $1 LIMIT 1`,
        projectId,
      );
      if (rows && rows.length > 0) {
        project = rows[0];
        try {
          const frags: any[] = await this.prisma.$queryRawUnsafe(
            `SELECT * FROM public.project_fragments WHERE "projectId" = $1 ORDER BY "createdAt" DESC LIMIT 1`,
            projectId,
          );
          project.fragments = frags || [];
        } catch {
          project.fragments = [];
        }
      }
    }

    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const rawFiles: Record<string, string> =
      (project.fragments[0]?.files as Record<string, string>) || {};

    const exportTree: Record<string, string> = {};
    const projectName = project.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    // 1. Separate frontend and backend files cleanly
    let hasFrontend = false;
    let hasBackend = false;

    for (const [path, content] of Object.entries(rawFiles)) {
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;

      if (cleanPath.startsWith('backend/') || cleanPath.startsWith('src/backend/')) {
        hasBackend = true;
        const subPath = cleanPath.replace(/^(backend\/|src\/backend\/)/, '');
        exportTree[`backend/src/${subPath}`] = content;
      } else if (cleanPath.startsWith('prisma/')) {
        hasBackend = true;
        exportTree[`backend/${cleanPath}`] = content;
      } else if (cleanPath.startsWith('frontend/')) {
        hasFrontend = true;
        exportTree[cleanPath] = content;
      } else {
        // App router / frontend default
        hasFrontend = true;
        exportTree[`frontend/${cleanPath}`] = content;
      }
    }

    // 2. Ensure frontend boilerplate if missing
    if (hasFrontend || Object.keys(exportTree).length === 0) {
      if (!exportTree['frontend/package.json']) {
        exportTree['frontend/package.json'] = JSON.stringify(
          {
            name: `${projectName}-frontend`,
            version: '0.1.0',
            private: true,
            scripts: {
              dev: 'next dev',
              build: 'next build',
              start: 'next start',
              lint: 'next lint',
            },
            dependencies: {
              next: '^15.1.0',
              react: '^19.0.0',
              'react-dom': '^19.0.0',
              'lucide-react': '^0.475.0',
              clsx: '^2.1.1',
              'tailwind-merge': '^3.0.1',
              ...this.resolveInstalledPackageDeps(project.packages),
            },
            devDependencies: {
              '@types/node': '^22.0.0',
              '@types/react': '^19.0.0',
              '@types/react-dom': '^19.0.0',
              typescript: '^5.7.0',
              tailwindcss: '^4.0.0',
            },
          },
          null,
          2,
        );
      }

      if (!exportTree['frontend/tsconfig.json']) {
        exportTree['frontend/tsconfig.json'] = JSON.stringify(
          {
            compilerOptions: {
              target: 'ES2022',
              lib: ['dom', 'dom.iterable', 'esnext'],
              allowJs: true,
              skipLibCheck: true,
              strict: true,
              noEmit: true,
              esModuleInterop: true,
              module: 'esnext',
              moduleResolution: 'bundler',
              resolveJsonModule: true,
              isolatedModules: true,
              jsx: 'preserve',
              incremental: true,
              plugins: [{ name: 'next' }],
              paths: { '@/*': ['./src/*'] },
            },
            include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
            exclude: ['node_modules'],
          },
          null,
          2,
        );
      }

      if (!exportTree['frontend/next.config.ts']) {
        exportTree['frontend/next.config.ts'] = `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

export default nextConfig;
`;
      }

      if (!exportTree['frontend/Dockerfile']) {
        exportTree['frontend/Dockerfile'] = `FROM node:22-alpine AS base
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
`;
      }
    }

    // 3. Ensure backend boilerplate if backend enabled or present
    if (project.isBackendEnabled || hasBackend) {
      if (!exportTree['backend/package.json']) {
        exportTree['backend/package.json'] = JSON.stringify(
          {
            name: `${projectName}-backend`,
            version: '0.1.0',
            private: true,
            scripts: {
              build: 'nest build',
              start: 'node dist/main',
              'start:dev': 'nest start --watch',
              'prisma:generate': 'prisma generate',
              'prisma:push': 'prisma db push',
            },
            dependencies: {
              '@nestjs/common': '^11.0.0',
              '@nestjs/core': '^11.0.0',
              '@nestjs/platform-express': '^11.0.0',
              '@nestjs/swagger': '^11.0.0',
              '@prisma/client': '^6.4.0',
              'class-validator': '^0.14.1',
              'class-transformer': '^0.5.1',
              'reflect-metadata': '^0.2.2',
              rxjs: '^7.8.1',
            },
            devDependencies: {
              '@nestjs/cli': '^11.0.0',
              '@types/express': '^5.0.0',
              '@types/node': '^22.0.0',
              prisma: '^6.4.0',
              typescript: '^5.7.0',
            },
          },
          null,
          2,
        );
      }

      if (!exportTree['backend/tsconfig.json']) {
        exportTree['backend/tsconfig.json'] = JSON.stringify(
          {
            compilerOptions: {
              module: 'commonjs',
              declaration: true,
              removeComments: true,
              emitDecoratorMetadata: true,
              experimentalDecorators: true,
              allowSyntheticDefaultImports: true,
              target: 'ES2022',
              sourceMap: true,
              outDir: './dist',
              baseUrl: './',
              incremental: true,
              skipLibCheck: true,
              strictNullChecks: false,
              noImplicitAny: false,
              strictBindCallApply: false,
              forceConsistentCasingInFileNames: false,
              noFallthroughCasesInSwitch: false,
            },
          },
          null,
          2,
        );
      }

      if (!exportTree['backend/Dockerfile']) {
        exportTree['backend/Dockerfile'] = `FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
EXPOSE 4000
CMD ["node", "dist/main.js"]
`;
      }
    }

    // 4. Infrastructure & Monorepo Root Files
    exportTree['docker-compose.yml'] = `version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: ${projectName}-db
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: ${projectName.replace(/-/g, '_')}
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: ${projectName}-redis
    restart: always
    ports:
      - '6379:6379'

${
  project.isBackendEnabled || hasBackend
    ? `  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ${projectName}-api
    restart: always
    environment:
      PORT: 4000
      DATABASE_URL: postgresql://postgres:password@postgres:5432/${projectName.replace(/-/g, '_')}?schema=public
      REDIS_URL: redis://redis:6379
      FRONTEND_URL: http://localhost:3000
    ports:
      - '4000:4000'
    depends_on:
      - postgres
      - redis
`
    : ''
}  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: ${projectName}-web
    restart: always
    environment:
      PORT: 3000
      NEXT_PUBLIC_API_URL: http://localhost:4000/api/v1
    ports:
      - '3000:3000'
${project.isBackendEnabled || hasBackend ? '    depends_on:\n      - backend\n' : ''}
volumes:
  postgres_data:
`;

    // Multi-cloud deployment manifests
    exportTree['vercel.json'] = JSON.stringify(
      {
        version: 2,
        builds: [{ src: 'frontend/package.json', use: '@vercel/next' }],
        routes: [{ src: '/(.*)', dest: 'frontend/$1' }],
      },
      null,
      2,
    );

    exportTree['render.yaml'] = `services:
  - type: web
    name: ${projectName}-web
    env: node
    plan: starter
    buildCommand: cd frontend && npm install && npm run build
    startCommand: cd frontend && npm run start
    envVars:
      - key: NODE_ENV
        value: production
${
  project.isBackendEnabled || hasBackend
    ? `  - type: web
    name: ${projectName}-api
    env: node
    plan: starter
    buildCommand: cd backend && npm install && npx prisma generate && npm run build
    startCommand: cd backend && npm run start
    envVars:
      - key: PORT
        value: 4000
      - key: DATABASE_URL
        fromDatabase:
          name: ${projectName}-postgres
          property: connectionString

databases:
  - name: ${projectName}-postgres
    plan: starter
    databaseName: ${projectName.replace(/-/g, '_')}
    user: postgres
`
    : ''
}`;

    exportTree['railway.json'] = JSON.stringify(
      {
        $schema: 'https://railway.com/railway.schema.json',
        build: {
          builder: 'NIXPACKS',
        },
        deploy: {
          startCommand: 'pnpm dev',
          restartPolicyType: 'ON_FAILURE',
        },
      },
      null,
      2,
    );

    // .env.example
    exportTree['.env.example'] = `# ============================================
# ${project.name.toUpperCase()} ENVIRONMENT VARIABLES
# ============================================

NODE_ENV=development
PORT=4000

# Database Connection (PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/${projectName.replace(/-/g, '_')}?schema=public"

# Redis Cache
REDIS_URL="redis://localhost:6379"

# Frontend & CORS
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
FRONTEND_URL="http://localhost:3000"

# Authentication Secrets
JWT_SECRET="super-secret-jwt-token-change-in-production"
`;

    // Professional README.md
    const cb = '```';
    exportTree['README.md'] = `# ${project.name}

> Generated with **Nirmaanify AI** — Autonomous Full-Stack Multi-Agent Engine.

## 🚀 Architecture Overview

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS
- **Backend:** NestJS 11 REST API, Swagger OpenAPI
- **Database:** PostgreSQL with Prisma 6 ORM
- **Containerization:** Docker & Docker Compose
- **Hosting Targets:** Vercel, Render, Railway, Docker, Self-Hosted

---

## 🛠️ Quick Start (Local Development)

### 1. Prerequisites
- [Node.js 22+](https://nodejs.org)
- [Docker Desktop](https://www.docker.com)
- [pnpm](https://pnpm.io)

### 2. Run with Docker Compose (Recommended)
${cb}bash
docker compose up -d
${cb}
- Frontend Web App: http://localhost:3000
- Backend Swagger API: http://localhost:4000/api/docs

### 3. Run Manually

${cb}bash
# 1. Setup Backend
cd backend
cp ../.env.example .env
npm install
npx prisma db push
npm run start:dev

# 2. Setup Frontend (in another terminal)
cd frontend
npm install
npm run dev
${cb}

---

## 🚢 Deployment

- **Vercel:** Connect the repository and select root as frontend (or use vercel.json).
- **Render:** Deploy directly using the provided render.yaml Blueprint.
- **Railway:** Connect repo and Railway auto-detects via railway.json.
- **Self-Hosted:** Deploy with docker compose -f docker-compose.yml up -d.
`;

    return { project, files: exportTree };
  }

  /**
   * Helper to instantiate ZIP archiver supporting both archiver v8 (ZipArchive class) and v7/v6 (factory function)
   */
  private createZipStream(): any {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const archiverModule = require('archiver');
    if (archiverModule.ZipArchive) {
      return new archiverModule.ZipArchive({ zlib: { level: 9 } });
    }
    if (typeof archiverModule === 'function') {
      return archiverModule('zip', { zlib: { level: 9 } });
    }
    if (archiverModule.default && typeof archiverModule.default === 'function') {
      return archiverModule.default('zip', { zlib: { level: 9 } });
    }
    if (archiverModule.default?.ZipArchive) {
      return new archiverModule.default.ZipArchive({ zlib: { level: 9 } });
    }
    throw new Error('Could not instantiate zip archiver');
  }

  /**
   * Stream production ZIP archive directly to Express HTTP response
   */
  async streamZipArchive(projectId: string, res: Response): Promise<void> {
    const { project, files } = await this.buildExportMonorepo(projectId);
    const slug = project.slug || 'project';

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${slug}-monorepo.zip"`);

    const archive = this.createZipStream();

    archive.on('error', (err: any) => {
      this.logger.error(`Archiving error for project ${projectId}: ${err?.message || err}`);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error generating archive' });
      }
    });

    archive.pipe(res);

    for (const [relativePath, content] of Object.entries(files)) {
      archive.append(content, { name: `${slug}/${relativePath}` });
    }

    await archive.finalize();
  }

  /**
   * Push codebase directly to GitHub repository using user's GitHub PAT
   */
  async pushToGithub(
    projectId: string,
    dto: ExportGithubDto,
    userId?: string,
  ): Promise<GithubExportResultDto> {
    const { project, files } = await this.buildExportMonorepo(projectId);

    if (!dto.personalAccessToken) {
      throw new BadRequestException('GitHub Personal Access Token is required to export repository');
    }

    const headers = {
      Authorization: `Bearer ${dto.personalAccessToken}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Nirmaanify-AI-Exporter',
    };

    // 1. Get authenticated user
    const userRes = await fetch('https://api.github.com/user', { headers });
    if (!userRes.ok) {
      throw new BadRequestException('Invalid GitHub Personal Access Token or permissions expired');
    }
    const ghUser = await userRes.json();
    const owner = ghUser.login;
    const repoName = dto.repoName.trim().replace(/\s+/g, '-');

    // 2. Check if repo exists; create if not
    const checkRepoRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, { headers });
    let repoUrl = `https://github.com/${owner}/${repoName}`;

    if (!checkRepoRes.ok) {
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: repoName,
          private: dto.isPrivate ?? true,
          description: `Generated full-stack application for ${project.name} by Nirmaanify AI`,
          auto_init: true,
        }),
      });

      if (!createRes.ok) {
        const errorData = await createRes.json();
        throw new BadRequestException(`Could not create GitHub repository: ${errorData.message}`);
      }
      const newRepo = await createRes.json();
      repoUrl = newRepo.html_url;
      // Wait 1.5s for initial commit
      await new Promise((r) => setTimeout(r, 1500));
    }

    // 3. Push files one-by-one or via Contents API
    let pushedCount = 0;
    const branch = dto.branch || 'main';

    for (const [path, content] of Object.entries(files)) {
      try {
        const contentUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${path}`;
        const existing = await fetch(`${contentUrl}?ref=${branch}`, { headers });
        let sha: string | undefined;
        if (existing.ok) {
          const fileData = await existing.json();
          sha = fileData.sha;
        }

        const putRes = await fetch(contentUrl, {
          method: 'PUT',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: dto.commitMessage || `feat: scaffold ${path} from Nirmaanify AI`,
            content: Buffer.from(content).toString('base64'),
            branch,
            sha,
          }),
        });

        if (putRes.ok) {
          pushedCount++;
        }
      } catch (err: any) {
        this.logger.warn(`Failed pushing ${path} to GitHub: ${err.message}`);
      }
    }

    return {
      success: true,
      repoUrl,
      branch,
      filesPushed: pushedCount,
      message: `Successfully pushed ${pushedCount} files to GitHub repository ${owner}/${repoName}`,
    };
  }

  private resolveInstalledPackageDeps(packages: any[] = []): Record<string, string> {
    const deps: Record<string, string> = {};
    for (const p of packages) {
      if (p.name) {
        deps[p.name] = p.version || 'latest';
      }
    }
    return deps;
  }
}
