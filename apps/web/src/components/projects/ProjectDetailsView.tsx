'use client';

import React from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Button,
  Separator,
  useToast,
} from '@nirmaanify/ui';
import {
  ArrowLeft,
  Download,
  Play,
  Layers,
  Server,
  FileCode2,
  Calendar,
  Globe,
  Settings2,
  Check,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={ROUTES.DASHBOARD.PROJECTS}>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{project.name}</h2>
              <Badge variant="indigo">{project.type}</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{project.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />} onClick={handleExport}>
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
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Schema & Architecture */}
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

          {/* Scaffolded Pages Matrix */}
          <Card className="p-6">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#22D3EE]" />
              <span>App Router Pages & Route Structure</span>
            </CardTitle>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { path: '/', title: 'Home Landing Page', status: 'Generated' },
                { path: '/dashboard', title: 'Analytics Dashboard', status: 'Generated' },
                { path: '/editor', title: 'Visual Studio Canvas', status: 'Ready' },
                { path: '/api/v1/auth', title: 'JWT Authentication Route', status: 'Connected' },
              ].map((route) => (
                <div
                  key={route.path}
                  className="p-3 rounded-xl border border-slate-200 dark:border-[#24293D] bg-slate-50 dark:bg-[#161926] flex items-center justify-between"
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
        </div>

        {/* Right 1 Col: Specs & Meta */}
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

          <Card className="p-6 bg-gradient-to-br from-[#635BFF]/5 to-transparent border-[#635BFF]/20 space-y-3">
            <h4 className="text-sm font-bold text-[#635BFF] dark:text-[#A5AEFD]">One-Click Cloud Deploy</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Deploy this full-stack application directly to Vercel or AWS ECS with automated CI/CD pipelines.
            </p>
            <Button
              variant="default"
              size="sm"
              className="w-full text-xs font-semibold"
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
      </div>
    </div>
  );
};
