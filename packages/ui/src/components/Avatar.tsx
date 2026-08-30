'use client';

import React from 'react';
import { cn } from '../utils/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy' | 'away';
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  fallback = 'NA',
  size = 'md',
  status,
  className,
  ...props
}) => {
  const [imageError, setImageError] = React.useState(!src);

  const sizeClasses = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  };

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-400',
    busy: 'bg-rose-500',
    away: 'bg-amber-500',
  };

  return (
    <div className={cn('relative inline-flex shrink-0', className)} {...props}>
      <div
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full font-semibold items-center justify-center bg-slate-200 dark:bg-[#1E2337] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-[#24293D]',
          sizeClasses[size]
        )}
      >
        {!imageError && src ? (
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className="aspect-square h-full w-full object-cover"
          />
        ) : (
          <span>{fallback}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-[#090A0F]',
            size === 'xs' ? 'h-1.5 w-1.5' : 'h-2.5 w-2.5',
            statusColors[status]
          )}
        />
      )}
    </div>
  );
};
