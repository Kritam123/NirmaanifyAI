'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ProjectDto,
  DataModel,
  ApiRouteConfig,
  DatabaseApiSchema,
  getDefaultDatabaseApiSchema,
} from '@nirmaanify/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Input,
  useToast,
} from '@nirmaanify/ui';
import {
  Database,
  Table,
  Plus,
  Edit,
  Trash2,
  Code2,
  Play,
  Key,
  Shield,
  Layers,
  ArrowRight,
  Link2,
  Copy,
  Check,
  Search,
  Filter,
  Sparkles,
  GitBranch,
  FileText,
} from 'lucide-react';
import { DatabaseModelModal } from './database-model-modal';
import { DatabaseCompiler } from '@nirmaanify/component-registry';

interface DatabaseApiDashboardProps {
  projects: ProjectDto[];
  activeProjectId?: string;
}

export function DatabaseApiDashboard({ projects, activeProjectId }: DatabaseApiDashboardProps) {
  const { toast } = useToast();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    activeProjectId || projects[0]?.id || ''
  );

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || projects[0] || null;
  }, [projects, selectedProjectId]);

  const [dbSchema, setDbSchema] = useState<DatabaseApiSchema>(getDefaultDatabaseApiSchema());
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tables' | 'er-diagram' | 'api-routes' | 'query-sandbox' | 'prisma'>('tables');

  // Modals state
  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<DataModel | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string>('');

  // API Sandbox State
  const [selectedRoute, setSelectedRoute] = useState<ApiRouteConfig | null>(null);
  const [sandboxBody, setSandboxBody] = useState('{\n  "name": "Sample Item",\n  "price": 99.0\n}');
  const [sandboxResponse, setSandboxResponse] = useState<any>(null);
  const [isExecutingQuery, setIsExecutingQuery] = useState(false);
  const [copiedPrisma, setCopiedPrisma] = useState(false);

  // Fetch schema
  useEffect(() => {
    if (!activeProject) return;

    const fetchSchema = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`http://localhost:4000/projects/${activeProject.id}/database/schema`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setDbSchema(data);
          if (data.models?.length > 0 && !selectedModelId) {
            setSelectedModelId(data.models[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching database schema:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchema();
  }, [activeProject, selectedModelId]);

  const selectedModel = useMemo(() => {
    return dbSchema.models.find((m) => m.id === selectedModelId) || dbSchema.models[0] || null;
  }, [dbSchema.models, selectedModelId]);

  // Save or update model
  const handleSaveModel = async (model: DataModel) => {
    if (!activeProject) return;
    const token = localStorage.getItem('auth_token');
    const isEdit = Boolean(editingModel);
    const url = isEdit
      ? `http://localhost:4000/projects/${activeProject.id}/database/models/${editingModel!.id}`
      : `http://localhost:4000/projects/${activeProject.id}/database/models`;

    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(model),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to save model');
    }

    const updated = await res.json();
    setDbSchema(updated);
    setSelectedModelId(model.id);
  };

  // Delete model
  const handleDeleteModel = async (modelId: string) => {
    if (!confirm('Are you sure you want to delete this table and its generated API routes?')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`http://localhost:4000/projects/${activeProject.id}/database/models/${modelId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const updated = await res.json();
        setDbSchema(updated);
        if (updated.models?.length > 0) setSelectedModelId(updated.models[0].id);
        toast({ title: 'Model Deleted', description: 'Removed table and associated API routes.', type: 'info' });
      }
    } catch {
      toast({ title: 'Error', description: 'Could not delete table.', type: 'error' });
    }
  };

  // Toggle API route
  const handleToggleRoute = (routeId: string, enabled: boolean) => {
    const updatedRoutes = dbSchema.apiRoutes.map((r) =>
      r.id === routeId ? { ...r, enabled } : r
    );
    setDbSchema({ ...dbSchema, apiRoutes: updatedRoutes });
  };

  // Toggle Auth on API route
  const handleToggleRouteAuth = (routeId: string, authRequired: boolean) => {
    const updatedRoutes = dbSchema.apiRoutes.map((r) =>
      r.id === routeId ? { ...r, authRequired } : r
    );
    setDbSchema({ ...dbSchema, apiRoutes: updatedRoutes });
  };

  // Execute Query in Sandbox
  const handleExecuteSandboxQuery = async () => {
    if (!selectedRoute || !activeProject) return;
    setIsExecutingQuery(true);
    try {
      const token = localStorage.getItem('auth_token');
      let parsedBody: any = undefined;
      if (['POST', 'PATCH'].includes(selectedRoute.method)) {
        try {
          parsedBody = JSON.parse(sandboxBody);
        } catch {
          // ignore
        }
      }

      const res = await fetch(`http://localhost:4000/projects/${activeProject.id}/database/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          modelName: selectedRoute.modelName,
          method: selectedRoute.method,
          path: selectedRoute.path,
          body: parsedBody,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setSandboxResponse(result);
      }
    } catch (err: any) {
      setSandboxResponse({ error: err.message || 'Query execution failed' });
    } finally {
      setIsExecutingQuery(false);
    }
  };

  const compiledPrismaCode = useMemo(() => {
    return DatabaseCompiler.compilePrismaSchema(dbSchema.models);
  }, [dbSchema.models]);

  if (!activeProject) {
    return (
      <Card className="p-12 text-center space-y-3">
        <Database className="h-10 w-10 text-slate-400 mx-auto" />
        <h4 className="font-bold text-base">No Active Projects</h4>
        <p className="text-xs text-slate-400">Create a project first to use the Database & API builder.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#24293D]">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-[#635BFF]" />
            <span>Database Schema & REST API Builder</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Design PostgreSQL relational tables, visual ER diagrams, and generate typed CRUD API endpoints with auth & validation.
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
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditingModel(null);
              setModelModalOpen(true);
            }}
          >
            New Data Model
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#24293D] overflow-x-auto text-xs font-semibold pb-1 scrollbar-none">
        {[
          { id: 'tables' as const, label: `Tables & Models (${dbSchema.models.length})`, icon: <Table className="h-4 w-4" /> },
          { id: 'er-diagram' as const, label: 'Visual ER Diagram', icon: <GitBranch className="h-4 w-4" /> },
          { id: 'api-routes' as const, label: `API Routes (${dbSchema.apiRoutes.length})`, icon: <Code2 className="h-4 w-4" /> },
          { id: 'query-sandbox' as const, label: 'Dynamic API Sandbox', icon: <Play className="h-4 w-4" /> },
          { id: 'prisma' as const, label: 'Prisma Schema', icon: <FileText className="h-4 w-4" /> },
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

      {/* TAB 1: TABLES & MODELS (WEEK 28) */}
      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Models List */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tables ({dbSchema.models.length})
            </span>
            <div className="space-y-1.5">
              {dbSchema.models.map((model) => {
                const isSelected = selectedModel?.id === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModelId(model.id)}
                    className={`p-3 rounded-xl cursor-pointer transition-all border flex items-center justify-between group ${
                      isSelected
                        ? 'border-[#635BFF] bg-[#635BFF]/10 text-[#635BFF] font-bold'
                        : 'bg-white dark:bg-[#161926] border-slate-200 dark:border-[#24293D] hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#635BFF] text-white' : 'bg-slate-100 dark:bg-[#0E121E] text-slate-400'}`}>
                        <Table className="h-3.5 w-3.5" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs block truncate">{model.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{model.fields.length} columns</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingModel(model);
                          setModelModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded"
                        title="Edit Model"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      {!model.isSystem && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteModel(model.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded"
                          title="Delete Model"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Columns Table */}
          <div className="lg:col-span-3">
            {selectedModel ? (
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">{selectedModel.name}</h3>
                      <Badge variant="indigo" size="sm">/{selectedModel.pluralName.toLowerCase()}</Badge>
                      {selectedModel.isSystem && <Badge variant="secondary" size="sm">System Table</Badge>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedModel.description || 'Database table schema.'}</p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Edit className="h-3.5 w-3.5" />}
                    onClick={() => {
                      setEditingModel(selectedModel);
                      setModelModalOpen(true);
                    }}
                  >
                    Edit Columns
                  </Button>
                </div>

                <div className="border border-slate-200 dark:border-[#24293D] rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-[#24293D]">
                  <div className="p-2.5 bg-slate-50 dark:bg-[#0E121E] text-[10px] font-bold uppercase tracking-wider text-slate-400 grid grid-cols-12 gap-2">
                    <span className="col-span-4">Column Name</span>
                    <span className="col-span-3">Type</span>
                    <span className="col-span-3">Constraints</span>
                    <span className="col-span-2">Default</span>
                  </div>

                  {selectedModel.fields.map((f) => (
                    <div key={f.id} className="p-3 bg-white dark:bg-[#161926] text-xs grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4 font-mono font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        {f.isId && <Key className="h-3 w-3 text-amber-500 shrink-0" />}
                        {f.type === 'Relation' && <Link2 className="h-3 w-3 text-[#635BFF] shrink-0" />}
                        <span>{f.name}</span>
                      </div>

                      <div className="col-span-3">
                        <Badge size="sm" variant={f.type === 'Relation' ? 'indigo' : 'secondary'} className="font-mono text-[10px]">
                          {f.type === 'Relation' ? `Relation → ${f.relationTarget}` : f.type}
                        </Badge>
                      </div>

                      <div className="col-span-3 flex items-center gap-1.5">
                        {f.isId && <Badge size="sm" variant="cyan" className="text-[9px]">PK</Badge>}
                        {f.isUnique && !f.isId && <Badge size="sm" variant="violet" className="text-[9px]">Unique</Badge>}
                        {f.isNullable && <span className="text-[10px] text-slate-400">Nullable</span>}
                      </div>

                      <div className="col-span-2 font-mono text-[10px] text-slate-400 truncate">
                        {f.defaultValue || '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center space-y-2">
                <Table className="h-8 w-8 text-slate-400 mx-auto" />
                <h5 className="font-bold text-xs">No Model Selected</h5>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: VISUAL ER DIAGRAM (WEEK 28 DELIVERABLE) */}
      {activeTab === 'er-diagram' && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Entity Relationship (ER) Visual Diagram</h4>
              <p className="text-xs text-slate-500">Visual mapping of PostgreSQL tables, primary keys, and foreign relationships.</p>
            </div>
            <Badge variant="indigo" size="sm">Relational Cardinality</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dbSchema.models.map((model) => (
              <div
                key={model.id}
                className="p-4 rounded-xl bg-white dark:bg-[#161926] border-2 border-slate-200 dark:border-[#24293D] shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#24293D]">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4 text-[#635BFF]" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{model.name}</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400">{model.fields.length} cols</span>
                </div>

                <div className="space-y-1 font-mono text-[10px]">
                  {model.fields.map((f) => (
                    <div key={f.id} className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        {f.isId && <Key className="h-2.5 w-2.5 text-amber-500" />}
                        {f.type === 'Relation' && <Link2 className="h-2.5 w-2.5 text-[#635BFF]" />}
                        <span className={f.isId ? 'font-bold text-slate-900 dark:text-white' : ''}>{f.name}</span>
                      </span>
                      <span className="text-slate-400">{f.type === 'Relation' ? f.relationTarget : f.type.toLowerCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 3: API ROUTES BUILDER (WEEK 29 DELIVERABLE) */}
      {activeTab === 'api-routes' && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Auto-Generated REST API Endpoints</h4>
              <p className="text-xs text-slate-500">Configure authentication requirements, role authorization, and pagination.</p>
            </div>
            <Badge variant="indigo" size="sm">{dbSchema.apiRoutes.length} Generated Routes</Badge>
          </div>

          <div className="border border-slate-200 dark:border-[#24293D] rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-[#24293D]">
            {dbSchema.apiRoutes.map((route) => (
              <div key={route.id} className="p-3.5 bg-white dark:bg-[#161926] flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-[240px]">
                  <span
                    className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded ${
                      route.method === 'GET'
                        ? 'bg-blue-500/20 text-blue-500'
                        : route.method === 'POST'
                        ? 'bg-emerald-500/20 text-emerald-500'
                        : route.method === 'PATCH'
                        ? 'bg-amber-500/20 text-amber-500'
                        : 'bg-rose-500/20 text-rose-500'
                    }`}
                  >
                    {route.method}
                  </span>
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      /api/v1{route.path}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-sans">{route.operation} ({route.modelName})</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Auth Toggle */}
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-500 text-[11px]">
                    <input
                      type="checkbox"
                      checked={route.authRequired}
                      onChange={(e) => handleToggleRouteAuth(route.id, e.target.checked)}
                      className="h-3.5 w-3.5 text-[#635BFF] rounded"
                    />
                    <Shield className="h-3 w-3" />
                    <span>Auth Required</span>
                  </label>

                  {/* Active Toggle */}
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-500 text-[11px]">
                    <input
                      type="checkbox"
                      checked={route.enabled}
                      onChange={(e) => handleToggleRoute(route.id, e.target.checked)}
                      className="h-3.5 w-3.5 text-[#635BFF] rounded"
                    />
                    <span>Enabled</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 4: DYNAMIC API SANDBOX (WEEK 29) */}
      {activeTab === 'query-sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Select Endpoint</span>
            <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
              {dbSchema.apiRoutes.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedRoute(r)}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all border flex items-center justify-between text-xs ${
                    selectedRoute?.id === r.id
                      ? 'border-[#635BFF] bg-[#635BFF]/10 text-[#635BFF] font-bold'
                      : 'bg-white dark:bg-[#161926] border-slate-200 dark:border-[#24293D] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono font-bold text-[9px]">{r.method}</span>
                    <span className="font-mono text-[11px] truncate">{r.path}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selectedRoute ? (
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold">
                    <Badge variant="indigo" size="sm">{selectedRoute.method}</Badge>
                    <span>/api/v1{selectedRoute.path}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="default"
                    isLoading={isExecutingQuery}
                    leftIcon={<Play className="h-3.5 w-3.5" />}
                    onClick={handleExecuteSandboxQuery}
                  >
                    Execute Query
                  </Button>
                </div>

                {['POST', 'PATCH'].includes(selectedRoute.method) && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Payload Body (JSON)</label>
                    <textarea
                      rows={4}
                      value={sandboxBody}
                      onChange={(e) => setSandboxBody(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0E121E] font-mono text-xs border border-slate-200 dark:border-[#24293D] focus:outline-none"
                    />
                  </div>
                )}

                {sandboxResponse && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-[#24293D]">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-500">Status: {sandboxResponse.status || 200} OK</span>
                      <span className="text-slate-400 font-mono">{sandboxResponse.durationMs || 10}ms</span>
                    </div>
                    <pre className="p-3 rounded-xl bg-slate-950 text-cyan-300 font-mono text-[10px] overflow-auto max-h-56">
                      {JSON.stringify(sandboxResponse.data, null, 2)}
                    </pre>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="p-12 text-center space-y-2">
                <Play className="h-8 w-8 text-slate-400 mx-auto" />
                <h5 className="font-bold text-xs">Select Route to Test</h5>
                <p className="text-[11px] text-slate-400">Click any REST route on the left to simulate live CRUD execution.</p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: PRISMA SCHEMA */}
      {activeTab === 'prisma' && (
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Generated schema.prisma</h4>
            <Button
              size="sm"
              variant="outline"
              leftIcon={copiedPrisma ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              onClick={() => {
                navigator.clipboard.writeText(compiledPrismaCode);
                setCopiedPrisma(true);
                setTimeout(() => setCopiedPrisma(false), 2000);
                toast({ title: 'Copied', description: 'Prisma schema copied.', type: 'info' });
              }}
            >
              {copiedPrisma ? 'Copied!' : 'Copy Prisma'}
            </Button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-auto max-h-[500px]">
            {compiledPrismaCode}
          </pre>
        </Card>
      )}

      {/* MODEL BUILDER MODAL */}
      <DatabaseModelModal
        isOpen={modelModalOpen}
        onClose={() => {
          setModelModalOpen(false);
          setEditingModel(null);
        }}
        onSave={handleSaveModel}
        initialModel={editingModel}
        existingModels={dbSchema.models}
      />
    </div>
  );
}
