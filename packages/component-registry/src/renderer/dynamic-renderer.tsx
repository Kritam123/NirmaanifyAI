'use client';

import React from 'react';
import { ComponentNode } from '@nirmaanify/types';
import { resolveComponent } from './component-resolver';
import { ComponentErrorBoundary } from './error-boundary';
import { MissingComponentFallback } from './missing-component-fallback';

export interface DynamicRendererProps {
  node: ComponentNode;
  mode?: 'preview' | 'builder' | 'live';
  selectedNodeId?: string | null;
  hoveredNodeId?: string | null;
  onSelectNode?: (id: string, e?: React.MouseEvent) => void;
  onHoverNode?: (id: string | null) => void;
  onDeleteNode?: (id: string) => void;
  onDuplicateNode?: (id: string) => void;
  onMoveNode?: (id: string, direction: 'up' | 'down') => void;
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
  onMoveNode,
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
          onMoveNode={onMoveNode}
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
      {content}
    </div>
  );
}
