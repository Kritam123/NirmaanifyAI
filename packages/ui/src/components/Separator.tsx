import React from 'react';
import { cn } from '../utils/cn';

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
}

export const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  label,
  className,
  ...props
}) => {
  if (label && orientation === 'horizontal') {
    return (
      <div className={cn('flex items-center gap-3 my-4', className)} {...props}>
        <div className="flex-1 h-[1px] bg-slate-200 dark:bg-[#24293D]" />
        <span className="text-xs uppercase font-medium tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <div className="flex-1 h-[1px] bg-slate-200 dark:bg-[#24293D]" />
      </div>
    );
  }

  return (
    <div
      role="separator"
      className={cn(
        'shrink-0 bg-slate-200 dark:bg-[#24293D]',
        orientation === 'horizontal' ? 'h-[1px] w-full my-4' : 'h-full w-[1px] mx-4',
        className
      )}
      {...props}
    />
  );
};
