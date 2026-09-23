'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { CanvasNodeData } from '@nirmaanify/types';
import { CloudIconRenderer } from '../icons/CloudIcons';

export const CloudServiceNode = memo(({ data, selected }: NodeProps<any>) => {
  const nodeData = data as CanvasNodeData;
  const provider = nodeData.provider || 'generic';
  const status = nodeData.status || 'active';

  const providerBadgeColors: Record<string, string> = {
    aws: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    gcp: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    azure: 'bg-sky-500/10 text-sky-500 border-sky-500/30',
    k8s: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30',
    docker: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30',
    generic: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500',
    warning: 'bg-amber-500',
    deprecated: 'bg-rose-500',
    planned: 'bg-sky-500',
  };

  return (
    <div
      className={`group relative rounded-xl border px-4 py-3 min-w-[200px] shadow-sm transition-all duration-200 select-none ${
        selected
          ? 'border-[#635BFF] ring-2 ring-[#635BFF]/30 shadow-md bg-white dark:bg-[#141724]'
          : 'border-slate-200 dark:border-[#24293D] hover:border-slate-300 dark:hover:border-[#3B4366] bg-white dark:bg-[#0F111A]'
      }`}
      style={nodeData.style ? { backgroundColor: nodeData.style.fill, borderColor: nodeData.style.stroke } : undefined}
    >
      {/* 4 Connection Handles with magnetic snap */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!w-2.5 !h-2.5 !bg-[#635BFF] !border-2 !border-white dark:!border-[#0F111A] !-top-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-2.5 !h-2.5 !bg-[#635BFF] !border-2 !border-white dark:!border-[#0F111A] !-bottom-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-2.5 !h-2.5 !bg-[#635BFF] !border-2 !border-white dark:!border-[#0F111A] !-left-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2.5 !h-2.5 !bg-[#635BFF] !border-2 !border-white dark:!border-[#0F111A] !-right-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
      />

      {/* Header with Provider Badge and Status */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className={`text-[9px] font-mono uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded border ${
            providerBadgeColors[provider] || providerBadgeColors.generic
          }`}
        >
          {provider}
        </span>
        <span className="flex items-center gap-1">
          <span className={`h-1.5 w-1.5 rounded-full ${statusColors[status] || statusColors.active}`} />
          <span className="text-[10px] text-slate-400 capitalize">{status}</span>
        </span>
      </div>

      {/* Body: Icon + Label + Subtitle */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#1A1E2E] border border-slate-100 dark:border-[#252A40] shrink-0">
          <CloudIconRenderer name={nodeData.icon || nodeData.category || 'server'} className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
            {nodeData.label || 'Untitled Service'}
          </div>
          {nodeData.subtitle && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {nodeData.subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

CloudServiceNode.displayName = 'CloudServiceNode';
