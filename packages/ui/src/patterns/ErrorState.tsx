import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '../components/Button';
import { cn } from '../utils/cn';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  code?: string | number;
  onRetry?: () => void;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  actionNode?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this view.',
  code,
  onRetry,
  actionLabel = 'Try again',
  actionIcon = <RotateCcw className="h-3.5 w-3.5" />,
  actionNode,
  compact = false,
  className,
}) => {
  if (compact) {
    return (
      <div className={cn('p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-center flex items-center justify-center gap-3', className)}>
        <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
        <div className="text-xs text-rose-700 dark:text-rose-300 text-left">
          <p className="font-semibold">{title}</p>
          <p className="text-[11px] opacity-80">{message}</p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="xs" leftIcon={actionIcon}>
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('p-8 md:p-12 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-center flex flex-col items-center justify-center', className)}>
      <div className="p-3.5 bg-rose-100 dark:bg-rose-900/40 rounded-2xl text-rose-600 dark:text-rose-400 mb-3.5 ring-1 ring-rose-200 dark:ring-rose-800">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h4 className="text-base font-bold text-rose-900 dark:text-rose-200">{title}</h4>
      <p className="text-xs md:text-sm text-rose-700 dark:text-rose-400 max-w-md mt-1 mb-4 leading-relaxed">{message}</p>
      {code && (
        <span className="text-[11px] font-mono bg-rose-200/60 dark:bg-rose-900/60 px-2.5 py-0.5 rounded-full text-rose-800 dark:text-rose-300 mb-4">
          Error code: {code}
        </span>
      )}
      <div className="flex items-center gap-2.5">
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm" leftIcon={actionIcon}>
            {actionLabel}
          </Button>
        )}
        {actionNode}
      </div>
    </div>
  );
};
