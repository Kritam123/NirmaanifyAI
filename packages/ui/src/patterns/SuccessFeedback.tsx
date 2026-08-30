import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../components/Button';
import { cn } from '../utils/cn';

export interface SuccessFeedbackProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const SuccessFeedback: React.FC<SuccessFeedbackProps> = ({
  title,
  description,
  actionLabel = 'Continue',
  onAction,
  className,
}) => {
  return (
    <div className={cn('p-8 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-center flex flex-col items-center', className)}>
      <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-full text-emerald-600 dark:text-emerald-400 mb-3">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-200">{title}</h3>
      <p className="text-sm text-emerald-800 dark:text-emerald-400 max-w-sm mt-1 mb-5">{description}</p>
      {onAction && (
        <Button onClick={onAction} variant="default">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
