'use client';

import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  EdgeProps,
} from '@xyflow/react';
import { CanvasEdgeData } from '@nirmaanify/types';

export const ArchitectureEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    data,
    markerEnd,
    selected,
  }: EdgeProps) => {
    const edgeData = (data || {}) as CanvasEdgeData;
    const [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: 12,
    });

    const labelText = edgeData.label || edgeData.protocol;

    return (
      <>
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            ...style,
            stroke: selected ? '#635BFF' : edgeData.color || (style.stroke as string) || '#6366f1',
            strokeWidth: selected ? 2.5 : edgeData.strokeWidth || 1.8,
            strokeDasharray: edgeData.lineStyle === 'dashed' ? '5,5' : edgeData.lineStyle === 'dotted' ? '2,2' : undefined,
          }}
        />
        {labelText && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: 'all',
              }}
              className="nodrag nopan select-none px-2 py-0.5 rounded-full border border-slate-200 dark:border-[#24293D] bg-white/95 dark:bg-[#0F111A]/95 text-[10px] font-mono font-medium text-slate-700 dark:text-slate-300 shadow-sm backdrop-blur-sm"
            >
              {labelText}
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  },
);

ArchitectureEdge.displayName = 'ArchitectureEdge';
