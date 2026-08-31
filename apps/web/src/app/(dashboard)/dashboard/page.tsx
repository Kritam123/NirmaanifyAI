'use client';

import React, { useState } from 'react';
import { PageHeader, Button } from '@nirmaanify/ui';
import { Plus, Building2 } from 'lucide-react';
import { useAuth } from '../../../context/auth-context';
import { AiPlannerBar } from '../../../components/dashboard/AiPlannerBar';
import { QuickMetrics } from '../../../components/dashboard/QuickMetrics';
import { RecentProjectsGrid } from '../../../components/dashboard/RecentProjectsGrid';
import { CreateProjectDialog } from '../../../components/projects/CreateProjectDialog';
import { CreateWorkspaceDialog } from '../../../components/workspaces/CreateWorkspaceDialog';

export default function DashboardPage() {
  const { user } = useAuth();
  const [createProjectModal, setCreateProjectModal] = useState(false);
  const [createWorkspaceModal, setCreateWorkspaceModal] = useState(false);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Developer'}`}
        description="Manage your full-stack applications, trigger AI generations, and orchestrate workspace members."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Building2 className="h-4 w-4" />}
              onClick={() => setCreateWorkspaceModal(true)}
            >
              New Workspace
            </Button>
            <Button
              variant="default"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setCreateProjectModal(true)}
            >
              Create Project
            </Button>
          </div>
        }
      />

      {/* AI Project Planning Bar */}
      <AiPlannerBar />

      {/* Quick Metrics */}
      <QuickMetrics />

      {/* Recent Projects Grid */}
      <RecentProjectsGrid onOpenCreateModal={() => setCreateProjectModal(true)} />

      {/* Modals */}
      <CreateProjectDialog
        isOpen={createProjectModal}
        onClose={() => setCreateProjectModal(false)}
      />

      <CreateWorkspaceDialog
        isOpen={createWorkspaceModal}
        onClose={() => setCreateWorkspaceModal(false)}
      />
    </div>
  );
}
