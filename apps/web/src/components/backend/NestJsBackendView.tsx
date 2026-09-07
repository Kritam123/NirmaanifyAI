'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ProjectDto,
  ProjectBackendSchema,
  PredefinedModuleId,
  PREDEFINED_BACKEND_MODULES,
  DEFAULT_BACKEND_SERVER_SETTINGS,
  createDefaultProjectBackendSchema,
  NestJsProjectCode,
} from '@nirmaanify/types';
import {
  Card,
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  Button,
  Badge,
  Switch,
  Input,
  Tabs,
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
  ShoppingBag,
  Tag,
  ShoppingCart,
  CreditCard,
  FileText,
  Bell,
  UploadCloud,
  Users,
  Settings,
  Code,
  FileCode2,
  FolderTree,
  Send,
  Zap,
  CheckCircle,
  AlertTriangle,
  Download,
  X,
  Plus,
} from 'lucide-react';
import { NestJsCodeGenerator } from '@nirmaanify/component-registry';
import { apiClient } from '../../lib/api';

interface NestJsBackendViewProps {
  project: ProjectDto;
  onProjectUpdated?: (updated: ProjectDto) => void;
}

const MODULE_ICONS: Record<PredefinedModuleId, React.ComponentType<{ className?: string }>> = {
  auth: Shield,
  users: Users,
  products: ShoppingBag,
  categories: Tag,
  orders: ShoppingCart,
  payments: CreditCard,
  blog: FileText,
  notifications: Bell,
  uploads: UploadCloud,
};

