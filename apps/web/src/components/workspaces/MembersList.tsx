'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Avatar, Badge, Button } from '@nirmaanify/ui';
import { Trash2, Shield } from 'lucide-react';
import { WorkspaceMemberDto } from '@nirmaanify/types';
import { useRBAC } from '../../hooks/use-rbac';
import { RoleBadge } from '../auth/RoleGate';

interface MembersListProps {
  members: WorkspaceMemberDto[];
  workspaceName?: string;
  onRemoveMember?: (userId: string) => void;
}

export const MembersList: React.FC<MembersListProps> = ({
  members,
  workspaceName,
  onRemoveMember,
}) => {
  const { canRemoveMembers } = useRBAC();

  return (
    <Card>
      <CardHeader className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Workspace Members & Permissions</CardTitle>
            <CardDescription className="text-xs">
              Role-Based Access Control (RBAC) active in {workspaceName || 'current workspace'}.
            </CardDescription>
          </div>
          <Badge variant="indigo" size="sm">
            {members.length} {members.length === 1 ? 'Member' : 'Members'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0 divide-y divide-slate-100 dark:divide-[#1E2337]">
        {members.length === 0 ? (
          <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
            No invited members yet. Invite team members to collaborate on this workspace.
          </div>
        ) : (
          members.map((member) => (
            <div key={member.id} className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  fallback={member.user?.name?.slice(0, 2).toUpperCase() || 'US'}
                  size="sm"
                  status={member.role === 'OWNER' ? 'online' : 'offline'}
                />
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {member.user?.name || 'Member'}
                  </p>
                  <p className="text-xs text-slate-400">{member.user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <RoleBadge role={member.role} showIcon />

                {canRemoveMembers && member.role !== 'OWNER' && onRemoveMember && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onRemoveMember(member.userId)}
                    className="text-slate-400 hover:text-rose-500"
                    aria-label={`Remove ${member.user?.name || 'member'}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
