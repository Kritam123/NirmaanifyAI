'use client';

import React, { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { CanvasNodeData } from '@nirmaanify/types';

export const TextAnnotationNode = memo(({ data, selected }: NodeProps<any>) => {
  const nodeData = data as CanvasNodeData;

  return (
    <div
      className={`px-3 py-1.5 select-none transition-all duration-200 ${
        selected ? 'ring-2 ring-[#635BFF] ring-offset-2 rounded' : ''
      }`}
    >
      <div className="text-base font-bold text-slate-800 dark:text-slate-100">
        {nodeData.label || 'Text Annotation'}
      </div>
      {nodeData.subtitle && (
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {nodeData.subtitle}
        </div>
      )}
    </div>
  );
});

TextAnnotationNode.displayName = 'TextAnnotationNode';
