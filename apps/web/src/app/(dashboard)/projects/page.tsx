'use client';

import React, { useState } from 'react';
import { PageHeader, Button, EmptyState } from '@nirmaanify/ui';
import { Plus, Boxes } from 'lucide-react';
import { useProjects } from '../../../hooks/use-projects';
import { ProjectCard } from '../../../components/projects/ProjectCard';
import { ProjectFilters } from '../../../components/projects/ProjectFilters';
import { CreateProjectDialog } from '../../../components/projects/CreateProjectDialog';

export default function ProjectsPage() {
  const {
    projects,
    filterType,
    setFilterType,
    searchQuery,
    setSearchQuery,
  } = useProjects();

  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects & Microservices"
        description="Scaffold, develop, and deploy full-stack applications in your active workspace."
        actions={
          <Button
            variant="default"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Create Project
          </Button>
        }
      />

      {/* Filters Bar */}
      <ProjectFilters
        filterType={filterType}
        onFilterChange={setFilterType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <EmptyState
          icon={<Boxes className="h-8 w-8 text-[#635BFF]" />}
          title="No matching projects found"
          description={
            searchQuery || filterType !== 'ALL'
              ? 'Try changing your search query or filter selection.'
              : 'You have not created any projects in this workspace yet.'
          }
          actionLabel="Create Project"
          actionIcon={<Plus className="h-3.5 w-3.5" />}
          onAction={() => setCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <ProjectCard key={proj.id} project={proj} />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectDialog
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}
