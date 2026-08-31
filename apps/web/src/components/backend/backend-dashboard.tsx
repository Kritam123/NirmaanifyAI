'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ProjectDto,
  ProjectBackendSchema,
  BackendModuleConfig,
  getDefaultBackendSchema,
  GeneratedFile,
} from '@nirmaanify/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
  Input,
  useToast,
} from '@nirmaanify/ui';
import {
  Server,
  Database,
  Layers,
  Code2,
  Play,
  Key,
  Shield,
  FileCode,
  Download,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  ShoppingBag,
  Users,
  CreditCard,
  FileText,
  Bell,
  UploadCloud,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { backendApi } from '../../core/api';

interface BackendDashboardProps {
  projects: ProjectDto[];
  activeProjectId?: string;
}

const MODULE_ICONS: Record<string, React.ReactNode> = {
  auth: <Shield className="h-4 w-4" />,
  users: <Users className="h-4 w-4" />,
  products: <ShoppingBag className="h-4 w-4" />,
  categories: <Layers className="h-4 w-4" />,
  orders: <FileText className="h-4 w-4" />,
  payments: <CreditCard className="h-4 w-4" />,
  blog: <FileCode className="h-4 w-4" />,
  notifications: <Bell className="h-4 w-4" />,
  uploads: <UploadCloud className="h-4 w-4" />,
};

export function BackendDashboard({ projects, activeProjectId }: BackendDashboardProps) {
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    activeProjectId || projects[0]?.id || ''
  );

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || projects[0] || null;
  }, [projects, selectedProjectId]);

  // Backend Schema State
  const [backendConfig, setBackendConfig] = useState<ProjectBackendSchema>(
    getDefaultBackendSchema(activeProject?.name || 'App')
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'modules' | 'database' | 'api-explorer' | 'environment' | 'codegen'
  >('overview');

  // Generated Source Code State
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedFile, setCopiedFile] = useState(false);

  // API Explorer Sandbox State
  const [selectedEndpoint, setSelectedEndpoint] = useState<{ method: string; path: string } | null>(null);
  const [requestBody, setRequestBody] = useState('{\n  "email": "user@nirmaanify.dev",\n  "password": "Password123!"\n}');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);

  // Fetch backend config for active project
  useEffect(() => {
    if (!activeProject) return;

    const fetchConfig = async () => {
      setIsLoading(true);
      try {
        const data = await backendApi.getConfig(activeProject.id);
        if (data) {
          setBackendConfig(data);
        }
      } catch (err) {
        console.error('Error fetching backend config:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [activeProject]);

  // Toggle backend enablement
  const handleToggleBackend = async (enabled: boolean) => {
    const updated = { ...backendConfig, enabled };
    setBackendConfig(updated);
    await handleSaveConfig(updated);
    toast({
      title: enabled ? 'NestJS Backend Enabled' : 'Switched to Frontend-Only',
      description: enabled
        ? 'Fullstack NestJS 11 + PostgreSQL architecture activated.'
        : 'Project set to static frontend build.',
      type: 'info',
    });
  };

  // Toggle module enablement
  const handleToggleModule = (moduleId: string, enabled: boolean) => {
    const updatedModules = backendConfig.modules.map((m) =>
      m.id === moduleId ? { ...m, enabled } : m
    );
    const updated = { ...backendConfig, modules: updatedModules };
    setBackendConfig(updated);
  };

  // Save backend configuration to backend API
  const handleSaveConfig = async (configToSave?: ProjectBackendSchema) => {
    if (!activeProject) return;
    setIsSaving(true);
    try {
      const payload = configToSave || backendConfig;
      await backendApi.updateConfig(activeProject.id, payload);
      toast({ title: 'Backend Settings Saved', description: 'Updated project architecture schema.', type: 'success' });
    } catch {
      toast({ title: 'Save Failed', description: 'Could not update backend configuration.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Generate source code files
  const handleGenerateCode = async () => {
    if (!activeProject) return;
    setIsGenerating(true);
    try {
      const data = await backendApi.getGeneratedFiles(activeProject.id);
      if (data) {
        setGeneratedFiles(data.files || []);
        setSelectedFileIndex(0);
        setActiveTab('codegen');
        toast({
          title: 'NestJS Code Generated! ⚡',
          description: `Compiled ${data.totalFiles} source files successfully.`,
          type: 'success',
        });
      }
    } catch {
      toast({ title: 'Generation Error', description: 'Could not compile NestJS source files.', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  // Test Endpoint in API Explorer
  const handleExecuteApiTest = async () => {
    if (!selectedEndpoint || !activeProject) return;
    setIsTestingApi(true);
    try {
      let parsedBody: any = undefined;
      try {
        if (['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method)) {
          parsedBody = JSON.parse(requestBody);
        }
      } catch {
        // use raw
      }

      const res = await backendApi.testEndpoint(activeProject.id, {
        method: selectedEndpoint.method,
        path: selectedEndpoint.path,
        body: parsedBody,
      });

      setApiResponse(res);
    } catch (err: any) {
      setApiResponse({ error: err.message || 'API request simulation failed' });
    } finally {
      setIsTestingApi(false);
    }
  };

  const activeEndpointsList = useMemo(() => {
    const list: { moduleName: string; path: string; method: string; description: string; auth: boolean }[] = [];
    backendConfig.modules
      .filter((m) => m.enabled)
      .forEach((m) => {
        m.endpoints.forEach((e) => {
          list.push({
            moduleName: m.name,
            path: `/${backendConfig.apiPrefix}/${m.routePrefix}${e.path.startsWith('/') ? e.path : `/${e.path}`}`,
            method: e.method,
            description: e.description,
            auth: e.auth,
          });
        });
      });
    return list;
  }, [backendConfig]);

  if (!activeProject) {
    return (
      <Card className="p-12 text-center space-y-3">
        <Server className="h-10 w-10 text-slate-400 mx-auto" />
        <h4 className="font-bold text-base">No Active Projects</h4>
        <p className="text-xs text-slate-400">Create a project first to configure the backend builder.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#24293D]">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Server className="h-5 w-5 text-[#635BFF]" />
            <span>Backend Builder & NestJS Generation Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure optional NestJS 11 microservices, PostgreSQL Prisma models, and compile production source code.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#161926] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#24293D]">
            <span className="text-[11px] font-semibold text-slate-400">Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#635BFF] focus:outline-none cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-[#161926] text-slate-900 dark:text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            size="sm"
            variant="default"
            isLoading={isGenerating}
            leftIcon={<Code2 className="h-4 w-4" />}
            onClick={handleGenerateCode}
          >
            Compile NestJS Code
          </Button>
        </div>
      </div>

      {/* Top Banner: Optional Backend Toggle */}
      <Card className="p-4 bg-gradient-to-r from-[#635BFF]/10 via-[#8B5CF6]/10 to-transparent border-slate-200 dark:border-[#24293D] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#635BFF] text-white flex items-center justify-center shadow-md">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {backendConfig.enabled ? 'Full-Stack NestJS Backend Enabled' : 'Frontend-Only Project'}
              </h4>
              <Badge variant={backendConfig.enabled ? 'cyan' : 'secondary'} size="sm">
                {backendConfig.enabled ? 'Full-Stack Active' : 'Static Export'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {backendConfig.enabled
                ? `Running on Port ${backendConfig.port} with PostgreSQL 16 & Prisma ORM.`
                : 'Project generates pure Next.js 15 frontend client without server backend.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleToggleBackend(!backendConfig.enabled)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              backendConfig.enabled
                ? 'bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-500/30'
                : 'bg-[#635BFF] text-white hover:bg-[#635BFF]/90'
            }`}
          >
            {backendConfig.enabled ? 'Disable Backend' : 'Enable NestJS Backend'}
          </button>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#24293D] overflow-x-auto text-xs font-semibold pb-1 scrollbar-none">
        {[
          { id: 'overview' as const, label: 'Overview', icon: <Server className="h-4 w-4" /> },
          { id: 'modules' as const, label: `Modules (${backendConfig.modules.filter((m) => m.enabled).length})`, icon: <Layers className="h-4 w-4" /> },
          { id: 'database' as const, label: 'Database & Prisma', icon: <Database className="h-4 w-4" /> },
          { id: 'api-explorer' as const, label: `API Explorer (${activeEndpointsList.length})`, icon: <Play className="h-4 w-4" /> },
          { id: 'environment' as const, label: 'Environment (.env)', icon: <Key className="h-4 w-4" /> },
          { id: 'codegen' as const, label: `Source Code (${generatedFiles.length})`, icon: <FileCode className="h-4 w-4" /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === t.id
                ? 'border-[#635BFF] text-[#635BFF] dark:text-[#A5AEFD]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Framework Runtime</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">NestJS 11</h3>
              <p className="text-[11px] text-emerald-500">Express / TypeScript AST</p>
            </Card>
            <Card className="p-4 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Database Engine</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">PostgreSQL 16</h3>
              <p className="text-[11px] text-slate-400">Prisma Client v6.4.1</p>
            </Card>
            <Card className="p-4 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Active Modules</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {backendConfig.modules.filter((m) => m.enabled).length} of {backendConfig.modules.length}
              </h3>
              <p className="text-[11px] text-[#635BFF]">Modular architecture</p>
            </Card>
            <Card className="p-4 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">REST Endpoints</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{activeEndpointsList.length} APIs</h3>
              <p className="text-[11px] text-slate-400">Auto-documented Swagger</p>
            </Card>
          </div>

          {/* Architecture Pipeline Visualizer */}
          <Card className="p-6 space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Full-Stack Data Flow Architecture</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] space-y-1">
                <span className="font-bold text-xs text-[#635BFF]">Next.js 15 Client</span>
                <p className="text-[11px] text-slate-400">Visual components & Server components</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] space-y-1">
                <span className="font-bold text-xs text-[#22D3EE]">API Data Sources</span>
                <p className="text-[11px] text-slate-400">REST query bindings & JWT headers</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] space-y-1">
                <span className="font-bold text-xs text-[#8B5CF6]">NestJS Controllers</span>
                <p className="text-[11px] text-slate-400">Validation pipes, guards & services</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] space-y-1">
                <span className="font-bold text-xs text-emerald-500">PostgreSQL Database</span>
                <p className="text-[11px] text-slate-400">Prisma migrations & schema relations</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: MODULE BUILDER */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">NestJS Micro-Modules</h4>
              <p className="text-xs text-slate-500">Enable or configure modular backend packages for this application.</p>
            </div>
            <Button size="sm" variant="default" onClick={() => handleSaveConfig()}>
              Save Module Settings
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {backendConfig.modules.map((mod) => (
              <Card
                key={mod.id}
                className={`p-5 space-y-3 transition-all border ${
                  mod.enabled
                    ? 'border-[#635BFF] shadow-sm bg-white dark:bg-[#161926]'
                    : 'border-slate-200/60 dark:border-[#24293D] opacity-60 bg-slate-50 dark:bg-[#0E121E]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${mod.enabled ? 'bg-[#635BFF] text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                      {MODULE_ICONS[mod.id] || <Layers className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{mod.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">/{mod.routePrefix}</span>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={mod.enabled}
                    onChange={(e) => handleToggleModule(mod.id, e.target.checked)}
                    className="h-4 w-4 text-[#635BFF] rounded"
                  />
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {mod.description}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-[#24293D] flex items-center justify-between text-[10px] text-slate-400">
                  <span>{mod.endpoints.length} Endpoints</span>
                  <span>{mod.entities.join(', ')}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DATABASE & PRISMA */}
      {activeTab === 'database' && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">PostgreSQL Prisma Schema</h4>
              <p className="text-xs text-slate-500">Auto-generated database models mapped to enabled modules.</p>
            </div>
            <Badge variant="indigo" size="sm">schema.prisma</Badge>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-auto max-h-[500px]">
{`datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN
  DEVELOPER
  MEMBER
  CUSTOMER
}

model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String
  name         String
  role         Role      @default(MEMBER)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Product {
  id          String    @id @default(uuid())
  name        String
  slug        String    @unique
  price       Float
  imageUrl    String
  inStock     Boolean   @default(true)
  createdAt   DateTime  @default(now())
}

model Order {
  id          String    @id @default(uuid())
  userId      String
  totalAmount Float
  status      String    @default("PENDING")
  createdAt   DateTime  @default(now())
}`}
          </pre>
        </Card>
      )}

      {/* TAB 4: API EXPLORER & SWAGGER */}
      {activeTab === 'api-explorer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Endpoints List */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Available Endpoints</span>
            <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
              {activeEndpointsList.map((ep, idx) => (
                <div
                  key={ep.path + ep.method + idx}
                  onClick={() => setSelectedEndpoint({ method: ep.method, path: ep.path })}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all border flex items-center justify-between text-xs ${
                    selectedEndpoint?.path === ep.path && selectedEndpoint?.method === ep.method
                      ? 'border-[#635BFF] bg-[#635BFF]/10 text-[#635BFF] font-bold'
                      : 'bg-white dark:bg-[#161926] border-slate-200 dark:border-[#24293D] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        ep.method === 'GET'
                          ? 'bg-blue-500/20 text-blue-500'
                          : ep.method === 'POST'
                          ? 'bg-emerald-500/20 text-emerald-500'
                          : ep.method === 'PUT'
                          ? 'bg-amber-500/20 text-amber-500'
                          : 'bg-rose-500/20 text-rose-500'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-[11px] truncate">{ep.path}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Request / Response Sandbox */}
          <div className="lg:col-span-2 space-y-4">
            {selectedEndpoint ? (
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#635BFF] text-white">
                      {selectedEndpoint.method}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {selectedEndpoint.path}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="default"
                    isLoading={isTestingApi}
                    leftIcon={<Play className="h-3.5 w-3.5" />}
                    onClick={handleExecuteApiTest}
                  >
                    Send Request
                  </Button>
                </div>

                {['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method) && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Request Payload (JSON)</label>
                    <textarea
                      rows={4}
                      value={requestBody}
                      onChange={(e) => setRequestBody(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0E121E] font-mono text-xs border border-slate-200 dark:border-[#24293D] focus:outline-none"
                    />
                  </div>
                )}

                {apiResponse && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-[#24293D]">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-500">Status: {apiResponse.status || 200} OK</span>
                      <span className="text-slate-400 font-mono">{apiResponse.durationMs || 12}ms</span>
                    </div>
                    <pre className="p-3 rounded-xl bg-slate-950 text-cyan-300 font-mono text-[10px] overflow-auto max-h-56">
                      {JSON.stringify(apiResponse.data, null, 2)}
                    </pre>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="p-12 text-center space-y-2">
                <Play className="h-8 w-8 text-slate-400 mx-auto" />
                <h5 className="font-bold text-xs">Select an API Endpoint to Test</h5>
                <p className="text-[11px] text-slate-400">Click any route on the left list to inspect parameters and test live mock responses.</p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: ENVIRONMENT */}
      {activeTab === 'environment' && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Environment Configuration (.env)</h4>
              <p className="text-xs text-slate-500">Key-value configurations and secret keys injected at runtime.</p>
            </div>
            <Button size="sm" variant="default" onClick={() => handleSaveConfig()}>
              Save Environment
            </Button>
          </div>

          <div className="space-y-3">
            {backendConfig.envVariables.map((env, idx) => (
              <div key={env.key} className="p-3 rounded-xl bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] flex flex-wrap sm:flex-nowrap items-center gap-3">
                <div className="w-48 shrink-0">
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">{env.key}</span>
                  {env.description && <p className="text-[10px] text-slate-400">{env.description}</p>}
                </div>
                <input
                  type={env.isSecret ? 'password' : 'text'}
                  value={env.value}
                  onChange={(e) => {
                    const updated = [...backendConfig.envVariables];
                    updated[idx] = { ...updated[idx], value: e.target.value };
                    setBackendConfig({ ...backendConfig, envVariables: updated });
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#0E121E] border border-slate-200 dark:border-[#24293D] font-mono text-xs"
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 6: SOURCE CODE VIEWER (WEEK 26 DELIVERABLE) */}
      {activeTab === 'codegen' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* File Explorer Tree */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Source Tree ({generatedFiles.length} files)
            </span>
            <div className="space-y-1 max-h-[550px] overflow-y-auto">
              {generatedFiles.map((file, idx) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`w-full p-2 rounded-lg text-left font-mono text-xs flex items-center gap-2 truncate transition-colors ${
                    selectedFileIndex === idx
                      ? 'bg-[#635BFF] text-white font-bold'
                      : 'bg-white dark:bg-[#161926] text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <FileCode className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{file.path}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Code Viewer */}
          <div className="lg:col-span-3">
            {generatedFiles[selectedFileIndex] ? (
              <Card className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-[#635BFF]" />
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      {generatedFiles[selectedFileIndex].path}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={copiedFile ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    onClick={() => {
                      navigator.clipboard.writeText(generatedFiles[selectedFileIndex].content);
                      setCopiedFile(true);
                      setTimeout(() => setCopiedFile(false), 2000);
                      toast({ title: 'Copied', description: 'Source code copied to clipboard.', type: 'info' });
                    }}
                  >
                    {copiedFile ? 'Copied!' : 'Copy Code'}
                  </Button>
                </div>

                <pre className="p-4 rounded-xl bg-slate-950 text-cyan-300 font-mono text-[11px] overflow-auto max-h-[500px]">
                  {generatedFiles[selectedFileIndex].content}
                </pre>
              </Card>
            ) : (
              <Card className="p-12 text-center space-y-3">
                <Code2 className="h-8 w-8 text-slate-400 mx-auto" />
                <h5 className="font-bold text-xs">No Compiled Source Files</h5>
                <p className="text-[11px] text-slate-400">Click &ldquo;Compile NestJS Code&rdquo; at the top to generate full architecture source files.</p>
                <Button size="sm" variant="default" onClick={handleGenerateCode}>
                  Compile NestJS Code
                </Button>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
