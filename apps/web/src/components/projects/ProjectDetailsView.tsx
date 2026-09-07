'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardTitle,
  CardDescription,
  Badge,
  Button,
  PageHeader,
  Tabs,
  useToast,
} from '@nirmaanify/ui';
import {
  Download,
  Play,
  Layers,
  FileCode2,
  Server,
  Cloud,
  CheckCircle2,
  Database,
  Copy,
  Check,
} from 'lucide-react';
import { ProjectDto } from '@nirmaanify/types';
import { ROUTES } from '../../lib/routes';
import { VisualStudioModal } from '../studio/visual-studio-modal';
import { useStorage } from '../../hooks/use-storage';
import { StorageSettingsCard } from '../storage/StorageSettingsCard';
import { FileUploadDropzone } from '../storage/FileUploadDropzone';
import { FileListTable } from '../storage/FileListTable';
import { CmsDashboardView } from '../cms/CmsDashboardView';
import { NestJsBackendView } from '../backend/NestJsBackendView';
import { useAuth } from '../../context/auth-context';
import {
  getProjectServerType,
  SERVER_ARCHITECTURES,
  ProjectServerType,
} from '../../lib/server-architecture';

interface ProjectDetailsViewProps {
  project: ProjectDto;
}

const studioStorageKey = (projectId: string) => `nirmaanify_studio_open:${projectId}`;

