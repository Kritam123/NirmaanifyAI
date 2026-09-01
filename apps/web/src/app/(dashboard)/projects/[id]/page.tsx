'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProjects } from '../../../../hooks/use-projects';
import { ProjectDetailsView } from '../../../../components/projects/ProjectDetailsView';
import { Button, Card, CardHeader, CardTitle, CardDescription } from '@nirmaanify/ui';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { ROUTES } from '../../../../lib/routes';

export default function SingleProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { allProjects, isLoading } = useProjects();
  const projectId = params?.id as string;

  const project = allProjects.find((p) => p.id === projectId);

  if (!project && !isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="p-8 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-[#161926] flex items-center justify-center text-slate-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <CardTitle>Project Not Found</CardTitle>
            <CardDescription>
              The project you requested does not exist or has been removed from this workspace.
            </CardDescription>
          </div>
          <Button
            variant="default"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => router.push(ROUTES.DASHBOARD.PROJECTS)}
          >
            Back to Projects
          </Button>
        </Card>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return <ProjectDetailsView project={project} />;
}