export const NestJsBackendView: React.FC<NestJsBackendViewProps> = ({
  project,
  onProjectUpdated,
}) => {
  const { toast } = useToast();

  // Initialize or extract backend schema from project
  const initialSchema: ProjectBackendSchema = useMemo(() => {
    const existing = (project.projectSchema as any)?.backendConfiguration?.schema as
      | ProjectBackendSchema
      | undefined;
    if (existing) {
      return {
        ...existing,
        enabled: project.isBackendEnabled ?? existing.enabled,
      };
    }
    const def = createDefaultProjectBackendSchema();
    def.enabled = project.isBackendEnabled ?? false;
    return def;
  }, [project]);

  const [backendSchema, setBackendSchema] = useState<ProjectBackendSchema>(initialSchema);
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'database' | 'api' | 'environment'>('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncingDataSources, setIsSyncingDataSources] = useState(false);

  // Selected module for configuration modal
  const [selectedModuleId, setSelectedModuleId] = useState<PredefinedModuleId | null>(null);

  // Code generation state & modal
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<NestJsProjectCode | null>(null);
  const [selectedFileKey, setSelectedFileKey] = useState<string>('src/app.module.ts');
  const [copiedFile, setCopiedFile] = useState(false);

  // API Playground state
  const [selectedApiRoute, setSelectedApiRoute] = useState<string | null>(null);
  const [apiTestResponse, setApiTestResponse] = useState<any | null>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);

  // Healthcheck state
  const [pingStatus, setPingStatus] = useState<{
    tested: boolean;
    loading: boolean;
    success?: boolean;
    latency?: number;
    message?: string;
  }>({ tested: false, loading: false });

  const [copiedEnv, setCopiedEnv] = useState(false);

  // Keep local schema in sync when project prop updates
  useEffect(() => {
    const existing = (project.projectSchema as any)?.backendConfiguration?.schema as
      | ProjectBackendSchema
      | undefined;
    if (existing) {
      setBackendSchema({
        ...existing,
        enabled: project.isBackendEnabled ?? existing.enabled,
      });
    } else {
      const def = createDefaultProjectBackendSchema();
      def.enabled = project.isBackendEnabled ?? false;
      setBackendSchema(def);
    }
  }, [project]);

  // Compute metrics
  const enabledModules = useMemo(
    () => Object.values(backendSchema.modules).filter((m) => m.enabled),
    [backendSchema.modules]
  );

  const totalEndpoints = useMemo(
    () => enabledModules.reduce((acc, m) => acc + m.endpoints.length, 0),
    [enabledModules]
  );

  const databaseModels = useMemo(
    () => enabledModules.filter((m) => m.databaseModel).map((m) => m.databaseModel!),
    [enabledModules]
  );

  // Save backend configuration to API and sync state
  const handleSaveSchema = async (updatedSchema: ProjectBackendSchema) => {
    setIsSaving(true);
    try {
      const res = await apiClient.projects.updateBackendSchema(project.id, updatedSchema);
      setBackendSchema(res.schema);
      if (onProjectUpdated) {
        onProjectUpdated(res.project);
      }
      toast({
        title: 'Backend Configuration Saved',
        description: `Updated NestJS backend settings with ${
          Object.values(updatedSchema.modules).filter((m) => m.enabled).length
        } active modules.`,
        type: 'success',
      });
    } catch (err: any) {
      console.error('Failed to save backend configuration:', err);
      toast({
        title: 'Save Failed',
        description: err.message || 'Could not update backend configuration.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle backend enabled/disabled master switch
  const handleToggleBackend = async (enabled: boolean) => {
    const updated: ProjectBackendSchema = {
      ...backendSchema,
      enabled,
      updatedAt: new Date().toISOString(),
    };
    setBackendSchema(updated);
    await handleSaveSchema(updated);
  };

  // Toggle individual module enabled state
  const handleToggleModule = async (moduleId: PredefinedModuleId, enabled: boolean) => {
    const updated: ProjectBackendSchema = {
      ...backendSchema,
      modules: {
        ...backendSchema.modules,
        [moduleId]: {
          ...backendSchema.modules[moduleId],
          enabled,
        },
      },
      updatedAt: new Date().toISOString(),
    };
    setBackendSchema(updated);
    await handleSaveSchema(updated);
  };

  // Sync Data Sources to frontend project schema (Week 27)
  const handleSyncDataSources = async () => {
    setIsSyncingDataSources(true);
    try {
      const dataSources = NestJsCodeGenerator.generateDataSources(backendSchema);
      const existingProjectSchema = (project.projectSchema as any) || {};
      const nonBackendDataSources = (existingProjectSchema.dataSources || []).filter(
        (ds: any) => !ds.id?.startsWith('ds-')
      );
      const updatedProjectSchema = {
        ...existingProjectSchema,
        dataSources: [...nonBackendDataSources, ...dataSources],
      };

      const updatedProject = await apiClient.projects.updateProject(project.id, {
        projectSchema: updatedProjectSchema,
      });

      if (onProjectUpdated) {
        onProjectUpdated(updatedProject);
      }

      toast({
        title: 'Data Sources Synchronized',
        description: `Generated ${dataSources.length} frontend REST API Data Sources for visual studio components.`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Sync Failed',
        description: err.message || 'Failed to synchronize data sources.',
        type: 'error',
      });
    } finally {
      setIsSyncingDataSources(false);
    }
  };

  // Generate full NestJS codebase (Week 26)
  const handleGenerateCode = () => {
    const code = NestJsCodeGenerator.generateProject(project.id, project.name, backendSchema);
    setGeneratedCode(code);
    setIsCodeModalOpen(true);
    if (!code.files[selectedFileKey]) {
      setSelectedFileKey('src/app.module.ts');
    }
  };

  // Health ping
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
          title: 'NestJS Gateway Online',
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
    }
  };

  // Copy .env template
  const handleCopyEnv = () => {
    const s = backendSchema.settings;
    const envText = `# NestJS Server Environment Configuration
PORT=${s.port}
NODE_ENV=development
API_PREFIX=${s.globalPrefix}

# PostgreSQL Database Connection
DATABASE_URL="${s.databaseUrl}"

# JWT Authentication
JWT_SECRET="${s.jwtSecret}"
JWT_EXPIRATION="${s.jwtExpiration}"

# Security & CORS
CORS_ORIGIN="${s.corsOrigin}"
`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(envText);
      setCopiedEnv(true);
      toast({
        title: 'Environment Config Copied',
        description: '.env configuration copied to clipboard.',
        type: 'success',
      });
      setTimeout(() => setCopiedEnv(false), 2000);
    }
  };

  // Copy active file in code generator modal
  const handleCopyActiveFile = () => {
    if (!generatedCode || !generatedCode.files[selectedFileKey]) return;
    const content = generatedCode.files[selectedFileKey].content;
    navigator.clipboard.writeText(content);
    setCopiedFile(true);
    toast({
      title: 'File Copied',
      description: `${selectedFileKey} copied to clipboard.`,
      type: 'success',
    });
    setTimeout(() => setCopiedFile(false), 2000);
  };

  // Test API route in playground (Week 27)
  const handleRunApiTest = (endpoint: string, method: string) => {
    setIsTestingApi(true);
    setSelectedApiRoute(endpoint);
    setTimeout(() => {
      setApiTestResponse({
        statusCode: 200,
        statusText: 'OK',
        timestamp: new Date().toISOString(),
        route: endpoint,
        method: method,
        payload: {
          success: true,
          message: `Live mock response from generated NestJS ${endpoint} route.`,
          data: [
            { id: 'item_1', name: 'Sample Item 1', status: 'ACTIVE' },
            { id: 'item_2', name: 'Sample Item 2', status: 'ACTIVE' },
          ],
        },
      });
      setIsTestingApi(false);
      toast({
        title: 'API Request Complete',
        description: `${method} ${endpoint} returned status 200 OK.`,
        type: 'success',
      });
    }, 450);
  };

  // ==========================================
  // VIEW: BACKEND DISABLED (FRONTEND ONLY)
  // ==========================================
  if (!backendSchema.enabled) {
    return (
      <div className="space-y-6">
        <Card className="p-8 border-2 border-dashed border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#161926] rounded-2xl text-center max-w-3xl mx-auto space-y-6 shadow-xs">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-[#635BFF]">
            <Server className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <Badge variant="secondary" size="md" className="mx-auto uppercase tracking-wide text-xs">
              Frontend-Only Architecture
            </Badge>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              NestJS Backend is Currently Disabled
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              This project is operating in static frontend mode with zero server overhead. You can enable a dedicated
              enterprise NestJS REST API with PostgreSQL, Prisma ORM, and pre-built modules with one click.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#24293D] bg-slate-50 dark:bg-[#12141F] space-y-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-[#635BFF]" /> 9 Predefined Modules
              </span>
              <p className="text-[11px] text-slate-400">Auth, Users, Products, Orders, Payments, Blog, &amp; more.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#24293D] bg-slate-50 dark:bg-[#12141F] space-y-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-cyan-500" /> Prisma &amp; PostgreSQL
              </span>
              <p className="text-[11px] text-slate-400">Type-safe database schemas, migrations, and relationships.</p>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#24293D] bg-slate-50 dark:bg-[#12141F] space-y-1">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" /> Instant Generation
              </span>
              <p className="text-[11px] text-slate-400">Export production-ready NestJS 11 TypeScript codebase.</p>
            </div>
          </div>

          <div className="pt-2">
            <Button
              size="lg"
              variant="default"
              leftIcon={<Plus className="h-4 w-4" />}
              isLoading={isSaving}
              onClick={() => handleToggleBackend(true)}
              className="px-8 shadow-md shadow-[#635BFF]/25 font-semibold"
            >
              Enable NestJS Backend
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ==========================================
  // VIEW: BACKEND ENABLED (5-TAB DASHBOARD)
  // ==========================================
  return (
    <div className="space-y-6">
      {/* Master Top Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[#635BFF] border border-indigo-100 dark:border-indigo-900/40">
            <Server className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                NestJS Backend &amp; API Builder
              </h3>
              <Badge variant="indigo" size="sm" className="font-mono">
                NestJS 11
              </Badge>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Backend Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Enterprise TypeScript backend with Prisma ORM, PostgreSQL database, class-validator DTOs, and OpenAPI Swagger documentation.
            </p>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Code className="h-4 w-4 text-[#635BFF]" />}
            onClick={handleGenerateCode}
          >
            Generate Codebase
          </Button>

          <Button
            size="sm"
            variant="outline"
            leftIcon={<Zap className="h-4 w-4 text-amber-500" />}
            isLoading={isSyncingDataSources}
            onClick={handleSyncDataSources}
          >
            Sync Data Sources
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleToggleBackend(false)}
          >
            Disable Backend
          </Button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#161926]">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Modules</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {enabledModules.length} <span className="text-xs font-normal text-slate-400">/ 9 available</span>
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#161926]">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">REST Endpoints</span>
          <p className="text-xl font-black text-[#635BFF] mt-1 font-mono">
            {totalEndpoints} <span className="text-xs font-normal text-slate-400">routes</span>
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#161926]">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Database Models</span>
          <p className="text-xl font-black text-cyan-500 mt-1">
            {databaseModels.length} <span className="text-xs font-normal text-slate-400">PostgreSQL tables</span>
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#161926]">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Base Prefix</span>
          <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1 font-mono">
            /{backendSchema.settings.globalPrefix.replace(/^\//, '')}
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs: Overview, Modules, Database, API, Environment */}
      <div className="border-b border-slate-200 dark:border-[#24293D] flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-[#635BFF] text-[#635BFF]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Activity className="h-4 w-4" />
          Overview
        </button>

        <button
          onClick={() => setActiveTab('modules')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'modules'
              ? 'border-[#635BFF] text-[#635BFF]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="h-4 w-4" />
          Modules ({enabledModules.length})
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'database'
              ? 'border-[#635BFF] text-[#635BFF]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Database className="h-4 w-4" />
          Database &amp; Prisma ({databaseModels.length})
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'api'
              ? 'border-[#635BFF] text-[#635BFF]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Terminal className="h-4 w-4" />
          API Playground ({totalEndpoints})
        </button>

        <button
          onClick={() => setActiveTab('environment')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'environment'
              ? 'border-[#635BFF] text-[#635BFF]'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Key className="h-4 w-4" />
          Environment &amp; Settings
        </button>
      </div>

      {/* ========================================== */}
      {/* TAB 1: OVERVIEW                           */}
      {/* ========================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Architecture Pipeline Card */}
              <Card className="p-6 border border-slate-200 dark:border-[#24293D] shadow-xs space-y-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Server className="h-4 w-4 text-[#635BFF]" />
                  <span>Full-Stack Architecture Flow</span>
                </CardTitle>
                <CardDescription>
                  End-to-end data pipeline connecting visual components to NestJS REST API and PostgreSQL.
                </CardDescription>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#12141F] border border-slate-200 dark:border-slate-800 font-mono text-xs flex flex-col md:flex-row items-center justify-between gap-3 text-center">
                  <div className="p-3 rounded-lg bg-white dark:bg-[#1A1D2D] border border-slate-200 dark:border-slate-700 w-full md:w-auto">
                    <p className="font-bold text-slate-900 dark:text-white">Next.js 15 UI</p>
                    <span className="text-[10px] text-slate-400">React Client Components</span>
                  </div>
                  <span className="text-[#635BFF] font-bold text-lg">→</span>
                  <div className="p-3 rounded-lg bg-white dark:bg-[#1A1D2D] border border-slate-200 dark:border-slate-700 w-full md:w-auto">
                    <p className="font-bold text-[#635BFF]">API Data Sources</p>
                    <span className="text-[10px] text-slate-400">REST Fetch / Hooks</span>
                  </div>
                  <span className="text-[#635BFF] font-bold text-lg">→</span>
                  <div className="p-3 rounded-lg bg-white dark:bg-[#1A1D2D] border border-slate-200 dark:border-slate-700 w-full md:w-auto">
                    <p className="font-bold text-emerald-500">NestJS 11 API</p>
                    <span className="text-[10px] text-slate-400">Controllers &amp; Guards</span>
                  </div>
                  <span className="text-[#635BFF] font-bold text-lg">→</span>
                  <div className="p-3 rounded-lg bg-white dark:bg-[#1A1D2D] border border-slate-200 dark:border-slate-700 w-full md:w-auto">
                    <p className="font-bold text-cyan-500">PostgreSQL 16</p>
                    <span className="text-[10px] text-slate-400">Prisma Client ORM</span>
                  </div>
                </div>
              </Card>

              {/* Server Gateway Health Probe */}
              <Card className="p-6 border border-slate-200 dark:border-[#24293D] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="h-4 w-4 text-emerald-500" />
                      <span>Live Server Gateway Telemetry</span>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Check responsiveness and round-trip ping time to your backend gateway.
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<RefreshCw className={`h-4 w-4 ${pingStatus.loading ? 'animate-spin' : ''}`} />}
                    onClick={handleTestHealth}
                    isLoading={pingStatus.loading}
                  >
                    Ping Server
                  </Button>
                </div>

                {pingStatus.tested ? (
                  <div
                    className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
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
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#12141F] border border-slate-200/60 dark:border-slate-800/80 text-xs text-slate-500 flex items-center justify-between">
                    <span>Click &ldquo;Ping Server&rdquo; to execute a health probe against /api/health</span>
                    <Badge variant="secondary" size="sm">Ready</Badge>
                  </div>
                )}
              </Card>
            </div>

            {/* Quick Actions & Stack Card */}
            <div className="space-y-6">
              <Card className="p-6 border border-slate-200 dark:border-[#24293D] shadow-xs space-y-4">
                <CardTitle className="text-base">Technical Specifications</CardTitle>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E2337]">
                    <span className="text-slate-400">Framework</span>
                    <span className="font-bold text-slate-900 dark:text-white">NestJS 11</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E2337]">
                    <span className="text-slate-400">Database Engine</span>
                    <span className="font-bold text-slate-900 dark:text-white capitalize">
                      {backendSchema.settings.databaseEngine}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E2337]">
                    <span className="text-slate-400">ORM Adapter</span>
                    <span className="font-bold text-slate-900 dark:text-white">Prisma Client</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E2337]">
                    <span className="text-slate-400">Validation Pipe</span>
                    <span className="font-bold text-slate-900 dark:text-white">class-validator</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E2337]">
                    <span className="text-slate-400">API Documentation</span>
                    <span className="font-bold text-[#635BFF]">OpenAPI / Swagger</span>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="w-full"
                    leftIcon={<Code className="h-4 w-4" />}
                    onClick={handleGenerateCode}
                  >
                    View Generated Code
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    leftIcon={<ExternalLink className="h-4 w-4" />}
                    onClick={() => window.open('/api/docs', '_blank')}
                  >
                    Open Swagger Docs
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: MODULES (WEEK 25 MODULE BUILDER)    */}
      {/* ========================================== */}
      {activeTab === 'modules' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Predefined Backend Modules
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Enable, disable, configure, and inspect the 9 modular building blocks for your application.
              </p>
            </div>
            <Badge variant="indigo" size="md">
              {enabledModules.length} Active Modules
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.keys(PREDEFINED_BACKEND_MODULES) as PredefinedModuleId[]).map((modId) => {
              const mod = backendSchema.modules[modId] || PREDEFINED_BACKEND_MODULES[modId];
              const Icon = MODULE_ICONS[modId] || Layers;
              const isEnabled = mod.enabled;

              return (
                <Card
                  key={modId}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                    isEnabled
                      ? 'border-indigo-200 dark:border-indigo-900/40 bg-white dark:bg-[#161926] shadow-xs'
                      : 'border-slate-200 dark:border-[#24293D] bg-slate-50/50 dark:bg-[#12141F]/50 opacity-75'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-2 rounded-xl ${
                            isEnabled
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-[#635BFF]'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {mod.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {mod.endpoints.length} routes
                          </span>
                        </div>
                      </div>

                      <Switch
                        checked={isEnabled}
                        onChange={(e) => handleToggleModule(modId, e.target.checked)}
                      />
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {mod.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">
                      {mod.databaseModel ? `Model: ${mod.databaseModel.name}` : 'Utility Module'}
                    </span>
                    <Button
                      size="xs"
                      variant="ghost"
                      leftIcon={<Settings className="h-3 w-3" />}
                      onClick={() => setSelectedModuleId(modId)}
                    >
                      Configure
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: DATABASE & PRISMA                  */}
      {/* ========================================== */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Prisma ORM &amp; PostgreSQL Models
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Automatically generated database schemas and relations for all enabled modules.
              </p>
            </div>
            <Badge variant="cyan" size="md">
              PostgreSQL 16 Engine
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {databaseModels.map((model) => (
              <Card key={model.name} className="p-5 border border-slate-200 dark:border-[#24293D] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-cyan-500" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {model.name}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      @@map(&quot;{model.tableName}&quot;)
                    </span>
                  </div>
                  <Badge variant="outline" size="sm">
                    {model.fields.length} fields
                  </Badge>
                </div>

                <p className="text-xs text-slate-500">{model.description}</p>

                <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {model.fields.map((f) => (
                    <div
                      key={f.name}
                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-[#12141F] flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {f.name}
                        </span>
                        {f.isId && (
                          <Badge variant="indigo" size="sm" className="text-[9px] py-0 px-1">
                            PK
                          </Badge>
                        )}
                        {f.isUnique && (
                          <Badge variant="secondary" size="sm" className="text-[9px] py-0 px-1">
                            UNIQUE
                          </Badge>
                        )}
                      </div>
                      <span className="text-indigo-600 dark:text-indigo-400">
                        {f.type}
                        {f.isOptional ? '?' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Migration Commands Card */}
          <Card className="p-6 border border-slate-200 dark:border-[#24293D] shadow-xs space-y-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Terminal className="h-4 w-4 text-amber-500" />
              <span>Database Migration Instructions</span>
            </CardTitle>
            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs space-y-2">
              <p className="text-slate-400"># Push Prisma schema to PostgreSQL database without creating migrations:</p>
              <p className="text-emerald-400 font-bold">npx prisma db push</p>
              <p className="text-slate-400 pt-2"># Create migration files and execute schema evolution:</p>
              <p className="text-emerald-400 font-bold">npx prisma migrate dev --name init</p>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 4: API PLAYGROUND & CONNECTION         */}
      {/* ========================================== */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Interactive API Explorer &amp; Data Sources
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Explore active REST routes, execute live test calls, and connect directly to frontend visual components.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Zap className="h-4 w-4 text-amber-500" />}
              isLoading={isSyncingDataSources}
              onClick={handleSyncDataSources}
            >
              Sync to Project Data Sources
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Route Table */}
            <div className="lg:col-span-2 space-y-3">
              {enabledModules.map((mod) => (
                <Card key={mod.id} className="p-4 border border-slate-200 dark:border-[#24293D] shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {mod.name}
                    </span>
                    <Badge variant="secondary" size="sm">
                      {mod.endpoints.length} endpoints
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    {mod.endpoints.map((ep) => (
                      <div
                        key={ep.path}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#12141F] border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge
                            variant={
                              ep.method === 'GET'
                                ? 'indigo'
                                : ep.method === 'POST'
                                ? 'cyan'
                                : ep.method === 'PUT' || ep.method === 'PATCH'
                                ? 'warning'
                                : 'destructive'
                            }
                            size="sm"
                            className="font-mono font-bold w-14 justify-center"
                          >
                            {ep.method}
                          </Badge>
                          <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            /{backendSchema.settings.globalPrefix.replace(/^\//, '')}{ep.path}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {ep.authRequired && (
                            <span className="text-[10px] font-semibold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200/60 dark:border-amber-900/40">
                              JWT
                            </span>
                          )}
                          <Button
                            size="xs"
                            variant="subtle"
                            leftIcon={<Send className="h-3 w-3" />}
                            onClick={() =>
                              handleRunApiTest(
                                `/${backendSchema.settings.globalPrefix.replace(/^\//, '')}${ep.path}`,
                                ep.method
                              )
                            }
                          >
                            Test
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            {/* Right: Test Runner Output */}
            <div className="space-y-4">
              <Card className="p-5 border border-slate-200 dark:border-[#24293D] shadow-xs space-y-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-[#635BFF]" />
                  <span>Test Console Output</span>
                </CardTitle>

                {apiTestResponse ? (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="font-mono font-bold text-emerald-500">
                        Status {apiTestResponse.statusCode} {apiTestResponse.statusText}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {apiTestResponse.method} {apiTestResponse.route}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-auto max-h-64 border border-slate-800">
                      <pre className="whitespace-pre">
                        {JSON.stringify(apiTestResponse.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#12141F] text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800">
                    Click &ldquo;Test&rdquo; on any endpoint to execute a mock API call and view payload output.
                  </div>
                )}
              </Card>

              {/* Frontend Code Snippet */}
              <Card className="p-5 border border-slate-200 dark:border-[#24293D] shadow-xs space-y-3">
                <CardTitle className="text-sm">Frontend Fetch Snippet</CardTitle>
                <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-auto max-h-48 border border-slate-800">
                  <pre className="whitespace-pre">{`// Use generated ProjectApiClient in Next.js
import { ProjectApiClient } from '@/client/api-client';

const items = await ProjectApiClient.products.list();`}</pre>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 5: ENVIRONMENT & SETTINGS              */}
      {/* ========================================== */}
      {activeTab === 'environment' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Settings Form */}
            <Card className="p-6 border border-slate-200 dark:border-[#24293D] shadow-xs space-y-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4 text-[#635BFF]" />
                <span>Backend Server Configuration</span>
              </CardTitle>
              <CardDescription>
                Customize runtime server parameters, port binding, and database targets.
              </CardDescription>

              <div className="space-y-3 pt-2">
                <Input
                  label="Server Port"
                  type="number"
                  value={backendSchema.settings.port}
                  onChange={(e) =>
                    setBackendSchema({
                      ...backendSchema,
                      settings: { ...backendSchema.settings, port: Number(e.target.value) || 3001 },
                    })
                  }
                />

                <Input
                  label="Global Route Prefix"
                  value={backendSchema.settings.globalPrefix}
                  onChange={(e) =>
                    setBackendSchema({
                      ...backendSchema,
                      settings: { ...backendSchema.settings, globalPrefix: e.target.value },
                    })
                  }
                />

                <Input
                  label="PostgreSQL Database Connection URL"
                  value={backendSchema.settings.databaseUrl}
                  onChange={(e) =>
                    setBackendSchema({
                      ...backendSchema,
                      settings: { ...backendSchema.settings, databaseUrl: e.target.value },
                    })
                  }
                />

                <Input
                  label="JWT Secret Key"
                  value={backendSchema.settings.jwtSecret}
                  onChange={(e) =>
                    setBackendSchema({
                      ...backendSchema,
                      settings: { ...backendSchema.settings, jwtSecret: e.target.value },
                    })
                  }
                />

                <Input
                  label="JWT Session Expiration"
                  value={backendSchema.settings.jwtExpiration}
                  onChange={(e) =>
                    setBackendSchema({
                      ...backendSchema,
                      settings: { ...backendSchema.settings, jwtExpiration: e.target.value },
                    })
                  }
                />

                <Input
                  label="CORS Allowed Origin"
                  value={backendSchema.settings.corsOrigin}
                  onChange={(e) =>
                    setBackendSchema({
                      ...backendSchema,
                      settings: { ...backendSchema.settings, corsOrigin: e.target.value },
                    })
                  }
                />

                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="default"
                    isLoading={isSaving}
                    onClick={() => handleSaveSchema(backendSchema)}
                  >
                    Save Server Settings
                  </Button>
                </div>
              </div>
            </Card>

            {/* Live .env Preview */}
            <Card className="p-6 border border-slate-200 dark:border-[#24293D] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Key className="h-4 w-4 text-amber-500" />
                    <span>Environment Variables (.env)</span>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Exportable environment secrets for local Docker or cloud deployment.
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
                <pre className="leading-relaxed whitespace-pre font-mono">{`# NestJS Server Environment Configuration
PORT=${backendSchema.settings.port}
NODE_ENV=development
API_PREFIX=${backendSchema.settings.globalPrefix}

# PostgreSQL Database Connection
DATABASE_URL="${backendSchema.settings.databaseUrl}"

# JWT Authentication
JWT_SECRET="${backendSchema.settings.jwtSecret}"
JWT_EXPIRATION="${backendSchema.settings.jwtExpiration}"

# Security & CORS
CORS_ORIGIN="${backendSchema.settings.corsOrigin}"`}</pre>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* CODE GENERATOR PREVIEW MODAL (WEEK 26)     */}
      {/* ========================================== */}
      {isCodeModalOpen && generatedCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-[#24293D] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#635BFF]/10 text-[#635BFF]">
                  <Code className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    NestJS 11 Generated Codebase
                    <Badge variant="indigo" size="sm">{generatedCode.totalFiles} Files</Badge>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Production-ready TypeScript files generated from your backend schema.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={copiedFile ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  onClick={handleCopyActiveFile}
                >
                  {copiedFile ? 'Copied' : 'Copy File'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsCodeModalOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Split Body: File Tree + Code Editor */}
            <div className="grid grid-cols-1 md:grid-cols-4 flex-1 overflow-hidden min-h-[500px]">
              {/* File List */}
              <div className="border-r border-slate-200 dark:border-[#24293D] overflow-y-auto p-3 space-y-1 bg-slate-50 dark:bg-[#111420]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 block">
                  Project Files
                </span>
                {generatedCode.fileList.map((fileKey) => (
                  <button
                    key={fileKey}
                    onClick={() => setSelectedFileKey(fileKey)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all truncate flex items-center gap-2 ${
                      selectedFileKey === fileKey
                        ? 'bg-[#635BFF] text-white font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <FileCode2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{fileKey}</span>
                  </button>
                ))}
              </div>

              {/* Code Viewer */}
              <div className="md:col-span-3 flex flex-col bg-slate-900 text-slate-100 overflow-hidden">
                <div className="p-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-bold">{selectedFileKey}</span>
                  <span className="text-slate-500 text-[11px]">
                    {generatedCode.files[selectedFileKey]?.language.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed">
                  <pre className="whitespace-pre">
                    {generatedCode.files[selectedFileKey]?.content}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODULE CONFIGURATION MODAL (WEEK 25)       */}
      {/* ========================================== */}
      {selectedModuleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[#635BFF]">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Configure {backendSchema.modules[selectedModuleId].name}
                  </h3>
                  <span className="text-xs text-slate-400">Module ID: {selectedModuleId}</span>
                </div>
              </div>
              <Button size="xs" variant="ghost" onClick={() => setSelectedModuleId(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-slate-500">
              {backendSchema.modules[selectedModuleId].description}
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#12141F] border border-slate-200/60 dark:border-slate-800/80">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Module Status
                </span>
                <Switch
                  checked={backendSchema.modules[selectedModuleId].enabled}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    const updated = {
                      ...backendSchema,
                      modules: {
                        ...backendSchema.modules,
                        [selectedModuleId]: {
                          ...backendSchema.modules[selectedModuleId],
                          enabled: isChecked,
                        },
                      },
                    };
                    setBackendSchema(updated);
                  }}
                />
              </div>

              {selectedModuleId === 'auth' && (
                <Input
                  label="Token Expiration"
                  value={backendSchema.modules.auth.settings?.tokenExpiration || '7d'}
                  onChange={(e) => {
                    const updated = {
                      ...backendSchema,
                      modules: {
                        ...backendSchema.modules,
                        auth: {
                          ...backendSchema.modules.auth,
                          settings: {
                            ...backendSchema.modules.auth.settings,
                            tokenExpiration: e.target.value,
                          },
                        },
                      },
                    };
                    setBackendSchema(updated);
                  }}
                />
              )}

              {selectedModuleId === 'products' && (
                <Input
                  label="Default Catalog Currency"
                  value={backendSchema.modules.products.settings?.currency || 'USD'}
                  onChange={(e) => {
                    const updated = {
                      ...backendSchema,
                      modules: {
                        ...backendSchema.modules,
                        products: {
                          ...backendSchema.modules.products,
                          settings: {
                            ...backendSchema.modules.products.settings,
                            currency: e.target.value,
                          },
                        },
                      },
                    };
                    setBackendSchema(updated);
                  }}
                />
              )}

              {selectedModuleId === 'orders' && (
                <Input
                  label="Default Sales Tax Rate"
                  type="number"
                  step="0.01"
                  value={backendSchema.modules.orders.settings?.taxRate ?? 0.08}
                  onChange={(e) => {
                    const updated = {
                      ...backendSchema,
                      modules: {
                        ...backendSchema.modules,
                        orders: {
                          ...backendSchema.modules.orders,
                          settings: {
                            ...backendSchema.modules.orders.settings,
                            taxRate: parseFloat(e.target.value) || 0,
                          },
                        },
                      },
                    };
                    setBackendSchema(updated);
                  }}
                />
              )}

              {selectedModuleId === 'uploads' && (
                <Input
                  label="Max File Size (MB)"
                  type="number"
                  value={backendSchema.modules.uploads.settings?.maxFileSizeMb ?? 25}
                  onChange={(e) => {
                    const updated = {
                      ...backendSchema,
                      modules: {
                        ...backendSchema.modules,
                        uploads: {
                          ...backendSchema.modules.uploads,
                          settings: {
                            ...backendSchema.modules.uploads.settings,
                            maxFileSizeMb: parseInt(e.target.value, 10) || 25,
                          },
                        },
                      },
                    };
                    setBackendSchema(updated);
                  }}
                />
              )}
            </div>

            <div className="pt-3 flex items-center justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedModuleId(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="default"
                isLoading={isSaving}
                onClick={async () => {
                  await handleSaveSchema(backendSchema);
                  setSelectedModuleId(null);
                }}
              >
                Apply &amp; Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
