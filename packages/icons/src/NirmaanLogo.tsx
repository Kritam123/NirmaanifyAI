import React from 'react';
import { NirmaanIcon } from './NirmaanIcon';

export interface NirmaanLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'light' | 'dark';
  showTagline?: boolean;
}

export const NirmaanLogo: React.FC<NirmaanLogoProps> = ({
  size = 'md',
  variant = 'default',
  showTagline = false,
  className = '',
  ...props
}) => {
  const iconSizes = { sm: 24, md: 32, lg: 42 };
  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };
  const taglineSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  const isLight = variant === 'light';

  return (
    <div className={`inline-flex items-center gap-3 ${className}`} {...props}>
      <NirmaanIcon
        size={iconSizes[size]}
        variant={isLight ? 'white' : 'gradient'}
      />
      <div className="flex flex-col">
        <div className={`font-bold tracking-tight leading-none ${textSizes[size]} ${isLight ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
          <span>Nirmaanify</span>
          <span className={`ml-1 ${isLight ? 'text-[#22D3EE]' : 'text-[#635BFF] dark:text-[#A5AEFD]'}`}>AI</span>
        </div>
        {showTagline && (
          <span className={`font-medium tracking-wide uppercase mt-1 ${taglineSizes[size]} text-slate-500 dark:text-slate-400`}>
            Imagine. Build. Launch.
          </span>
        )}
      </div>
    </div>
  );
};
