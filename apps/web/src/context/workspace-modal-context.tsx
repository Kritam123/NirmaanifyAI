'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { WorkspaceDto } from '@nirmaanify/types';

interface OpenModalOptions {
  isFirstTime?: boolean;
  onSuccess?: (workspace: WorkspaceDto) => void;
}

interface WorkspaceModalContextType {
  isOpen: boolean;
  isFirstTime: boolean;
  openCreateWorkspaceModal: (options?: OpenModalOptions) => void;
  closeCreateWorkspaceModal: () => void;
  handleSuccessCallback: (workspace: WorkspaceDto) => void;
}

const WorkspaceModalContext = createContext<WorkspaceModalContextType | undefined>(undefined);

export function WorkspaceModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [successCallback, setSuccessCallback] = useState<((ws: WorkspaceDto) => void) | null>(null);

  const openCreateWorkspaceModal = useCallback((options?: OpenModalOptions) => {
    setIsFirstTime(Boolean(options?.isFirstTime));
    setSuccessCallback(options?.onSuccess ? () => options.onSuccess : null);
    setIsOpen(true);
  }, []);

  const closeCreateWorkspaceModal = useCallback(() => {
    setIsOpen(false);
    setIsFirstTime(false);
    setSuccessCallback(null);
  }, []);

  const handleSuccessCallback = useCallback((workspace: WorkspaceDto) => {
    if (successCallback) {
      successCallback(workspace);
    }
  }, [successCallback]);

  return (
    <WorkspaceModalContext.Provider
      value={{
        isOpen,
        isFirstTime,
        openCreateWorkspaceModal,
        closeCreateWorkspaceModal,
        handleSuccessCallback,
      }}
    >
      {children}
    </WorkspaceModalContext.Provider>
  );
}

export function useWorkspaceModal() {
  const context = useContext(WorkspaceModalContext);
  if (!context) {
    throw new Error('useWorkspaceModal must be used within a WorkspaceModalProvider');
  }
  return context;
}
