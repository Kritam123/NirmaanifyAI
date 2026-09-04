
"use client";
import React, { useEffect, useState } from 'react';
import { NirmaanLoadingAnimation } from '@nirmaanify/icons';
import { cn } from '../utils/cn';

export interface LoadingStateProps {
  /**
   * Custom message to display. If omitted, cycles through Nirmaanify architectural stages.
   */
  message?: string;
  /**
   * Full-screen overlay with atmospheric backdrop and blueprint grid.
   */
  fullScreen?: boolean;
  /**
   * Component sizing variant.
   * - 'sm': compact for drawers, small cards, modals
   * - 'md': standard for page sections and tabs
   * - 'lg': prominent for hero views and global transitions
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether to show the quantum progress bar.
   */
  showProgress?: boolean;
  /**
   * Whether to display the "Imagine. Build. Launch." brand tagline.
   */
  showTagline?: boolean;
  /**
   * Speed of the internal animations.
   */
  speed?: 'normal' | 'slow' | 'fast';
  className?: string;
}

const DEFAULT_STAGES = [
  'Architecting workspace blueprints...',
  'Synthesizing AI layout engine...',
  'Compiling component registry...',
  'Synchronizing full-stack runtime...',
];

export const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  fullScreen = false,
  size = 'md',
  showProgress = true,
  showTagline = true,
  speed = 'normal',
  className,
}) => {
  const [stageIndex, setStageIndex] = useState(0);

  // If no custom message is provided, cycle through Nirmaanify brand stages
  useEffect(() => {
    if (message) return;
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % DEFAULT_STAGES.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [message]);

  const activeMessage = message || DEFAULT_STAGES[stageIndex];

  const iconSizes = {
    sm: 44,
    md: 64,
    lg: 84,
  };

  const content = (
    <div className="flex flex-col items-center text-center select-none w-full max-w-xs">
      {/* Branded Nirmaan Architectural Animation */}
      <div className="relative mb-4">
        <NirmaanLoadingAnimation
          size={iconSizes[size]}
          speed={speed}
          showRings={size !== 'sm'}
          showSparks={true}
        />
      </div>

      {/* Brand Wordmark with glowing AI pill */}
      <div className="inline-flex items-center gap-1.5 font-bold tracking-tight text-slate-900 dark:text-white mb-2">
        <span className={size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'}>
          Nirmaanify
        </span>
        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md font-semibold bg-gradient-to-r from-[#635BFF] to-[#22D3EE] text-white shadow-sm shadow-[#635BFF]/30 tracking-wider">
          AI
        </span>
      </div>

      {/* Active Stage / Loading Telemetry */}
      <div className="h-5 flex items-center justify-center gap-2 mb-3 px-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#22D3EE] animate-ping" />
        <p
          key={activeMessage}
          className="text-xs font-medium text-slate-600 dark:text-slate-300 transition-all duration-300 truncate max-w-[260px]"
        >
          {activeMessage}
        </p>
      </div>

      {/* Quantum Linear Progress Rail */}
      {showProgress && (
        <div className="w-full h-1 bg-slate-200/70 dark:bg-[#1E2337] rounded-full overflow-hidden relative mb-3">
          <div
            className="absolute inset-y-0 w-1/2 rounded-full bg-gradient-to-r from-[#635BFF] via-[#8B5CF6] to-[#22D3EE] shadow-[0_0_12px_rgba(34,211,238,0.75)]"
            style={{
              animation: 'nirmaan-rail 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            }}
          />
        </div>
      )}

      {/* Tagline */}
      {showTagline && size !== 'sm' && (
        <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-slate-400 dark:text-slate-500">
          Imagine • Build • Launch
        </span>
      )}

      {/* Inlined CSS for self-contained progress bar movement */}
      <style>
        {`
          @keyframes nirmaan-rail {
            0% {
              left: -50%;
              width: 30%;
            }
            50% {
              left: 25%;
              width: 55%;
            }
            100% {
              left: 100%;
              width: 30%;
            }
          }
        `}
      </style>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#F8FAFC]/90 dark:bg-[#090A0F]/90 backdrop-blur-xl transition-colors duration-300',
          className
        )}
      >
        {/* Subtle Blueprint Radial Grid Ambient Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(rgba(99, 91, 255, 0.3) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Ambient Center Glow */}
        <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-[#635BFF]/25 via-[#8B5CF6]/15 to-[#22D3EE]/20 blur-3xl pointer-events-none" />

        {/* Glassmorphic Brand Container */}
        <div className="relative z-10 p-7 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-[#24293D] bg-white/80 dark:bg-[#0F111A]/80 backdrop-blur-2xl shadow-2xl flex flex-col items-center ring-1 ring-white/10 dark:ring-white/5">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex flex-col items-center justify-center p-8', className)}
    >
      {content}
    </div>
  );
};

/**
 * Convenient Fullscreen Global Loading Screen.
 */
export const GlobalLoadingScreen: React.FC<Omit<LoadingStateProps, 'fullScreen'>> = (props) => (
  <LoadingState fullScreen {...props} size={props.size || 'lg'} />
);
