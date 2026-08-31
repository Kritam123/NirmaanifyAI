'use client';

import React, { useState } from 'react';
import { PageHeader, Button } from '@nirmaanify/ui';
import { Plus, Building2, UserPlus } from 'lucide-react';
import { useWorkspaces } from '../../../hooks/use-workspaces';
import { WorkspaceCard } from '../../../components/workspaces/WorkspaceCard';
import { MembersList } from '../../../components/workspaces/MembersList';
import { CreateWorkspaceDialog } from '../../../components/workspaces/CreateWorkspaceDialog';
import { InviteMemberDialog } from '../../../components/workspaces/InviteMemberDialog';

export default function WorkspacesPage() {
  const {
    workspaces,
    activeWorkspace,
    members,
    switchWorkspace,
    inviteMember,
    removeMember,
  } = useWorkspaces();

  const [createWsModal, setCreateWsModal] = useState(false);
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
              onClick={() => setCreateWsModal(true)}
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
      </div>

      {/* Active Workspace Member Roster */}
      <MembersList
        members={members}
        workspaceName={activeWorkspace?.name}
        onRemoveMember={removeMember}
      />

      {/* Modals */}
      <CreateWorkspaceDialog
        isOpen={createWsModal}
        onClose={() => setCreateWsModal(false)}
      />

      <InviteMemberDialog
        isOpen={inviteModal}
        onClose={() => setInviteModal(false)}
        onInvite={inviteMember}
        workspaceName={activeWorkspace?.name}
      />
    </div>
  );
}
