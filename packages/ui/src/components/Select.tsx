import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../utils/cn';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, helperText, error, options = [], children, id, disabled, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'flex h-10 w-full appearance-none rounded-lg border border-slate-300 dark:border-[#24293D] bg-white dark:bg-[#0F111A] px-3.5 py-2 pr-10 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BFF] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
              error && 'border-rose-500 focus-visible:ring-rose-500',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-white dark:bg-[#0F111A] text-slate-900 dark:text-white">
                {opt.label}
              </option>
            ))}
            {children}
          </select>
          <ChevronDown className="absolute right-3 top-3 h-4 w-4 pointer-events-none text-slate-400" />
        </div>
        {error ? (
          <p className="text-xs text-rose-500 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = 'Select';
