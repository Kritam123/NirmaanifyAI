'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { CanvasNodeData } from '@nirmaanify/types';
import { Database, Key } from 'lucide-react';

export const DatabaseTableNode = memo(({ data, selected }: NodeProps<any>) => {
  const nodeData = data as CanvasNodeData;
  const columns = nodeData.columns || [];

  return (
    <div
      className={`group relative rounded-lg border min-w-[210px] shadow-sm select-none transition-all duration-200 overflow-hidden font-mono ${
        selected
          ? 'border-[#635BFF] ring-2 ring-[#635BFF]/30 shadow-md bg-white dark:bg-[#141724]'
          : 'border-slate-300 dark:border-[#2E354F] bg-white dark:bg-[#0F111A]'
      }`}
    >
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

      {/* Table Header */}
      <div className="bg-sky-50 dark:bg-[#152033] px-3 py-2 flex items-center gap-2 border-b border-sky-100 dark:border-[#1E304F]">
        <Database className="h-4 w-4 text-sky-500 shrink-0" />
        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
          {nodeData.label || 'table_name'}
        </span>
      </div>

      {/* Columns List */}
      <div className="divide-y divide-slate-100 dark:divide-[#1A1F33]">
        {columns.length === 0 ? (
          <div className="px-3 py-2 text-[10px] text-slate-400 italic">No columns defined</div>
        ) : (
          columns.map((col, idx) => (
            <div
              key={idx}
              className="px-3 py-1.5 flex items-center justify-between gap-3 text-[11px] hover:bg-slate-50 dark:hover:bg-[#141724]"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                {col.isPrimary && <Key className="h-3 w-3 text-amber-500 shrink-0" />}
                {col.isForeign && <span className="text-[9px] text-blue-400 font-bold">FK</span>}
                <span className={`truncate ${col.isPrimary ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                  {col.name}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">{col.type}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

DatabaseTableNode.displayName = 'DatabaseTableNode';
