'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ComponentNode, PageSchema } from '@nirmaanify/types';
import {
  DynamicRenderer,
  getAllLayoutContainers,
  isDescendant,
  findNode,
  findParentNode,
} from '@nirmaanify/component-registry';
import {
  ChevronRight,
  Plus,
  ArrowUp,
  ArrowDown,
  ArrowRightLeft,
  Copy,
  Trash2,
  Lock,
  Layers,
  Sparkles,
  MousePointer2,
  Square,
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
  onReparentNode?: (
    sourceId: string,
    targetId: string,
    position: 'before' | 'after' | 'inside'
  ) => void;
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
  onReparentNode,
  onDropComponent,
  onOpenAddModal,
}: VisualCanvasProps) {
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);
  const [isJumpMenuOpen, setIsJumpMenuOpen] = useState(false);
  const jumpMenuRef = useRef<HTMLDivElement>(null);

  // Close jump menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (jumpMenuRef.current && !jumpMenuRef.current.contains(e.target as Node)) {
        setIsJumpMenuOpen(false);
      }
    }
    if (isJumpMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isJumpMenuOpen]);

  // Find selected node details and parent
  const selectedNode = useMemo(() => {
    if (!page.rootNode || !selectedNodeId) return null;
    return findNode(page.rootNode, selectedNodeId);
  }, [page.rootNode, selectedNodeId]);

  const selectedParent = useMemo(() => {
    if (!page.rootNode || !selectedNodeId) return null;
    return findParentNode(page.rootNode, selectedNodeId);
  }, [page.rootNode, selectedNodeId]);

  const isSelectedLocked = Boolean(selectedNode?.isLocked || selectedParent?.isLocked);

  // Available layout containers for jump menu (must not be locked or descendant)
  const availableSections = useMemo(() => {
    if (!page.rootNode || !selectedNodeId) return [];
    return getAllLayoutContainers(page.rootNode).filter(
      (c) => c.id !== selectedNodeId && !c.isLocked && !isDescendant(page.rootNode, selectedNodeId, c.id)
    );
  }, [page.rootNode, selectedNodeId]);

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

    const existingNodeId =
      e.dataTransfer.getData('application/nirmaanify-node-id') ||
      e.dataTransfer.getData('application/nirmaanify-layer-id');

    if (existingNodeId) {
      onReparentNode?.(existingNodeId, selectedNodeId || page.rootNode.id, 'inside');
      return;
    }

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
      className="flex-1 bg-slate-50 dark:bg-[#090A0F] overflow-y-auto overflow-x-auto relative flex flex-col items-center p-5 pb-24 select-none"
    >
      {/* Subtle radial brand glow behind the canvas */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-40"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, rgba(99,91,255,0.12) 0%, rgba(139,92,246,0.06) 35%, rgba(34,211,238,0) 70%)',
        }}
      />
      {/* Subtle dot grid pattern */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18] dark:opacity-[0.10]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(100,116,139,0.35) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Breadcrumb & Floating Quick Actions in Builder Mode */}
      {mode === 'builder' && (
        <div className="sticky top-0 z-30 mb-3 inline-flex items-center gap-2.5 pl-1 pr-1.5 py-1 rounded-full bg-white/95 dark:bg-[#0F111A]/95 backdrop-blur-md border border-slate-200 dark:border-[#24293D] shadow-lg shadow-slate-200/40 dark:shadow-black/30 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 px-1.5">
            <Layers className="h-3 w-3 text-[#635BFF]" />
            <span className="font-bold text-[9.5px] uppercase tracking-wider text-slate-400">Path</span>
          </div>
          <div className="flex items-center gap-1">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.id + idx}>
                {idx > 0 && (
                  <ChevronRight className="h-3 w-3 text-slate-300 dark:text-slate-600" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (crumb.id !== 'page') onSelectNode(crumb.id);
                  }}
                  className={`px-1.5 py-0.5 rounded-md font-semibold transition-colors ${
                    crumb.id === selectedNodeId
                      ? 'bg-gradient-to-br from-[#635BFF] to-[#8B5CF6] text-white shadow-sm shadow-[#635BFF]/30'
                      : 'hover:bg-slate-100 dark:hover:bg-[#141724] hover:text-[#635BFF] text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Quick node contextual action buttons */}
          {selectedNodeId && selectedNodeId !== page.rootNode.id && (
            <div className="flex items-center gap-0.5 border-l border-slate-200 dark:border-[#24293D] pl-1.5">
              {isSelectedLocked && (
                <span
                  title={selectedNode?.isLocked ? 'Selected component is locked' : 'Parent container is locked'}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 mr-1 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                >
                  <Lock className="h-2.5 w-2.5" />
                  <span>Locked</span>
                </span>
              )}
              <button
                disabled={isSelectedLocked}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isSelectedLocked) onMoveNode(selectedNodeId, 'up');
                }}
                title={isSelectedLocked ? 'Element or container is locked' : 'Move Up / Jump layout (Alt+↑)'}
                className={`h-6 w-6 inline-flex items-center justify-center rounded-md transition-colors ${
                  isSelectedLocked
                    ? 'opacity-30 cursor-not-allowed text-slate-400'
                    : 'hover:bg-slate-100 dark:hover:bg-[#141724] text-slate-600 dark:text-slate-300 hover:text-[#635BFF] cursor-pointer'
                }`}
              >
                <ArrowUp className="h-3 w-3" />
              </button>
              <button
                disabled={isSelectedLocked}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isSelectedLocked) onMoveNode(selectedNodeId, 'down');
                }}
                title={isSelectedLocked ? 'Element or container is locked' : 'Move Down / Jump layout (Alt+↓)'}
                className={`h-6 w-6 inline-flex items-center justify-center rounded-md transition-colors ${
                  isSelectedLocked
                    ? 'opacity-30 cursor-not-allowed text-slate-400'
                    : 'hover:bg-slate-100 dark:hover:bg-[#141724] text-slate-600 dark:text-slate-300 hover:text-[#635BFF] cursor-pointer'
                }`}
              >
                <ArrowDown className="h-3 w-3" />
              </button>

              {/* Jump to section dropdown */}
              <div className="relative" ref={jumpMenuRef}>
                <button
                  disabled={isSelectedLocked}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSelectedLocked) setIsJumpMenuOpen((v) => !v);
                  }}
                  title={isSelectedLocked ? 'Element or container is locked' : 'Jump to another layout section'}
                  className={`h-6 w-6 inline-flex items-center justify-center rounded-md transition-colors ${
                    isSelectedLocked
                      ? 'opacity-30 cursor-not-allowed text-slate-400'
                      : isJumpMenuOpen
                        ? 'bg-[#635BFF]/20 text-[#635BFF] dark:text-[#A5AEFD]'
                        : 'hover:bg-slate-100 dark:hover:bg-[#141724] text-slate-600 dark:text-slate-300 hover:text-[#635BFF] cursor-pointer'
                  }`}
                >
                  <ArrowRightLeft className="h-3 w-3" />
                </button>

                {!isSelectedLocked && isJumpMenuOpen && (
                  <div className="absolute left-0 top-7 z-50 w-52 py-1 bg-white dark:bg-[#0F111A] rounded-lg border border-slate-200 dark:border-[#24293D] shadow-xl text-[11px] animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto">
                    <div className="px-2 py-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-[#24293D]/60 mb-0.5">
                      Jump to Layout Section
                    </div>
                    {availableSections.length === 0 ? (
                      <div className="px-2 py-2 text-slate-400 text-center text-[10px]">
                        No other layout sections
                      </div>
                    ) : (
                      availableSections.map((sec) => (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onReparentNode?.(selectedNodeId, sec.id, 'inside');
                            setIsJumpMenuOpen(false);
                          }}
                          className="w-full px-2 py-1 text-left flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-[#1C2030] text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                          style={{ paddingLeft: `${sec.depth * 8 + 8}px` }}
                        >
                          <Square className="h-2.5 w-2.5 text-[#635BFF]" />
                          <span className="truncate">{sec.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <button
                disabled={isSelectedLocked}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isSelectedLocked) onDuplicateNode(selectedNodeId);
                }}
                title={isSelectedLocked ? 'Element or container is locked' : 'Duplicate'}
                className={`h-6 w-6 inline-flex items-center justify-center rounded-md transition-colors ${
                  isSelectedLocked
                    ? 'opacity-30 cursor-not-allowed text-slate-400'
                    : 'hover:bg-slate-100 dark:hover:bg-[#141724] text-slate-600 dark:text-slate-300 hover:text-[#22D3EE] cursor-pointer'
                }`}
              >
                <Copy className="h-3 w-3" />
              </button>
              <button
                disabled={isSelectedLocked}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isSelectedLocked) onDeleteNode(selectedNodeId);
                }}
                title={isSelectedLocked ? 'Element or container is locked' : 'Delete'}
                className={`h-6 w-6 inline-flex items-center justify-center rounded-md transition-colors ${
                  isSelectedLocked
                    ? 'opacity-30 cursor-not-allowed text-slate-400'
                    : 'hover:bg-rose-500 hover:text-white text-rose-500 cursor-pointer'
                }`}
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
        className={`relative transition-all duration-200 min-h-[650px] h-auto shrink-0 bg-white dark:bg-[#0F111A] shadow-2xl shadow-slate-300/40 dark:shadow-[0_30px_60px_-15px_rgba(99,91,255,0.25)] rounded-2xl border ${
          isDragOverCanvas
            ? 'border-2 border-[#635BFF] ring-4 ring-[#635BFF]/25'
            : 'border-slate-200/80 dark:border-[#24293D]'
        } overflow-hidden flex flex-col ${viewportWidthClass}`}
      >
        {/* Top gradient accent bar inside the canvas */}
        <div className="h-[2px] w-full bg-gradient-to-r from-[#635BFF] via-[#8B5CF6] to-[#22D3EE] shrink-0 rounded-t-2xl" />

        {/* Drop Zone Visual Overlay when dragging component over canvas */}
        {isDragOverCanvas && (
          <div className="absolute inset-0 z-40 bg-gradient-to-br from-[#635BFF]/10 via-[#8B5CF6]/10 to-[#22D3EE]/10 backdrop-blur-[2px] pointer-events-none flex items-center justify-center border-2 border-dashed border-[#635BFF] rounded-2xl">
            <div className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#635BFF] to-[#8B5CF6] text-white text-xs font-bold shadow-2xl shadow-[#635BFF]/40 flex items-center gap-2 animate-pulse">
              <Plus className="h-4 w-4" />
              <span>Drop to insert component</span>
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
            onMoveNode={onMoveNode}
            onReparentNode={onReparentNode}
          />
        ) : (
          <div className="flex-1 p-16 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#635BFF] via-[#8B5CF6] to-[#22D3EE] p-[2px] shadow-lg shadow-[#635BFF]/30">
                <div className="h-full w-full rounded-2xl bg-white dark:bg-[#0F111A] flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-[#635BFF]" />
                </div>
              </div>
              <div className="absolute -inset-2 rounded-3xl bg-[#635BFF]/20 blur-xl -z-10" />
            </div>
            <div className="max-w-xs">
              <h4 className="font-bold text-[15px] text-slate-900 dark:text-white">Empty canvas</h4>
              <p className="text-[12px] text-slate-500 mt-1.5 leading-relaxed">
                Drag components from the left palette or use the AI command bar to start architecting your page.
              </p>
            </div>
            <Button
              size="sm"
              variant="default"
              onClick={onOpenAddModal}
              leftIcon={<MousePointer2 className="h-3.5 w-3.5" />}
              className="shadow-md shadow-[#635BFF]/30"
            >
              Browse components
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}