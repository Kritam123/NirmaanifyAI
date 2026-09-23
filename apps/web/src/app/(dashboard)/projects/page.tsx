'use client';

import React, { useState } from 'react';
import { PageHeader, Button, EmptyState, Card } from '@nirmaanify/ui';
import { Plus, Boxes } from 'lucide-react';
import {
  ProjectCard,
  ProjectFilters,
  CreateProjectDialog,
  EditProjectDialog,
  ProjectSettingsDialog,
  DeleteProjectDialog,
} from '../../../components/projects';
import { useProjects } from '../../../hooks/use-projects';
import { useProjectActions } from '../../../hooks/use-project-actions';
import { ROUTES } from '../../../lib/routes';

export default function ProjectsPage() {
  const [createOpen, setCreateOpen] = useState(false);

  const {
    projects,
    allProjects,
    filterType,
    setFilterType,
    archiveFilter,
    setArchiveFilter,
    searchQuery,
    setSearchQuery,
    isLoading,
  } = useProjects();

  const actions = useProjectActions();

  const activeCount = allProjects.filter((p) => !p.isArchived).length;
  const archivedCount = allProjects.filter((p) => p.isArchived).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Architecture Designs"
        description="Design distributed system architectures, cloud topologies, and UML diagrams on an infinite vector canvas with AI scaffolding."
        actions={
          <Button
            variant="default"
            size="sm"
            onClick={() => setCreateOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            New Architecture Design
          </Button>
        }
      />

      <Card className="p-4">
        <ProjectFilters
          filterType={filterType}
          onFilterChange={setFilterType}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          archiveFilter={archiveFilter}
          onArchiveFilterChange={setArchiveFilter}
          activeCount={activeCount}
          archivedCount={archivedCount}
        />
      </Card>

      {projects.length === 0 ? (
        <EmptyState
          icon={<Boxes className="h-8 w-8 text-[#635BFF]" />}
          title="No matching architecture designs found"
          description={
            searchQuery || filterType !== 'ALL' || archiveFilter !== 'all'
              ? 'Try changing your search, type filter, or status filter.'
              : 'You have not created any architecture designs in this workspace yet.'
          }
          actionLabel="Create Architecture Design"
          actionIcon={<Plus className="h-3.5 w-3.5" />}
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <ProjectCard
              key={proj.id}
              project={proj}
              onEdit={actions.openEdit}
              onSettings={actions.openSettings}
              onDelete={actions.openDelete}
              onOpen={(p) => actions.router.push(ROUTES.DASHBOARD.PROJECT_DETAIL(p.id))}
            />
          ))}
        </div>
      )}

      <CreateProjectDialog isOpen={createOpen} onClose={() => setCreateOpen(false)} />

      <EditProjectDialog
        project={actions.state.editing}
        isOpen={!!actions.state.editing}
        onClose={actions.closeEdit}
      />

      <ProjectSettingsDialog
        project={actions.state.settings}
        isOpen={!!actions.state.settings}
        onClose={actions.closeSettings}
        onEdit={() => {
          const target = actions.state.settings;
          actions.closeSettings();
          if (target) actions.openEdit(target);
        }}
      />

      <DeleteProjectDialog
        project={actions.state.deleting}
        isOpen={!!actions.state.deleting}
        onClose={actions.closeDelete}
      />
    </div>
  );
}
