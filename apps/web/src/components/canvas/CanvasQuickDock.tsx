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
  onClearCanvas,
}) => {
  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-2 rounded-2xl bg-[#10121C]/95 backdrop-blur-md border border-[#2E354F] shadow-2xl select-none transition-all">
      {/* Tool: Pointer vs Hand Pan */}
      <div className="flex items-center gap-0.5 bg-[#141724] p-0.5 rounded-xl border border-[#24293D]">
        <button
          type="button"
          onClick={onTogglePanMode}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            !isPanMode
              ? 'bg-[#635BFF] text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E2337]'
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
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E2337]'
          }`}
          title={isPanMode ? 'Hand Pan Tool (Active)' : 'Switch to Hand Pan Tool (Spacebar)'}
        >
          <Hand className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Pan</span>
        </button>
      </div>

      <div className="h-4 w-px bg-[#2E354F] mx-0.5" />

      {/* Delete Action: Simple, clean, static (no glowing pulse or shadow) */}
      <button
        type="button"
        disabled={!hasSelection}
        onClick={onDeleteSelected}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
          hasSelection
            ? 'bg-red-600 hover:bg-red-500 text-white border border-red-500 shadow-sm cursor-pointer'
            : 'text-slate-400 bg-[#141724] border border-[#2E354F] hover:bg-[#1E2337] hover:text-slate-200 cursor-pointer'
        }`}
        title={
          hasSelection
            ? `Delete Selected ${selectedType === 'node' ? 'Component' : 'Connection'} (Del / Backspace)`
            : 'Select any component or connection to delete (Del)'
        }
      >
        <Trash2 className={`h-3.5 w-3.5 ${hasSelection ? 'text-white' : 'text-red-400'}`} />
        <span>Delete</span>
        <span
          className={`text-[10px] font-mono px-1 py-0.2 rounded font-bold ${
            hasSelection
              ? 'bg-red-700 text-white'
              : 'bg-[#10121C] text-slate-400 border border-[#24293D]'
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
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
          selectedType === 'node'
            ? 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 shadow-sm'
            : 'text-slate-400 bg-[#141724] border border-[#2E354F] hover:bg-[#1E2337] hover:text-slate-200'
        }`}
        title={selectedType === 'node' ? 'Duplicate Component (Ctrl+D)' : 'Select a component to duplicate (Ctrl+D)'}
      >
        <Copy className={`h-3.5 w-3.5 ${selectedType === 'node' ? 'text-white' : 'text-indigo-400'}`} />
        <span>Clone</span>
        <span
          className={`text-[10px] font-mono px-1 py-0.2 rounded font-bold ${
            selectedType === 'node'
              ? 'bg-indigo-700 text-white'
              : 'bg-[#10121C] text-slate-400 border border-[#24293D]'
          }`}
        >
          Ctrl+D
        </span>
      </button>

      <div className="h-4 w-px bg-[#2E354F] mx-0.5" />

      {/* Auto-Layout Quick Trigger */}
      <button
        type="button"
        onClick={onAutoLayout}
        className="p-2 rounded-xl text-slate-300 bg-[#141724] border border-[#2E354F] hover:bg-[#1E2337] hover:text-white transition-colors"
        title="Auto-Layout Nodes (Dagre)"
      >
        <Zap className="h-4 w-4 text-amber-400" />
      </button>

      {/* Zoom In & Zoom Out & Fit View */}
      <div className="flex items-center gap-0.5 bg-[#141724] p-0.5 rounded-xl border border-[#24293D]">
        <button
          type="button"
          onClick={onZoomOut}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1E2337] transition-colors"
          title="Zoom Out (-)"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={onFitView}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1E2337] transition-colors"
          title="Fit All Nodes in View"
        >
          <Maximize2 className="h-3.5 w-3.5 text-emerald-400" />
        </button>

        <button
          type="button"
          onClick={onZoomIn}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#1E2337] transition-colors"
          title="Zoom In (+)"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="h-4 w-px bg-[#2E354F] mx-0.5" />

      {/* Clear Canvas */}
      <button
        type="button"
        onClick={onClearCanvas}
        className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-900/50 transition-colors"
        title="Clear All Canvas Elements"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  );
};
