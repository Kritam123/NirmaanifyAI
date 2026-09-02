'use client';

import React from 'react';
import { ComponentNode } from '@nirmaanify/types';
import { resolveComponent } from './component-resolver';
import { ComponentErrorBoundary } from './error-boundary';
import { MissingComponentFallback } from './missing-component-fallback';
import { Trash2, Copy, Eye, Lock } from 'lucide-react';

export interface DynamicRendererProps {
  node: ComponentNode;
  mode?: 'preview' | 'builder' | 'live';
  selectedNodeId?: string | null;
  hoveredNodeId?: string | null;
  onSelectNode?: (id: string, e?: React.MouseEvent) => void;
  onHoverNode?: (id: string | null) => void;
  onDeleteNode?: (id: string) => void;
  onDuplicateNode?: (id: string) => void;
}

export function DynamicRenderer({
  node,
  mode = 'preview',
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
  onDeleteNode,
  onDuplicateNode,
}: DynamicRendererProps): React.ReactElement | null {
  if (node.isHidden && mode !== 'builder') {
    return null;
  }

  const def = resolveComponent(node.type);
  if (!def) {
    return <MissingComponentFallback node={node} />;
  }

  const Component = def.component;
  const isSelected = selectedNodeId === node.id;
  const isHovered = hoveredNodeId === node.id && !isSelected;

  // Recursively render child components.
  const renderedChildren = node.children && node.children.length > 0
    ? node.children.map((child) => (
        <DynamicRenderer
          key={child.id}
          node={child}
          mode={mode}
          selectedNodeId={selectedNodeId}
          hoveredNodeId={hoveredNodeId}
          onSelectNode={onSelectNode}
          onHoverNode={onHoverNode}
          onDeleteNode={onDeleteNode}
          onDuplicateNode={onDuplicateNode}
        />
      ))
    : undefined;

  // Recursively render named slots. Components that want slot-based composition
  // (e.g. card with `header` / `footer` / `media` slots) declare them on their
  // definition and consume them by reading `props.slots[slotName]` instead of
  // receiving them as `children`.
  const renderedSlots: Record<string, React.ReactNode> = {};
  if (node.slots && typeof node.slots === 'object') {
    Object.entries(node.slots).forEach(([slotKey, slotChildren]) => {
      if (!Array.isArray(slotChildren) || slotChildren.length === 0) return;
      renderedSlots[slotKey] = slotChildren.map((slotChild) => (
        <DynamicRenderer
          key={slotChild.id}
          node={slotChild}
          mode={mode}
          selectedNodeId={selectedNodeId}
          hoveredNodeId={hoveredNodeId}
          onSelectNode={onSelectNode}
          onHoverNode={onHoverNode}
          onDeleteNode={onDeleteNode}
          onDuplicateNode={onDuplicateNode}
        />
      ));
    });
  }

  const content = (
    <ComponentErrorBoundary nodeId={node.id}>
      <Component
        id={node.id}
        node={node}
        mode={mode}
        selectedNodeId={selectedNodeId}
        hoveredNodeId={hoveredNodeId}
        onSelectNode={onSelectNode}
        onHoverNode={onHoverNode}
        style={node.style}
        {...node.props}
        slots={Object.keys(renderedSlots).length > 0 ? renderedSlots : undefined}
      >
        {renderedChildren}
      </Component>
    </ComponentErrorBoundary>
  );

  // In live or preview mode, render component directly without editor overlay
  if (mode === 'live' || mode === 'preview') {
    return content;
  }

  // Builder mode: Wrap in interactive selection bounds
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelectNode?.(node.id, e);
      }}
      onMouseEnter={(e) => {
        e.stopPropagation();
        onHoverNode?.(node.id);
      }}
      onMouseLeave={(e) => {
        e.stopPropagation();
        onHoverNode?.(null);
      }}
      className={`relative group/node transition-all ${
        isSelected
          ? 'ring-2 ring-[#635BFF] ring-offset-2 dark:ring-offset-[#0E121E] z-20'
          : isHovered
          ? 'ring-1 ring-[#22D3EE]/80 z-10'
          : ''
      }`}
    >
      {/* Active Node Selection Badge & Quick Actions */}
      {isSelected && (
        <div
          className="absolute -top-7 left-0 z-30 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#635BFF] text-white text-[10px] font-bold shadow-md select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="font-mono">{node.name || node.type}</span>
          {node.isLocked && <Lock className="h-3 w-3 text-amber-300 ml-0.5" />}
          {node.isHidden && <Eye className="h-3 w-3 text-slate-300 ml-0.5" />}

          <div className="flex items-center gap-1 ml-2 border-l border-white/20 pl-1.5">
            {onDuplicateNode && (
              <button
                onClick={() => onDuplicateNode(node.id)}
                title="Duplicate node"
                className="p-0.5 hover:bg-white/20 rounded transition-colors"
              >
                <Copy className="h-3 w-3" />
              </button>
            )}
            {onDeleteNode && (
              <button
                onClick={() => onDeleteNode(node.id)}
                title="Delete node"
                className="p-0.5 hover:bg-rose-500 rounded transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {content}
    </div>
  );
}
