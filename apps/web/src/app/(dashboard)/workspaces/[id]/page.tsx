'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWorkspaces } from '../../../../hooks/use-workspaces';
import { WorkspaceDetailsView } from '../../../../components/workspaces/WorkspaceDetailsView';
import { Button, Card, CardTitle, CardDescription } from '@nirmaanify/ui';
import { ArrowLeft, AlertCircle } from 'lucide-react';
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
        <Card className="p-8 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-[#161926] flex items-center justify-center text-slate-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <CardTitle>Workspace Not Found</CardTitle>
            <CardDescription>
              The workspace you requested does not exist or you do not have permission to view it.
            </CardDescription>
          </div>
          <Button
            variant="default"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => router.push(ROUTES.DASHBOARD.WORKSPACES)}
          >
            Back to Workspaces
          </Button>
        </Card>
      </div>
    );
  }

  return <WorkspaceDetailsView workspace={workspace} />;
}
