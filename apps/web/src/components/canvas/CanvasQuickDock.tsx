'use client';

import React from 'react';
import {
  MousePointer,
  Hand,
  Trash2,
  Copy,
  Zap,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  PanelLeft,
  PanelRight,
  RotateCcw,
} from 'lucide-react';

interface CanvasQuickDockProps {
  isPanMode: boolean;
  onTogglePanMode: () => void;
  hasSelection: boolean;
  selectedType: 'node' | 'edge' | null;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onAutoLayout: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  isLeftSidebarOpen: boolean;
  onToggleLeftSidebar: () => void;
  isRightSidebarOpen: boolean;
  onToggleRightSidebar: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  onClearCanvas: () => void;
}

export const CanvasQuickDock: React.FC<CanvasQuickDockProps> = ({
  isPanMode,
  onTogglePanMode,
  hasSelection,
  selectedType,
  onDeleteSelected,
  onDuplicateSelected,
  onAutoLayout,
  onZoomIn,
  onZoomOut,
  onFitView,
  isLeftSidebarOpen,
  onToggleLeftSidebar,
  isRightSidebarOpen,
  onToggleRightSidebar,
  isZenMode,
  onToggleZenMode,
  onClearCanvas,
}) => {
  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-2 rounded-2xl bg-white/95 dark:bg-[#10121C]/95 backdrop-blur-md border border-slate-300 dark:border-[#2E354F] shadow-2xl select-none transition-all">
      {/* Tool: Pointer vs Hand Pan */}
      <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-[#141724] p-0.5 rounded-xl border border-slate-200 dark:border-[#24293D]">
        <button
          type="button"
          onClick={onTogglePanMode}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            !isPanMode
              ? 'bg-[#635BFF] text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#1E2337]'
          }`}
          title={!isPanMode ? 'Selection Tool (Active)' : 'Switch to Selection Tool'}
        >
          <MousePointer className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Select</span>
        </button>

        <button
          type="button"
          onClick={onTogglePanMode}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isPanMode
              ? 'bg-[#635BFF] text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#1E2337]'
          }`}
          title={isPanMode ? 'Hand Pan Tool (Active)' : 'Switch to Hand Pan Tool (Spacebar)'}
        >
          <Hand className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Pan</span>
        </button>
      </div>

      <div className="h-4 w-px bg-slate-300 dark:bg-[#2E354F] mx-0.5" />

      {/* Delete Action: High-Visibility Inactive & Vibrant Active */}
      <button
        type="button"
        disabled={!hasSelection}
        onClick={onDeleteSelected}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
          hasSelection
            ? 'bg-red-500 text-white border border-red-400 shadow-md shadow-red-500/30 scale-105 animate-pulse'
            : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#1A1E2E] border border-slate-300 dark:border-[#2E354F] hover:bg-slate-200 dark:hover:bg-[#252B42] hover:text-slate-900 dark:hover:text-white cursor-pointer'
        }`}
        title={
          hasSelection
            ? `Delete Selected ${selectedType === 'node' ? 'Component' : 'Connection'} (Del / Backspace)`
            : 'Select any component or connection to delete (Del)'
        }
      >
        <Trash2 className={`h-3.5 w-3.5 ${hasSelection ? 'text-white' : 'text-red-500 dark:text-red-400'}`} />
        <span>Delete</span>
        <span
          className={`text-[10px] font-mono px-1 py-0.2 rounded font-bold ${
            hasSelection
              ? 'bg-red-600 text-white'
              : 'bg-slate-200 dark:bg-[#141724] text-slate-500 dark:text-slate-400'
          }`}
        >
          Del
        </span>
      </button>

      {/* Duplicate / Clone Action */}
      <button
        type="button"
        disabled={selectedType !== 'node'}
        onClick={onDuplicateSelected}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
          selectedType === 'node'
            ? 'bg-indigo-600 text-white border border-indigo-500 shadow-md shadow-indigo-600/30'
            : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#1A1E2E] border border-slate-300 dark:border-[#2E354F] hover:bg-slate-200 dark:hover:bg-[#252B42] hover:text-slate-900 dark:hover:text-white'
        }`}
        title={selectedType === 'node' ? 'Duplicate Component (Ctrl+D)' : 'Select a component to duplicate (Ctrl+D)'}
      >
        <Copy className={`h-3.5 w-3.5 ${selectedType === 'node' ? 'text-white' : 'text-indigo-400'}`} />
        <span>Clone</span>
        <span
          className={`text-[10px] font-mono px-1 py-0.2 rounded font-bold ${
            selectedType === 'node'
              ? 'bg-indigo-700 text-white'
              : 'bg-slate-200 dark:bg-[#141724] text-slate-500 dark:text-slate-400'
          }`}
        >
          Ctrl+D
        </span>
      </button>

      <div className="h-4 w-px bg-slate-300 dark:bg-[#2E354F] mx-0.5" />

      {/* Auto-Layout Quick Trigger */}
      <button
        type="button"
        onClick={onAutoLayout}
        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#1A1E2E] border border-slate-300 dark:border-[#2E354F] hover:bg-slate-200 dark:hover:bg-[#252B42] hover:text-slate-900 dark:hover:text-white transition-all"
        title="Auto-Layout Nodes (Dagre)"
      >
        <Zap className="h-4 w-4 text-amber-500" />
      </button>

      {/* Zoom In & Zoom Out & Fit View */}
      <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-[#141724] p-0.5 rounded-xl border border-slate-200 dark:border-[#24293D]">
        <button
          type="button"
          onClick={onZoomOut}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#1E2337] transition-all"
          title="Zoom Out (-)"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={onFitView}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#1E2337] transition-all"
          title="Fit All Nodes in View"
        >
          <Maximize2 className="h-3.5 w-3.5 text-emerald-500" />
        </button>

        <button
          type="button"
          onClick={onZoomIn}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#1E2337] transition-all"
          title="Zoom In (+)"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="h-4 w-px bg-slate-300 dark:bg-[#2E354F] mx-0.5" />

      {/* Sidebar Controls: Left Stencils Toggle */}
      <button
        type="button"
        onClick={onToggleLeftSidebar}
        className={`p-2 rounded-xl border transition-all ${
          isLeftSidebarOpen
            ? 'text-[#635BFF] bg-[#635BFF]/15 border-[#635BFF]/50 shadow-sm font-semibold'
            : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#1A1E2E] border-slate-300 dark:border-[#2E354F] hover:text-slate-900 dark:hover:text-white hover:border-[#635BFF]'
        }`}
        title={isLeftSidebarOpen ? 'Hide Stencils Palette' : 'Show Stencils Palette'}
      >
        <PanelLeft className="h-4 w-4" />
      </button>

      {/* Sidebar Controls: Right Inspector Toggle */}
      <button
        type="button"
        onClick={onToggleRightSidebar}
        className={`p-2 rounded-xl border transition-all ${
          isRightSidebarOpen
            ? 'text-[#635BFF] bg-[#635BFF]/15 border-[#635BFF]/50 shadow-sm font-semibold'
            : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#1A1E2E] border-slate-300 dark:border-[#2E354F] hover:text-slate-900 dark:hover:text-white hover:border-[#635BFF]'
        }`}
        title={isRightSidebarOpen ? 'Hide Properties & Specs' : 'Show Properties & Specs'}
      >
        <PanelRight className="h-4 w-4" />
      </button>

      {/* Fullscreen / Zen Mode Toggle */}
      <button
        type="button"
        onClick={onToggleZenMode}
        className={`p-2 rounded-xl border transition-all ${
          isZenMode
            ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white shadow-md border-transparent'
            : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#1A1E2E] border-slate-300 dark:border-[#2E354F] hover:text-slate-900 dark:hover:text-white hover:border-[#635BFF]'
        }`}
        title={isZenMode ? 'Exit Zen Mode (Restore Panels)' : 'Zen Mode: Maximize Canvas Fullscreen'}
      >
        {isZenMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>

      {/* Clear Canvas */}
      <button
        type="button"
        onClick={onClearCanvas}
        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
        title="Clear All Canvas Elements"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
};
