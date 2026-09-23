'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, Button, Input, useToast } from '@nirmaanify/ui';
import { AlertTriangle } from 'lucide-react';
import { ProjectDto } from '@nirmaanify/types';
import { useAuth } from '../../context/auth-context';

interface DeleteProjectDialogProps {
  project: ProjectDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteProjectDialog: React.FC<DeleteProjectDialogProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const { deleteProject } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setConfirmText('');
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!project) return null;

  const expected = project.slug;
  const matches = confirmText.trim() === expected;

  const handleConfirm = async () => {
    if (!matches) return;
    setIsLoading(true);
    try {
      await deleteProject(project.id);
      toast({
        title: 'Project deleted',
        description: `"${project.name}" has been permanently removed.`,
        type: 'success',
      });
      onClose();
    } catch (err: any) {
      toast({
        title: 'Delete failed',
        description: err.message || 'Could not delete project',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Delete architecture permanently"
      description="This action is irreversible. All vector diagrams, UML models, cloud stencils, and architecture specifications for this design will be removed."
      className="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={!matches}
          >
            Delete permanently
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-lg border border-rose-500/30 bg-rose-500/5">
          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-600 dark:text-rose-400">
            <p className="font-bold">You are about to delete:</p>
            <p className="mt-0.5 text-rose-700/80 dark:text-rose-400/80">
              <span className="font-mono font-bold">{project.name}</span>
              {' '}— and any associated vector diagrams, AI blueprints, and Eraser architecture specs.
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            To confirm, type the project slug{' '}
            <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] font-mono font-bold text-slate-800 dark:text-slate-200">
              {expected}
            </code>{' '}
            below:
          </p>
          <div className="mt-2">
            <Input
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && matches) handleConfirm();
              }}
              placeholder={expected}
              aria-label="Type project slug to confirm deletion"
              error={
                confirmText.length > 0 && !matches
                  ? 'Slug does not match — check spelling and case'
                  : undefined
              }
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            This is a safety barrier. Deletion cannot be undone.
          </p>
        </div>
      </div>
    </Dialog>
  );
};
