'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ComponentNode } from '@nirmaanify/types';
import * as LucideIcons from 'lucide-react';
import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  Square,
  ArrowUp,
  ArrowDown,
  ArrowRightLeft,
  GripVertical,
} from 'lucide-react';
import {
  canAcceptChildren,
  isDescendant,
  getAllLayoutContainers,
  findNode,
  findParentNode,
} from '@nirmaanify/component-registry';

interface LayersPanelProps {
  rootNode: ComponentNode;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onToggleLockNode: (id: string) => void;
  onToggleHideNode: (id: string) => void;
  onCollapse?: () => void;
  onMoveNode?: (id: string, direction: 'up' | 'down') => void;
  onReparentNode?: (
    sourceId: string,
    targetId: string,
    position: 'before' | 'after' | 'inside'
  ) => void;
}

export function LayersPanel({
  rootNode,
  selectedNodeId,
  onSelectNode,
  onDeleteNode,
  onDuplicateNode,
  onToggleLockNode,
  onToggleHideNode,
  onMoveNode,
  onReparentNode,
}: LayersPanelProps) {
  // Set of collapsed node IDs. Nodes with children are expanded by default.
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(() => new Set());

  // Drag and Drop state
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    id: string;
    position: 'before' | 'after' | 'inside';
  } | null>(null);

  // Jump to Section popover state
  const [isJumpMenuOpen, setIsJumpMenuOpen] = useState(false);
  const jumpMenuRef = useRef<HTMLDivElement>(null);

  // Auto-expand ancestors when selectedNodeId changes so that the selected layer is always visible
  useEffect(() => {
    if (!selectedNodeId || !rootNode) return;

    const findAncestors = (curr: ComponentNode, targetId: string, path: string[]): string[] | null => {
      if (curr.id === targetId) return path;
      const children = getNodeChildren(curr);
      for (const child of children) {
        const res = findAncestors(child, targetId, [...path, curr.id]);
        if (res) return res;
      }
      return null;
    };

    const ancestors = findAncestors(rootNode, selectedNodeId, []);
    if (ancestors && ancestors.length > 0) {
      setCollapsedNodeIds((prev) => {
        let changed = false;
        const next = new Set(prev);
        for (const ancestorId of ancestors) {
          if (next.has(ancestorId)) {
            next.delete(ancestorId);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }
  }, [selectedNodeId, rootNode]);

  // Click outside to close jump menu
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

  const handleToggleCollapse = useCallback((id: string) => {
    setCollapsedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleExpandAll = useCallback(() => {
    setCollapsedNodeIds(new Set());
  }, []);

  const handleCollapseAll = useCallback(() => {
    if (!rootNode) return;
    const allIds = getAllExpandableIds(rootNode);
    // Keep rootNode open so top-level sections remain visible
    const childExpandableIds = allIds.filter((id) => id !== rootNode.id);
    const allChildrenAlreadyCollapsed =
      childExpandableIds.length > 0 &&
      childExpandableIds.every((id) => collapsedNodeIds.has(id));

    if (allChildrenAlreadyCollapsed) {
      setCollapsedNodeIds(new Set(allIds));
    } else {
      setCollapsedNodeIds(new Set(childExpandableIds));
    }
  }, [rootNode, collapsedNodeIds]);

  const totalNodes = useMemo(() => countNodes(rootNode), [rootNode]);

  // Find selected node details and parent
  const selectedNode = useMemo(() => {
    if (!rootNode || !selectedNodeId) return null;
    return findNode(rootNode, selectedNodeId);
  }, [rootNode, selectedNodeId]);

  const selectedParent = useMemo(() => {
    if (!rootNode || !selectedNodeId) return null;
    return findParentNode(rootNode, selectedNodeId);
  }, [rootNode, selectedNodeId]);

  const isSelectedLocked = Boolean(selectedNode?.isLocked || selectedParent?.isLocked);

  // Filter available layout sections for jump menu (must not be locked or descendant)
  const availableSections = useMemo(() => {
    if (!rootNode || !selectedNodeId) return [];
    return getAllLayoutContainers(rootNode).filter(
      (c) => c.id !== selectedNodeId && !c.isLocked && !isDescendant(rootNode, selectedNodeId, c.id)
    );
  }, [rootNode, selectedNodeId]);

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, node: ComponentNode) => {
    const parent = findParentNode(rootNode, node.id);
    if (node.id === rootNode.id || node.isLocked || parent?.isLocked) return;
    e.stopPropagation();
    e.dataTransfer.setData('application/nirmaanify-layer-id', node.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedNodeId(node.id);
  };

  const handleDragOver = (e: React.DragEvent, targetNode: ComponentNode) => {
    e.preventDefault();
    e.stopPropagation();

    const activeDragId =
      draggedNodeId ||
      e.dataTransfer.getData('application/nirmaanify-layer-id') ||
      e.dataTransfer.getData('application/nirmaanify-node-id');

    if (!activeDragId || activeDragId === targetNode.id) return;
    if (isDescendant(rootNode, activeDragId, targetNode.id)) return;

    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const height = rect.height;
    const isContainer = canAcceptChildren(targetNode.type);

    let position: 'before' | 'after' | 'inside';
    if (isContainer) {
      if (offsetY < height * 0.25) position = 'before';
      else if (offsetY > height * 0.75) position = 'after';
      else position = 'inside';
    } else {
      position = offsetY < height * 0.5 ? 'before' : 'after';
    }

    // Do not allow dropping inside a locked container
    if (position === 'inside' && targetNode.isLocked) {
      return;
    }

    // Do not allow dropping as sibling into a locked parent
    if (position === 'before' || position === 'after') {
      const targetParent = findParentNode(rootNode, targetNode.id);
      if (targetParent?.isLocked) {
        return;
      }
    }

    if (dropTarget?.id !== targetNode.id || dropTarget?.position !== position) {
      setDropTarget({ id: targetNode.id, position });
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent, targetNode: ComponentNode) => {
    e.preventDefault();
    e.stopPropagation();

    const sourceId =
      draggedNodeId ||
      e.dataTransfer.getData('application/nirmaanify-layer-id') ||
      e.dataTransfer.getData('application/nirmaanify-node-id');

    if (sourceId && sourceId !== targetNode.id && dropTarget) {
      onReparentNode?.(sourceId, targetNode.id, dropTarget.position);
    }
    setDropTarget(null);
    setDraggedNodeId(null);
  };

  const handleDragEnd = () => {
    setDropTarget(null);
    setDraggedNodeId(null);
  };

  const renderTreeItem = (node: ComponentNode, depth: number = 0, parentNode?: ComponentNode) => {
    const isSelected = selectedNodeId === node.id;
    const children = getNodeChildren(node);
    const hasChildren = children.length > 0;
    const isCollapsed = collapsedNodeIds.has(node.id);
    const NodeIcon = getNodeIcon(node.type);

    const isDragSource = draggedNodeId === node.id;
    const isDropTarget = dropTarget?.id === node.id;
    const isParentLocked = Boolean(parentNode?.isLocked);
    const isNodeOrParentLocked = Boolean(node.isLocked || isParentLocked);
    const canDrag = node.id !== rootNode.id && !node.isLocked && !isParentLocked;

    return (
      <div key={node.id} className="space-y-0.5">
        <div
          role="treeitem"
          aria-expanded={hasChildren ? !isCollapsed : undefined}
          aria-selected={isSelected}
          tabIndex={0}
          draggable={canDrag}
          onDragStart={(e) => handleDragStart(e, node)}
          onDragOver={(e) => handleDragOver(e, node)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node)}
          onDragEnd={handleDragEnd}
          onClick={() => onSelectNode(node.id)}
          onDoubleClick={(e) => {
            if (hasChildren) {
              e.stopPropagation();
              handleToggleCollapse(node.id);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' && hasChildren && isCollapsed) {
              e.preventDefault();
              e.stopPropagation();
              handleToggleCollapse(node.id);
            } else if (e.key === 'ArrowLeft' && hasChildren && !isCollapsed) {
              e.preventDefault();
              e.stopPropagation();
              handleToggleCollapse(node.id);
            } else if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectNode(node.id);
            }
          }}
          style={{ paddingLeft: `${depth * 10 + 6}px` }}
          className={`group relative flex items-center justify-between py-1.5 pr-1.5 rounded-md text-[11.5px] cursor-pointer transition-all outline-none focus-visible:ring-1 focus-visible:ring-[#635BFF] ${
            isDragSource ? 'opacity-40 scale-[0.98]' : ''
          } ${
            isDropTarget && dropTarget.position === 'inside'
              ? 'ring-2 ring-[#635BFF] bg-[#635BFF]/15 dark:bg-[#635BFF]/30 font-semibold text-[#635BFF]'
              : isSelected
              ? 'bg-gradient-to-r from-[#635BFF] to-[#8B5CF6] text-white font-semibold shadow-sm shadow-[#635BFF]/30'
              : node.isHidden
              ? 'opacity-50 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-[#141724]'
              : 'hover:bg-slate-100 dark:hover:bg-[#141724] text-slate-700 dark:text-slate-300'
          }`}
        >
          {/* Drop indicator: Before line */}
          {isDropTarget && dropTarget.position === 'before' && (
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#635BFF] z-40 shadow-xs shadow-[#635BFF] flex items-center pointer-events-none">
              <span className="h-1.5 w-1.5 rounded-full bg-[#635BFF] -ml-0.5 border border-white dark:border-[#0F111A]" />
            </div>
          )}

          {/* Drop indicator: After line */}
          {isDropTarget && dropTarget.position === 'after' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#635BFF] z-40 shadow-xs shadow-[#635BFF] flex items-center pointer-events-none">
              <span className="h-1.5 w-1.5 rounded-full bg-[#635BFF] -ml-0.5 border border-white dark:border-[#0F111A]" />
            </div>
          )}

          {/* Left: Drag grip, Chevron, Type Icon, Full Name, Badges */}
          <div className="flex items-center gap-1.5 overflow-hidden min-w-0 flex-1 mr-1">
            {canDrag && (
              <span
                className={`opacity-0 group-hover:opacity-60 cursor-grab active:cursor-grabbing shrink-0 -mr-0.5 ${
                  isSelected ? 'text-white' : 'text-slate-400'
                }`}
                title="Drag to reorder"
              >
                <GripVertical className="h-3 w-3" />
              </span>
            )}

            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleCollapse(node.id);
                }}
                className={`h-4 w-4 shrink-0 -ml-0.5 flex items-center justify-center rounded transition-colors ${
                  isSelected
                    ? 'text-white/80 hover:text-white hover:bg-white/20'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-700/60'
                }`}
                title={isCollapsed ? 'Expand layer' : 'Collapse layer'}
                aria-label={isCollapsed ? `Expand ${node.name || node.type}` : `Collapse ${node.name || node.type}`}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-3 w-3 shrink-0" />
                ) : (
                  <ChevronDown className="h-3 w-3 shrink-0" />
                )}
              </button>
            ) : (
              <span className="w-4 shrink-0 -ml-0.5" />
            )}

            <span
              className={`shrink-0 ${
                isSelected
                  ? 'text-white/90'
                  : canAcceptChildren(node.type)
                  ? 'text-[#635BFF] dark:text-[#A5AEFD]'
                  : 'text-slate-400'
              }`}
            >
              <NodeIcon className="h-3.5 w-3.5" />
            </span>

            <span
              className={`truncate font-medium text-[11.5px] ${
                isSelected
                  ? 'text-white'
                  : 'text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
              }`}
              title={node.name || node.type}
            >
              {node.name || node.type}
            </span>

            {node.isLocked && (
              <span
                title="Locked layer"
                className={`shrink-0 ml-0.5 ${isSelected ? 'text-amber-200' : 'text-amber-500 dark:text-amber-400'}`}
              >
                <Lock className="h-2.5 w-2.5" />
              </span>
            )}

            {node.isHidden && (
              <span
                title="Hidden on canvas"
                className={`shrink-0 ml-0.5 ${isSelected ? 'text-amber-200' : 'text-slate-400 dark:text-slate-500'}`}
              >
                <EyeOff className="h-2.5 w-2.5" />
              </span>
            )}

            {hasChildren && isCollapsed && (
              <span
                className={`shrink-0 ml-1 px-1 py-0.2 text-[9px] font-mono rounded ${
                  isSelected
                    ? 'bg-white/20 text-white/90'
                    : 'bg-slate-100 dark:bg-[#1A1D2B] text-slate-400 dark:text-slate-500'
                }`}
                title={`${children.length} nested layer${children.length > 1 ? 's' : ''}`}
              >
                {children.length}
              </span>
            )}
          </div>

          {/* Right: Quick toggles (Lock, Hide, Delete on hover) */}
          <div
            className={`flex items-center gap-0.5 shrink-0 transition-opacity ${
              node.isLocked || node.isHidden
                ? 'opacity-100'
                : isSelected
                ? 'opacity-90 group-hover:opacity-100'
                : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <IconBtn
              isSelected={isSelected}
              title={node.isLocked ? 'Unlock layer' : 'Lock layer'}
              onClick={(e) => {
                e.stopPropagation();
                onToggleLockNode(node.id);
              }}
            >
              {node.isLocked ? (
                <Lock className="h-3 w-3 text-amber-300" />
              ) : (
                <Unlock className="h-3 w-3" />
              )}
            </IconBtn>
            <IconBtn
              isSelected={isSelected}
              title={node.isHidden ? 'Show layer' : 'Hide layer'}
              onClick={(e) => {
                e.stopPropagation();
                onToggleHideNode(node.id);
              }}
            >
              {node.isHidden ? (
                <EyeOff className="h-3 w-3 text-amber-500 dark:text-amber-400" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </IconBtn>
            {node.id !== rootNode.id && (
              <IconBtn
                isSelected={isSelected}
                disabled={isNodeOrParentLocked}
                title={isNodeOrParentLocked ? 'Element or container is locked' : 'Delete layer'}
                danger
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNode(node.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </IconBtn>
            )}
          </div>
        </div>

        {hasChildren && !isCollapsed && (
          <div className="space-y-0.5">
            {children.map((child) => renderTreeItem(child, depth + 1, node))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0F111A] border-r border-slate-200 dark:border-[#24293D] w-[285px] shrink-0 select-none">
      {/* Header bar */}
      <div className="px-3 py-2.5 border-b border-slate-200 dark:border-[#24293D] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-[#635BFF]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Layers
          </span>
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 tabular-nums">
            ({totalNodes})
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={handleExpandAll}
            title="Expand all layers"
            aria-label="Expand all layers"
            className="h-5 w-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1C2030] transition-colors"
          >
            <ChevronsUpDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCollapseAll}
            title="Collapse all layers"
            aria-label="Collapse all layers"
            className="h-5 w-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1C2030] transition-colors"
          >
            <ChevronsDownUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Contextual Action Bar when a layer is selected */}
      {selectedNode && selectedNode.id !== rootNode.id && (
        <div className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#141724] border-b border-slate-200 dark:border-[#24293D] flex items-center justify-between gap-2 text-[11px] animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span
              className="text-[11px] font-medium text-slate-700 dark:text-slate-200 truncate"
              title={selectedNode.name || selectedNode.type}
            >
              {selectedNode.name || selectedNode.type}
            </span>
            {isSelectedLocked && (
              <span
                title={selectedNode.isLocked ? 'Element is locked' : 'Container is locked'}
                className="shrink-0 text-amber-500 dark:text-amber-400"
              >
                <Lock className="h-3 w-3" />
              </span>
            )}
          </div>

          {/* Simple Icon-only Action Bar */}
          <div className="flex items-center gap-0.5 shrink-0 bg-white dark:bg-[#0F111A] p-0.5 rounded-lg border border-slate-200 dark:border-[#24293D] shadow-2xs">
            <button
              type="button"
              disabled={isSelectedLocked}
              onClick={() => onMoveNode?.(selectedNode.id, 'up')}
              title={isSelectedLocked ? 'Element or container is locked' : 'Move Up (Alt+↑)'}
              className="h-6 w-6 rounded flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#1C2030] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ArrowUp className="h-3 w-3" />
            </button>
            <button
              type="button"
              disabled={isSelectedLocked}
              onClick={() => onMoveNode?.(selectedNode.id, 'down')}
              title={isSelectedLocked ? 'Element or container is locked' : 'Move Down (Alt+↓)'}
              className="h-6 w-6 rounded flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#1C2030] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ArrowDown className="h-3 w-3" />
            </button>

            {/* Jump to Section Dropdown */}
            <div className="relative" ref={jumpMenuRef}>
              <button
                type="button"
                disabled={isSelectedLocked}
                onClick={() => {
                  if (!isSelectedLocked) {
                    setIsJumpMenuOpen((v) => !v);
                  }
                }}
                title={isSelectedLocked ? 'Element or container is locked' : 'Jump to section...'}
                className={`h-6 w-6 rounded flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-[#635BFF] hover:bg-slate-100 dark:hover:bg-[#1C2030] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer ${
                  isJumpMenuOpen ? 'text-[#635BFF] bg-[#635BFF]/10' : ''
                }`}
              >
                <ArrowRightLeft className="h-3 w-3" />
              </button>

              {!isSelectedLocked && isJumpMenuOpen && (
                <div className="absolute right-0 top-7 z-50 w-52 py-1 bg-white dark:bg-[#0F111A] rounded-lg border border-slate-200 dark:border-[#24293D] shadow-xl text-[11px] animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto">
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
                        onClick={() => {
                          onReparentNode?.(selectedNode.id, sec.id, 'inside');
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

            {/* Subtle Divider */}
            <div className="h-3.5 w-[1px] bg-slate-200 dark:bg-[#24293D] mx-0.5" />

            {/* Visibility Toggle Button */}
            <button
              type="button"
              onClick={() => onToggleHideNode(selectedNode.id)}
              title={selectedNode.isHidden ? 'Show layer on canvas' : 'Hide layer on canvas'}
              className={`h-6 w-6 rounded flex items-center justify-center transition-colors cursor-pointer ${
                selectedNode.isHidden
                  ? 'text-amber-500 hover:text-amber-600 bg-amber-500/10'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#1C2030]'
              }`}
            >
              {selectedNode.isHidden ? (
                <EyeOff className="h-3 w-3 text-amber-500" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </button>

            {/* Duplicate Button */}
            <button
              type="button"
              disabled={isSelectedLocked}
              onClick={() => onDuplicateNode(selectedNode.id)}
              title={isSelectedLocked ? 'Element or container is locked' : 'Duplicate layer (Ctrl+D)'}
              className="h-6 w-6 rounded flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-[#635BFF] hover:bg-slate-100 dark:hover:bg-[#1C2030] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Copy className="h-3 w-3" />
            </button>

            {/* Delete Button */}
            <button
              type="button"
              disabled={isSelectedLocked}
              onClick={() => onDeleteNode(selectedNode.id)}
              title={isSelectedLocked ? 'Element or container is locked' : 'Delete layer (Del)'}
              className="h-6 w-6 rounded flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Layers list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {rootNode ? (
          renderTreeItem(rootNode)
        ) : (
          <div className="p-6 text-center">
            <Layers className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-[11px] text-slate-400">No active layers</p>
          </div>
        )}
      </div>
    </div>
  );
}

function IconBtn({
  isSelected,
  title,
  onClick,
  danger,
  disabled,
  children,
}: {
  isSelected: boolean;
  title: string;
  onClick: (e: React.MouseEvent) => void;
  danger?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const base = disabled
    ? 'opacity-30 cursor-not-allowed text-slate-400'
    : isSelected
      ? 'hover:bg-white/20 text-white cursor-pointer'
      : danger
        ? 'hover:bg-rose-500 hover:text-white text-rose-500 cursor-pointer'
        : 'hover:bg-black/10 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 cursor-pointer';
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      title={title}
      aria-label={title}
      className={`h-5 w-5 inline-flex items-center justify-center rounded transition-colors ${base}`}
    >
      {children}
    </button>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getNodeIcon(type: string): React.ComponentType<{ className?: string }> {
  if (!type) return Square;
  const capitalized = capitalize(type);
  if ((LucideIcons as any)[capitalized]) {
    return (LucideIcons as any)[capitalized];
  }
  const pascal = type
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
  if ((LucideIcons as any)[pascal]) {
    return (LucideIcons as any)[pascal];
  }
  return Square;
}

function getNodeChildren(node: ComponentNode): ComponentNode[] {
  if (!node) return [];
  const list: ComponentNode[] = [];
  if (Array.isArray(node.children)) {
    list.push(...node.children);
  }
  if (node.slots && typeof node.slots === 'object') {
    for (const arr of Object.values(node.slots)) {
      if (Array.isArray(arr)) {
        list.push(...arr);
      }
    }
  }
  return list;
}

function countNodes(node: ComponentNode): number {
  if (!node) return 0;
  let total = 1;
  const children = getNodeChildren(node);
  for (const child of children) {
    total += countNodes(child);
  }
  return total;
}

function getAllExpandableIds(node: ComponentNode): string[] {
  const ids: string[] = [];
  const traverse = (n: ComponentNode) => {
    const children = getNodeChildren(n);
    if (children.length > 0) {
      ids.push(n.id);
      children.forEach(traverse);
    }
  };
  if (node) traverse(node);
  return ids;
}