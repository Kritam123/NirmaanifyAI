'use client';

import React, { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { CanvasNodeData } from '@nirmaanify/types';
import { Box } from 'lucide-react';

export const SystemGroupNode = memo(({ data, selected }: NodeProps<any>) => {
  const nodeData = data as CanvasNodeData;

  return (
    <div
      className={`rounded-2xl border-2 border-dashed p-4 min-w-[320px] min-h-[220px] transition-all duration-200 select-none ${
        selected
          ? 'border-[#635BFF] bg-[#635BFF]/5 ring-2 ring-[#635BFF]/20'
          : 'border-slate-300 dark:border-[#2D334D] bg-slate-50/50 dark:bg-[#121522]/40 hover:border-slate-400 dark:hover:border-[#3D4566]'
      }`}
    >
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-200/60 dark:border-[#252A40]">
        <Box className="h-4 w-4 text-[#635BFF] shrink-0" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {nodeData.label || 'System Boundary'}
        </span>
        {nodeData.subtitle && (
          <span className="text-[10px] text-slate-400 ml-auto font-mono">
            {nodeData.subtitle}
          </span>
        )}
      </div>
    </div>
  );
});

SystemGroupNode.displayName = 'SystemGroupNode';
