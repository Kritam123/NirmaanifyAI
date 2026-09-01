'use client';

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Avatar,
  Badge,
  Button,
} from '@nirmaanify/ui';
import { UserX, LogOut, Shield, Settings2 } from 'lucide-react';
import { WorkspaceMemberDto, WorkspaceDto, UserRole } from '@nirmaanify/types';
import { useRBAC } from '../../hooks/use-rbac';
import { useAuth } from '../../context/auth-context';
import { RoleBadge } from '../auth/RoleGate';
import { KickMemberDialog } from './KickMemberDialog';
import { LeaveWorkspaceDialog } from './LeaveWorkspaceDialog';
import { EditMemberRoleDialog } from './EditMemberRoleDialog';

interface MembersListProps {
  members: WorkspaceMemberDto[];
  workspace?: WorkspaceDto;
  workspaceName?: string;
  onRemoveMember?: (userId: string) => Promise<void>;
  onUpdateMemberRole?: (userId: string, role: UserRole) => Promise<void>;
  onLeaveWorkspace?: () => Promise<void>;
}

export const MembersList: React.FC<MembersListProps> = ({
  members,
  workspace,
  workspaceName,
  onRemoveMember,
  onUpdateMemberRole,
  onLeaveWorkspace,
}) => {
  const { user } = useAuth();
  const { canRemoveMembers, canInviteMembers, role: myRole } = useRBAC();

  const [memberToKick, setMemberToKick] = useState<WorkspaceMemberDto | null>(null);
  const [memberToEditRole, setMemberToEditRole] = useState<WorkspaceMemberDto | null>(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  const wsName = workspace?.name || workspaceName || 'current workspace';

  const isCallerOwner =
    (workspace && workspace.ownerId === user?.id) ||
    myRole === 'OWNER' ||
    workspace?.role === 'OWNER';

  return (
    <>
      <Card>
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Workspace Members & Permissions</CardTitle>
              <CardDescription className="text-xs">
                Role-Based Access Control (RBAC) active in {wsName}.
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
            members.map((member) => {
              const isPending = member.status === 'PENDING';
              const isSelf =
                member.userId === user?.id ||
                (Boolean(user?.email) &&
                  member.user?.email?.toLowerCase() === user?.email?.toLowerCase());
              const isMemberOwner =
                member.role === 'OWNER' ||
                (Boolean(workspace?.ownerId) && member.userId === workspace?.ownerId);

              // Owner can edit role of any other member; Admins can edit role of non-admins and non-owners
              const canEditThisMemberRole =
                !isMemberOwner &&
                !isSelf &&
                (isCallerOwner ||
                  (canInviteMembers &&
                    myRole !== 'DEVELOPER' &&
                    myRole !== 'VIEWER' &&
                    myRole !== 'EDITOR' &&
                    member.role !== 'ADMIN'));

              // Owner can kick any other member; Admins can kick non-owners and non-admins
              const canKickThisMember =
                !isMemberOwner &&
                !isSelf &&
                (isCallerOwner ||
                  (canRemoveMembers &&
                    myRole !== 'DEVELOPER' &&
                    myRole !== 'VIEWER' &&
                    myRole !== 'EDITOR' &&
                    member.role !== 'ADMIN'));

              // Non-owner member can leave the workspace
              const canLeaveThisWorkspace = isSelf && !isMemberOwner && !isCallerOwner;

              return (
                <div key={member.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      fallback={member.user?.name?.slice(0, 2).toUpperCase() || 'US'}
                      size="sm"
                      status={isPending ? 'away' : 'online'}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                          {member.user?.name || 'Member'}
                        </p>
                        {isSelf && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#1E2337] text-slate-500">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{member.user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {/* Status Badge */}
                    {isPending ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-semibold shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
                        Pending Invite
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    )}

                    {/* Role Badge */}
                    <RoleBadge role={member.role} showIcon />

                    {/* Edit Role Action (Owner / Admin) */}
                    {canEditThisMemberRole && onUpdateMemberRole && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setMemberToEditRole(member)}
                        className="text-slate-400 hover:text-[#635BFF] hover:bg-[#635BFF]/10 p-1.5 rounded-lg transition-colors"
                        aria-label={`Edit role for ${member.user?.name || 'member'}`}
                        title="Edit member role & permissions"
                      >
                        <Shield className="h-4 w-4" />
                      </Button>
                    )}

                    {/* Non-Owner Member Self Leave Action */}
                    {canLeaveThisWorkspace && onLeaveWorkspace && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setIsLeaveModalOpen(true)}
                        className=" text-red-500 hover:text-red-600 hover:bg-amber-500/10 px-2.5 py-1 h-auto text-xs font-semibold gap-1.5 rounded-lg border border-amber-500/20 transition-colors"
                        title="Leave this workspace"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                      </Button>
                    )}

                    {/* Workspace Owner / Admin Kick Action */}
                    {canKickThisMember && onRemoveMember && (
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => setMemberToKick(member)}
                        className="text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors"
                        aria-label={`Kick ${member.user?.name || 'member'}`}
                        title="Kick member from workspace"
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Edit Member Role Dialog */}
      {memberToEditRole && onUpdateMemberRole && (
        <EditMemberRoleDialog
          isOpen={Boolean(memberToEditRole)}
          onClose={() => setMemberToEditRole(null)}
          member={memberToEditRole}
          workspaceName={wsName}
          onConfirm={onUpdateMemberRole}
        />
      )}

      {/* Kick Member Confirmation Dialog */}
      {memberToKick && onRemoveMember && (
        <KickMemberDialog
          isOpen={Boolean(memberToKick)}
          onClose={() => setMemberToKick(null)}
          member={memberToKick}
          workspaceName={wsName}
          onConfirm={onRemoveMember}
        />
      )}

      {/* Leave Workspace Confirmation Dialog */}
      {workspace && onLeaveWorkspace && (
        <LeaveWorkspaceDialog
          isOpen={isLeaveModalOpen}
          onClose={() => setIsLeaveModalOpen(false)}
          workspace={workspace}
          onConfirm={onLeaveWorkspace}
        />
      )}
    </>
  );
};
