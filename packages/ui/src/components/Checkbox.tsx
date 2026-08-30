'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../utils/cn';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, checked, defaultChecked, id, disabled, onChange, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;
    const [isChecked, setIsChecked] = React.useState<boolean>(Boolean(checked ?? defaultChecked ?? false));

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(Boolean(checked));
      }
    }, [checked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (checked === undefined) {
        setIsChecked(e.target.checked);
      }
      onChange?.(e);
    };

    return (
      <div className="flex items-start gap-2.5">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            id={checkboxId}
            type="checkbox"
            ref={ref}
            checked={checked}
            defaultChecked={defaultChecked}
            disabled={disabled}
            onChange={handleChange}
            className="peer h-4 w-4 shrink-0 cursor-pointer appearance-none rounded border border-slate-300 dark:border-[#24293D] bg-white dark:bg-[#0F111A] checked:bg-[#635BFF] checked:border-[#635BFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#635BFF] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
            {...props}
          />
          <Check className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
        {(label || description) && (
          <div className="space-y-0.5">
            {label && (
              <label htmlFor={checkboxId} className="cursor-pointer text-sm font-medium text-slate-800 dark:text-slate-200">
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';
