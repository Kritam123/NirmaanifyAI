'use client';

import React from 'react';
import { useWorkspaceModal } from '../../context/workspace-modal-context';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';

interface CreateWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Legacy wrapper: Delegates directly to the centralized CreateWorkspaceModal
 */
export const CreateWorkspaceDialog: React.FC<CreateWorkspaceDialogProps> = () => {
  return null; // Managed globally by WorkspaceModalProvider in DashboardShell
};
