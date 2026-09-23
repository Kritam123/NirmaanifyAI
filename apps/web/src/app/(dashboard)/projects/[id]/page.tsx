'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProjects } from '../../../../hooks/use-projects';
import { DiagramStudio } from '../../../../components/canvas';
import { LoadingState, ErrorState } from '@nirmaanify/ui';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '../../../../lib/routes';
import { apiClient } from '../../../../lib/api';
import { DiagramDto } from '@nirmaanify/types';

export default function SingleProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { allProjects, isLoading: isProjectsLoading } = useProjects();
  const projectId = params?.id as string;

  const project = allProjects.find((p) => p.id === projectId);

  const [diagrams, setDiagrams] = useState<DiagramDto[]>([]);
  const [isDiagramsLoading, setIsDiagramsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    let isMounted = true;
    setIsDiagramsLoading(true);

    apiClient.diagrams
      .listProjectDiagrams(projectId)
      .then((data) => {
        if (isMounted) {
          setDiagrams(data);
          setIsDiagramsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load project diagrams:', err);
          setLoadError(err.message || 'Failed to load project diagrams');
          setIsDiagramsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  if (isProjectsLoading || isDiagramsLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#090A0F]">
        <LoadingState message="Initializing Architecture Studio & Canvas Vector Engine..." />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <ErrorState
          title="Project Not Found"
          message="The requested architecture project does not exist or has been removed from this workspace."
          actionLabel="Back to Projects"
          actionIcon={<ArrowLeft className="h-4 w-4" />}
          onRetry={() => router.push(ROUTES.DASHBOARD.PROJECTS)}
        />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <ErrorState
          title="Failed to Load Diagrams"
          message={loadError}
          actionLabel="Try Again"
          onRetry={() => router.refresh()}
        />
      </div>
    );
  }

  return (
    <DiagramStudio
      project={project}
      initialDiagrams={diagrams}
      onBackToProjects={() => router.push(ROUTES.DASHBOARD.PROJECTS)}
    />
  );
}