export const ProjectDetailsView: React.FC<ProjectDetailsViewProps> = ({ project }) => {
  const { toast } = useToast();
  const { updateProject } = useAuth();
  const searchParams = useSearchParams();
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<ProjectDto>(project);

  useEffect(() => {
    setCurrentProject(project);
  }, [project]);

  const serverType = getProjectServerType(currentProject);
  const serverMeta = SERVER_ARCHITECTURES[serverType];

  const handleUpdateServerArchitecture = async (newType: ProjectServerType) => {
    const updatedSchema = {
      ...(currentProject.projectSchema || {}),
      serverType: newType,
    };
    const isBackend = newType === 'nestjs' || newType === 'fullstack';
    try {
      const updated = await updateProject(currentProject.id, {
        projectSchema: updatedSchema,
        isBackendEnabled: isBackend,
      });
      setCurrentProject({
        ...currentProject,
        ...updated,
        projectSchema: updatedSchema,
        isBackendEnabled: isBackend,
      });
      toast({
        title: 'Server Architecture Updated',
        description: `Project server set to "${SERVER_ARCHITECTURES[newType].label}".`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Failed to update architecture',
        description: err.message || 'Could not update project',
        type: 'error',
      });
    }
  };

  // Scoped storage state for this specific project
  const {
    activeDriver,
    files,
    config: storageConfig,
    isUploading,
    isSavingConfig,
    isTestingConnection,
    updateStorageConfig,
    testConnection,
    uploadFile,
    deleteFile,
  } = useStorage(currentProject.id);

  // Restore persisted studio state on mount / project change.
  useEffect(() => {
    try {
      const wasOpen = localStorage.getItem(studioStorageKey(project.id)) === 'true';
      if (wasOpen) {
        setIsStudioOpen(true);
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  // One-time URL trigger from external links (e.g. "Open studio" on ProjectCard).
  const urlTriggerHandledRef = React.useRef(false);
  useEffect(() => {
    if (urlTriggerHandledRef.current) return;
    if (searchParams?.get('studio') === 'open') {
      urlTriggerHandledRef.current = true;
      setIsStudioOpen(true);
    }
  }, [searchParams]);

  // Persist studio state so it survives reloads.
  useEffect(() => {
    try {
      localStorage.setItem(studioStorageKey(project.id), String(isStudioOpen));
    } catch {
      /* ignore */
    }
  }, [isStudioOpen, project.id]);

  const openStudio = useCallback(() => {
    setIsStudioOpen(true);
  }, []);

  const closeStudio = useCallback(() => {
    setIsStudioOpen(false);
    // Strip the `?studio=open` query param so a reload doesn't re-trigger it.
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('studio')) {
          url.searchParams.delete('studio');
          window.history.replaceState({}, '', url.toString());
        }
      } catch {
        /* ignore */
      }
    }
  }, []);

  const handleExport = () => {
    toast({
      title: 'Export initiated',
      description: `Bundling ${currentProject.slug}.zip with Next.js 15 App Router ${
        serverMeta.hasNestJs
          ? '& NestJS API backend.'
          : serverMeta.hasCms
          ? '& Headless CMS data bindings.'
          : '& Static export.'
      }`,
      type: 'success',
    });
  };

  const [isBlueprintCopied, setIsBlueprintCopied] = useState(false);

  const handleCopyBlueprint = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(project, null, 2));
      setIsBlueprintCopied(true);
      toast({
        title: 'Blueprint Copied',
        description: 'Project configuration JSON copied to clipboard.',
        type: 'success',
      });
      setTimeout(() => setIsBlueprintCopied(false), 2000);
    }
  };

  const tabItems = [
    {
      id: 'blueprint',
      label: 'Blueprint',
      icon: <FileCode2 className="h-4 w-4" />,
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileCode2 className="h-4 w-4 text-[#635BFF]" />
                    <span>Project blueprint &amp; configuration</span>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Live schema metadata generated and orchestrated by the platform.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Badge variant="secondary" size="sm">JSON</Badge>
                  <Button
                    variant="outline"
                    size="xs"
                    leftIcon={isBlueprintCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    onClick={handleCopyBlueprint}
                  >
                    {isBlueprintCopied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-auto max-h-[480px] border border-slate-800 shadow-inner">
                <pre className="leading-relaxed whitespace-pre font-mono">{JSON.stringify(project, null, 2)}</pre>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <CardTitle className="text-base">Technical specs</CardTitle>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E2337]">
                  <span className="text-slate-400">Framework</span>
                  <span className="font-semibold">{currentProject.framework}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E2337]">
                  <span className="text-slate-400">UI system</span>
                  <span className="font-semibold">{currentProject.uiLibrary}</span>
                </div>
                {/* Dynamic Server Architecture Selector */}
                <div className="space-y-1.5 pb-2.5 border-b border-slate-100 dark:border-[#1E2337]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Server Architecture</span>
                    <Badge variant={serverMeta.badgeVariant} size="sm">
                      {serverMeta.shortLabel}
                    </Badge>
                  </div>
                  <select
                    value={serverType}
                    onChange={(e) => handleUpdateServerArchitecture(e.target.value as ProjectServerType)}
                    className="w-full text-xs py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161926] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
                  >
                    <option value="cms">Headless CMS (Dynamic Content)</option>
                    <option value="nestjs">Full NestJS REST API (Prisma + PostgreSQL)</option>
                    <option value="fullstack">Full-Stack (NestJS API + Headless CMS)</option>
                    <option value="static">Static Frontend (No Server)</option>
                  </select>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {serverMeta.description}
                  </p>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E2337]">
                  <span className="text-slate-400">Storage engine</span>
                  <Badge variant={activeDriver === 's3' ? 'indigo' : activeDriver === 'vercel-blob' ? 'cyan' : 'secondary'} size="sm">
                    {activeDriver.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E2337]">
                  <span className="text-slate-400">Created at</span>
                  <span className="font-semibold text-slate-500">
                    {new Date(currentProject.createdAt as any).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: 'routes',
      label: 'App router pages',
      icon: <Layers className="h-4 w-4" />,
      content: (
        <Card className="p-6">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#22D3EE]" />
            <span>App router pages &amp; route structure</span>
          </CardTitle>
          <CardDescription className="mt-1">
            Scaffolded routes derived from {project.aiPlan ? 'the approved AI Blueprint' : 'the project schema'}.
          </CardDescription>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(() => {
              const aiPages = Array.isArray(project.aiPlan?.pages)
                ? (project.aiPlan!.pages as Array<{
                    name: string;
                    path: string;
                    description?: string;
                    isProtected?: boolean;
                  }>)
                : [];
              const schemaPages = Array.isArray(project.projectSchema?.pages)
                ? (project.projectSchema!.pages as Array<unknown>)
                : [];

              const items =
                aiPages.length > 0
                  ? aiPages.map((p) => ({
                      path: p.path,
                      title: p.name,
                      status: p.isProtected ? 'Auth required' : 'Generated',
                    }))
                  : schemaPages.map((p) => {
                      if (typeof p === 'string') {
                        return {
                          path: p,
                          title: p === '/' ? 'Home' : p.replace(/^\//, ''),
                          status: 'Generated',
                        };
                      }
                      const obj = p as { path?: string; name?: string };
                      const path = typeof obj?.path === 'string' ? obj.path : '/';
                      const title =
                        typeof obj?.name === 'string' && obj.name.length > 0
                          ? obj.name
                          : path === '/'
                          ? 'Home'
                          : path.replace(/^\//, '');
                      return { path, title, status: 'Generated' };
                    });

              if (items.length === 0) {
                return (
                  <div className="col-span-full p-6 rounded-xl border border-dashed border-slate-200 dark:border-[#24293D] text-center text-xs text-slate-400">
                    No routes scaffolded yet for this project.
                  </div>
                );
              }

              return items.map((route) => (
                <div
                  key={route.path}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-[#24293D] bg-slate-50 dark:bg-[#161926] flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {route.path}
                    </p>
                    <p className="text-[11px] text-slate-400">{route.title}</p>
                  </div>
                  <Badge variant={route.status === 'Auth required' ? 'violet' : 'cyan'} size="sm">
                    {route.status}
                  </Badge>
                </div>
              ));
            })()}
          </div>
        </Card>
      ),
    },
    ...(serverMeta.hasCms
      ? [
          {
            id: 'cms',
            label: 'CMS & Content',
            icon: <Database className="h-4 w-4" />,
            content: (
              <CmsDashboardView
                projectId={currentProject.id}
                projectName={currentProject.name}
              />
            ),
          },
        ]
      : []),
    {
      id: 'backend',
      label: currentProject.isBackendEnabled ? 'NestJS Backend' : 'Backend & API',
      icon: <Server className="h-4 w-4" />,
      content: (
        <NestJsBackendView
          project={currentProject}
          onProjectUpdated={(updated) => setCurrentProject(updated)}
        />
      ),
    },
    {
      id: 'deploy',
      label: 'Cloud deployment',
      icon: <Cloud className="h-4 w-4" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4 text-[#635BFF]" />
              <span>Production pipeline</span>
            </CardTitle>
            <CardDescription>
              Automated multi-stage Docker build and edge distribution targets.
            </CardDescription>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                <CheckCircle2 className="h-4 w-4" /> Next.js 15 standalone output configured
              </div>
              {serverMeta.hasNestJs ? (
                <>
                  <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                    <CheckCircle2 className="h-4 w-4" /> Prisma migration &amp; PostgreSQL schema ready
                  </div>
                  <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                    <CheckCircle2 className="h-4 w-4" /> NestJS REST API gateway (/api/v1) active
                  </div>
                </>
              ) : serverMeta.hasCms ? (
                <>
                  <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                    <CheckCircle2 className="h-4 w-4" /> Dynamic Headless CMS delivery API configured
                  </div>
                  <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                    <CheckCircle2 className="h-4 w-4" /> Content delivery endpoint (/api/v1/cms/delivery) active
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                  <CheckCircle2 className="h-4 w-4" /> Static edge distribution (zero server overhead)
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-[#635BFF]/5 to-transparent border-[#635BFF]/20 space-y-3">
            <h4 className="text-sm font-bold text-[#635BFF] dark:text-[#A5AEFD]">
              One-click cloud deploy
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Deploy this full-stack application directly to Vercel or AWS ECS with automated CI/CD pipelines.
            </p>
            <Button
              variant="default"
              size="sm"
              className="w-full text-xs font-semibold shadow-md shadow-[#635BFF]/20"
              onClick={() =>
                toast({
                  title: 'Deployment triggered',
                  description: 'Connecting to Vercel and AWS infrastructure...',
                  type: 'info',
                })
              }
            >
              Deploy application
            </Button>
          </Card>
        </div>
      ),
    },
    {
      id: 'storage',
      label: 'Storage & Assets',
      icon: <Database className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          {/* Storage Engine Settings & Credentials */}
          <StorageSettingsCard
            projectId={currentProject.id}
            projectName={currentProject.name}
            activeDriver={activeDriver}
            initialConfig={storageConfig}
            onSave={(cfg, drv) => updateStorageConfig(cfg, drv)}
            onTest={(drv, cfg) => testConnection(drv, cfg)}
            isSaving={isSavingConfig}
            isTesting={isTestingConnection}
          />

          <FileUploadDropzone
            activeDriver={activeDriver}
            targetName={currentProject.name}
            onUpload={uploadFile}
            isUploading={isUploading}
          />

          <FileListTable
            files={files}
            activeDriver={activeDriver}
            targetName={currentProject.name}
            onDeleteFile={deleteFile}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={currentProject.name}
        description={currentProject.description || 'AI-generated full-stack application.'}
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="indigo">{currentProject.type}</Badge>
            <Badge variant={serverMeta.badgeVariant}>{serverMeta.shortLabel}</Badge>
          </div>
        }
        backAction={{
          label: 'Back to projects',
          href: ROUTES.DASHBOARD.PROJECTS,
        }}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={handleExport}
            >
              Export codebase
            </Button>
            <Button
              variant="default"
              size="sm"
              leftIcon={<Play className="h-4 w-4" />}
              onClick={openStudio}
            >
              Launch visual builder
            </Button>
          </>
        }
      />

      <Tabs
        items={tabItems}
        defaultTab={serverType === 'cms' ? 'cms' : serverType === 'nestjs' ? 'backend' : 'blueprint'}
      />

      <VisualStudioModal
        project={currentProject}
        isOpen={isStudioOpen}
        onClose={closeStudio}
      />
    </div>
  );
};
