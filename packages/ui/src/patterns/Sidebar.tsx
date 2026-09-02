import React from 'react';
import { NirmaanLogo, NirmaanIcon } from '@nirmaanify/icons';
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
  isCollapsed?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  isCollapsed = false,
  footer,
  className,
}) => {
  return (
    <aside
      className={cn(
        'shrink-0 border-r border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0F111A] flex flex-col h-screen select-none transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      <div
        className={cn(
          'h-16 flex items-center border-b border-slate-200 dark:border-[#24293D]',
          isCollapsed ? 'justify-center px-2' : 'justify-between px-6'
        )}
      >
        {isCollapsed ? <NirmaanIcon size={28} /> : <NirmaanLogo size="sm" />}
      </div>

      <nav className={cn('flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden', isCollapsed ? 'px-2 py-4' : 'px-3 py-4')}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            title={isCollapsed ? item.label : undefined}
            className={cn(
              'w-full flex items-center rounded-lg text-xs font-semibold transition-all group relative',
              isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2',
              item.active
                ? 'bg-[#635BFF]/10 text-[#635BFF] dark:text-[#A5AEFD]'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#161926] hover:text-slate-900 dark:hover:text-slate-100'
            )}
          >
            <div className={cn('flex items-center', isCollapsed ? 'justify-center' : 'gap-3')}>
              <span className={cn(item.active ? 'text-[#635BFF]' : 'text-slate-400')}>{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </div>
            {!isCollapsed && item.badge && (
              <span className="px-2 py-0.5 text-[10px] font-bold font-poppins rounded-full bg-[#635BFF]/15 text-[#635BFF] dark:text-[#A5AEFD]">
                {item.badge}
              </span>
            )}
            {isCollapsed && item.badge && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#635BFF] animate-pulse" />
            )}
          </button>
        ))}
      </nav>

      {footer && (
        <div className={cn('border-t border-slate-200 dark:border-[#24293D]', isCollapsed ? 'p-2' : 'p-3')}>
          {footer}
        </div>
      )}
    </aside>
  );
};
