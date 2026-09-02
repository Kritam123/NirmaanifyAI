'use client';

import React from 'react';
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
} from 'lucide-react';
import { ProjectDto } from '@nirmaanify/types';
import { ROUTES } from '../../lib/routes';

interface ProjectDetailsViewProps {
  project: ProjectDto;
}

export const ProjectDetailsView: React.FC<ProjectDetailsViewProps> = ({ project }) => {
  const { toast } = useToast();

  const handleExport = () => {
    toast({
      title: 'Export initiated',
      description: `Bundling ${project.slug}.zip with Next.js 15 App Router & NestJS modules.`,
      type: 'success',
    });
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
              <CardTitle className="text-base flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-[#635BFF]" />
                <span>Project blueprint &amp; configuration</span>
              </CardTitle>
              <CardDescription className="mt-1">
                Live schema metadata generated and orchestrated by the platform.
              </CardDescription>

              <div className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
                <pre>{JSON.stringify(project, null, 2)}</pre>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <CardTitle className="text-base">Technical specs</CardTitle>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E2337]">
                  <span className="text-slate-400">Framework</span>
                  <span className="font-semibold">{project.framework}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E2337]">
                  <span className="text-slate-400">UI system</span>
                  <span className="font-semibold">{project.uiLibrary}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E2337]">
                  <span className="text-slate-400">Backend</span>
                  <Badge variant={project.isBackendEnabled ? 'indigo' : 'secondary'} size="sm">
                    {project.isBackendEnabled ? 'NestJS enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E2337]">
                  <span className="text-slate-400">Created at</span>
                  <span className="font-semibold text-slate-500">
                    {new Date(project.createdAt as any).toLocaleDateString()}
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
                ? (project.projectSchema!.pages as string[])
                : [];

              const items =
                aiPages.length > 0
                  ? aiPages.map((p) => ({
                      path: p.path,
                      title: p.name,
                      status: p.isProtected ? 'Auth required' : 'Generated',
                    }))
                  : schemaPages.map((p) => ({
                      path: p,
                      title: p === '/' ? 'Home' : p.replace(/^\//, ''),
                      status: 'Generated',
                    }));

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
              <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                <CheckCircle2 className="h-4 w-4" /> Prisma migration &amp; seed schema ready
              </div>
              <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                <CheckCircle2 className="h-4 w-4" /> Healthcheck route (/api/health) active
              </div>
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
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.name}
        description={project.description || 'AI-generated full-stack application.'}
        badge={<Badge variant="indigo">{project.type}</Badge>}
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
              onClick={() =>
                toast({
                  title: 'Visual studio ready',
                  description: 'Canvas synchronized with live React renderer.',
                  type: 'success',
                })
              }
            >
              Launch visual builder
            </Button>
          </>
        }
      />

      <Tabs items={tabItems} defaultTab="blueprint" />
    </div>
  );
};
