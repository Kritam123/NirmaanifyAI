'use client';

import React, { useState } from 'react';
import { ComponentNode, PageSchema } from '@nirmaanify/types';
import { DynamicRenderer } from '@nirmaanify/component-registry';
import {
  ChevronRight,
  Plus,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '@nirmaanify/ui';

interface VisualCanvasProps {
  page: PageSchema;
  mode: 'builder' | 'preview';
  viewport: 'desktop' | 'tablet' | 'mobile';
  zoom: number;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  onSelectNode: (id: string, e?: React.MouseEvent) => void;
  onHoverNode: (id: string | null) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onMoveNode: (id: string, direction: 'up' | 'down') => void;
  onDropComponent: (type: string, targetParentId?: string, index?: number) => void;
  onOpenAddModal: () => void;
}

export function VisualCanvas({
  page,
  mode,
  viewport,
  zoom,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
  onDeleteNode,
  onDuplicateNode,
  onMoveNode,
  onDropComponent,
  onOpenAddModal,
}: VisualCanvasProps) {
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);

  const getBreadcrumbs = (): { id: string; name: string }[] => {
    if (!selectedNodeId) return [{ id: page.rootNode.id, name: page.name }];
    const trail: { id: string; name: string }[] = [{ id: 'page', name: page.name }];

    const findPath = (
      current: ComponentNode,
      targetId: string,
      currentPath: { id: string; name: string }[]
    ): boolean => {
      const newPath = [...currentPath, { id: current.id, name: current.name || current.type }];
      if (current.id === targetId) {
        trail.push(...newPath);
        return true;
      }
      if (current.children) {
        for (const child of current.children) {
          if (findPath(child, targetId, newPath)) return true;
        }
      }
      return false;
    };

    findPath(page.rootNode, selectedNodeId, []);
    return trail;
  };

  const breadcrumbs = getBreadcrumbs();

  const viewportWidthClass = {
    desktop: 'w-full max-w-[1280px]',
    tablet: 'w-[768px] max-w-[768px]',
    mobile: 'w-[375px] max-w-[375px]',
  }[viewport];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOverCanvas) setIsDragOverCanvas(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOverCanvas(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverCanvas(false);
    const componentType =
      e.dataTransfer.getData('application/nirmaanify-component') ||
      e.dataTransfer.getData('text/plain');

    if (componentType) {
      onDropComponent(componentType, selectedNodeId || page.rootNode.id);
    }
  };

  return (
    <div
      onClick={() => onSelectNode(page.rootNode.id)}
      className="flex-1 bg-slate-100 dark:bg-[#06080F] overflow-auto relative flex flex-col items-center p-6 select-none"
    >
      {/* Breadcrumb & Floating Quick Actions in Builder Mode */}
      {mode === 'builder' && (
        <div className="sticky top-0 z-30 mb-4 px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#161926]/90 backdrop-blur-md border border-slate-200 dark:border-[#24293D] shadow-md flex items-center gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-400">Path:</span>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.id + idx}>
                {idx > 0 && <ChevronRight className="h-3 w-3 text-slate-400" />}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (crumb.id !== 'page') onSelectNode(crumb.id);
                  }}
                  className={`font-semibold hover:text-[#635BFF] transition-colors ${
                    crumb.id === selectedNodeId ? 'text-[#635BFF] font-bold' : ''
                  }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Quick node contextual action buttons */}
          {selectedNodeId && selectedNodeId !== page.rootNode.id && (
            <div className="flex items-center gap-1 border-l border-slate-200 dark:border-[#24293D] pl-2.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveNode(selectedNodeId, 'up');
                }}
                title="Move Up"
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#24293D] text-slate-600 dark:text-slate-300"
              >
                <ArrowUp className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveNode(selectedNodeId, 'down');
                }}
                title="Move Down"
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#24293D] text-slate-600 dark:text-slate-300"
              >
                <ArrowDown className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateNode(selectedNodeId);
                }}
                title="Duplicate"
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#24293D] text-slate-600 dark:text-slate-300"
              >
                <Copy className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNode(selectedNodeId);
                }}
                title="Delete"
                className="p-1 rounded hover:bg-rose-500 hover:text-white text-rose-500"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Canvas Viewport Container with Zoom scaling & Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
        }}
        className={`transition-all duration-200 min-h-[650px] bg-white dark:bg-[#0E121E] shadow-2xl rounded-2xl border ${
          isDragOverCanvas
            ? 'border-2 border-[#635BFF] ring-4 ring-[#635BFF]/20'
            : 'border-slate-200/80 dark:border-[#24293D]'
        } overflow-hidden flex flex-col relative ${viewportWidthClass}`}
      >
        {/* Drop Zone Visual Overlay when dragging component over canvas */}
        {isDragOverCanvas && (
          <div className="absolute inset-0 z-40 bg-[#635BFF]/5 pointer-events-none flex items-center justify-center border-2 border-dashed border-[#635BFF]">
            <div className="px-4 py-2 rounded-xl bg-[#635BFF] text-white text-xs font-bold shadow-lg flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Drop to Insert Component</span>
            </div>
          </div>
        )}

        {page.rootNode ? (
          <DynamicRenderer
            node={page.rootNode}
            mode={mode}
            selectedNodeId={selectedNodeId}
            hoveredNodeId={hoveredNodeId}
            onSelectNode={onSelectNode}
            onHoverNode={onHoverNode}
            onDeleteNode={onDeleteNode}
            onDuplicateNode={onDuplicateNode}
          />
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-center space-y-3">
            <Sparkles className="h-10 w-10 text-[#635BFF]" />
            <h4 className="font-bold text-base">Empty Canvas</h4>
            <p className="text-xs text-slate-400 max-w-xs">
              Start building by dragging components from the left palette or using the AI command bar.
            </p>
            <Button size="sm" variant="default" onClick={onOpenAddModal} leftIcon={<Plus className="h-3.5 w-3.5" />}>
              Add Component
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
