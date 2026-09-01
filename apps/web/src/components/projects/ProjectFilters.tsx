'use client';

import React from 'react';
import { Input, Tabs } from '@nirmaanify/ui';
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
    { id: 'ALL', label: 'All Projects' },
    { id: 'SAAS', label: 'SaaS' },
    { id: 'ECOMMERCE', label: 'E-commerce' },
    { id: 'BLOG', label: 'Blog & Docs' },
    { id: 'DASHBOARD', label: 'Dashboard' },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Category Pills using Tabs Pattern */}
      <div className="overflow-x-auto w-full sm:w-auto">
        <Tabs
          items={types}
          activeTab={filterType}
          onChange={onFilterChange}
          variant="pills"
          className="space-y-0"
        />
      </div>

      {/* Search Input */}
      <div className="w-full sm:w-72">
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
