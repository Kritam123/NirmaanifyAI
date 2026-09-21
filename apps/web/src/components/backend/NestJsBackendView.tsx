'use client';

import React, { useState } from 'react';
import { ProjectDto } from '@nirmaanify/types';
import {
  Card,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  useToast,
} from '@nirmaanify/ui';
import {
  Server,
  Database,
  CheckCircle2,
  ExternalLink,
  Activity,
  Copy,
  Check,
  Terminal,
  Layers,
  Key,
  Shield,
  Clock,
  Radio,
  RefreshCw,
} from 'lucide-react';

interface NestJsBackendViewProps {
  project: ProjectDto;
}

interface EndpointInfo {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  authRequired: boolean;
}

const MODULE_ENDPOINTS: Array<{
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  endpoints: EndpointInfo[];
}> = [
  {
    name: 'Authentication & RBAC',
    description: 'JWT session tokens, password hashing, OAuth2 providers, and user management.',
    icon: Shield,
    endpoints: [
      { method: 'POST', path: '/api/v1/auth/register', description: 'Register a new user account', authRequired: false },
      { method: 'POST', path: '/api/v1/auth/login', description: 'Authenticate credentials & retrieve JWT', authRequired: false },
      { method: 'GET', path: '/api/v1/auth/me', description: 'Fetch current authenticated user profile', authRequired: true },
      { method: 'POST', path: '/api/v1/auth/refresh', description: 'Exchange refresh token for new access token', authRequired: true },
    ],
  },
  {
    name: 'Projects & Workspaces',
    description: 'Tenant workspace isolation, project schema persistence, and team memberships.',
    icon: Layers,
    endpoints: [
      { method: 'GET', path: '/api/v1/projects', description: 'List projects in active workspace', authRequired: true },
      { method: 'POST', path: '/api/v1/projects', description: 'Create project with blueprint & schema', authRequired: true },
      { method: 'GET', path: '/api/v1/projects/:id', description: 'Get project metadata, schema, and stack', authRequired: true },
      { method: 'PUT', path: '/api/v1/projects/:id', description: 'Update project configuration and routes', authRequired: true },
    ],
  },
  {
    name: 'Storage & Asset Delivery',
    description: 'Multipart file uploads, S3 / MinIO object storage, and Vercel Blob CDN.',
    icon: Database,
    endpoints: [
      { method: 'POST', path: '/api/v1/storage/upload', description: 'Upload file asset to configured storage engine', authRequired: true },
      { method: 'GET', path: '/api/v1/storage/files/:projectId', description: 'List assets uploaded to project', authRequired: true },
      { method: 'DELETE', path: '/api/v1/storage/files/:id', description: 'Delete file asset from bucket/filesystem', authRequired: true },
    ],
  },
  {
    name: 'Platform Health & Telemetry',
    description: 'Terminus health probes, memory metrics, and uptime monitoring.',
    icon: Activity,
    endpoints: [
      { method: 'GET', path: '/api/health', description: 'Live health status check and process uptime', authRequired: false },
      { method: 'GET', path: '/api/docs', description: 'Swagger / OpenAPI interactive UI documentation', authRequired: false },
    ],
  },
];

