'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@nirmaanify/ui';
import { ProjectDto } from '@nirmaanify/types';
import { useAuth } from '../context/auth-context';

interface ProjectActionsState {
  editing: ProjectDto | null;
  settings: ProjectDto | null;
  deleting: ProjectDto | null;
  confirmDuplicate: ProjectDto | null;
}

/**
 * Centralised dialog state and action handlers for project CRUD lifecycle
 * (Edit / Settings / Delete / Duplicate). Returns handlers + state setters
 * for use in any page that shows project cards or lists.
 */
export function useProjectActions() {
  const router = useRouter();
  const { toast } = useToast();
  const { duplicateProject } = useAuth();

  const [state, setState] = useState<ProjectActionsState>({
    editing: null,
    settings: null,
    deleting: null,
    confirmDuplicate: null,
  });

  const closeAll = useCallback(() => {
    setState({ editing: null, settings: null, deleting: null, confirmDuplicate: null });
  }, []);

  const openEdit = useCallback((p: ProjectDto) => setState((s) => ({ ...s, editing: p })), []);
  const openSettings = useCallback(
    (p: ProjectDto) => setState((s) => ({ ...s, settings: p })),
    [],
  );
  const openDelete = useCallback(
    (p: ProjectDto) => setState((s) => ({ ...s, deleting: p })),
    [],
  );
  const closeEdit = useCallback(() => setState((s) => ({ ...s, editing: null })), []);
  const closeSettings = useCallback(() => setState((s) => ({ ...s, settings: null })), []);
  const closeDelete = useCallback(() => setState((s) => ({ ...s, deleting: null })), []);

  const duplicateWithToast = useCallback(async (p: ProjectDto) => {
    try {
      const dup = await duplicateProject(p.id);
      toast({
        title: 'Project duplicated',
        description: `Created clone: "${dup.name}"`,
        type: 'success',
      });
      return dup;
    } catch (err: any) {
      toast({
        title: 'Duplication failed',
        description: err?.message || 'Could not duplicate project',
        type: 'error',
      });
      throw err;
    }
  }, [duplicateProject, toast]);

  return useMemo(
    () => ({
      state,
      closeAll,
      openEdit,
      closeEdit,
      openSettings,
      closeSettings,
      openDelete,
      closeDelete,
      duplicateWithToast,
      router,
    }),
    [
      state,
      closeAll,
      openEdit,
      closeEdit,
      openSettings,
      closeSettings,
      openDelete,
      closeDelete,
      duplicateWithToast,
      router,
    ],
  );
}
