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
  Undo2,
  Redo2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';

interface CanvasQuickDockProps {
  isPanMode: boolean;
  onTogglePanMode: () => void;
  hasSelection: boolean;
  selectedType: 'node' | 'edge' | null;
  selectedCount?: number;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onAutoLayout: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onClearCanvas: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isLeftSidebarOpen: boolean;
  onToggleLeftSidebar: () => void;
  isRightSidebarOpen: boolean;
  onToggleRightSidebar: () => void;
}

export const CanvasQuickDock: React.FC<CanvasQuickDockProps> = ({
  isPanMode,
  onTogglePanMode,
  hasSelection,
  selectedType,
  selectedCount = 0,
  onDeleteSelected,
  onDuplicateSelected,
  onAutoLayout,
  onZoomIn,
  onZoomOut,
  onFitView,
  onClearCanvas,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isLeftSidebarOpen,
  onToggleLeftSidebar,
  isRightSidebarOpen,
  onToggleRightSidebar,
}) => {
  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#10121C]/95 backdrop-blur-md border border-[#2E354F] shadow-2xl select-none whitespace-nowrap max-w-[calc(100vw-32px)] overflow-x-auto scrollbar-none transition-all">
      {/* Left Sidebar (Stencils) Collapse/Expand Toggle */}
      <button
        type="button"
        onClick={onToggleLeftSidebar}
        className={`h-8 flex items-center gap-1.5 px-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 whitespace-nowrap ${
          isLeftSidebarOpen
            ? 'bg-[#141724] text-slate-200 border border-[#2E354F] hover:bg-[#1E2337] hover:text-white'
            : 'bg-[#141724]/60 text-slate-500 border border-[#24293D] hover:text-slate-300 hover:bg-[#1E2337]'
        }`}
        title={isLeftSidebarOpen ? 'Collapse Left Sidebar (Stencils & Shapes)' : 'Expand Left Sidebar (Stencils & Shapes)'}
      >
        {isLeftSidebarOpen ? (
          <PanelLeftClose className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
        ) : (
          <PanelLeftOpen className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        )}
        <span className="hidden xl:inline text-[11px]">Stencils</span>
      </button>

      <div className="h-4.5 w-px bg-[#2E354F] shrink-0 mx-0.5" />

      {/* Tool: Pointer vs Hand Pan */}
      <div className="h-8 flex items-center gap-0.5 bg-[#141724] p-0.5 rounded-xl border border-[#24293D] shrink-0">
        <button
          type="button"
          onClick={onTogglePanMode}
          className={`h-7 flex items-center gap-1 px-2.5 rounded-lg text-xs font-semibold transition-all shrink-0 whitespace-nowrap ${
            !isPanMode
              ? 'bg-[#635BFF] text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E2337]'
          }`}
          title={!isPanMode ? 'Selection Tool (Active)' : 'Switch to Selection Tool'}
        >
          <MousePointer className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden md:inline">Select</span>
        </button>

        <button
          type="button"
          onClick={onTogglePanMode}
          className={`h-7 flex items-center gap-1 px-2.5 rounded-lg text-xs font-semibold transition-all shrink-0 whitespace-nowrap ${
            isPanMode
              ? 'bg-[#635BFF] text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E2337]'
          }`}
          title={isPanMode ? 'Hand Pan Tool (Active)' : 'Switch to Hand Pan Tool (Spacebar)'}
        >
          <Hand className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden md:inline">Pan</span>
        </button>
      </div>

      <div className="h-4.5 w-px bg-[#2E354F] shrink-0 mx-0.5" />

      {/* Undo & Redo History Controls */}
      <div className="h-8 flex items-center gap-0.5 bg-[#141724] p-0.5 rounded-xl border border-[#24293D] shrink-0">
        <button
          type="button"
          disabled={!canUndo}
          onClick={onUndo}
          className={`h-7 flex items-center gap-1 px-2 rounded-lg text-xs font-semibold transition-colors shrink-0 whitespace-nowrap ${
            canUndo
              ? 'text-slate-300 hover:text-white hover:bg-[#1E2337] cursor-pointer'
              : 'text-slate-600 cursor-not-allowed opacity-35'
          }`}
          title="Undo Canvas Change (Ctrl+Z)"
        >
          <Undo2 className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden lg:inline text-[11px]">Undo</span>
        </button>

        <button
          type="button"
          disabled={!canRedo}
          onClick={onRedo}
          className={`h-7 flex items-center gap-1 px-2 rounded-lg text-xs font-semibold transition-colors shrink-0 whitespace-nowrap ${
            canRedo
              ? 'text-slate-300 hover:text-white hover:bg-[#1E2337] cursor-pointer'
              : 'text-slate-600 cursor-not-allowed opacity-35'
          }`}
          title="Redo Canvas Change (Ctrl+Y / Ctrl+Shift+Z)"
        >
          <Redo2 className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden lg:inline text-[11px]">Redo</span>
        </button>
      </div>

      <div className="h-4.5 w-px bg-[#2E354F] shrink-0 mx-0.5" />

      {/* Delete Action: Simple, clean, static */}
      <button
        type="button"
        disabled={!hasSelection}
        onClick={onDeleteSelected}
        className={`h-8 flex items-center gap-1.5 px-2.5 rounded-xl text-xs font-semibold transition-colors shrink-0 whitespace-nowrap ${
          hasSelection
            ? 'bg-red-600 hover:bg-red-500 text-white border border-red-500 shadow-sm cursor-pointer'
            : 'text-slate-400 bg-[#141724] border border-[#2E354F] hover:bg-[#1E2337] hover:text-slate-200 cursor-pointer'
        }`}
        title={
          hasSelection
            ? selectedCount > 1
              ? `Delete ${selectedCount} Selected Items (Del / Backspace)`
              : `Delete Selected ${selectedType === 'node' ? 'Component' : 'Connection'} (Del / Backspace)`
            : 'Select any component or connection to delete (Del)'
        }
      >
        <Trash2 className={`h-3.5 w-3.5 shrink-0 ${hasSelection ? 'text-white' : 'text-red-400'}`} />
        <span className="whitespace-nowrap">Delete</span>
        {selectedCount > 1 && (
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold bg-red-800 text-white shrink-0 whitespace-nowrap leading-none">
            {selectedCount}
          </span>
        )}
        <span
          className={`text-[10px] font-mono px-1 py-0.2 rounded font-bold shrink-0 whitespace-nowrap ${
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
        disabled={!hasSelection || selectedType !== 'node'}
        onClick={onDuplicateSelected}
        className={`h-8 flex items-center gap-1.5 px-2.5 rounded-xl text-xs font-semibold transition-colors shrink-0 whitespace-nowrap ${
          hasSelection && selectedType === 'node'
            ? 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 shadow-sm'
            : 'text-slate-400 bg-[#141724] border border-[#2E354F] hover:bg-[#1E2337] hover:text-slate-200'
        }`}
        title={hasSelection && selectedType === 'node' ? 'Duplicate Selected (Ctrl+D)' : 'Select a component to duplicate (Ctrl+D)'}
      >
        <Copy className={`h-3.5 w-3.5 shrink-0 ${hasSelection && selectedType === 'node' ? 'text-white' : 'text-indigo-400'}`} />
        <span className="whitespace-nowrap">Clone</span>
        {selectedCount > 1 && selectedType === 'node' && (
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold bg-indigo-800 text-white shrink-0 whitespace-nowrap leading-none">
            {selectedCount}
          </span>
        )}
        <span
          className={`text-[10px] font-mono px-1 py-0.2 rounded font-bold shrink-0 whitespace-nowrap ${
            hasSelection && selectedType === 'node'
              ? 'bg-indigo-700 text-white'
              : 'bg-[#10121C] text-slate-400 border border-[#24293D]'
          }`}
        >
          Ctrl+D
        </span>
      </button>

      <div className="h-4.5 w-px bg-[#2E354F] shrink-0 mx-0.5" />

      {/* Auto-Layout Quick Trigger */}
      <button
        type="button"
        onClick={onAutoLayout}
        className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-300 bg-[#141724] border border-[#2E354F] hover:bg-[#1E2337] hover:text-white transition-colors shrink-0"
        title="Auto-Layout Nodes (Dagre)"
      >
        <Zap className="h-4 w-4 text-amber-400 shrink-0" />
      </button>

      {/* Zoom In & Zoom Out & Fit View */}
      <div className="h-8 flex items-center gap-0.5 bg-[#141724] p-0.5 rounded-xl border border-[#24293D] shrink-0">
        <button
          type="button"
          onClick={onZoomOut}
          className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-[#1E2337] transition-colors shrink-0"
          title="Zoom Out (-)"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={onFitView}
          className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-[#1E2337] transition-colors shrink-0"
          title="Fit All Nodes in View"
        >
          <Maximize2 className="h-3.5 w-3.5 text-emerald-400" />
        </button>

        <button
          type="button"
          onClick={onZoomIn}
          className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-[#1E2337] transition-colors shrink-0"
          title="Zoom In (+)"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="h-4.5 w-px bg-[#2E354F] shrink-0 mx-0.5" />

      {/* Clear Canvas */}
      <button
        type="button"
        onClick={onClearCanvas}
        className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/40 border border-[#24293D] hover:border-red-900/50 transition-colors shrink-0"
        title="Clear All Canvas Elements"
      >
        <RotateCcw className="h-4 w-4 shrink-0" />
      </button>

      <div className="h-4.5 w-px bg-[#2E354F] shrink-0 mx-0.5" />

      {/* Right Sidebar (Inspector) Collapse/Expand Toggle */}
      <button
        type="button"
        onClick={onToggleRightSidebar}
        className={`h-8 flex items-center gap-1.5 px-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 whitespace-nowrap ${
          isRightSidebarOpen
            ? 'bg-[#141724] text-slate-200 border border-[#2E354F] hover:bg-[#1E2337] hover:text-white'
            : 'bg-[#141724]/60 text-slate-500 border border-[#24293D] hover:text-slate-300 hover:bg-[#1E2337]'
        }`}
        title={isRightSidebarOpen ? 'Collapse Right Sidebar (Inspector & Specs)' : 'Expand Right Sidebar (Inspector & Specs)'}
      >
        <span className="hidden xl:inline text-[11px]">Inspector</span>
        {isRightSidebarOpen ? (
          <PanelRightClose className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
        ) : (
          <PanelRightOpen className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        )}
      </button>
    </div>
  );
};
