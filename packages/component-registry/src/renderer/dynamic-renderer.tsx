'use client';

import React from 'react';
import { Lock, EyeOff } from 'lucide-react';
import { ComponentNode } from '@nirmaanify/types';
import { resolveComponent } from './component-resolver';
import { ComponentErrorBoundary } from './error-boundary';
import { MissingComponentFallback } from './missing-component-fallback';
import { useViewport } from './viewport-context';

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
  onReparentNode?: (
    sourceId: string,
    targetId: string,
    position: 'before' | 'after' | 'inside'
  ) => void;
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
  onReparentNode,
}: DynamicRendererProps): React.ReactElement | null {
  const [dropPos, setDropPos] = React.useState<'before' | 'after' | 'inside' | null>(null);
  const { viewport } = useViewport();

  const isHiddenOnCurrentDevice =
    (viewport === 'mobile' && Boolean(node.style?.hideOnMobile)) ||
    (viewport === 'tablet' && Boolean(node.style?.hideOnTablet)) ||
    (viewport === 'desktop' && Boolean(node.style?.hideOnDesktop));

  if (node.isHidden || (isHiddenOnCurrentDevice && mode !== 'builder')) {
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
          onReparentNode={onReparentNode}
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
          onMoveNode={onMoveNode}
          onReparentNode={onReparentNode}
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

  // Builder mode: Wrap in interactive selection bounds & drag-and-drop
  const canDrag = node.parent !== null && !node.isLocked;

  return (
    <div
      draggable={canDrag}
      onDragStart={(e) => {
        if (!canDrag) return;
        e.stopPropagation();
        e.dataTransfer.setData('application/nirmaanify-node-id', node.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragOver={(e) => {
        const types = Array.from(e.dataTransfer.types);
        const isDraggingNode =
          types.includes('application/nirmaanify-node-id') ||
          types.includes('application/nirmaanify-layer-id');

        if (!isDraggingNode) return;

        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';

        const rect = e.currentTarget.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        const height = rect.height;
        const isContainer = ['container', 'section', 'grid', 'form'].includes(node.type);

        if (isContainer) {
          if (offsetY < height * 0.25) setDropPos('before');
          else if (offsetY > height * 0.75) setDropPos('after');
          else if (!node.isLocked) setDropPos('inside');
          else setDropPos(null);
        } else {
          setDropPos(offsetY < height * 0.5 ? 'before' : 'after');
        }
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setDropPos(null);
      }}
      onDrop={(e) => {
        const sourceId =
          e.dataTransfer.getData('application/nirmaanify-node-id') ||
          e.dataTransfer.getData('application/nirmaanify-layer-id');

        if (sourceId && sourceId !== node.id && dropPos) {
          e.preventDefault();
          e.stopPropagation();
          onReparentNode?.(sourceId, node.id, dropPos);
        }
        setDropPos(null);
      }}
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
      className={`relative group/node transition-all min-w-0 max-w-full ${
        canDrag ? 'cursor-pointer' : ''
      } ${
        isHiddenOnCurrentDevice ? 'opacity-40 grayscale-[40%] border-2 border-dashed border-amber-400/60 rounded-lg' : ''
      } ${
        isSelected
          ? 'ring-2 ring-[#635BFF] ring-offset-2 dark:ring-offset-[#0E121E] z-20'
          : isHovered
          ? 'ring-1 ring-[#22D3EE]/80 z-10'
          : ''
      }`}
    >
      {/* Hidden on current device badge */}
      {isHiddenOnCurrentDevice && (
        <div className="absolute top-2 left-2 z-40 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9.5px] font-semibold flex items-center gap-1 shadow-md pointer-events-none capitalize">
          <EyeOff className="w-2.5 h-2.5" />
          <span>Hidden on {viewport}</span>
        </div>
      )}

      {/* Locked badge */}
      {node.isLocked && isSelected && (
        <div className="absolute top-2 right-2 z-40 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-semibold flex items-center gap-1 shadow-md pointer-events-none">
          <Lock className="w-2.5 h-2.5" />
          <span>Locked</span>
        </div>
      )}

      {/* Drop indicator: Before */}
      {dropPos === 'before' && (
        <div className="absolute -top-1 left-0 right-0 h-1 bg-[#635BFF] z-40 rounded-full shadow-md shadow-[#635BFF]/50 pointer-events-none" />
      )}

      {/* Drop indicator: After */}
      {dropPos === 'after' && (
        <div className="absolute -bottom-1 left-0 right-0 h-1 bg-[#635BFF] z-40 rounded-full shadow-md shadow-[#635BFF]/50 pointer-events-none" />
      )}

      {/* Drop indicator: Inside */}
      {dropPos === 'inside' && (
        <div className="absolute inset-0 z-30 border-2 border-dashed border-[#635BFF] bg-[#635BFF]/10 rounded-xl pointer-events-none animate-pulse" />
      )}

      {content}
    </div>
  );
}
