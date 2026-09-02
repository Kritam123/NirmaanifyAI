'use client';

import React from 'react';
import { Input, Badge } from '@nirmaanify/ui';
import { Search, Archive, ArchiveRestore, Layers } from 'lucide-react';
import type { ArchiveFilter } from '../../hooks/use-projects';

interface ProjectFiltersProps {
  filterType: string;
  onFilterChange: (type: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  archiveFilter: ArchiveFilter;
  onArchiveFilterChange: (filter: ArchiveFilter) => void;
  activeCount: number;
  archivedCount: number;
}

const TYPES = [
  { id: 'ALL', label: 'All projects' },
  { id: 'SAAS', label: 'SaaS' },
  { id: 'ECOMMERCE', label: 'E-commerce' },
  { id: 'BLOG', label: 'Blog & docs' },
  { id: 'DASHBOARD', label: 'Dashboard' },
  { id: 'PORTFOLIO', label: 'Portfolio' },
  { id: 'WEBSITE', label: 'Marketing' },
  { id: 'CUSTOM', label: 'Custom' },
];

export const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  filterType,
  onFilterChange,
  searchQuery,
  onSearchChange,
  archiveFilter,
  onArchiveFilterChange,
  activeCount,
  archivedCount,
}) => {
  return (
    <div className="space-y-3">
      {/* Type pills */}
      <div className="overflow-x-auto">
        <div className="flex items-center gap-2 min-w-fit">
          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] font-semibold text-slate-400 pr-1">
            <Layers className="h-3 w-3" /> Type
          </span>
          {TYPES.map((t) => {
            const isActive = filterType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onFilterChange(t.id)}
                className={
                  'inline-flex items-center px-2.5 h-7 rounded-full text-xs font-medium border transition-colors ' +
                  (isActive
                    ? 'border-[#635BFF] bg-[#635BFF] text-white'
                    : 'border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0F111A] text-slate-600 dark:text-slate-300 hover:border-[#635BFF]/40 hover:text-[#635BFF] dark:hover:text-[#A5AEFD]')
                }
                aria-pressed={isActive}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Archive + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Project status"
          className="inline-flex p-0.5 rounded-lg border border-slate-200 dark:border-[#24293D] bg-slate-50 dark:bg-[#141724] text-xs"
        >
          {(
            [
              { id: 'all' as const, label: 'All', count: activeCount + archivedCount },
              {
                id: 'active' as const,
                label: 'Active',
                count: activeCount,
                icon: <ArchiveRestore className="h-3 w-3" />,
              },
              {
                id: 'archived' as const,
                label: 'Archived',
                count: archivedCount,
                icon: <Archive className="h-3 w-3" />,
              },
            ] as const
          ).map((opt) => {
            const isActive = archiveFilter === opt.id;
            return (
              <button
                key={opt.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => onArchiveFilterChange(opt.id)}
                className={
                  'inline-flex items-center gap-1.5 px-3 h-7 rounded-md font-medium transition-colors ' +
                  (isActive
                    ? 'bg-white dark:bg-[#1E2337] text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200')
                }
              >
                {'icon' in opt ? opt.icon : null}
                {opt.label}
                <Badge
                  variant={isActive ? 'indigo' : 'secondary'}
                  size="sm"
                  className="ml-0.5"
                >
                  {opt.count}
                </Badge>
              </button>
            );
          })}
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Filter by name or slug..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            startIcon={<Search className="h-4 w-4 text-slate-400" />}
            className="h-9 text-xs"
          />
        </div>
      </div>
    </div>
  );
};
