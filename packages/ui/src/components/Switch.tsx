import React from 'react';
import { cn } from '../utils/cn';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, checked, defaultChecked, id, disabled, onChange, ...props }, ref) => {
    const generatedId = React.useId();
    const switchId = id || generatedId;

    return (
      <div className="flex items-center justify-between gap-3">
        {(label || description) && (
          <div className="space-y-0.5">
            {label && (
              <label htmlFor={switchId} className="cursor-pointer text-sm font-medium text-slate-800 dark:text-slate-200">
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
            )}
          </div>
        )}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            id={switchId}
            type="checkbox"
            ref={ref}
            checked={checked}
            defaultChecked={defaultChecked}
            disabled={disabled}
            onChange={onChange}
            className="sr-only peer"
            {...props}
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#635BFF] dark:bg-[#1E2337] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#635BFF] disabled:opacity-50 disabled:cursor-not-allowed"></div>
        </label>
      </div>
    );
  }
);
Switch.displayName = 'Switch';
