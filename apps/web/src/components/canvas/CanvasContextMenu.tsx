'use client';

import React, { useEffect, useRef } from 'react';
import {
  Trash2,
  Copy,
  Sliders,
  Zap,
  Maximize2,
  StickyNote,
} from 'lucide-react';
import { CanvasNode, CanvasEdge } from '@nirmaanify/types';

export interface ContextMenuState {
  x: number;
  y: number;
  type: 'node' | 'edge' | 'pane';
  targetId?: string;
  targetItem?: CanvasNode | CanvasEdge | null;
}

interface CanvasContextMenuProps {
  menu: ContextMenuState | null;
  onClose: () => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onOpenProperties: () => void;
  onAutoLayout: () => void;
  onFitView: () => void;
  onAddStickyNote: (x: number, y: number) => void;
}

export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  menu,
  onClose,
  onDeleteNode,
  onDeleteEdge,
  onDuplicateNode,
  onOpenProperties,
  onAutoLayout,
  onFitView,
  onAddStickyNote,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!menu) return null;

  // Ensure menu stays within screen boundaries
  const adjustedX = Math.min(menu.x, window.innerWidth - 200);
  const adjustedY = Math.min(menu.y, window.innerHeight - 250);

  return (
    <div
      ref={menuRef}
      style={{ left: `${adjustedX}px`, top: `${adjustedY}px` }}
      className="fixed z-50 min-w-[190px] rounded-xl border border-[#2E354F] bg-[#141724]/95 backdrop-blur-md shadow-2xl p-1.5 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-100 select-none"
    >
      {menu.type === 'node' && menu.targetId && (
        <div className="space-y-0.5">
          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#1E2337] mb-1">
            Component Options
          </div>
          <button
            type="button"
            onClick={() => {
              onDuplicateNode(menu.targetId!);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#1E2337] text-left transition-colors"
          >
            <Copy className="h-3.5 w-3.5 text-indigo-400" />
            <span>Duplicate Component</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenProperties();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#1E2337] text-left transition-colors"
          >
            <Sliders className="h-3.5 w-3.5 text-slate-400" />
            <span>Edit Properties</span>
          </button>
          <div className="h-px bg-[#1E2337] my-1" />
          <button
            type="button"
            onClick={() => {
              onDeleteNode(menu.targetId!);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-red-950/40 text-red-400 text-left font-medium transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5 text-red-400" />
            <span>Delete Component (Del)</span>
          </button>
        </div>
      )}

      {menu.type === 'edge' && menu.targetId && (
        <div className="space-y-0.5">
          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#1E2337] mb-1">
            Connection Options
          </div>
          <button
            type="button"
            onClick={() => {
              onOpenProperties();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#1E2337] text-left transition-colors"
          >
            <Sliders className="h-3.5 w-3.5 text-slate-400" />
            <span>Edit Connection</span>
          </button>
          <div className="h-px bg-[#1E2337] my-1" />
          <button
            type="button"
            onClick={() => {
              onDeleteEdge(menu.targetId!);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-red-950/40 text-red-400 text-left font-medium transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5 text-red-400" />
            <span>Delete Connection (Del)</span>
          </button>
        </div>
      )}

      {menu.type === 'pane' && (
        <div className="space-y-0.5">
          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#1E2337] mb-1">
            Canvas Actions
          </div>
          <button
            type="button"
            onClick={() => {
              onAddStickyNote(menu.x, menu.y);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#1E2337] text-left transition-colors"
          >
            <StickyNote className="h-3.5 w-3.5 text-amber-400" />
            <span>Add Sticky Note Here</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onAutoLayout();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#1E2337] text-left transition-colors"
          >
            <Zap className="h-3.5 w-3.5 text-indigo-400" />
            <span>Auto-Layout (Dagre)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onFitView();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#1E2337] text-left transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Fit All to Canvas</span>
          </button>
        </div>
      )}
    </div>
  );
};
