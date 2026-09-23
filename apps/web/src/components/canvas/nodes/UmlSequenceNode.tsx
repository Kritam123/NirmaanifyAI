'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { CanvasNodeData } from '@nirmaanify/types';
import { User, Server } from 'lucide-react';

export const UmlSequenceNode = memo(({ data, selected }: NodeProps<any>) => {
  const nodeData = data as CanvasNodeData;
  const isActor = nodeData.stereotype === '<<actor>>' || nodeData.category === 'compute';

  return (
    <div className={`relative flex flex-col items-center select-none ${selected ? 'ring-2 ring-[#635BFF] rounded-lg p-1' : ''}`}>
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-2 !h-2 !bg-[#635BFF] opacity-0 hover:opacity-100"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2 !h-2 !bg-[#635BFF] opacity-0 hover:opacity-100"
      />

      {/* Participant Box */}
      <div className="px-4 py-2 rounded border border-slate-300 dark:border-[#2D334D] bg-white dark:bg-[#141724] shadow-sm flex items-center gap-2">
        {isActor ? (
          <User className="h-4 w-4 text-blue-500" />
        ) : (
          <Server className="h-4 w-4 text-indigo-500" />
        )}
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
          {nodeData.label || 'Participant'}
        </span>
      </div>

      {/* Dashed Lifeline */}
      <div className="w-0.5 h-64 border-l-2 border-dashed border-slate-300 dark:border-[#2D334D] my-1 relative">
        {/* Activation Bar */}
        <div className="absolute top-10 -left-1.5 w-3 h-20 bg-slate-200 dark:bg-[#1E2337] border border-slate-400 dark:border-[#3D4566] rounded-sm" />
      </div>
    </div>
  );
});

UmlSequenceNode.displayName = 'UmlSequenceNode';
