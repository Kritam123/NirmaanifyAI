'use client';

import React, { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { CanvasNodeData } from '@nirmaanify/types';

export const StickyNoteNode = memo(({ data, selected }: NodeProps<any>) => {
  const nodeData = data as CanvasNodeData;

  return (
    <div
      className={`relative w-48 min-h-[140px] p-3 shadow-md rounded-sm select-none transition-all duration-200 rotate-[-1deg] hover:rotate-0 bg-amber-100 dark:bg-amber-200/90 text-amber-950 font-sans border-t-8 border-amber-300 ${
        selected ? 'ring-2 ring-[#635BFF] ring-offset-2' : ''
      }`}
    >
      <div className="text-xs font-bold mb-1 border-b border-amber-300/60 pb-1">
        {nodeData.label || 'Architecture Note'}
      </div>
      <div className="text-[11px] leading-relaxed whitespace-pre-wrap font-mono">
        {nodeData.description || 'Note comments, architecture decisions, or team feedback here...'}
      </div>
    </div>
  );
});

StickyNoteNode.displayName = 'StickyNoteNode';
