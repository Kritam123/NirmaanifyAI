'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProjects } from '../../../../hooks/use-projects';
import { ProjectDetailsView } from '../../../../components/projects/ProjectDetailsView';
import { Button } from '@nirmaanify/ui';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '../../../../lib/routes';

export default function SingleProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { allProjects } = useProjects();
  const projectId = params?.id as string;

  const project = allProjects.find((p) => p.id === projectId) || {
    id: projectId,
    name: 'Fashion Hub Store',
    slug: 'fashion-hub',
    description: 'Modern luxury clothing boutique with Next.js App Router, NestJS API, and PostgreSQL.',
    type: 'ECOMMERCE' as const,
    workspaceId: 'ws-personal-001',
    framework: 'Next.js 15 App Router',
    uiLibrary: 'shadcn/ui + Tailwind CSS',
    isBackendEnabled: true,
    projectSchema: { pages: ['/', '/products', '/cart', '/checkout'] },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return <ProjectDetailsView project={project} />;
}
