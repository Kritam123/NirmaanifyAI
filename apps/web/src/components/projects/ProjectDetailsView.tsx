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
      title: 'Full Source Export Initiated',
      description: `Bundling ${project.slug}.zip with Next.js 15 App Router & NestJS modules.`,
      type: 'success',
    });
  };

  const tabItems = [
    {
      id: 'blueprint',
      label: 'Blueprint & Architecture',
      icon: <FileCode2 className="h-4 w-4" />,
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <CardTitle className="text-base flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-[#635BFF]" />
                <span>Project Blueprint & Configuration</span>
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
              <CardTitle className="text-base">Technical Specs</CardTitle>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E2337]">
                  <span className="text-slate-400">Framework</span>
                  <span className="font-semibold">{project.framework}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E2337]">
                  <span className="text-slate-400">UI System</span>
                  <span className="font-semibold">{project.uiLibrary}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E2337]">
                  <span className="text-slate-400">Backend</span>
                  <Badge variant={project.isBackendEnabled ? 'indigo' : 'secondary'} size="sm">
                    {project.isBackendEnabled ? 'NestJS Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E2337]">
                  <span className="text-slate-400">Created At</span>
                  <span className="font-semibold text-slate-500">
                    {new Date(project.createdAt).toLocaleDateString()}
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
      label: 'App Router Pages',
      icon: <Layers className="h-4 w-4" />,
      content: (
        <Card className="p-6">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#22D3EE]" />
            <span>App Router Pages & Route Structure</span>
          </CardTitle>
          <CardDescription className="mt-1">
            Scaffolded routes with Next.js 15 layout server components.
          </CardDescription>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { path: '/', title: 'Home Landing Page', status: 'Generated' },
              { path: '/dashboard', title: 'Analytics Dashboard', status: 'Generated' },
              { path: '/editor', title: 'Visual Studio Canvas', status: 'Ready' },
              { path: '/api/v1/auth', title: 'JWT Authentication Route', status: 'Connected' },
            ].map((route) => (
              <div
                key={route.path}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-[#24293D] bg-slate-50 dark:bg-[#161926] flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">{route.path}</p>
                  <p className="text-[11px] text-slate-400">{route.title}</p>
                </div>
                <Badge variant="cyan" size="sm">
                  {route.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      ),
    },
    {
      id: 'deploy',
      label: 'Cloud Deployment',
      icon: <Cloud className="h-4 w-4" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4 text-[#635BFF]" />
              <span>Production Pipeline</span>
            </CardTitle>
            <CardDescription>
              Automated multi-stage Docker build and edge distribution targets.
            </CardDescription>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                <CheckCircle2 className="h-4 w-4" /> Next.js 15 Standalone Output Configured
              </div>
              <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                <CheckCircle2 className="h-4 w-4" /> Prisma Migration & Seed Schema Ready
              </div>
              <div className="flex items-center gap-2 text-emerald-500 font-semibold">
                <CheckCircle2 className="h-4 w-4" /> Healthcheck Route (/api/health) Active
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-[#635BFF]/5 to-transparent border-[#635BFF]/20 space-y-3">
            <h4 className="text-sm font-bold text-[#635BFF] dark:text-[#A5AEFD]">One-Click Cloud Deploy</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Deploy this full-stack application directly to Vercel or AWS ECS with automated CI/CD pipelines.
            </p>
            <Button
              variant="default"
              size="sm"
              className="w-full text-xs font-semibold shadow-md shadow-[#635BFF]/20"
              onClick={() =>
                toast({
                  title: 'Deployment Triggered',
                  description: 'Connecting to Vercel and AWS infrastructure...',
                  type: 'info',
                })
              }
            >
              Deploy Application
            </Button>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={project.name}
        description={project.description || 'AI-generated full-stack application.'}
        badge={<Badge variant="indigo">{project.type}</Badge>}
        backAction={{
          label: 'Back to Projects',
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
              Export Codebase
            </Button>
            <Button
              variant="default"
              size="sm"
              leftIcon={<Play className="h-4 w-4" />}
              onClick={() =>
                toast({
                  title: 'Visual Studio Ready',
                  description: 'Canvas synchronized with live React renderer.',
                  type: 'success',
                })
              }
            >
              Launch Visual Builder
            </Button>
          </>
        }
      />

      {/* Tabs Navigation */}
      <Tabs items={tabItems} defaultTab="blueprint" />
    </div>
  );
};
