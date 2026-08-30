'use client';

import React, { useState } from 'react';
import { cn } from '../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ items, defaultTab, className }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id);

  return (
    <div className={cn('w-full space-y-4', className)}>
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-[#24293D] pb-px">
        {items.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab.id
                ? 'border-[#635BFF] text-[#635BFF] dark:text-[#A5AEFD] font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="pt-2">
        {items.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
};
