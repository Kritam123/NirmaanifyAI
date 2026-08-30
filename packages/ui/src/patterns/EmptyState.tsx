import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from '../components/Button';
import { cn } from '../utils/cn';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <FolderOpen className="h-10 w-10 text-slate-400" />,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-[#24293D] bg-white/40 dark:bg-[#0F111A]/40', className)}>
      <div className="p-4 mb-4 rounded-2xl bg-slate-100 dark:bg-[#1E2337] ring-1 ring-slate-200 dark:ring-slate-800">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="max-w-md text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">{description}</p>
      <div className="flex items-center gap-3">
        {actionLabel && (
          <Button onClick={onAction} variant="default">
            {actionLabel}
          </Button>
        )}
        {secondaryActionLabel && (
          <Button onClick={onSecondaryAction} variant="outline">
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
