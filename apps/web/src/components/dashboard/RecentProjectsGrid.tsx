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
  EmptyState,
  useToast,
} from '@nirmaanify/ui';
import { FolderDot, ArrowRight, Sparkles, Plus, ExternalLink, Boxes } from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { ROUTES } from '../../lib/routes';

interface RecentProjectsGridProps {
  onOpenCreateModal: () => void;
}

export const RecentProjectsGrid: React.FC<RecentProjectsGridProps> = ({ onOpenCreateModal }) => {
  const { projects, activeWorkspace } = useAuth();
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Projects</h3>
          <p className="text-xs text-slate-400">Applications inside {activeWorkspace?.name || 'Workspace'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={ROUTES.DASHBOARD.PROJECTS}>
            <Button variant="ghost" size="sm">
              View All ({projects.length})
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCreateModal}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            New Project
          </Button>
        </div>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<Boxes className="h-8 w-8 text-[#635BFF]" />}
          title="No projects in this workspace yet"
          description="Scaffold your first full-stack Next.js 15 + NestJS application or microservice."
          actionLabel="Create First Project"
          actionIcon={<Plus className="h-3.5 w-3.5" />}
          onAction={onOpenCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.slice(0, 6).map((proj) => (
          <Card key={proj.id} hoverable className="flex flex-col justify-between overflow-hidden group">
            <CardHeader className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant={getBadgeVariant(proj.type) as any} size="sm">
                    {proj.type}
                  </Badge>
                  <CardTitle className="mt-2.5 text-base text-slate-900 dark:text-white group-hover:text-[#635BFF] transition-colors">
                    {proj.name}
                  </CardTitle>
                </div>
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-[#161926] text-[#635BFF]">
                  <FolderDot className="h-4 w-4" />
                </div>
              </div>
              <CardDescription className="line-clamp-2 mt-1 text-xs">
                {proj.description || 'AI-generated full-stack application.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-5 py-0 space-y-3">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#161926] border border-slate-100 dark:border-[#24293D] space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Framework:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {proj.framework || 'Next.js 15 App Router'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Backend:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {proj.isBackendEnabled ? 'NestJS API + PostgreSQL' : 'Static Export'}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-5 pt-4 flex items-center justify-between border-t border-slate-100 dark:border-[#1E2337]">
              <Link href={ROUTES.DASHBOARD.PROJECT_DETAIL(proj.id)}>
                <Button variant="ghost" size="sm" className="text-xs">
                  Inspect Schema
                </Button>
              </Link>
              <Button
                variant="subtle"
                size="sm"
                className="text-xs"
                rightIcon={<ArrowRight className="h-3 w-3" />}
                onClick={() =>
                  toast({
                    title: 'Studio Launching',
                    description: `Opened ${proj.name} canvas`,
                    type: 'success',
                  })
                }
              >
                Launch Studio
              </Button>
            </CardFooter>
          </Card>
        ))}
        </div>
      )}
    </div>
  );
};
