'use client';

import React from 'react';
import { useAuth } from '../../../context/auth-context';
import { CmsDashboardView } from '../../../components/cms/CmsDashboardView';
import { Skeleton } from '@nirmaanify/ui';

export default function GlobalCmsPage() {
  const { activeWorkspace, isLoading } = useAuth();

  if (isLoading || !activeWorkspace) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-14 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CmsDashboardView
        workspaceId={activeWorkspace.id}
        workspaceName={activeWorkspace.name}
        workspaceSlug={activeWorkspace.slug}
      />
    </div>
  );
}
