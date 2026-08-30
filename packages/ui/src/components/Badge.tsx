import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-[#635BFF]/15 text-[#635BFF] dark:text-[#A5AEFD] border border-[#635BFF]/30',
        secondary: 'bg-slate-100 dark:bg-[#1E2337] text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-[#24293D]',
        success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
        warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
        destructive: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30',
        outline: 'border border-slate-300 dark:border-[#24293D] text-slate-700 dark:text-slate-300',
        indigo: 'bg-[#635BFF] text-white',
        violet: 'bg-[#8B5CF6]/15 text-[#8B5CF6] dark:text-[#C4B5FD] border border-[#8B5CF6]/30',
        cyan: 'bg-[#22D3EE]/15 text-cyan-700 dark:text-[#67E8F9] border border-[#22D3EE]/30',
      },
      size: {
        sm: 'px-2 py-0.2 text-[11px]',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ className, variant, size, dot, children, ...props }) => {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </div>
  );
};
