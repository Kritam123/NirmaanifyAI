'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, Button, Badge, Avatar } from '@nirmaanify/ui';
import { UserRole, WorkspaceMemberDto } from '@nirmaanify/types';
import { Shield, Code, Edit3, Eye, Check, ShieldAlert } from 'lucide-react';

interface EditMemberRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  member: WorkspaceMemberDto | null;
  workspaceName?: string;
  onConfirm: (userId: string, newRole: UserRole) => Promise<void>;
}

export const EditMemberRoleDialog: React.FC<EditMemberRoleDialogProps> = ({
  isOpen,
  onClose,
  member,
  workspaceName,
  onConfirm,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('DEVELOPER');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (member) {
      setSelectedRole(member.role);
    }
  }, [member]);

  if (!member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member.userId || selectedRole === member.role) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(member.userId, selectedRole);
      onClose();
    } catch {
      // Toast notification is managed by the caller hook
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions: { role: UserRole; title: string; desc: string; icon: React.ReactNode; color: string }[] = [
    {
      role: 'ADMIN',
      title: 'Admin',
      desc: 'Full administration: manage team members, workspace settings, and projects.',
      icon: <Shield className="h-4 w-4" />,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    },
    {
      role: 'DEVELOPER',
      title: 'Developer',
      desc: 'Full project access: build, deploy, execute tasks, and manage API keys.',
      icon: <Code className="h-4 w-4" />,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      role: 'EDITOR',
      title: 'Editor',
      desc: 'Collaborative access: edit application schemas, documentation, and design assets.',
      icon: <Edit3 className="h-4 w-4" />,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      role: 'VIEWER',
      title: 'Viewer',
      desc: 'Read-only access: view project activity, metrics, and deployments.',
      icon: <Eye className="h-4 w-4" />,
      color: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
    },
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Member Role & Permissions"
      description={`Update access permissions for ${member.user?.name || member.user?.email || 'this member'} in "${workspaceName || 'workspace'}".`}
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            isLoading={isLoading}
            onClick={handleSubmit}
            className="font-semibold"
            disabled={selectedRole === member.role}
          >
            Save Role Changes
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2 text-slate-900 dark:text-slate-100">
        {/* Selected Member Profile Preview */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              fallback={member.user?.name?.slice(0, 2).toUpperCase() || 'MB'}
              size="sm"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {member.user?.name || 'Workspace Member'}
              </p>
              <p className="text-xs text-slate-400 truncate">{member.user?.email}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 block mb-0.5">Current Role</span>
            <Badge variant="indigo" size="sm">
              {member.role}
            </Badge>
          </div>
        </div>

        {/* Visual Role Options Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Select New Role
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {roleOptions.map((opt) => {
              const isSelected = selectedRole === opt.role;
              return (
                <button
                  key={opt.role}
                  type="button"
                  onClick={() => setSelectedRole(opt.role)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#635BFF] bg-[#635BFF]/5 dark:bg-[#635BFF]/10 ring-1 ring-[#635BFF] shadow-sm'
                      : 'border-slate-200 dark:border-[#24293D] hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-[#141724]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-lg border ${opt.color}`}>
                        {opt.icon}
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{opt.title}</span>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-[#635BFF]" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight line-clamp-2">
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-amber-500" />
          Role changes apply immediately and affect workspace APIs, repositories, and project deployments.
        </p>
      </form>
    </Dialog>
  );
};
