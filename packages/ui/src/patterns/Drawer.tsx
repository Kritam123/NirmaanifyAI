import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils/cn';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  position?: 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  position = 'right',
  children,
  className,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          'relative h-full w-96 bg-white dark:bg-[#0F111A] border-slate-200 dark:border-[#24293D] p-6 shadow-2xl z-10 flex flex-col',
          position === 'right' ? 'ml-auto border-l' : 'mr-auto border-r',
          className
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#24293D]">
          <h3 className="text-base font-bold">{title}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">{children}</div>
      </div>
    </div>
  );
};
