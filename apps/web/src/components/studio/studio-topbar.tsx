'use client';

import React from 'react';
import { SandboxProvider, StudioViewMode } from '@nirmaanify/types';
import {
  Sparkles,
  Code2,
  Columns,
  Monitor,
  MessageSquare,
  Download,
  ExternalLink,
  X,
} from 'lucide-react';
import { Button } from '@nirmaanify/ui';
import { SandboxSwitcher } from './SandboxSwitcher';

interface StudioTopbarProps {
  projectId: string;
  projectName: string;
  projectType?: string;
  framework?: string;
  viewMode: StudioViewMode;
  onChangeViewMode: (viewMode: StudioViewMode) => void;
  sandboxProvider: SandboxProvider;
  onSwitchSandboxProvider: (provider: SandboxProvider) => void;
  sandboxStatus: string;
  sandboxUrl?: string;
  filesCount?: number;
  onExportCodebase?: () => void;
  onCloseStudio: () => void;
}

export function StudioTopbar({
  projectId,
  projectName,
  projectType = 'WEBSITE',
  framework = 'Next.js 15',
  viewMode,
  onChangeViewMode,
  sandboxProvider,
  onSwitchSandboxProvider,
  sandboxStatus,
  sandboxUrl,
  filesCount = 0,
  onExportCodebase,
  onCloseStudio,
}: StudioTopbarProps) {
  return (
    <header className="h-[52px] px-3.5 border-b border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0E101A] flex items-center justify-between shrink-0 select-none z-30 gap-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Left cluster: close, brand, project name & sandbox provider */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <button
          onClick={onCloseStudio}
          title="Exit Studio (Esc)"
          aria-label="Exit Studio"
          className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1A1E2E] transition-colors shrink-0"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-[#24293D]" />

        <div className="flex items-center gap-2 min-w-0">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-[#635BFF] to-[#8B5CF6] flex items-center justify-center text-white shrink-0 shadow-sm shadow-[#635BFF]/20">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate max-w-[160px] sm:max-w-[240px]">
            {projectName}
          </span>
          <span className="hidden md:inline-flex text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#1A1E2E] text-slate-500 dark:text-slate-400 font-mono">
            {framework}
          </span>
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-[#24293D] hidden sm:block" />

        {/* Sandbox Runtime Switcher */}
        <div className="hidden sm:flex items-center gap-2">
          <SandboxSwitcher
            projectId={projectId}
            currentProvider={sandboxProvider}
            onSwitchProvider={onSwitchSandboxProvider}
            status={sandboxStatus}
          />
        </div>
      </div>

      {/* Center cluster: Studio View Mode Switcher */}
      <div className="flex items-center bg-slate-100/90 dark:bg-[#121522] p-1 rounded-xl border border-slate-200/90 dark:border-[#24293D] gap-1 shrink-0 shadow-inner">
        <button
          onClick={() => onChangeViewMode('split')}
          title="Split View: AI Chat & Live Runtime"
          className={`h-7 px-3 rounded-lg text-xs flex items-center gap-1.5 transition-all duration-150 ${
            viewMode === 'split'
              ? 'bg-white dark:bg-[#1E2337] text-[#635BFF] dark:text-[#A5B4FC] shadow-sm font-semibold border border-slate-200/70 dark:border-[#2D334D]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#1A1E2E] font-medium'
          }`}
        >
          <Columns className={`h-3.5 w-3.5 ${viewMode === 'split' ? 'text-[#635BFF] dark:text-[#A5B4FC]' : 'text-slate-400'}`} />
          <span className="hidden md:inline">Split View</span>
        </button>

        <button
          onClick={() => onChangeViewMode('agent')}
          title="Full Agent Chat"
          className={`h-7 px-3 rounded-lg text-xs flex items-center gap-1.5 transition-all duration-150 ${
            viewMode === 'agent'
              ? 'bg-white dark:bg-[#1E2337] text-[#635BFF] dark:text-[#A5B4FC] shadow-sm font-semibold border border-slate-200/70 dark:border-[#2D334D]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#1A1E2E] font-medium'
          }`}
        >
          <MessageSquare className={`h-3.5 w-3.5 ${viewMode === 'agent' ? 'text-[#635BFF] dark:text-[#A5B4FC]' : 'text-slate-400'}`} />
          <span className="hidden md:inline">Agent Chat</span>
        </button>

        <button
          onClick={() => onChangeViewMode('code')}
          title="Full Code Explorer"
          className={`h-7 px-3 rounded-lg text-xs flex items-center gap-1.5 transition-all duration-150 ${
            viewMode === 'code'
              ? 'bg-white dark:bg-[#1E2337] text-[#635BFF] dark:text-[#A5B4FC] shadow-sm font-semibold border border-slate-200/70 dark:border-[#2D334D]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#1A1E2E] font-medium'
          }`}
        >
          <Code2 className={`h-3.5 w-3.5 ${viewMode === 'code' ? 'text-[#635BFF] dark:text-[#A5B4FC]' : 'text-slate-400'}`} />
          <span className="hidden md:inline">Code</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono transition-colors ${
              viewMode === 'code'
                ? 'bg-[#635BFF]/10 text-[#635BFF] font-bold'
                : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {filesCount}
          </span>
        </button>

        <button
          onClick={() => onChangeViewMode('preview')}
          title="Full Sandbox Preview"
          className={`h-7 px-3 rounded-lg text-xs flex items-center gap-1.5 transition-all duration-150 ${
            viewMode === 'preview'
              ? 'bg-white dark:bg-[#1E2337] text-[#635BFF] dark:text-[#A5B4FC] shadow-sm font-semibold border border-slate-200/70 dark:border-[#2D334D]'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#1A1E2E] font-medium'
          }`}
        >
          <Monitor className={`h-3.5 w-3.5 ${viewMode === 'preview' ? 'text-[#635BFF] dark:text-[#A5B4FC]' : 'text-slate-400'}`} />
          <span className="hidden md:inline">Live Preview</span>
        </button>
      </div>

      {/* Right cluster: Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {sandboxUrl && (
          <a
            href={sandboxUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open Sandbox in New Window"
            className="h-8 px-2.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1A1E2E] text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Open URL</span>
          </a>
        )}

        {onExportCodebase && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-3.5 w-3.5" />}
            onClick={onExportCodebase}
            className="h-8 text-xs"
          >
            <span className="hidden sm:inline">Export Codebase</span>
          </Button>
        )}
      </div>
    </header>
  );
}