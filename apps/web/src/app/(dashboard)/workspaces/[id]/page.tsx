'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWorkspaces } from '../../../../hooks/use-workspaces';
import { WorkspaceDetailsView } from '../../../../components/workspaces/WorkspaceDetailsView';
import { ErrorState } from '@nirmaanify/ui';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '../../../../lib/routes';

export default function SingleWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { workspaces } = useWorkspaces();
  const workspaceId = params?.id as string;

  const workspace = workspaces.find((w) => w.id === workspaceId);

  if (!workspace) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <ErrorState
          title="Workspace Not Found"
          message="The workspace you requested does not exist or you do not have permission to view it."
          actionLabel="Back to Workspaces"
          actionIcon={<ArrowLeft className="h-4 w-4" />}
          onRetry={() => router.push(ROUTES.DASHBOARD.WORKSPACES)}
        />
      </div>
    );
  }

  return <WorkspaceDetailsView workspace={workspace} />;
}
