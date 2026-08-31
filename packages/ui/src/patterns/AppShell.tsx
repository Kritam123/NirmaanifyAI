import React from 'react';
import { cn } from '../utils/cn';

export interface AppShellProps {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  sidebar,
  topbar,
  children,
  className,
}) => {
  return (
    <div className={cn('h-screen max-h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 flex', className)}>
      <div className="shrink-0 h-screen sticky top-0">
        {sidebar}
      </div>
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {topbar}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
