'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProjectDto } from '@nirmaanify/types';
import { apiClient } from '../lib/api';
import { useAuth } from '../context/auth-context';
import { useToast } from '@nirmaanify/ui';

export type ArchiveFilter = 'all' | 'active' | 'archived';

export function useProjects() {
  const {
    projects: contextProjects,
    activeWorkspace,
    createProject: contextCreateProject,
    refreshData,
  } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<ProjectDto[]>(contextProjects);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.projects.listProjects(activeWorkspace?.id);
      if (Array.isArray(data) && data.length > 0) {
        setProjects(data);
      } else {
        setProjects(contextProjects);
      }
    } catch {
      setProjects(contextProjects);
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace?.id, contextProjects]);

  useEffect(() => {
    setProjects(contextProjects);
  }, [contextProjects]);

  const createProject = async (dto: Partial<ProjectDto>) => {
    try {
      const created = await contextCreateProject(dto);
      toast({
        title: 'Project created',
        description: `${created.name} is ready for development.`,
        type: 'success',
      });
      return created;
    } catch (err: any) {
      toast({
        title: 'Failed to create project',
        description: err?.message || 'Something went wrong',
        type: 'error',
      });
      throw err;
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesType = filterType === 'ALL' || p.type === filterType;
    const matchesArchive =
      archiveFilter === 'all' ||
      (archiveFilter === 'active' && !p.isArchived) ||
      (archiveFilter === 'archived' && p.isArchived);
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesArchive && matchesSearch;
  });

  return {
    projects: filteredProjects,
    allProjects: projects,
    isLoading,
    filterType,
    setFilterType,
    archiveFilter,
    setArchiveFilter,
    searchQuery,
    setSearchQuery,
    fetchProjects,
    createProject,
    refreshData,
  };
}
