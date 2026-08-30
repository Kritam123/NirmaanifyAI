'use client';

import React from 'react';
import { Bell, Search, Moon, Sun } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider';
import { IconButton } from '../components/Button';
import { Badge } from '../components/Badge';
import { Avatar } from '../components/Avatar';
import { cn } from '../utils/cn';

export interface TopbarProps {
  title?: string;
  contextBadge?: 'platform' | 'project';
  breadcrumbs?: string[];
  user?: { name: string; email: string; avatarUrl?: string };
  className?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  title,
  contextBadge = 'platform',
  breadcrumbs = [],
  user = { name: 'Alex Developer', email: 'alex@nirmaanify.ai' },
  className,
}) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className={cn('h-16 border-b border-slate-200 dark:border-[#24293D] bg-white/80 dark:bg-[#0F111A]/80 backdrop-blur-md px-6 flex items-center justify-between select-none shrink-0', className)}>
      <div className="flex items-center gap-3">
        {breadcrumbs.length > 0 ? (
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb}>
                <span className={idx === breadcrumbs.length - 1 ? 'font-semibold text-slate-900 dark:text-white' : ''}>
                  {crumb}
                </span>
                {idx < breadcrumbs.length - 1 && <span>/</span>}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <h1 className="text-base font-semibold">{title}</h1>
        )}

        <Badge variant={contextBadge === 'platform' ? 'indigo' : 'cyan'} size="sm">
          {contextBadge === 'platform' ? 'Nirmaanify Platform' : 'User Project'}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#24293D] text-xs text-slate-400 bg-slate-50 dark:bg-[#141724] hover:border-slate-300 dark:hover:border-slate-600 transition-colors w-52">
          <Search className="h-3.5 w-3.5" />
          <span>Quick search (Cmd+K)</span>
        </button>

        <IconButton
          icon={<Bell className="h-4 w-4" />}
          variant="ghost"
          aria-label="Notifications"
        />

        <IconButton
          icon={theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          variant="ghost"
          aria-label="Toggle theme"
          onClick={toggleTheme}
        />

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-[#24293D]" />

        <div className="flex items-center gap-2.5">
          <Avatar fallback="AD" size="sm" status="online" />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold leading-tight">{user.name}</p>
            <p className="text-[11px] text-slate-400">{user.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
