'use client';

import React from 'react';
import { Input } from '@nirmaanify/ui';
import { Search } from 'lucide-react';

interface ProjectFiltersProps {
  filterType: string;
  onFilterChange: (type: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  filterType,
  onFilterChange,
  searchQuery,
  onSearchChange,
}) => {
  const types = [
    { label: 'All Projects', value: 'ALL' },
    { label: 'SaaS', value: 'SAAS' },
    { label: 'E-commerce', value: 'ECOMMERCE' },
    { label: 'Blog & Docs', value: 'BLOG' },
    { label: 'Dashboard', value: 'DASHBOARD' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
        {types.map((t) => (
          <button
            key={t.value}
            onClick={() => onFilterChange(t.value)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === t.value
                ? 'bg-[#635BFF] text-white shadow-sm shadow-[#635BFF]/30'
                : 'bg-white dark:bg-[#161926] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#24293D] hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="w-full sm:w-64">
        <Input
          placeholder="Filter by name or keyword..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          startIcon={<Search className="h-4 w-4 text-slate-400" />}
          className="h-9 text-xs"
        />
      </div>
    </div>
  );
};
