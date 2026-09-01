'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Avatar, Badge, IconButton, useTheme } from '@nirmaanify/ui';
import { Search, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { RoleBadge } from '../auth/RoleGate';

export const TopNavbar: React.FC = () => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, activeWorkspace } = useAuth();

  // Derive breadcrumbs based on pathname
  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return ['Platform', 'Dashboard'];
    return [
      'Nirmaanify',
      activeWorkspace?.name || 'Workspace',
      ...segments.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 border-b border-slate-200 dark:border-[#24293D] bg-white/80 dark:bg-[#0F111A]/80 backdrop-blur-md px-6 flex items-center justify-between select-none shrink-0 transition-colors duration-200">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb + idx}>
              <span
                className={
                  idx === breadcrumbs.length - 1
                    ? 'font-bold text-slate-900 dark:text-white'
                    : 'text-slate-400'
                }
              >
                {crumb}
              </span>
              {idx < breadcrumbs.length - 1 && <span className="text-slate-300 dark:text-slate-600">/</span>}
            </React.Fragment>
          ))}
        </div>

        <Badge variant="indigo" size="sm" className="hidden sm:inline-flex">
          Platform Studio
        </Badge>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#24293D] text-xs text-slate-400 bg-slate-50 dark:bg-[#141724] hover:border-slate-300 dark:hover:border-slate-600 transition-colors w-48">
          <Search className="h-3.5 w-3.5" />
          <span>Quick search (Cmd+K)</span>
        </button>

        {/* Theme Toggle */}
        <IconButton
          icon={theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          variant="ghost"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        />

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-[#24293D]" />

        {/* User Avatar & Role */}
        <div className="flex items-center gap-2.5">
          <Avatar fallback={user?.name?.slice(0, 2).toUpperCase() || 'AD'} size="sm" status="online" />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold leading-tight text-slate-900 dark:text-white truncate max-w-[120px]">
              {user?.name || 'Developer'}
            </p>
            <div className="mt-0.5">
              <RoleBadge role={user?.role} size="sm" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
