'use client';

import React from 'react';
import { NavigationSidebar } from './NavigationSidebar';
import { TopNavbar } from './TopNavbar';
import { AuthGuard } from '../auth/AuthGuard';

interface DashboardShellProps {
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  return (
    <AuthGuard>
      <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC] dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 transition-colors duration-200 font-sans">
        {/* Navigation Sidebar */}
        <NavigationSidebar />

        {/* Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Navbar */}
          <TopNavbar />

          {/* Scrollable Page Body */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
            <div className="max-w-7xl mx-auto w-full space-y-8">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
};
