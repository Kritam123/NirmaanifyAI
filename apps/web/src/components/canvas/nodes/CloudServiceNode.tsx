'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps, NodeToolbar } from '@xyflow/react';
import { CanvasNodeData } from '@nirmaanify/types';
import { CloudIconRenderer } from '../icons/CloudIcons';
import { useCanvasActions } from '../CanvasActionsContext';
import { Unlink, Link2 } from 'lucide-react';

export const CloudServiceNode = memo(({ id, data, selected }: NodeProps<any>) => {
  const nodeData = data as CanvasNodeData;
  const provider = nodeData.provider || 'generic';
  const status = nodeData.status || 'active';
  const canvasActions = useCanvasActions();

  const outgoingEdges = React.useMemo(
    () => canvasActions?.allEdges.filter((e) => e.source === id) || [],
    [canvasActions?.allEdges, id],
  );
  const incomingEdges = React.useMemo(
    () => canvasActions?.allEdges.filter((e) => e.target === id) || [],
    [canvasActions?.allEdges, id],
  );
  const totalConnections = outgoingEdges.length + incomingEdges.length;

  const firstTargetNode = React.useMemo(() => {
    if (outgoingEdges.length === 0) return null;
    return canvasActions?.allNodes.find((n) => n.id === outgoingEdges[0].target);
  }, [outgoingEdges, canvasActions?.allNodes]);

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
      {/* Node Toolbar with Quick Detach Option when Selected */}
      {selected && totalConnections > 0 && (
        <NodeToolbar
          position={Position.Top}
          isVisible={selected}
          className="flex items-center gap-1.5 p-1 rounded-xl bg-[#141724]/95 border border-[#2E354F] shadow-2xl backdrop-blur-md mb-2 nodrag"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (outgoingEdges.length > 0) {
                canvasActions?.onDetachEdge(outgoingEdges[0].id);
              } else if (incomingEdges.length > 0) {
                canvasActions?.onDetachEdge(incomingEdges[0].id);
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 text-[11px] font-semibold transition-all shadow-sm"
            title={
              outgoingEdges.length > 0
                ? `Detach connection pointing to "${firstTargetNode?.data?.label || 'Target'}"`
                : 'Detach connection'
            }
          >
            <Unlink className="h-3 w-3" />
            <span>
              {outgoingEdges.length === 1 && firstTargetNode
                ? `Detach from ${firstTargetNode.data?.label || 'Target'}`
                : `Detach Connection${totalConnections > 1 ? ` (${totalConnections})` : ''}`}
            </span>
          </button>
          {totalConnections > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                canvasActions?.onDetachNodeEdges(id);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1F2438] hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-[#2E354F] text-[10px] font-medium transition-colors"
              title="Detach all connections attached to this service"
            >
              <span>Detach All</span>
            </button>
          )}
        </NodeToolbar>
      )}

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

      {/* Header with Provider Badge, Connection count and Status */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className={`text-[9px] font-mono uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded border truncate ${
              providerBadgeColors[provider] || providerBadgeColors.generic
            }`}
          >
            {provider}
          </span>
          {outgoingEdges.length > 0 && (
            <span
              className="flex items-center gap-0.5 text-[9px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-1 py-0.5 rounded shrink-0"
              title={`Pointing to ${outgoingEdges.length} service(s)`}
            >
              <Link2 className="h-2.5 w-2.5" />
              <span>➔ {outgoingEdges.length}</span>
            </span>
          )}
        </div>
        <span className="flex items-center gap-1 shrink-0">
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
