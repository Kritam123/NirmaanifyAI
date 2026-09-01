'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardTitle,
  Badge,
  Button,
} from '@nirmaanify/ui';
import { ArrowLeft, Plus, ExternalLink, Trash2, AlertTriangle } from 'lucide-react';
import { WorkspaceDto } from '@nirmaanify/types';
import { useWorkspaces } from '../../hooks/use-workspaces';
import { useRBAC } from '../../hooks/use-rbac';
import { MembersList } from './MembersList';
import { InviteMemberDialog } from './InviteMemberDialog';
import { DeleteWorkspaceDialog } from './DeleteWorkspaceDialog';
import { RoleBadge } from '../auth/RoleGate';
import { ROUTES } from '../../lib/routes';

interface WorkspaceDetailsViewProps {
  workspace: WorkspaceDto;
}

export const WorkspaceDetailsView: React.FC<WorkspaceDetailsViewProps> = ({ workspace }) => {
  const router = useRouter();
  const { members, inviteMember, removeMember } = useWorkspaces();
  const { canInviteMembers, role } = useRBAC();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const workspaceUrl = `/workspaces/${workspace.id}`;
  const isOwnerOrAdmin = role === 'OWNER' || role === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={ROUTES.DASHBOARD.WORKSPACES}>
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{workspace.name}</h2>
              <Badge variant="indigo">{workspace.isPersonal ? 'Personal' : 'Organization'}</Badge>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">/{workspace.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Single Dedicated Redirect Button to Open Workspace in New Tab */}
          <a
            href={workspaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#24293D] hover:border-[#635BFF] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#635BFF] bg-white dark:bg-[#0F111A] shadow-sm transition-all"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open in New Tab</span>
          </a>

          {canInviteMembers && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setInviteModalOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Invite Member
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MembersList
            members={members}
            workspaceName={workspace.name}
            onRemoveMember={removeMember}
          />
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <CardTitle className="text-base">Workspace Settings</CardTitle>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E2337]">
                <span className="text-slate-400">Your Current Role</span>
                <RoleBadge role={role} showIcon />
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E2337]">
                <span className="text-slate-400">Owner ID</span>
                <span className="font-mono text-slate-600 dark:text-slate-300">{workspace.ownerId}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E2337]">
                <span className="text-slate-400">Total Projects</span>
                <span className="font-semibold">{workspace.projectCount || 0}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E2337]">
                <span className="text-slate-400">Slug Identifier</span>
                <span className="font-mono text-slate-600 dark:text-slate-300">/{workspace.slug}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E2337]">
                <span className="text-slate-400">RBAC Policy</span>
                <Badge variant="cyan" size="sm">
                  Active
                </Badge>
              </div>
            </div>
          </Card>

          {/* Danger Zone: Delete Workspace */}
          {isOwnerOrAdmin && (
            <Card className="p-6 border-rose-500/20 bg-rose-500/5 space-y-4">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-4 w-4" />
                <CardTitle className="text-sm font-bold text-rose-600 dark:text-rose-400">
                  Danger Zone
                </CardTitle>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Permanently delete this workspace and all its contained projects. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="w-full font-bold text-xs"
                onClick={() => setDeleteModalOpen(true)}
                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
              >
                Delete Workspace
              </Button>
            </Card>
          )}
        </div>
      </div>

      {canInviteMembers && (
        <InviteMemberDialog
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          onInvite={inviteMember}
          workspaceName={workspace.name}
        />
      )}

      {/* Delete Workspace Confirmation Dialog */}
      <DeleteWorkspaceDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        workspace={workspace}
        onSuccess={() => router.push(ROUTES.DASHBOARD.WORKSPACES)}
      />
    </div>
  );
};
