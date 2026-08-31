import React from 'react';
import { NirmaanLogo } from '@nirmaanify/icons';
import { cn } from '../utils/cn';

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: string | number;
  active?: boolean;
  onClick?: () => void;
}

export interface SidebarProps {
  items: SidebarNavItem[];
  footer?: React.ReactNode;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, footer, className }) => {
  return (
    <aside className={cn('w-64 shrink-0 border-r border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0F111A] flex flex-col h-screen select-none sticky top-0 overflow-hidden', className)}>
      <div className="h-16 px-6 flex items-center border-b border-slate-200 dark:border-[#24293D] shrink-0">
        <NirmaanLogo size="sm" />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-hidden">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              item.active
                ? 'bg-[#635BFF]/10 text-[#635BFF] dark:text-[#A5AEFD] font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#161926] hover:text-slate-900 dark:hover:text-slate-100'
            )}
          >
            <div className="flex items-center gap-3">
              <span className={cn(item.active ? 'text-[#635BFF]' : 'text-slate-400')}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-[#635BFF]/20 text-[#635BFF] dark:text-[#A5AEFD]">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {footer && (
        <div className="p-4 border-t border-slate-200 dark:border-[#24293D] shrink-0">
          {footer}
        </div>
      )}
    </aside>
  );
};
