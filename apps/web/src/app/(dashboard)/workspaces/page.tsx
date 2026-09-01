'use client';

import React, { useState } from 'react';
import { PageHeader, Button } from '@nirmaanify/ui';
import { Plus, Building2, UserPlus } from 'lucide-react';
import { useWorkspaces } from '../../../hooks/use-workspaces';
import { useWorkspaceModal } from '../../../context/workspace-modal-context';
import { WorkspaceCard } from '../../../components/workspaces/WorkspaceCard';
import { MembersList } from '../../../components/workspaces/MembersList';
import { InviteMemberDialog } from '../../../components/workspaces/InviteMemberDialog';

export default function WorkspacesPage() {
  const {
    workspaces,
    activeWorkspace,
    members,
    switchWorkspace,
    inviteMember,
    removeMember,
    leaveWorkspace,
  } = useWorkspaces();
  const { openCreateWorkspaceModal } = useWorkspaceModal();

  const [inviteModal, setInviteModal] = useState(false);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Workspaces & Team Management"
        description="Organize multi-tenant developer teams, manage role permissions (Owner, Admin, Developer, Editor, Viewer)."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openCreateWorkspaceModal()}
              leftIcon={<Building2 className="h-4 w-4" />}
            >
              New Workspace
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setInviteModal(true)}
              leftIcon={<UserPlus className="h-4 w-4" />}
            >
              Invite Member
            </Button>
          </div>
        }
      />

      {/* Workspaces Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Your Workspaces</h3>
        {workspaces.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-[#24293D] p-6 space-y-3 bg-white/40 dark:bg-[#0F111A]/40">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No workspaces found</p>
            <p className="text-xs text-slate-400">You don't have any workspaces in PostgreSQL yet. Create your first workspace to start collaborating.</p>
            <Button
              variant="default"
              size="sm"
              onClick={() => openCreateWorkspaceModal()}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Create Workspace
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workspaces.map((ws) => (
              <WorkspaceCard
                key={ws.id}
                workspace={ws}
                isActive={ws.id === activeWorkspace?.id}
                onSwitch={switchWorkspace}
              />
            ))}
          </div>
        )}
      </div>

      {/* Active Workspace Member Roster */}
      <MembersList
        members={members}
        workspace={activeWorkspace || undefined}
        workspaceName={activeWorkspace?.name}
        onRemoveMember={removeMember}
        onLeaveWorkspace={leaveWorkspace}
      />

      {/* Invite Modal */}
      <InviteMemberDialog
        isOpen={inviteModal}
        onClose={() => setInviteModal(false)}
        onInvite={inviteMember}
        workspaceName={activeWorkspace?.name}
      />
    </div>
  );
}
