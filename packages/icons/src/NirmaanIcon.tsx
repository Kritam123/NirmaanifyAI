import React from 'react';

export interface NirmaanIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  variant?: 'gradient' | 'solid' | 'white' | 'dark';
}

export const NirmaanIcon: React.FC<NirmaanIconProps> = ({
  size = 32,
  variant = 'gradient',
  className = '',
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="nirmaan-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#635BFF" />
          <stop offset="60%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        <linearGradient id="nirmaan-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#635BFF" />
        </linearGradient>
      </defs>

      <path
        d="M8 10C8 7.79086 9.79086 6 12 6H16C18.2091 6 20 7.79086 20 10V38C20 40.2091 18.2091 42 16 42H12C9.79086 42 8 40.2091 8 38V10Z"
        fill={variant === 'gradient' ? 'url(#nirmaan-grad-1)' : variant === 'white' ? '#FFFFFF' : '#635BFF'}
      />
      <path
        d="M17.5 12.5C18.8 11.2 21 11.5 22.2 13.1L30.5 24.5C31.8 26.2 31.8 28.5 30.5 30.2L26.5 35.5C25.2 37.2 22.7 37.5 21 36.2L16.5 32.7L25 21L17.5 12.5Z"
        fill={variant === 'gradient' ? 'url(#nirmaan-grad-2)' : variant === 'white' ? '#FFFFFF' : '#8B5CF6'}
        opacity={variant === 'gradient' ? 0.92 : 1}
      />
      <path
        d="M28 10C28 7.79086 29.7909 6 32 6H36C38.2091 6 40 7.79086 40 10V38C40 40.2091 38.2091 42 36 42H32C29.7909 42 28 40.2091 28 38V10Z"
        fill={variant === 'gradient' ? 'url(#nirmaan-grad-1)' : variant === 'white' ? '#FFFFFF' : '#635BFF'}
      />
      <circle
        cx="34"
        cy="12"
        r="3"
        fill={variant === 'gradient' ? '#22D3EE' : variant === 'white' ? '#FFFFFF' : '#22D3EE'}
      />
    </svg>
  );
};
