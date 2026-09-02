'use client';

import React from 'react';
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
  Square,
} from 'lucide-react';
import { Badge } from '@nirmaanify/ui';

interface LayersPanelProps {
  rootNode: ComponentNode;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  onToggleLockNode: (id: string) => void;
  onToggleHideNode: (id: string) => void;
}

export function LayersPanel({
  rootNode,
  selectedNodeId,
  onSelectNode,
  onDeleteNode,
  onDuplicateNode,
  onToggleLockNode,
  onToggleHideNode,
}: LayersPanelProps) {
  const renderTreeItem = (node: ComponentNode, depth: number = 0) => {
    const isSelected = selectedNodeId === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const NodeIcon = (LucideIcons as any)[capitalize(node.type)] as React.ComponentType<{ className?: string }> | undefined;

    return (
      <div key={node.id} className="space-y-0.5">
        <div
          onClick={() => onSelectNode(node.id)}
          style={{ paddingLeft: `${depth * 14 + 6}px` }}
          className={`group flex items-center justify-between py-1 pr-1 rounded-md text-[11.5px] cursor-pointer transition-all ${
            isSelected
              ? 'bg-gradient-to-r from-[#635BFF] to-[#8B5CF6] text-white font-semibold shadow-sm shadow-[#635BFF]/30'
              : 'hover:bg-slate-100 dark:hover:bg-[#141724] text-slate-700 dark:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-1 overflow-hidden">
            {hasChildren ? (
              <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
            ) : (
              <span className="w-3 shrink-0" />
            )}
            <span className={`shrink-0 ${isSelected ? 'text-white/90' : 'text-slate-400'}`}>
              {NodeIcon ? <NodeIcon className="h-3 w-3" /> : <Square className="h-3 w-3" />}
            </span>
            <span className="truncate">{node.name || node.type}</span>
          </div>

          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <IconBtn
              isSelected={isSelected}
              title={node.isLocked ? 'Unlock' : 'Lock'}
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
              title={node.isHidden ? 'Show' : 'Hide'}
              onClick={(e) => {
                e.stopPropagation();
                onToggleHideNode(node.id);
              }}
            >
              {node.isHidden ? (
                <EyeOff className="h-3 w-3 text-slate-300" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </IconBtn>
            <IconBtn
              isSelected={isSelected}
              title="Duplicate"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicateNode(node.id);
              }}
            >
              <Copy className="h-3 w-3" />
            </IconBtn>
            {node.id !== rootNode.id && (
              <IconBtn
                isSelected={isSelected}
                title="Delete"
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

        {hasChildren && (
          <div className="space-y-0.5">
            {node.children!.map((child) => renderTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0F111A] border-r border-slate-200 dark:border-[#24293D] w-[252px] shrink-0 select-none">
      <div className="px-3 py-2.5 border-b border-slate-200 dark:border-[#24293D] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-[#635BFF]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Layers
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 tabular-nums">
          {countNodes(rootNode)} nodes
        </span>
      </div>

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
  children,
}: {
  isSelected: boolean;
  title: string;
  onClick: (e: React.MouseEvent) => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  const base = isSelected
    ? 'hover:bg-white/20 text-white'
    : danger
      ? 'hover:bg-rose-500 hover:text-white text-rose-500'
      : 'hover:bg-black/10 dark:hover:bg-white/10';
  return (
    <button
      onClick={onClick}
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

function countNodes(node: ComponentNode): number {
  let total = 1;
  if (node.children) {
    for (const child of node.children) {
      total += countNodes(child);
    }
  }
  return total;
}