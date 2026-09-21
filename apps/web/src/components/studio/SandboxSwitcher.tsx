'use client';

import React, { useState } from 'react';
import { Cloud, Server, ChevronDown, Check, Loader2 } from 'lucide-react';
import { SandboxProvider } from '@nirmaanify/types';

interface SandboxSwitcherProps {
  projectId: string;
  currentProvider: SandboxProvider;
  onSwitchProvider: (provider: SandboxProvider) => Promise<void> | void;
  status?: string;
  className?: string;
}

export function SandboxSwitcher({
  projectId,
  currentProvider,
  onSwitchProvider,
  status = 'READY',
  className = '',
}: SandboxSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSelect = async (provider: SandboxProvider) => {
    if (provider === currentProvider) {
      setIsOpen(false);
      return;
    }

    setIsSwitching(true);
    setIsOpen(false);
    try {
      await onSwitchProvider(provider);
    } finally {
      setIsSwitching(false);
    }
  };

  const isCloud = currentProvider === 'E2B_CLOUD';

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="h-7 px-2.5 inline-flex items-center gap-1.5 rounded-md border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#141724] text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm"
        title="Toggle Sandbox Infrastructure"
      >
        {isSwitching ? (
          <Loader2 className="h-3 w-3 animate-spin text-[#635BFF]" />
        ) : isCloud ? (
          <Cloud className="h-3 w-3 text-[#635BFF]" />
        ) : (
          <Server className="h-3 w-3 text-[#22D3EE]" />
        )}

        <span>{isCloud ? 'Cloud (E2B)' : 'Local (Docker)'}</span>

        <span
          className={`h-1.5 w-1.5 rounded-full ${
            status === 'READY'
              ? 'bg-emerald-400'
              : status === 'INITIALIZING'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-slate-400'
          }`}
        />

        <ChevronDown className="h-3 w-3 text-slate-400 opacity-60 ml-0.5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1.5 w-56 rounded-xl border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#10131F] shadow-xl z-50 py-1 text-xs animate-in fade-in-50 zoom-in-95">
            <div className="px-3 py-1.5 border-b border-slate-100 dark:border-[#24293D]/60 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Sandbox Runner
            </div>

            <button
              onClick={() => handleSelect('E2B_CLOUD')}
              className="w-full px-3 py-2 flex items-start justify-between hover:bg-slate-50 dark:hover:bg-[#161A2B] transition-colors text-left"
            >
              <div className="flex items-start gap-2">
                <Cloud className="h-3.5 w-3.5 text-[#635BFF] mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                    Cloud Micro-VM (E2B)
                  </div>
                  <p className="text-[10px] text-slate-400">Zero-config cloud execution with instant hot-reloading</p>
                </div>
              </div>
              {isCloud && <Check className="h-3.5 w-3.5 text-[#635BFF] shrink-0 mt-0.5" />}
            </button>

            <button
              onClick={() => handleSelect('LOCAL_DOCKER')}
              className="w-full px-3 py-2 flex items-start justify-between hover:bg-slate-50 dark:hover:bg-[#161A2B] transition-colors text-left"
            >
              <div className="flex items-start gap-2">
                <Server className="h-3.5 w-3.5 text-[#22D3EE] mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                    Local Docker Runner
                  </div>
                  <p className="text-[10px] text-slate-400">Offline self-hosted execution via local Docker daemon</p>
                </div>
              </div>
              {!isCloud && <Check className="h-3.5 w-3.5 text-[#22D3EE] shrink-0 mt-0.5" />}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
