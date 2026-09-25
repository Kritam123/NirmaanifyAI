'use client';

import React, { createContext, useContext } from 'react';
import { CanvasNode, CanvasEdge } from '@nirmaanify/types';

export interface CanvasActionsContextType {
  onDetachEdge: (edgeId: string) => void;
  onDetachNodeEdges: (nodeId: string, specificEdgeId?: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onDuplicateNode?: (nodeId: string) => void;
  allNodes: CanvasNode[];
  allEdges: CanvasEdge[];
}

export const CanvasActionsContext = createContext<CanvasActionsContextType | null>(null);

export const useCanvasActions = () => {
  return useContext(CanvasActionsContext);
};