export const NestJsBackendView: React.FC<NestJsBackendViewProps> = ({ project }) => {
  const { toast } = useToast();

  const [pingStatus, setPingStatus] = useState<{
    tested: boolean;
    loading: boolean;
    success?: boolean;
    latency?: number;
    message?: string;
  }>({ tested: false, loading: false });

  const [copiedEnv, setCopiedEnv] = useState(false);

  const envTemplate = `# NestJS Backend Environment Configuration
PORT=3001
NODE_ENV=development
API_PREFIX=api/v1

# PostgreSQL & Prisma Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nirmaanify?schema=public"

# Authentication & Security
JWT_SECRET="nirmaanify-jwt-dev-secret-replace-in-production"
JWT_EXPIRATION="7d"

# Redis & BullMQ Workers
REDIS_HOST="localhost"
REDIS_PORT=6379

# Storage Configuration
STORAGE_DRIVER=${project.storageDriver || 'local'}
CORS_ORIGIN="http://localhost:3000"`;

  const handleTestHealth = async () => {
    setPingStatus({ tested: false, loading: true });
    const startTime = performance.now();
    try {
      const res = await fetch('/api/health');
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      if (res.ok) {
        setPingStatus({
          tested: true,
          loading: false,
          success: true,
          latency,
          message: `200 OK (${latency}ms) — Server is healthy and accepting connections.`,
        });
        toast({
          title: 'NestJS Server Online',
          description: `Healthcheck responded in ${latency}ms.`,
          type: 'success',
        });
      } else {
        setPingStatus({
          tested: true,
          loading: false,
          success: false,
          latency,
          message: `Status ${res.status}: ${res.statusText}`,
        });
      }
    } catch (err: any) {
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      setPingStatus({
        tested: true,
        loading: false,
        success: false,
        latency,
        message: err.message || 'Connection refused',
      });
      toast({
        title: 'Server Connection Failed',
        description: 'Could not connect to the NestJS API server.',
        type: 'error',
      });
    }
  };

  const handleCopyEnv = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(envTemplate);
      setCopiedEnv(true);
      toast({
        title: 'Environment Config Copied',
        description: '.env configuration copied to clipboard.',
        type: 'success',
      });
      setTimeout(() => setCopiedEnv(false), 2000);
    }
  };

  const getMethodBadgeVariant = (method: string): 'indigo' | 'secondary' | 'success' | 'warning' | 'destructive' => {
    switch (method) {
      case 'GET':
        return 'indigo';
      case 'POST':
        return 'success';
      case 'PUT':
      case 'PATCH':
        return 'warning';
      case 'DELETE':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: NestJS Server Gateway Status */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[#635BFF] border border-indigo-100 dark:border-indigo-900/40">
            <Server className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                NestJS REST API Gateway
              </h3>
              <Badge variant="indigo" size="sm" className="font-mono">
                NestJS 11
              </Badge>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Enterprise TypeScript backend with Prisma ORM, PostgreSQL database, BullMQ background queues, and OpenAPI specifications.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Activity className="h-4 w-4" />}
            onClick={handleTestHealth}
            isLoading={pingStatus.loading}
          >
            Ping Health
          </Button>

          <Button
            size="sm"
            variant="default"
            leftIcon={<ExternalLink className="h-4 w-4" />}
            onClick={() => window.open('/api/docs', '_blank')}
          >
            Swagger Docs
          </Button>
        </div>
      </div>

      {/* Health Ping Result if tested */}
      {pingStatus.tested && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
            pingStatus.success
              ? 'bg-emerald-50/75 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50/75 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {pingStatus.success ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Radio className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <span className="font-semibold">{pingStatus.message}</span>
          </div>
          <span className="font-mono text-[11px] opacity-75">
            Latency: {pingStatus.latency}ms
          </span>
        </div>
      )}

      {/* Grid: Architecture Breakdown & Database */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#161926] space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Framework</span>
          <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Server className="h-4 w-4 text-[#635BFF]" /> NestJS 11
          </p>
          <p className="text-[11px] text-slate-500">Fastify / Express HTTP adapter</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#161926] space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Database &amp; ORM</span>
          <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Database className="h-4 w-4 text-cyan-500" /> PostgreSQL 16
          </p>
          <p className="text-[11px] text-slate-500">Prisma Client ORM</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#161926] space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Background Queues</span>
          <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-violet-500" /> BullMQ + Redis
          </p>
          <p className="text-[11px] text-slate-500">Distributed jobs &amp; workers</p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#161926] space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Base Route Prefix</span>
          <p className="text-sm font-bold text-slate-900 dark:text-white font-mono flex items-center gap-1.5">
            <Terminal className="h-4 w-4 text-amber-500" /> /api/v1
          </p>
          <p className="text-[11px] text-slate-500">Global versioned routing</p>
        </div>
      </div>

      {/* REST Modules & Endpoints Table */}
      <Card className="p-6 space-y-4 border border-slate-200 dark:border-[#24293D] shadow-xs">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#635BFF]" />
            <span>Active Server Modules &amp; API Routes</span>
          </CardTitle>
          <CardDescription className="mt-1">
            Standard REST API routes exposed by this project&apos;s NestJS backend.
          </CardDescription>
        </div>

        <div className="space-y-4">
          {MODULE_ENDPOINTS.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.name}
                className="p-4 rounded-xl border border-slate-200 dark:border-[#24293D] bg-slate-50 dark:bg-[#161926] space-y-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-white dark:bg-[#0F111A] text-[#635BFF] border border-slate-200 dark:border-slate-800">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {mod.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">{mod.description}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {mod.endpoints.map((ep) => (
                    <div
                      key={ep.path}
                      className="p-2.5 rounded-lg bg-white dark:bg-[#12141F] border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Badge variant={getMethodBadgeVariant(ep.method)} size="sm" className="font-mono font-bold w-14 justify-center">
                          {ep.method}
                        </Badge>
                        <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {ep.path}
                        </span>
                        <span className="text-[11px] text-slate-400 hidden sm:inline truncate">
                          — {ep.description}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {ep.authRequired ? (
                          <span className="text-[10px] font-semibold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200/60 dark:border-amber-900/40">
                            JWT Auth
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-900/40">
                            Public
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Environment Config Helper */}
      <Card className="p-6 space-y-3 border border-slate-200 dark:border-[#24293D] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="h-4 w-4 text-amber-500" />
              <span>Environment Configuration (.env)</span>
            </CardTitle>
            <CardDescription className="mt-1">
              Required environment variables to connect your NestJS application locally or in production.
            </CardDescription>
          </div>

          <Button
            size="xs"
            variant="outline"
            leftIcon={copiedEnv ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            onClick={handleCopyEnv}
          >
            {copiedEnv ? 'Copied' : 'Copy .env'}
          </Button>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
          <pre className="leading-relaxed whitespace-pre font-mono">{envTemplate}</pre>
        </div>
      </Card>
    </div>
  );
};
