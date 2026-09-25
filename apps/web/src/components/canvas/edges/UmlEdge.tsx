'use client';

import React, { memo, useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  EdgeProps,
} from '@xyflow/react';
import { CanvasEdgeData } from '@nirmaanify/types';
import { Unlink } from 'lucide-react';
import { useCanvasActions } from '../CanvasActionsContext';

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
    const [isHovered, setIsHovered] = useState(false);
    const canvasActions = useCanvasActions();
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

    const showDetach = selected || isHovered;

    return (
      <g
        className="group/edge cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Invisible wider interaction path for effortless hovering and clicking */}
        <path
          d={edgePath}
          fill="none"
          stroke="transparent"
          strokeWidth={24}
          className="pointer-events-stroke"
        />
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            ...style,
            stroke: selected ? '#635BFF' : isHovered ? '#818cf8' : (style.stroke as string) || '#64748b',
            strokeWidth: selected ? 2.5 : isHovered ? 2.0 : 1.5,
            strokeDasharray: edgeData.lineStyle === 'dashed' ? '5,5' : undefined,
          }}
        />
        {(edgeData.label || showDetach) && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: 'all',
                zIndex: 1000,
              }}
              className="nodrag nopan select-none flex items-center gap-1.5"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {edgeData.label && (
                <div className="px-2 py-0.5 rounded border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0F111A] text-[10px] font-mono text-slate-600 dark:text-slate-300 shadow-sm">
                  {edgeData.label}
                </div>
              )}
              {showDetach && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    canvasActions?.onDetachEdge(id);
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/90 hover:bg-red-600 text-white text-[10px] font-semibold shadow-lg hover:shadow-red-500/30 transition-all scale-100 hover:scale-105 active:scale-95 animate-in fade-in zoom-in-75 duration-100"
                  title="Detach connection"
                >
                  <Unlink className="h-2.5 w-2.5" />
                  <span>Detach</span>
                </button>
              )}
            </div>
          </EdgeLabelRenderer>
        )}
      </g>
    );
  },
);

UmlEdge.displayName = 'UmlEdge';
