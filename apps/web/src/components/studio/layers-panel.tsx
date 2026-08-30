'use client';

import React from 'react';
import { ComponentNode } from '@nirmaanify/types';
import { Layers, Eye, EyeOff, Lock, Unlock, Trash2, Copy, ChevronRight, ChevronDown } from 'lucide-react';

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

    return (
      <div key={node.id} className="space-y-0.5">
        <div
          onClick={() => onSelectNode(node.id)}
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
          className={`flex items-center justify-between py-1.5 pr-2 rounded-lg text-xs cursor-pointer group transition-all ${
            isSelected
              ? 'bg-[#635BFF] text-white font-semibold shadow-sm'
              : 'hover:bg-slate-100 dark:hover:bg-[#161926] text-slate-700 dark:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            {hasChildren ? (
              <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
            ) : (
              <span className="w-3" />
            )}
            <span className="truncate">{node.name || node.type}</span>
            <span
              className={`text-[9px] uppercase px-1 py-0.2 rounded font-mono shrink-0 ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              {node.type}
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLockNode(node.id);
              }}
              title={node.isLocked ? 'Unlock' : 'Lock'}
              className="p-1 hover:bg-black/10 rounded"
            >
              {node.isLocked ? <Lock className="h-3 w-3 text-amber-300" /> : <Unlock className="h-3 w-3" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleHideNode(node.id);
              }}
              title={node.isHidden ? 'Show' : 'Hide'}
              className="p-1 hover:bg-black/10 rounded"
            >
              {node.isHidden ? <EyeOff className="h-3 w-3 text-slate-400" /> : <Eye className="h-3 w-3" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicateNode(node.id);
              }}
              title="Duplicate"
              className="p-1 hover:bg-black/10 rounded"
            >
              <Copy className="h-3 w-3" />
            </button>
            {node.id !== rootNode.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNode(node.id);
                }}
                title="Delete"
                className="p-1 hover:bg-rose-500 hover:text-white rounded"
              >
                <Trash2 className="h-3 w-3" />
              </button>
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
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-[#0A0D16] border-r border-slate-200 dark:border-[#24293D] w-64 shrink-0 select-none">
      <div className="p-3 border-b border-slate-200 dark:border-[#24293D] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#635BFF]" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Layers & Tree
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {rootNode ? (
          renderTreeItem(rootNode)
        ) : (
          <div className="p-4 text-center text-xs text-slate-400">No active layers</div>
        )}
      </div>
    </div>
  );
}
