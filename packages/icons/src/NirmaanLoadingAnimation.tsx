import React from 'react';

export interface NirmaanLoadingAnimationProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  speed?: 'normal' | 'slow' | 'fast';
  showRings?: boolean;
  showSparks?: boolean;
}

export const NirmaanLoadingAnimation: React.FC<NirmaanLoadingAnimationProps> = ({
  size = 64,
  speed = 'normal',
  showRings = true,
  showSparks = true,
  className = '',
  ...props
}) => {
  const durationMap = {
    slow: { ring: '10s', pulse: '3s', shimmer: '4s' },
    normal: { ring: '7s', pulse: '2s', shimmer: '2.5s' },
    fast: { ring: '4s', pulse: '1.2s', shimmer: '1.5s' },
  };

  const dur = durationMap[speed] || durationMap.normal;

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center select-none ${className}`}
    >
      {/* Radiant atmospheric background glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#635BFF]/30 via-[#8B5CF6]/20 to-[#22D3EE]/25 blur-xl animate-pulse pointer-events-none" />

      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
        aria-hidden="true"
        {...props}
      >
        <defs>
          {/* Base Nirmaan Brand Gradients */}
          <linearGradient id="nirmaan-anim-grad-pillar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#635BFF" />
            <stop offset="60%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>

          <linearGradient id="nirmaan-anim-grad-beam" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#635BFF" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>

          {/* Cyan Glow Filter */}
          <filter id="nirmaan-spark-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <style>
            {`
              @keyframes nirmaan-spin-cw {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes nirmaan-spin-ccw {
                from { transform: rotate(360deg); }
                to { transform: rotate(0deg); }
              }
              @keyframes nirmaan-spark-ripple {
                0% { r: 3px; opacity: 0.9; stroke-width: 1.5px; }
                50% { opacity: 0.5; }
                100% { r: 9px; opacity: 0; stroke-width: 0.5px; }
              }
              @keyframes nirmaan-spark-beacon {
                0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px #22D3EE); }
                50% { transform: scale(1.25); filter: drop-shadow(0 0 10px #22D3EE); }
              }
              @keyframes nirmaan-pillar-pulse {
                0%, 100% { opacity: 0.92; }
                50% { opacity: 1; }
              }
              @keyframes nirmaan-crosshair-fade {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.85; }
              }
            `}
          </style>
        </defs>

        {/* Outer Blueprint Architectural Calibration Rings */}
        {showRings && (
          <>
            {/* Outer dashed blueprint circle (Clockwise) */}
            <circle
              cx="32"
              cy="32"
              r="29"
              stroke="#635BFF"
              strokeWidth="0.85"
              strokeDasharray="4 8"
              strokeOpacity="0.4"
              style={{
                transformOrigin: '32px 32px',
                animation: `nirmaan-spin-cw ${dur.ring} linear infinite`,
              }}
            />

            {/* Inner dashed blueprint circle (Counter-Clockwise) */}
            <circle
              cx="32"
              cy="32"
              r="25.5"
              stroke="#22D3EE"
              strokeWidth="0.75"
              strokeDasharray="6 14"
              strokeOpacity="0.3"
              style={{
                transformOrigin: '32px 32px',
                animation: `nirmaan-spin-ccw ${dur.ring} linear infinite`,
              }}
            />

            {/* Corner Drafting / Blueprint Crosshairs */}
            <g
              stroke="#8B5CF6"
              strokeWidth="1"
              strokeLinecap="round"
              style={{ animation: `nirmaan-crosshair-fade ${dur.pulse} ease-in-out infinite` }}
            >
              {/* Top-Left */}
              <line x1="5" y1="8" x2="11" y2="8" />
              <line x1="8" y1="5" x2="8" y2="11" />
              {/* Top-Right */}
              <line x1="53" y1="8" x2="59" y2="8" />
              <line x1="56" y1="5" x2="56" y2="11" />
              {/* Bottom-Left */}
              <line x1="5" y1="56" x2="11" y2="56" />
              <line x1="8" y1="53" x2="8" y2="59" />
              {/* Bottom-Right */}
              <line x1="53" y1="56" x2="59" y2="56" />
              <line x1="56" y1="53" x2="56" y2="59" />
            </g>
          </>
        )}

        {/* Core Nirmaan Emblem (Transformed to center at 32, 32) */}
        <g transform="translate(8, 8)">
          {/* Pillar 1: Left Vertical Column (Foundation) */}
          <path
            d="M8 10C8 7.79086 9.79086 6 12 6H16C18.2091 6 20 7.79086 20 10V38C20 40.2091 18.2091 42 16 42H12C9.79086 42 8 40.2091 8 38V10Z"
            fill="url(#nirmaan-anim-grad-pillar)"
            style={{
              animation: `nirmaan-pillar-pulse ${dur.pulse} ease-in-out infinite`,
            }}
          />

          {/* Diagonal Crossbeam: AI Architectural Connection */}
          <path
            d="M17.5 12.5C18.8 11.2 21 11.5 22.2 13.1L30.5 24.5C31.8 26.2 31.8 28.5 30.5 30.2L26.5 35.5C25.2 37.2 22.7 37.5 21 36.2L16.5 32.7L25 21L17.5 12.5Z"
            fill="url(#nirmaan-anim-grad-beam)"
            opacity="0.95"
            style={{
              animation: `nirmaan-pillar-pulse ${dur.pulse} ease-in-out infinite 0.3s`,
            }}
          />

          {/* Pillar 2: Right Vertical Column (Structure) */}
          <path
            d="M28 10C28 7.79086 29.7909 6 32 6H36C38.2091 6 40 7.79086 40 10V38C40 40.2091 38.2091 42 36 42H32C29.7909 42 28 40.2091 28 38V10Z"
            fill="url(#nirmaan-anim-grad-pillar)"
            style={{
              animation: `nirmaan-pillar-pulse ${dur.pulse} ease-in-out infinite 0.6s`,
            }}
          />

          {/* AI Spark Beacon & Expanding Quantum Energy Ripples */}
          {showSparks && (
            <g>
              {/* Primary Expanding Ripple Ring 1 */}
              <circle
                cx="34"
                cy="12"
                r="3"
                fill="none"
                stroke="#22D3EE"
                style={{
                  animation: `nirmaan-spark-ripple ${dur.pulse} cubic-bezier(0.2, 0.8, 0.2, 1) infinite`,
                }}
              />

              {/* Secondary Delayed Ripple Ring 2 */}
              <circle
                cx="34"
                cy="12"
                r="3"
                fill="none"
                stroke="#8B5CF6"
                style={{
                  animation: `nirmaan-spark-ripple ${dur.pulse} cubic-bezier(0.2, 0.8, 0.2, 1) infinite 0.75s`,
                }}
              />

              {/* Central Glowing AI Spark Node */}
              <circle
                cx="34"
                cy="12"
                r="3.2"
                fill="#22D3EE"
                filter="url(#nirmaan-spark-glow)"
                style={{
                  transformOrigin: '34px 12px',
                  animation: `nirmaan-spark-beacon ${dur.pulse} ease-in-out infinite`,
                }}
              />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
