'use client';

import React, { useState } from 'react';
import { cn } from '../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'underline' | 'pills';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultTab,
  activeTab: controlledActiveTab,
  onChange,
  variant = 'underline',
  className,
}) => {
  const [internalTab, setInternalTab] = useState(defaultTab || items[0]?.id);
  const currentTab = controlledActiveTab !== undefined ? controlledActiveTab : internalTab;

  const handleTabClick = (tabId: string) => {
    if (controlledActiveTab === undefined) {
      setInternalTab(tabId);
    }
    onChange?.(tabId);
  };

  const isPills = variant === 'pills';

  return (
    <div className={cn('w-full space-y-4', className)}>
      <div
        className={cn(
          'flex items-center gap-1.5 overflow-x-auto pb-px',
          !isPills && 'border-b border-slate-200 dark:border-[#24293D]'
        )}
      >
        {items.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                'flex items-center gap-2 text-xs font-semibold whitespace-nowrap transition-all select-none',
                isPills
                  ? cn(
                      'px-3.5 py-1.5 rounded-lg border',
                      isActive
                        ? 'bg-[#635BFF] text-white border-transparent shadow-sm shadow-[#635BFF]/30'
                        : 'bg-white dark:bg-[#161926] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#24293D] hover:text-slate-900 dark:hover:text-slate-100'
                    )
                  : cn(
                      'px-4 py-2.5 text-sm border-b-2 -mb-px',
                      isActive
                        ? 'border-[#635BFF] text-[#635BFF] dark:text-[#A5AEFD] font-bold'
                        : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    )
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      {items.some((t) => t.content) && (
        <div className="pt-2">
          {items.find((tab) => tab.id === currentTab)?.content}
        </div>
      )}
    </div>
  );
};
