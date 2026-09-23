'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { CanvasNodeData } from '@nirmaanify/types';

export const StandardShapeNode = memo(({ data, selected }: NodeProps<any>) => {
  const nodeData = data as CanvasNodeData;
  const shape = nodeData.shapeKind || 'rectangle';

  const renderShapeContent = () => {
    switch (shape) {
      case 'diamond':
        return (
          <div className="w-24 h-24 rotate-45 border-2 border-slate-400 dark:border-[#3D4566] bg-white dark:bg-[#141724] flex items-center justify-center shadow-sm">
            <div className="-rotate-45 text-center px-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
              {nodeData.label || 'Decision'}
            </div>
          </div>
        );
      case 'cylinder':
        return (
          <div className="w-32 h-24 rounded-lg border-2 border-slate-400 dark:border-[#3D4566] bg-white dark:bg-[#141724] flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-4 border-b border-slate-300 dark:border-[#3D4566] bg-slate-100 dark:bg-[#1C2033] rounded-t-lg" />
            <div className="text-center px-2 text-xs font-semibold text-slate-800 dark:text-slate-200 pt-3">
              {nodeData.label || 'Data Store'}
            </div>
          </div>
        );
      case 'pill':
        return (
          <div className="px-6 py-3 rounded-full border-2 border-slate-400 dark:border-[#3D4566] bg-white dark:bg-[#141724] text-center shadow-sm">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {nodeData.label || 'Start / End'}
            </div>
          </div>
        );
      case 'circle':
        return (
          <div className="w-20 h-20 rounded-full border-2 border-slate-400 dark:border-[#3D4566] bg-white dark:bg-[#141724] flex items-center justify-center text-center shadow-sm">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 px-1">
              {nodeData.label || 'Node'}
            </div>
          </div>
        );
      case 'rectangle':
      default:
        return (
          <div className="px-5 py-4 rounded-lg border-2 border-slate-400 dark:border-[#3D4566] bg-white dark:bg-[#141724] text-center min-w-[140px] shadow-sm">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {nodeData.label || 'Process Block'}
            </div>
            {nodeData.subtitle && (
              <div className="text-[10px] text-slate-400 mt-1">{nodeData.subtitle}</div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`relative group select-none ${selected ? 'ring-2 ring-[#635BFF] ring-offset-2 rounded-lg' : ''}`}>
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
      {renderShapeContent()}
    </div>
  );
});

StandardShapeNode.displayName = 'StandardShapeNode';
