'use client';

import React from 'react';
import { ComponentNode, PageSchema } from '@nirmaanify/types';
import { DynamicRenderer } from '@nirmaanify/component-registry';
import { ChevronRight, Plus, Monitor, Sparkles } from 'lucide-react';
import { Button } from '@nirmaanify/ui';

interface VisualCanvasProps {
  page: PageSchema;
  mode: 'builder' | 'preview';
  viewport: 'desktop' | 'tablet' | 'mobile';
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  onSelectNode: (id: string, e?: React.MouseEvent) => void;
  onHoverNode: (id: string | null) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onOpenAddModal: () => void;
}

export function VisualCanvas({
  page,
  mode,
  viewport,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
  onDeleteNode,
  onDuplicateNode,
  onOpenAddModal,
}: VisualCanvasProps) {
  const getBreadcrumbs = (): { id: string; name: string }[] => {
    if (!selectedNodeId) return [{ id: page.rootNode.id, name: page.name }];
    const trail: { id: string; name: string }[] = [{ id: 'page', name: page.name }];

    const findPath = (current: ComponentNode, targetId: string, currentPath: { id: string; name: string }[]): boolean => {
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
    desktop: 'w-full max-w-full',
    tablet: 'w-[768px] max-w-[768px]',
    mobile: 'w-[375px] max-w-[375px]',
  }[viewport];

  return (
    <div
      onClick={() => onSelectNode(page.rootNode.id)}
      className="flex-1 bg-slate-100 dark:bg-[#06080F] overflow-auto relative flex flex-col items-center p-6 select-none"
    >
      {/* Breadcrumb Trail in Builder Mode */}
      {mode === 'builder' && (
        <div className="sticky top-0 z-20 mb-4 px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#161926]/90 backdrop-blur-md border border-slate-200 dark:border-[#24293D] shadow-sm flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-400">Canvas Path:</span>
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
      )}

      {/* Main Canvas Viewport Container */}
      <div
        className={`transition-all duration-300 min-h-[600px] bg-white dark:bg-[#0E121E] shadow-2xl rounded-2xl border border-slate-200/80 dark:border-[#24293D] overflow-hidden flex flex-col ${viewportWidthClass}`}
      >
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
              Start building by adding components from the left palette.
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
