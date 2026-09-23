'use client';

import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  EdgeProps,
} from '@xyflow/react';
import { CanvasEdgeData } from '@nirmaanify/types';

export const UmlEdge = memo(
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
      borderRadius: 8,
    });

    return (
      <>
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            ...style,
            stroke: selected ? '#635BFF' : (style.stroke as string) || '#64748b',
            strokeWidth: selected ? 2.5 : 1.5,
            strokeDasharray: edgeData.lineStyle === 'dashed' ? '5,5' : undefined,
          }}
        />
        {edgeData.label && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: 'all',
              }}
              className="nodrag nopan select-none px-2 py-0.5 rounded border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0F111A] text-[10px] font-mono text-slate-600 dark:text-slate-300 shadow-sm"
            >
              {edgeData.label}
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  },
);

UmlEdge.displayName = 'UmlEdge';
