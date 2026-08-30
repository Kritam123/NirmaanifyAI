import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BFF] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-[#635BFF] text-white shadow-sm hover:bg-[#4D3FF5] shadow-[#635BFF]/20',
        secondary: 'bg-slate-100 dark:bg-[#1E2337] text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-[#282F49]',
        outline: 'border border-slate-300 dark:border-[#24293D] bg-transparent hover:bg-slate-100 dark:hover:bg-[#161926] text-slate-800 dark:text-slate-200',
        ghost: 'hover:bg-slate-100 dark:hover:bg-[#161926] text-slate-700 dark:text-slate-300',
        destructive: 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 shadow-rose-600/20',
        subtle: 'bg-[#635BFF]/10 text-[#635BFF] dark:text-[#A5AEFD] hover:bg-[#635BFF]/20',
        link: 'text-[#635BFF] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs rounded-md gap-1.5',
        sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
        md: 'h-10 px-4 text-sm gap-2',
        lg: 'h-11 px-5 text-base gap-2.5',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!isLoading && leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);
Button.displayName = 'Button';

export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, size = 'icon', ...props }, ref) => {
    return (
      <Button ref={ref} size={size} className={cn('p-0', className)} {...props}>
        {icon}
      </Button>
    );
  }
);
IconButton.displayName = 'IconButton';
