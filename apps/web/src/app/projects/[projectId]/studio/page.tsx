'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProjectDto } from '@nirmaanify/types';
import { projectsApi } from '../../../../core/api';
import { VisualStudioModal } from '../../../../components/studio/visual-studio-modal';
import { Card, Button } from '@nirmaanify/ui';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { ROUTES } from '../../../../config/routes.config';

export default function ProjectStudioPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;

  const [project, setProject] = useState<ProjectDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const loadProject = async () => {
      setIsLoading(true);
      try {
        const data = await projectsApi.get(projectId);
        setProject(data);
      } catch (err: any) {
        setError(err.message || 'Project not found');
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#0A0D14] flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-[#635BFF] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Loading Nirmaan Visual Studio...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="h-screen w-screen bg-[#0A0D14] flex flex-col items-center justify-center p-6 text-center">
        <Card className="max-w-md p-8 bg-[#161926] border-[#24293D] text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">Project Not Found</h3>
          <p className="text-xs text-slate-400">
            {error || `Unable to load studio for project ID "${projectId}".`}
          </p>
          <Button
            variant="default"
            onClick={() => router.push(ROUTES.DASHBOARD.OVERVIEW)}
            className="w-full bg-[#635BFF] hover:bg-[#5348E2]"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0D14]">
      <VisualStudioModal
        project={project}
        isOpen={true}
        onClose={() => router.push(ROUTES.DASHBOARD.OVERVIEW)}
      />
    </div>
  );
}
