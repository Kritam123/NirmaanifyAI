'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProjectDto } from '@nirmaanify/types';
import { apiClient } from '../lib/api';
import { useAuth } from '../context/auth-context';
import { useToast } from '@nirmaanify/ui';

export function useProjects() {
  const { projects: contextProjects, activeWorkspace, createProject: contextCreateProject } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<ProjectDto[]>(contextProjects);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.projects.listProjects(activeWorkspace?.id);
      if (data && data.length > 0) {
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
        title: 'Project Created',
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
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return {
    projects: filteredProjects,
    allProjects: projects,
    isLoading,
    filterType,
    setFilterType,
    searchQuery,
    setSearchQuery,
    fetchProjects,
    createProject,
  };
}
