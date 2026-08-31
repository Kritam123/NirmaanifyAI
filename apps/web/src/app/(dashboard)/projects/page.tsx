'use client';

import React, { useState } from 'react';
import { PageHeader, Button } from '@nirmaanify/ui';
import { Plus } from 'lucide-react';
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
        <div className="py-16 text-center rounded-2xl border border-dashed border-slate-300 dark:border-[#24293D] p-8 space-y-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No matching projects found</p>
          <p className="text-xs text-slate-400">Try changing your search query or filter selection.</p>
          <Button variant="subtle" size="sm" onClick={() => setCreateModalOpen(true)}>
            Create New Project
          </Button>
        </div>
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
