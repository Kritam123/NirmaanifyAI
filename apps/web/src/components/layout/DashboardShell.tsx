'use client';

import React, { useEffect, useState } from 'react';
import { NavigationSidebar } from './NavigationSidebar';
import { TopNavbar } from './TopNavbar';
import { AuthGuard } from '../auth/AuthGuard';
import { useAuth } from '../../context/auth-context';
import { WorkspaceModalProvider, useWorkspaceModal } from '../../context/workspace-modal-context';
import { CreateWorkspaceModal } from '../workspaces/CreateWorkspaceModal';
import { Drawer } from '@nirmaanify/ui';

interface DashboardShellProps {
  children: React.ReactNode;
}

const FirstWorkspaceTrigger: React.FC = () => {
  const { workspaces, activeWorkspace, isLoading, isAuthenticated } = useAuth();
  const { openCreateWorkspaceModal, isOpen } = useWorkspaceModal();

  useEffect(() => {
    const hasNoWorkspace = Boolean(
      isAuthenticated && !isLoading && (!activeWorkspace || workspaces.length === 0)
    );
    if (hasNoWorkspace && !isOpen) {
      openCreateWorkspaceModal({ isFirstTime: true });
    }
  }, [isAuthenticated, isLoading, activeWorkspace, workspaces.length, isOpen, openCreateWorkspaceModal]);

  return null;
};

export const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Initialize and persist sidebar collapse state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nirmaanify_sidebar_collapsed');
      if (saved !== null) {
        setIsSidebarCollapsed(saved === 'true');
      }
    } catch {}
  }, []);

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileMenuOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('nirmaanify_sidebar_collapsed', String(next));
        } catch {}
        return next;
      });
    }
  };

  // Keyboard shortcut: Ctrl+B or Cmd+B toggles sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AuthGuard>
      <WorkspaceModalProvider>
        <FirstWorkspaceTrigger />
        {/* Centralized Workspace Creation Modal Dialog */}
        <CreateWorkspaceModal />

        <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC] dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans">
          {/* Desktop Navigation Sidebar */}
          <div className="hidden md:block shrink-0">
            <NavigationSidebar isCollapsed={isSidebarCollapsed} />
          </div>

          {/* Mobile Drawer Navigation Sidebar */}
          <Drawer
            isOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            title="Navigation"
            position="left"
            className="w-72 p-0 max-w-[85vw]"
          >
            <NavigationSidebar
              isCollapsed={false}
              onClose={() => setMobileMenuOpen(false)}
              className="h-full border-r-0 w-full"
            />
          </Drawer>

          {/* Content Viewport */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Top Navbar with the single collapse/toggle button */}
            <TopNavbar
              onToggleSidebar={handleToggleSidebar}
              isSidebarCollapsed={isSidebarCollapsed}
            />

            {/* Scrollable Page Body */}
            <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8 space-y-6 md:space-y-8">
              <div className="max-w-7xl mx-auto w-full space-y-6 md:space-y-8">{children}</div>
            </main>
          </div>
        </div>
      </WorkspaceModalProvider>
    </AuthGuard>
  );
};
