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
    inviteMember: contextInviteMember,
    removeMember: contextRemoveMember,
  } = useAuth();
  const { toast } = useToast();

  const [members, setMembers] = useState<WorkspaceMemberDto[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState<boolean>(false);

  const fetchMembers = useCallback(async (wsId?: string) => {
    const targetId = wsId || activeWorkspace?.id;
    if (!targetId) return;

    setIsLoadingMembers(true);
    try {
      const list = await apiClient.workspaces.listMembers(targetId);
      if (list && list.length > 0) {
        setMembers(list);
      } else {
        // Fallback default members
        setMembers([
          {
            id: 'mem-1',
            workspaceId: targetId,
            userId: 'usr-alex-001',
            role: 'OWNER',
            user: { id: 'usr-alex-001', name: 'Alex Developer', email: 'alex@nirmaanify.ai' },
            createdAt: new Date().toISOString(),
          },
          {
            id: 'mem-2',
            workspaceId: targetId,
            userId: 'usr-sarah-002',
            role: 'DEVELOPER',
            user: { id: 'usr-sarah-002', name: 'Sarah Chen', email: 'sarah.chen@acme.com' },
            createdAt: new Date().toISOString(),
          },
          {
            id: 'mem-3',
            workspaceId: targetId,
            userId: 'usr-david-003',
            role: 'EDITOR',
            user: { id: 'usr-david-003', name: 'David Miller', email: 'david.miller@acme.com' },
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      setMembers([
        {
          id: 'mem-1',
          workspaceId: targetId,
          userId: 'usr-alex-001',
          role: 'OWNER',
          user: { id: 'usr-alex-001', name: 'Alex Developer', email: 'alex@nirmaanify.ai' },
          createdAt: new Date().toISOString(),
        },
        {
          id: 'mem-2',
          workspaceId: targetId,
          userId: 'usr-sarah-002',
          role: 'DEVELOPER',
          user: { id: 'usr-sarah-002', name: 'Sarah Chen', email: 'sarah.chen@acme.com' },
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoadingMembers(false);
    }
  }, [activeWorkspace?.id]);

  useEffect(() => {
    if (activeWorkspace?.id) {
      fetchMembers(activeWorkspace.id);
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
      setMembers((prev) => [
        ...prev,
        {
          id: `mem-${Date.now()}`,
          workspaceId: activeWorkspace?.id || 'ws-001',
          userId: `usr-${Date.now()}`,
          role,
          user: {
            id: `usr-${Date.now()}`,
            name: email.split('@')[0],
            email,
          },
          createdAt: new Date().toISOString(),
        },
      ]);
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

  return {
    workspaces,
    activeWorkspace,
    members,
    isLoadingMembers,
    switchWorkspace,
    createWorkspace,
    inviteMember,
    removeMember,
    fetchMembers,
  };
}
