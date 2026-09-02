'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProjects } from '../../../../hooks/use-projects';
import { ProjectDetailsView } from '../../../../components/projects/ProjectDetailsView';
import { LoadingState, ErrorState } from '@nirmaanify/ui';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '../../../../lib/routes';

export default function SingleProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { allProjects, isLoading } = useProjects();
  const projectId = params?.id as string;

  const project = allProjects.find((p) => p.id === projectId);

  if (isLoading) {
    return (
      <div className="py-20">
        <LoadingState message="Loading project blueprint & configuration..." />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <ErrorState
          title="Project Not Found"
          message="The requested project does not exist or has been removed from this workspace."
          actionLabel="Back to Projects"
          actionIcon={<ArrowLeft className="h-4 w-4" />}
          onRetry={() => router.push(ROUTES.DASHBOARD.PROJECTS)}
        />
      </div>
    );
  }

  return <ProjectDetailsView project={project} />;
}
