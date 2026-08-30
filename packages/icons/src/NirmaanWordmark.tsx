import React from 'react';

export const NirmaanWordmark: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 260 40" fill="none" xmlns="http://www.w3.org/2000/svg" height={32} {...props}>
    <text
      x="0"
      y="28"
      fontFamily="Inter, sans-serif"
      fontSize="24"
      fontWeight="800"
      letterSpacing="-0.03em"
      className="fill-slate-900 dark:fill-white"
    >
      NIRMAANIFY
    </text>
    <text
      x="180"
      y="28"
      fontFamily="Inter, sans-serif"
      fontSize="24"
      fontWeight="900"
      letterSpacing="0.02em"
      fill="url(#ai-grad)"
    >
      AI
    </text>
    <defs>
      <linearGradient id="ai-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#635BFF" />
        <stop offset="100%" stopColor="#22D3EE" />
      </linearGradient>
    </defs>
  </svg>
);
