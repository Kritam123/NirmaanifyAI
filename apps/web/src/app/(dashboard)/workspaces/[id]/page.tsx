'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useWorkspaces } from '../../../../hooks/use-workspaces';
import { WorkspaceDetailsView } from '../../../../components/workspaces/WorkspaceDetailsView';

export default function SingleWorkspacePage() {
  const params = useParams();
  const { workspaces } = useWorkspaces();
  const workspaceId = params?.id as string;

  const workspace = workspaces.find((w) => w.id === workspaceId) || {
    id: workspaceId,
    name: 'Acme SaaS Corp',
    slug: 'acme-saas',
    isPersonal: false,
    ownerId: 'usr-alex-001',
    role: 'OWNER' as const,
    projectCount: 6,
    memberCount: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return <WorkspaceDetailsView workspace={workspace} />;
}
