import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { cn } from '../utils/cn';

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  backAction?: {
    label?: string;
    onClick?: () => void;
    href?: string;
  };
  backButton?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  badge,
  actions,
  backAction,
  backButton,
  className,
}) => {
  return (
    <div className={cn('flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-[#24293D] mb-6', className)}>
      <div className="flex items-start gap-3">
        {backButton ? (
          backButton
        ) : backAction ? (
          backAction.href ? (
            <a href={backAction.href}>
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                {backAction.label || 'Back'}
              </Button>
            </a>
          ) : (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={backAction.onClick}
            >
              {backAction.label || 'Back'}
            </Button>
          )
        ) : null}

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
            {badge}
          </div>
          {description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
};
