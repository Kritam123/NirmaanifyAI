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
  useToast,
} from '@nirmaanify/ui';
import { FolderDot, ArrowRight, Download, Server, Layout } from 'lucide-react';
import { ProjectDto } from '@nirmaanify/types';
import { ROUTES } from '../../lib/routes';

interface ProjectCardProps {
  project: ProjectDto;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { toast } = useToast();

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'SAAS':
        return 'indigo';
      case 'ECOMMERCE':
        return 'violet';
      case 'BLOG':
        return 'cyan';
      default:
        return 'secondary';
    }
  };

  const handleExport = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({
      title: 'Export Generated',
      description: `Package for ${project.slug}.zip created with Next.js 15 & NestJS API.`,
      type: 'success',
    });
  };

  return (
    <Card hoverable className="flex flex-col justify-between overflow-hidden group">
      <CardHeader className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <Badge variant={getBadgeVariant(project.type) as any} size="sm">
              {project.type}
            </Badge>
            <CardTitle className="mt-2.5 text-lg text-slate-900 dark:text-white group-hover:text-[#635BFF] transition-colors">
              {project.name}
            </CardTitle>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#161926] text-[#635BFF]">
            <FolderDot className="h-5 w-5" />
          </div>
        </div>
        <CardDescription className="line-clamp-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
          {project.description || 'Custom full-stack application.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 py-0 space-y-3">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#161926] border border-slate-100 dark:border-[#24293D] space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Layout className="h-3.5 w-3.5" /> Frontend:
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {project.framework || 'Next.js 15 App Router'}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5" /> Backend:
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {project.isBackendEnabled ? 'NestJS API + Postgres' : 'Static Build'}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-4 flex items-center justify-between border-t border-slate-100 dark:border-[#1E2337]">
        <Link href={ROUTES.DASHBOARD.PROJECT_DETAIL(project.id)}>
          <Button variant="ghost" size="sm" className="text-xs">
            Manage Schema
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="text-xs"
            leftIcon={<Download className="h-3 w-3" />}
          >
            Export
          </Button>
          <Link href={ROUTES.DASHBOARD.PROJECT_DETAIL(project.id)}>
            <Button
              variant="subtle"
              size="sm"
              className="text-xs"
              rightIcon={<ArrowRight className="h-3 w-3" />}
            >
              Open
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};
