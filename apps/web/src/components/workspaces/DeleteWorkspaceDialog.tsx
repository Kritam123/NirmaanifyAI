'use client';

import React, { useState } from 'react';
import {
  Dialog,
  Button,
  Input,
  useToast,
} from '@nirmaanify/ui';
import { AlertTriangle, Trash2, FolderDot } from 'lucide-react';
import { WorkspaceDto } from '@nirmaanify/types';
import { useWorkspaces } from '../../hooks/use-workspaces';

interface DeleteWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: WorkspaceDto | null;
  onSuccess?: () => void;
}

export const DeleteWorkspaceDialog: React.FC<DeleteWorkspaceDialogProps> = ({
  isOpen,
  onClose,
  workspace,
  onSuccess,
}) => {
  const { deleteWorkspace } = useWorkspaces();
  const { toast } = useToast();
  const [confirmName, setConfirmName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!workspace) return null;

  const projectCount = workspace.projectCount || 0;
  const isNameMatched = confirmName.trim() === workspace.name.trim();

  const handleDelete = async () => {
    if (!isNameMatched) return;

    setIsDeleting(true);
    try {
      await deleteWorkspace(workspace.id);
      setConfirmName('');
      onClose();
      onSuccess?.();
    } catch (err: any) {
      toast({
        title: 'Deletion Failed',
        description: err?.message || 'Could not delete workspace. Please try again.',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Workspace"
      description="Permanent removal of workspace and associated cloud resources."
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={!isNameMatched || isDeleting}
            isLoading={isDeleting}
            onClick={handleDelete}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Delete Workspace & Cascade Projects
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        {/* Warning Banner */}
        <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>Destructive Action Warning</span>
          </div>
          <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
            Deleting <strong className="font-bold">"{workspace.name}"</strong> will permanently destroy:
          </p>
          <ul className="text-xs list-disc list-inside space-y-1 text-rose-700/90 dark:text-rose-300/90">
            <li className="font-semibold">
              All {projectCount} project(s) and their full-stack scaffolds
            </li>
            <li>All team collaborator roles and member rosters</li>
            <li>All workspace environment variables and settings</li>
          </ul>
        </div>

        {/* Name Confirmation Input */}
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Please type <span className="font-mono font-bold text-rose-500">"{workspace.name}"</span> to confirm:
          </label>
          <Input
            placeholder={workspace.name}
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            disabled={isDeleting}
            className="font-mono text-xs"
            autoFocus
          />
        </div>
      </div>
    </Dialog>
  );
};
