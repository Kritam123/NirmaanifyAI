'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { CanvasNodeData } from '@nirmaanify/types';

export const UmlClassNode = memo(({ data, selected }: NodeProps<any>) => {
  const nodeData = data as CanvasNodeData;
  const stereotype = nodeData.stereotype;
  const attributes = nodeData.umlAttributes || [];
  const methods = nodeData.umlMethods || [];

  return (
    <div
      className={`group relative rounded-lg border min-w-[220px] shadow-sm select-none transition-all duration-200 overflow-hidden font-mono ${
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

      {/* Header */}
      <div className="bg-slate-100 dark:bg-[#1A1E2E] px-3 py-2 text-center border-b border-slate-200 dark:border-[#252A40]">
        {stereotype && (
          <div className="text-[10px] text-slate-500 dark:text-slate-400 italic">
            {stereotype}
          </div>
        )}
        <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
          {nodeData.label || 'UmlClass'}
        </div>
      </div>

      {/* Attributes */}
      <div className="px-3 py-2 text-[11px] space-y-1 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-[#1E2337] min-h-[32px]">
        {attributes.length === 0 ? (
          <div className="text-slate-400 italic text-[10px]">No attributes</div>
        ) : (
          attributes.map((attr, idx) => (
            <div key={idx} className="truncate">
              <span className="text-blue-500 font-bold">{attr.visibility || '+'}</span> {attr.name}:{' '}
              <span className="text-emerald-500">{attr.type}</span>
            </div>
          ))
        )}
      </div>

      {/* Methods */}
      <div className="px-3 py-2 text-[11px] space-y-1 text-slate-700 dark:text-slate-300 min-h-[32px]">
        {methods.length === 0 ? (
          <div className="text-slate-400 italic text-[10px]">No methods</div>
        ) : (
          methods.map((m, idx) => (
            <div key={idx} className="truncate">
              <span className="text-purple-500 font-bold">{m.visibility || '+'}</span> {m.name}(
              {m.params || ''}): <span className="text-amber-500">{m.returnType}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

UmlClassNode.displayName = 'UmlClassNode';
