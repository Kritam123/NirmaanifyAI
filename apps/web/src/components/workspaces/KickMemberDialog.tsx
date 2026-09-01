'use client';

import React, { useState } from 'react';
import { Dialog, Button } from '@nirmaanify/ui';
import { UserX, AlertTriangle } from 'lucide-react';
import { WorkspaceMemberDto } from '@nirmaanify/types';

interface KickMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  member: WorkspaceMemberDto | null;
  workspaceName?: string;
  onConfirm: (userId: string) => Promise<void>;
}

export const KickMemberDialog: React.FC<KickMemberDialogProps> = ({
  isOpen,
  onClose,
  member,
  workspaceName,
  onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!member) return null;

  const handleKick = async () => {
    setIsLoading(true);
    try {
      await onConfirm(member.userId);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Kick Member from Workspace"
      description={`Remove access permission for this collaborator.`}
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            isLoading={isLoading}
            onClick={handleKick}
            leftIcon={<UserX className="h-4 w-4" />}
            className="font-bold shadow-md shadow-rose-500/20"
          >
            Kick Member
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-2 text-slate-900 dark:text-slate-100">
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-600 dark:text-rose-400 space-y-1">
            <p className="font-bold">Immediate Access Revocation</p>
            <p className="leading-relaxed">
              Are you sure you want to remove <strong className="text-rose-700 dark:text-rose-300 font-semibold">{member.user?.name || 'this member'}</strong> ({member.user?.email}) from <strong className="text-rose-700 dark:text-rose-300 font-semibold">{workspaceName || 'this workspace'}</strong>?
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          This user will immediately lose access to all projects, storage buckets, and environments within this workspace. You can re-invite them at any time.
        </p>
      </div>
    </Dialog>
  );
};
