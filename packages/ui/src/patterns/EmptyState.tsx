import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from '../components/Button';
import { cn } from '../utils/cn';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  secondaryActionIcon?: React.ReactNode;
  actionNode?: React.ReactNode;
  compact?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <FolderOpen className="h-8 w-8 text-slate-400" />,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  secondaryActionLabel,
  onSecondaryAction,
  secondaryActionIcon,
  actionNode,
  compact = false,
  className,
  children,
}) => {
  if (compact) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-[#24293D] bg-slate-50/50 dark:bg-[#0F111A]/50 space-y-2',
          className
        )}
      >
        <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#1E2337] text-slate-400">
          {icon}
        </div>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{title}</p>
        {description && <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>}
        {actionLabel && (
          <Button onClick={onAction} variant="subtle" size="xs" leftIcon={actionIcon}>
            {actionLabel}
          </Button>
        )}
        {actionNode}
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-10 md:p-14 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-[#24293D] bg-white/40 dark:bg-[#0F111A]/40',
        className
      )}
    >
      <div className="p-4 mb-3.5 rounded-2xl bg-slate-100 dark:bg-[#1E2337] ring-1 ring-slate-200/80 dark:ring-slate-800 shadow-sm text-slate-400">
        {icon}
      </div>
      <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      {description && (
        <p className="max-w-md text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5 leading-relaxed">
          {description}
        </p>
      )}
      {(actionLabel || secondaryActionLabel || actionNode) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actionLabel && (
            <Button onClick={onAction} variant="default" size="sm" leftIcon={actionIcon}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button onClick={onSecondaryAction} variant="outline" size="sm" leftIcon={secondaryActionIcon}>
              {secondaryActionLabel}
            </Button>
          )}
          {actionNode}
        </div>
      )}
      {children}
    </div>
  );
};
