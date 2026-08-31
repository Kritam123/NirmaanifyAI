'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  useToast,
} from '@nirmaanify/ui';
import { ArrowLeft, Building2, Users, Plus, Shield, Key } from 'lucide-react';
import { WorkspaceDto } from '@nirmaanify/types';
import { useWorkspaces } from '../../hooks/use-workspaces';
import { MembersList } from './MembersList';
import { InviteMemberDialog } from './InviteMemberDialog';
import { ROUTES } from '../../lib/routes';

interface WorkspaceDetailsViewProps {
  workspace: WorkspaceDto;
}

export const WorkspaceDetailsView: React.FC<WorkspaceDetailsViewProps> = ({ workspace }) => {
  const { members, inviteMember, removeMember } = useWorkspaces();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

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

        <Button
          variant="default"
          size="sm"
          onClick={() => setInviteModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Invite Member
        </Button>
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
                <span className="text-slate-400">Owner ID</span>
                <span className="font-mono text-slate-600 dark:text-slate-300">{workspace.ownerId}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E2337]">
                <span className="text-slate-400">Total Projects</span>
                <span className="font-semibold">{workspace.projectCount || 3}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E2337]">
                <span className="text-slate-400">RBAC Policy</span>
                <Badge variant="cyan" size="sm">
                  Active
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <InviteMemberDialog
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInvite={inviteMember}
        workspaceName={workspace.name}
      />
    </div>
  );
};
