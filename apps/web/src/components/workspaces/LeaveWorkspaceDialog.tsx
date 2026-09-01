'use client';

import React, { useState } from 'react';
import { Dialog, Button } from '@nirmaanify/ui';
import { LogOut, AlertTriangle } from 'lucide-react';
import { WorkspaceDto } from '@nirmaanify/types';

interface LeaveWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: WorkspaceDto;
  onConfirm: () => Promise<void>;
}

export const LeaveWorkspaceDialog: React.FC<LeaveWorkspaceDialogProps> = ({
  isOpen,
  onClose,
  workspace,
  onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLeave = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Leave "${workspace.name}"?`}
      description="Relinquish access to this workspace and its projects."
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            isLoading={isLoading}
            onClick={handleLeave}
            leftIcon={<LogOut className="h-4 w-4" />}
            className="font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20"
          >
            Leave Workspace
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-2 text-slate-900 dark:text-slate-100">
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div className="text-xs text-red-600 dark:text-red-400 space-y-1">
            <p className="font-bold">Access Warning</p>
            <p className="leading-relaxed">
              You will immediately lose access to all projects, repositories, and configurations in <strong className="font-semibold text-red-700 dark:text-red-300">{workspace.name}</strong>.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          To regain access in the future, a workspace Owner or Admin will need to send a new invitation to your email.
        </p>
      </div>
    </Dialog>
  );
};
