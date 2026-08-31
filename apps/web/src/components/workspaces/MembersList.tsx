'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Avatar, Badge, Button } from '@nirmaanify/ui';
import { Trash2, Shield, UserCheck } from 'lucide-react';
import { WorkspaceMemberDto, UserRole } from '@nirmaanify/types';

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
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'OWNER':
        return <Badge variant="indigo">Owner</Badge>;
      case 'ADMIN':
        return <Badge variant="violet">Admin</Badge>;
      case 'DEVELOPER':
        return <Badge variant="cyan">Developer</Badge>;
      case 'EDITOR':
        return <Badge variant="secondary">Editor</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

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
        {members.map((member) => (
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
              {getRoleBadge(member.role)}

              {member.role !== 'OWNER' && onRemoveMember && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onRemoveMember(member.userId)}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
