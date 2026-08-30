import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '../components/Button';
import { cn } from '../utils/cn';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  code?: string | number;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this view.',
  code,
  onRetry,
  className,
}) => {
  return (
    <div className={cn('p-8 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-center flex flex-col items-center justify-center', className)}>
      <div className="p-3 bg-rose-100 dark:bg-rose-900/40 rounded-full text-rose-600 dark:text-rose-400 mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h4 className="text-base font-bold text-rose-900 dark:text-rose-200">{title}</h4>
      <p className="text-sm text-rose-700 dark:text-rose-400 max-w-sm mt-1 mb-4">{message}</p>
      {code && (
        <span className="text-[11px] font-mono bg-rose-200/60 dark:bg-rose-900/60 px-2 py-0.5 rounded text-rose-800 dark:text-rose-300 mb-4">
          Error code: {code}
        </span>
      )}
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" leftIcon={<RotateCcw className="h-3.5 w-3.5" />}>
          Try again
        </Button>
      )}
    </div>
  );
};
