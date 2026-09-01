'use client';

import { useState, useEffect, useCallback } from 'react';
import { WorkspaceDto, WorkspaceMemberDto, UserRole } from '@nirmaanify/types';
import { apiClient } from '../lib/api';
import { useAuth } from '../context/auth-context';
import { useToast } from '@nirmaanify/ui';

export function useWorkspaces(explicitWorkspaceId?: string) {
  const {
    workspaces,
    activeWorkspace,
    switchWorkspace,
    createWorkspace: contextCreateWorkspace,
    deleteWorkspace: contextDeleteWorkspace,
    leaveWorkspace: contextLeaveWorkspace,
    removeMember: contextRemoveMember,
    refreshData,
  } = useAuth();
  const { toast } = useToast();

  const currentWsId = explicitWorkspaceId || activeWorkspace?.id;

  const [members, setMembers] = useState<WorkspaceMemberDto[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState<boolean>(false);

  const fetchMembers = useCallback(async (wsId?: string) => {
    const targetId = wsId || currentWsId;
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
  }, [currentWsId]);

  useEffect(() => {
    if (currentWsId) {
      fetchMembers(currentWsId);
    } else {
      setMembers([]);
    }
  }, [currentWsId, fetchMembers]);

  const createWorkspace = async (name: string, slug?: string, isPersonal?: boolean) => {
    try {
      const newWs = await contextCreateWorkspace(name, slug, isPersonal);
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

  const inviteMember = async (email: string, role: UserRole, targetWsId?: string) => {
    const wsId = targetWsId || currentWsId;
    if (!wsId) {
      toast({
        title: 'No Workspace Selected',
        description: 'Please select a workspace before inviting members.',
        type: 'error',
      });
      return;
    }

    try {
      const res: any = await apiClient.workspaces.inviteMember(wsId, { email, role });
      await fetchMembers(wsId);
      await refreshData();

      toast({
        title: res?.delivered ? '✉️ Gmail Invitation Sent!' : '🎉 Invitation Generated',
        description: res?.message || `Invitation successfully sent to ${email}`,
        type: 'success',
      });
      return res;
    } catch (err: any) {
      toast({
        title: 'Invite Failed',
        description: err?.message || 'Could not send invitation. Please verify email.',
        type: 'error',
      });
      throw err;
    }
  };

  const removeMember = async (userId: string, targetWsId?: string) => {
    const wsId = targetWsId || currentWsId;
    if (!wsId) return;

    try {
      const res: any = await apiClient.workspaces.removeMember(wsId, userId);
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
      await refreshData();
      toast({
        title: 'Member Removed',
        description: res?.message || 'Collaborator has been removed from this workspace.',
        type: 'info',
      });
    } catch (err: any) {
      toast({
        title: 'Action Failed',
        description: err?.message || 'Could not remove member',
        type: 'error',
      });
    }
  };

  const leaveWorkspace = async (targetWsId?: string) => {
    const wsId = targetWsId || currentWsId;
    if (!wsId) return;

    try {
      await contextLeaveWorkspace(wsId);
      toast({
        title: 'Left Workspace',
        description: 'You have successfully left the workspace.',
        type: 'info',
      });
    } catch (err: any) {
      toast({
        title: 'Error Leaving Workspace',
        description: err?.message || 'Could not leave workspace',
        type: 'error',
      });
      throw err;
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
    leaveWorkspace,
    inviteMember,
    removeMember,
    fetchMembers,
  };
}
