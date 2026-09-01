'use client';

import { useState, useEffect, useCallback } from 'react';
import { WorkspaceDto, WorkspaceMemberDto, UserRole } from '@nirmaanify/types';
import { apiClient } from '../lib/api';
import { useAuth } from '../context/auth-context';
import { useToast } from '@nirmaanify/ui';

export function useWorkspaces() {
  const {
    workspaces,
    activeWorkspace,
    switchWorkspace,
    createWorkspace: contextCreateWorkspace,
    deleteWorkspace: contextDeleteWorkspace,
    inviteMember: contextInviteMember,
    removeMember: contextRemoveMember,
  } = useAuth();
  const { toast } = useToast();

  const [members, setMembers] = useState<WorkspaceMemberDto[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState<boolean>(false);

  const fetchMembers = useCallback(async (wsId?: string) => {
    const targetId = wsId || activeWorkspace?.id;
    if (!targetId) {
      setMembers([]);
      return;
    }

    setIsLoadingMembers(true);
    try {
      const list = await apiClient.workspaces.listMembers(targetId);
      setMembers(list || []);
    } catch {
      setMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  }, [activeWorkspace?.id]);

  useEffect(() => {
    if (activeWorkspace?.id) {
      fetchMembers(activeWorkspace.id);
    } else {
      setMembers([]);
    }
  }, [activeWorkspace?.id, fetchMembers]);

  const createWorkspace = async (name: string, slug?: string) => {
    try {
      const newWs = await contextCreateWorkspace(name, slug);
      toast({
        title: 'Workspace Created',
        description: `Switched to workspace "${newWs.name}"`,
        type: 'success',
      });
      return newWs;
    } catch (err: any) {
      toast({
        title: 'Error Creating Workspace',
        description: err?.message || 'Failed to create workspace',
        type: 'error',
      });
      throw err;
    }
  };

  const inviteMember = async (email: string, role: UserRole) => {
    try {
      await contextInviteMember(email, role);
      await fetchMembers();
      toast({
        title: 'Invitation Sent',
        description: `Invite successfully sent to ${email} as ${role}`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Invite Failed',
        description: err?.message || 'Could not send invitation',
        type: 'error',
      });
    }
  };

  const removeMember = async (userId: string) => {
    try {
      await contextRemoveMember(userId);
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
      toast({
        title: 'Member Removed',
        description: 'Collaborator has been removed from this workspace.',
        type: 'info',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Could not remove member',
        type: 'error',
      });
    }
  };

  const deleteWorkspace = async (workspaceId: string) => {
    try {
      await contextDeleteWorkspace(workspaceId);
      toast({
        title: 'Workspace Deleted',
        description: 'The workspace and all associated projects have been permanently deleted.',
        type: 'info',
      });
    } catch (err: any) {
      toast({
        title: 'Delete Failed',
        description: err?.message || 'Could not delete workspace',
        type: 'error',
      });
      throw err;
    }
  };

  return {
    workspaces,
    activeWorkspace,
    members,
    isLoadingMembers,
    switchWorkspace,
    createWorkspace,
    deleteWorkspace,
    inviteMember,
    removeMember,
    fetchMembers,
  };
}
