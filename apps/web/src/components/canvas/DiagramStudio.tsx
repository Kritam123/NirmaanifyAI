'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Connection,
  Edge,
  Node,
  MarkerType,
  SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';

import {
  DiagramDto,
  CanvasNode,
  CanvasEdge,
  CanvasSettings,
  ProjectDto,
} from '@nirmaanify/types';
import { apiClient } from '../../lib/api';
import { useToast } from '@nirmaanify/ui';

import { CloudServiceNode } from './nodes/CloudServiceNode';
import { UmlClassNode } from './nodes/UmlClassNode';
import { UmlSequenceNode } from './nodes/UmlSequenceNode';
import { DatabaseTableNode } from './nodes/DatabaseTableNode';
import { SystemGroupNode } from './nodes/SystemGroupNode';
import { StandardShapeNode } from './nodes/StandardShapeNode';
import { StickyNoteNode } from './nodes/StickyNoteNode';
import { TextAnnotationNode } from './nodes/TextAnnotationNode';

import { ArchitectureEdge } from './edges/ArchitectureEdge';
import { UmlEdge } from './edges/UmlEdge';

import { StencilSidebar } from './sidebar/StencilSidebar';
import { CanvasInspector } from './inspector/CanvasInspector';
import { CanvasTopbar } from './topbar/CanvasTopbar';
import { CanvasQuickDock } from './CanvasQuickDock';
import { CanvasContextMenu, ContextMenuState } from './CanvasContextMenu';
import { AiArchitectModal } from './ai/AiArchitectModal';
import { ExportModal } from './export/ExportModal';
import { RevisionHistoryModal } from './history/RevisionHistoryModal';
import { CanvasPreviewBar } from './CanvasPreviewBar';
import { CanvasActionsContext } from './CanvasActionsContext';

interface DiagramStudioProps {
  project: ProjectDto;
  initialDiagrams: DiagramDto[];
  onBackToProjects: () => void;
}

const nodeTypes = {
  'cloud-service': CloudServiceNode,
  'uml-class': UmlClassNode,
  'uml-sequence': UmlSequenceNode,
  'database-table': DatabaseTableNode,
  'system-group': SystemGroupNode,
  'standard-shape': StandardShapeNode,
  'sticky-note': StickyNoteNode,
  'text-annotation': TextAnnotationNode,
};

const edgeTypes = {
  smoothstep: ArchitectureEdge,
  orthogonal: ArchitectureEdge,
  uml: UmlEdge,
};

interface HistorySnapshot {
  nodes: Node[];
  edges: Edge[];
}

function DiagramCanvasInner({
  project,
  initialDiagrams,
  onBackToProjects,
}: DiagramStudioProps) {
  const { toast } = useToast();
  const reactFlowInstance = useReactFlow();

  const [diagramsList, setDiagramsList] = useState<DiagramDto[]>(initialDiagrams);
  const [currentDiagram, setCurrentDiagram] = useState<DiagramDto>(
    initialDiagrams[0] || {
      id: 'default',
      projectId: project.id,
      name: 'Architecture Overview',
      type: 'SYSTEM_ARCHITECTURE',
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      settings: { grid: true, snapToGrid: true, theme: 'dark' },
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(currentDiagram.nodes as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState(currentDiagram.edges as any);

  // Undo / Redo History Tracking
  const pastRef = useRef<HistorySnapshot[]>([]);
  const futureRef = useRef<HistorySnapshot[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const nodesRef = useRef<Node[]>(nodes);
  nodesRef.current = nodes;
  const edgesRef = useRef<Edge[]>(edges);
  edgesRef.current = edges;

  const takeSnapshot = useCallback(() => {
    const snap: HistorySnapshot = {
      nodes: JSON.parse(JSON.stringify(nodesRef.current)),
      edges: JSON.parse(JSON.stringify(edgesRef.current)),
    };
    pastRef.current.push(snap);
    if (pastRef.current.length > 50) {
      pastRef.current.shift();
    }
    futureRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const handleUndo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    const previous = pastRef.current.pop();
    if (!previous) return;

    futureRef.current.push({
      nodes: JSON.parse(JSON.stringify(nodesRef.current)),
      edges: JSON.parse(JSON.stringify(edgesRef.current)),
    });

    setNodes(previous.nodes);
    setEdges(previous.edges);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);

    setCanUndo(pastRef.current.length > 0);
    setCanRedo(true);

    toast({
      title: 'Undo (Ctrl+Z)',
      description: 'Reverted canvas change.',
      type: 'info',
    });
  }, [setNodes, setEdges, toast]);

  const handleRedo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current.pop();
    if (!next) return;

    pastRef.current.push({
      nodes: JSON.parse(JSON.stringify(nodesRef.current)),
      edges: JSON.parse(JSON.stringify(edgesRef.current)),
    });

    setNodes(next.nodes);
    setEdges(next.edges);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);

    setCanUndo(true);
    setCanRedo(futureRef.current.length > 0);

    toast({
      title: 'Redo (Ctrl+Y)',
      description: 'Restored canvas change.',
      type: 'info',
    });
  }, [setNodes, setEdges, toast]);

  // Track node drag for history
  const dragStartSnapshotRef = useRef<HistorySnapshot | null>(null);

  const onNodeDragStart = useCallback(() => {
    dragStartSnapshotRef.current = {
      nodes: JSON.parse(JSON.stringify(nodesRef.current)),
      edges: JSON.parse(JSON.stringify(edgesRef.current)),
    };
  }, []);

  const onNodeDragStop = useCallback(() => {
    if (dragStartSnapshotRef.current) {
      const initial = JSON.stringify(dragStartSnapshotRef.current.nodes);
      const current = JSON.stringify(nodesRef.current);
      if (initial !== current) {
        pastRef.current.push(dragStartSnapshotRef.current);
        if (pastRef.current.length > 50) pastRef.current.shift();
        futureRef.current = [];
        setCanUndo(true);
        setCanRedo(false);
      }
      dragStartSnapshotRef.current = null;
    }
  }, []);

  const [documentContent, setDocumentContent] = useState<string>(
    currentDiagram.document || '',
  );
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>(
    currentDiagram.settings || { grid: true, snapToGrid: true, theme: 'dark' },
  );

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const [isPanMode, setIsPanMode] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // Preview Mode & Fullscreen Mode
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sidebar visibility states (controlled from Quick Dock & Context Menu)
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  const handleToggleLeftSidebar = useCallback(() => {
    setIsLeftSidebarOpen((prev) => !prev);
  }, []);

  const handleToggleRightSidebar = useCallback(() => {
    setIsRightSidebarOpen((prev) => !prev);
  }, []);

  // Sync browser fullscreen state
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error('Fullscreen request failed:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  const handleTogglePreviewMode = useCallback(() => {
    setIsPreviewMode((prev) => {
      const next = !prev;
      if (next) {
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
        setTimeout(() => {
          reactFlowInstance.fitView({ duration: 500, padding: 0.18 });
        }, 50);
      }
      return next;
    });
  }, [reactFlowInstance]);

  const [isSaving, setIsSaving] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<any>(null);

  // Delete Node and any connected edges
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      takeSnapshot();
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      if (selectedNodeId === nodeId) setSelectedNodeId(null);
      toast({
        title: 'Component Deleted',
        description: 'Selected component and connected edges removed.',
        type: 'info',
      });
    },
    [takeSnapshot, setNodes, setEdges, selectedNodeId, toast],
  );

  // Delete / Detach Edge
  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      takeSnapshot();
      const edge = edges.find((e) => e.id === edgeId);
      const sourceNode = edge ? nodes.find((n) => n.id === edge.source) : null;
      const targetNode = edge ? nodes.find((n) => n.id === edge.target) : null;
      const desc =
        sourceNode && targetNode
          ? `Detached connection from "${sourceNode.data?.label || 'Source'}" to "${targetNode.data?.label || 'Target'}".`
          : 'Selected connection detached.';

      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      if (selectedEdgeId === edgeId) setSelectedEdgeId(null);
      toast({
        title: 'Connection Detached',
        description: desc,
        type: 'info',
      });
    },
    [takeSnapshot, edges, nodes, setEdges, selectedEdgeId, toast],
  );

  // Detach all connections (or a specific connection) attached to a node
  const handleDetachNodeEdges = useCallback(
    (nodeId: string, specificEdgeId?: string) => {
      takeSnapshot();
      const sourceNode = nodes.find((n) => n.id === nodeId);
      const sourceLabel = sourceNode?.data?.label || 'Component';

      if (specificEdgeId) {
        const edge = edges.find((e) => e.id === specificEdgeId);
        const otherNodeId = edge ? (edge.source === nodeId ? edge.target : edge.source) : null;
        const otherNode = otherNodeId ? nodes.find((n) => n.id === otherNodeId) : null;
        const otherLabel = otherNode?.data?.label || 'Service';

        setEdges((eds) => eds.filter((e) => e.id !== specificEdgeId));
        if (selectedEdgeId === specificEdgeId) setSelectedEdgeId(null);
        toast({
          title: 'Connection Detached',
          description: `Detached connection between "${sourceLabel}" and "${otherLabel}".`,
          type: 'info',
        });
      } else {
        const edgesToDetach = edges.filter((e) => e.source === nodeId || e.target === nodeId);
        if (edgesToDetach.length === 0) return;

        setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
        if (selectedEdgeId && edgesToDetach.some((e) => e.id === selectedEdgeId)) {
          setSelectedEdgeId(null);
        }
        toast({
          title: 'Connections Detached',
          description: `Detached ${edgesToDetach.length} connection${edgesToDetach.length > 1 ? 's' : ''} from "${sourceLabel}".`,
          type: 'info',
        });
      }
    },
    [takeSnapshot, nodes, edges, setEdges, selectedEdgeId, toast],
  );

  // Delete all currently selected items
  const handleDeleteSelected = useCallback(() => {
    const nodesToDelete = new Set<string>();
    if (selectedNodeId) nodesToDelete.add(selectedNodeId);
    nodes.forEach((n) => {
      if (n.selected) nodesToDelete.add(n.id);
    });

    const edgesToDelete = new Set<string>();
    if (selectedEdgeId) edgesToDelete.add(selectedEdgeId);
    edges.forEach((e) => {
      if (e.selected || nodesToDelete.has(e.source) || nodesToDelete.has(e.target)) {
        edgesToDelete.add(e.id);
      }
    });

    if (nodesToDelete.size === 0 && edgesToDelete.size === 0) return;

    takeSnapshot();
    setNodes((nds) => nds.filter((n) => !nodesToDelete.has(n.id)));
    setEdges((eds) => eds.filter((e) => !edgesToDelete.has(e.id)));
    setSelectedNodeId(null);
    setSelectedEdgeId(null);

    toast({
      title: 'Items Removed',
      description: `Removed ${nodesToDelete.size} components and ${edgesToDelete.size} connections.`,
      type: 'info',
    });
  }, [takeSnapshot, selectedNodeId, selectedEdgeId, nodes, edges, setNodes, setEdges, toast]);

  // Duplicate a node or multiple selected nodes
  const handleDuplicateNode = useCallback(
    (nodeId?: string) => {
      let targetNodes = nodes.filter((n) => n.selected);
      if (targetNodes.length === 0 && (nodeId || selectedNodeId)) {
        const single = nodes.find((n) => n.id === (nodeId || selectedNodeId));
        if (single) targetNodes = [single];
      }
      if (targetNodes.length === 0) return;

      takeSnapshot();
      const newClonedNodes: Node[] = targetNodes.map((sourceNode) => ({
        ...sourceNode,
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        position: {
          x: sourceNode.position.x + 40,
          y: sourceNode.position.y + 40,
        },
        selected: true,
        data: {
          ...sourceNode.data,
          label: `${sourceNode.data.label || 'Component'} (Copy)`,
        },
      }));

      setNodes((nds) => [
        ...nds.map((n) => ({ ...n, selected: false })),
        ...(newClonedNodes as any),
      ]);
      setSelectedNodeId(newClonedNodes[0].id);

      toast({
        title: `${newClonedNodes.length} Component${newClonedNodes.length > 1 ? 's' : ''} Duplicated`,
        description: `Created clone of ${newClonedNodes.length > 1 ? `${newClonedNodes.length} components` : `"${targetNodes[0].data.label || 'Component'}"`}.`,
        type: 'success',
      });
    },
    [takeSnapshot, nodes, selectedNodeId, setNodes, toast],
  );

  // Clear Canvas
  const handleClearCanvas = useCallback(() => {
    if (nodes.length === 0 && edges.length === 0) return;
    if (window.confirm('Are you sure you want to clear all components and connections from this diagram?')) {
      takeSnapshot();
      setNodes([]);
      setEdges([]);
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      toast({
        title: 'Canvas Cleared',
        description: 'All elements have been removed from the canvas.',
        type: 'info',
      });
    }
  }, [takeSnapshot, nodes.length, edges.length, setNodes, setEdges, toast]);

  // Add Sticky Note from Context Menu
  const handleAddStickyNoteAt = useCallback(
    (clientX: number, clientY: number) => {
      takeSnapshot();
      const position = reactFlowInstance.screenToFlowPosition({ x: clientX, y: clientY });
      const newNode: Node = {
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: 'sticky-note',
        position,
        data: {
          label: 'Architecture Review Note',
          color: 'yellow',
        },
      };
      setNodes((nds) => [...nds, newNode as any]);
      setSelectedNodeId(newNode.id);
    },
    [takeSnapshot, reactFlowInstance, setNodes],
  );

  const handleTogglePanMode = useCallback(() => {
    setIsPanMode((prev) => !prev);
  }, []);

  const handleZoomIn = useCallback(() => reactFlowInstance.zoomIn({ duration: 300 }), [reactFlowInstance]);
  const handleZoomOut = useCallback(() => reactFlowInstance.zoomOut({ duration: 300 }), [reactFlowInstance]);
  const handleFitView = useCallback(() => reactFlowInstance.fitView({ duration: 400, padding: 0.15 }), [reactFlowInstance]);

  // Explicit click selection handlers
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
    setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === node.id })));
    setEdges((eds) => eds.map((e) => ({ ...e, selected: false })));
  }, [setNodes, setEdges]);

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
    setEdges((eds) => eds.map((e) => ({ ...e, selected: e.id === edge.id })));
    setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
  }, [setNodes, setEdges]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
    setEdges((eds) => eds.map((e) => ({ ...e, selected: false })));
  }, [setNodes, setEdges]);

  // Context Menu handlers
  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setSelectedNodeId(node.id);
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      type: 'node',
      targetId: node.id,
      targetItem: node as any,
    });
  }, []);

  const onEdgeContextMenu = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    setSelectedEdgeId(edge.id);
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      type: 'edge',
      targetId: edge.id,
      targetItem: edge as any,
    });
  }, []);

  const onPaneContextMenu = useCallback((event: any) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      type: 'pane',
    });
  }, []);

  // Sync canvas when switching diagram tabs
  const handleSelectDiagram = useCallback(
    (diagramId: string) => {
      const selected = diagramsList.find((d) => d.id === diagramId);
      if (selected) {
        // Reset undo/redo history for new diagram tab
        pastRef.current = [];
        futureRef.current = [];
        setCanUndo(false);
        setCanRedo(false);

        setCurrentDiagram(selected);
        setNodes(selected.nodes as any);
        setEdges(selected.edges as any);
        setDocumentContent(selected.document || '');
        setCanvasSettings(selected.settings || { grid: true, snapToGrid: true, theme: 'dark' });
      }
    },
    [diagramsList, setNodes, setEdges],
  );

  // Global Keyboard shortcuts for Delete, Duplicate, and Sidebar toggles
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // In preview mode: Escape exits preview
      if (isPreviewMode && e.key === 'Escape') {
        e.preventDefault();
        setIsPreviewMode(false);
        return;
      }

      // In preview mode: Arrow keys navigate between diagrams
      if (isPreviewMode && diagramsList.length > 1) {
        const curIndex = diagramsList.findIndex((d) => d.id === currentDiagram.id);
        if (e.key === 'ArrowRight' || e.key === 'PageDown') {
          e.preventDefault();
          if (curIndex < diagramsList.length - 1) {
            handleSelectDiagram(diagramsList[curIndex + 1].id);
          }
          return;
        }
        if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          e.preventDefault();
          if (curIndex > 0) {
            handleSelectDiagram(diagramsList[curIndex - 1].id);
          }
          return;
        }
      }

      // Delete / Backspace: Remove selected items (disabled in preview mode)
      if (!isPreviewMode && (e.key === 'Delete' || e.key === 'Backspace')) {
        if (selectedNodeId || selectedEdgeId || nodes.some((n) => n.selected) || edges.some((e) => e.selected)) {
          e.preventDefault();
          handleDeleteSelected();
        }
      }

      // Ctrl+D or Cmd+D: Duplicate selected component(s) (disabled in preview mode)
      if (!isPreviewMode && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        if (selectedNodeId || nodes.some((n) => n.selected)) {
          e.preventDefault();
          handleDuplicateNode();
        }
      }

      // [ or Alt+[: Toggle Left Sidebar
      if (!isPreviewMode && e.key === '[' && (e.altKey || (!e.ctrlKey && !e.metaKey))) {
        e.preventDefault();
        handleToggleLeftSidebar();
      }

      // ] or Alt+]: Toggle Right Sidebar
      if (!isPreviewMode && e.key === ']' && (e.altKey || (!e.ctrlKey && !e.metaKey))) {
        e.preventDefault();
        handleToggleRightSidebar();
      }

      // Ctrl+Z or Cmd+Z: Undo (disabled in preview mode)
      if (!isPreviewMode && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Ctrl+Y or Cmd+Y or Ctrl+Shift+Z: Redo (disabled in preview mode)
      if (
        !isPreviewMode &&
        (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z'))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isPreviewMode,
    diagramsList,
    currentDiagram.id,
    handleSelectDiagram,
    selectedNodeId,
    selectedEdgeId,
    nodes,
    edges,
    handleDeleteSelected,
    handleDuplicateNode,
    handleUndo,
    handleRedo,
    handleToggleLeftSidebar,
    handleToggleRightSidebar,
  ]);

  // Connect handler
  const onConnect = useCallback(
    (connection: Connection) => {
      takeSnapshot();
      const newEdge: Edge = {
        ...connection,
        id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: 'smoothstep',
        data: { label: '', protocol: 'HTTPS', lineStyle: 'solid' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [takeSnapshot, setEdges],
  );

  // Selection handlers
  const onSelectionChange = useCallback(({ nodes: selNodes, edges: selEdges }: any) => {
    if (selNodes && selNodes.length > 0) {
      setSelectedNodeId(selNodes[0].id);
      setSelectedEdgeId(null);
    } else if (selEdges && selEdges.length > 0) {
      setSelectedEdgeId(selEdges[0].id);
      setSelectedNodeId(null);
    }
  }, []);

  const selectedNode = useMemo(
    () => (nodes.find((n) => n.id === selectedNodeId) as CanvasNode) || null,
    [nodes, selectedNodeId],
  );

  const selectedEdge = useMemo(
    () => (edges.find((e) => e.id === selectedEdgeId) as CanvasEdge) || null,
    [edges, selectedEdgeId],
  );

  const totalSelectedCount = useMemo(() => {
    const nodesCount = nodes.filter((n) => n.selected).length;
    const edgesCount = edges.filter((e) => e.selected).length;
    const directCount = (selectedNodeId ? 1 : 0) + (selectedEdgeId ? 1 : 0);
    return Math.max(nodesCount + edgesCount, directCount);
  }, [nodes, edges, selectedNodeId, selectedEdgeId]);

  // Node & Edge Data updates from Inspector
  const handleUpdateNodeData = useCallback(
    (nodeId: string, newData: any) => {
      takeSnapshot();
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n)),
      );
    },
    [takeSnapshot, setNodes],
  );

  const handleUpdateEdgeData = useCallback(
    (edgeId: string, newData: any) => {
      takeSnapshot();
      setEdges((eds) =>
        eds.map((e) => {
          if (e.id === edgeId) {
            const updatedData = { ...(e.data || {}), ...newData };
            return {
              ...e,
              animated: newData.animated !== undefined ? newData.animated : e.animated,
              data: updatedData,
            };
          }
          return e;
        }),
      );
    },
    [takeSnapshot, setEdges],
  );

  // HTML5 Drag and Drop from StencilSidebar
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const raw = event.dataTransfer.getData('application/reactflow');
      if (!raw) return;

      try {
        const stencil = JSON.parse(raw);
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const newNode: Node = {
          id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          type: stencil.type,
          position,
          data: stencil.data,
        };

        takeSnapshot();
        setNodes((nds) => [...nds, newNode as any]);
      } catch (err) {
        console.error('Failed to parse dropped stencil:', err);
      }
    },
    [takeSnapshot, reactFlowInstance, setNodes],
  );

  // Auto-Layout via Dagre
  const handleAutoLayout = useCallback(
    (direction: 'LR' | 'TB' = 'LR') => {
      takeSnapshot();
      const g = new dagre.graphlib.Graph();
      g.setGraph({ rankdir: direction, nodesep: 70, ranksep: 100 });
      g.setDefaultEdgeLabel(() => ({}));

      nodes.forEach((node) => {
        g.setNode(node.id, {
          width: node.measured?.width || 220,
          height: node.measured?.height || 100,
        });
      });

      edges.forEach((edge) => {
        g.setEdge(edge.source, edge.target);
      });

      dagre.layout(g);

      setNodes((nds) =>
        nds.map((node) => {
          const nodeWithPosition = g.node(node.id);
          if (nodeWithPosition) {
            return {
              ...node,
              position: {
                x: nodeWithPosition.x - (node.measured?.width || 220) / 2,
                y: nodeWithPosition.y - (node.measured?.height || 100) / 2,
              },
            };
          }
          return node;
        }),
      );

      setTimeout(() => {
        reactFlowInstance.fitView({ duration: 400, padding: 0.15 });
      }, 50);

      toast({
        title: 'Auto-Layout Complete',
        description: `Nodes arranged in hierarchical ${direction === 'LR' ? 'Horizontal (Left-to-Right)' : 'Vertical (Top-to-Bottom)'} layout.`,
        type: 'success',
      });
    },
    [nodes, edges, setNodes, reactFlowInstance, toast],
  );

  // Save Diagram Checkpoint
  const handleSave = useCallback(async () => {
    if (!currentDiagram.id) return;
    setIsSaving(true);
    try {
      const updated = await apiClient.diagrams.updateDiagram(currentDiagram.id, {
        nodes: nodes as any,
        edges: edges as any,
        document: documentContent,
        settings: canvasSettings,
      });

      setCurrentDiagram(updated);
      setDiagramsList((list) => list.map((d) => (d.id === updated.id ? updated : d)));

      toast({
        title: 'Diagram Saved',
        description: 'Canvas changes saved successfully.',
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Failed to Save',
        description: err.message || 'Could not save diagram',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  }, [currentDiagram.id, nodes, edges, documentContent, canvasSettings, toast]);

  // Create New Diagram in Project
  const handleCreateDiagram = useCallback(async () => {
    try {
      const newDiag = await apiClient.diagrams.createDiagram(project.id, {
        name: `Diagram ${diagramsList.length + 1}`,
        type: 'SYSTEM_ARCHITECTURE',
        nodes: [],
        edges: [],
      });
      setDiagramsList((list) => [...list, newDiag]);
      handleSelectDiagram(newDiag.id);
      toast({
        title: 'Diagram Created',
        description: `Created "${newDiag.name}".`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Creation Failed',
        description: err.message,
        type: 'error',
      });
    }
  }, [project.id, diagramsList.length, handleSelectDiagram, toast]);

  // Rename Diagram
  const handleUpdateTitle = useCallback(
    async (title: string) => {
      try {
        const updated = await apiClient.diagrams.updateDiagram(currentDiagram.id, { name: title });
        setCurrentDiagram(updated);
        setDiagramsList((list) => list.map((d) => (d.id === updated.id ? updated : d)));
      } catch (err) {
        console.error('Failed to rename diagram:', err);
      }
    },
    [currentDiagram.id],
  );

  // Apply AI Scaffold to Canvas
  const handleApplyScaffold = useCallback(
    (result: { nodes: CanvasNode[]; edges: CanvasEdge[]; document: string; title: string }) => {
      takeSnapshot();
      setNodes(result.nodes as any);
      setEdges(result.edges as any);
      setDocumentContent(result.document);
      handleUpdateTitle(result.title);

      setTimeout(() => {
        reactFlowInstance.fitView({ duration: 500, padding: 0.15 });
      }, 100);

      toast({
        title: 'Architecture Scaffolded ✨',
        description: `Populated canvas with ${result.nodes.length} nodes and generated architecture documentation.`,
        type: 'success',
      });
    },
    [takeSnapshot, setNodes, setEdges, handleUpdateTitle, reactFlowInstance, toast],
  );

  // Run AI Architecture Review
  const handleReviewArchitecture = useCallback(async () => {
    setIsReviewing(true);
    try {
      const res = await apiClient.diagrams.reviewWithAi(nodes as any, edges as any);
      setReviewResult(res);
      toast({
        title: 'Architecture Review Complete',
        description: `Resilience Score: ${res.score}/100. Inspect findings in the side panel.`,
        type: 'info',
      });
    } catch (err) {
      console.error('Failed to review architecture:', err);
    } finally {
      setIsReviewing(false);
    }
  }, [nodes, edges, toast]);

  return (
    <CanvasActionsContext.Provider
      value={{
        onDetachEdge: handleDeleteEdge,
        onDetachNodeEdges: handleDetachNodeEdges,
        onDeleteNode: handleDeleteNode,
        onDuplicateNode: handleDuplicateNode,
        allNodes: nodes as any,
        allEdges: edges as any,
      }}
    >
      <div className="dark flex flex-col h-screen w-full overflow-hidden bg-[#090A0F] text-slate-100 font-sans select-none relative">
        {/* Top Navbar or Floating Presentation Bar */}
        {isPreviewMode ? (
          <CanvasPreviewBar
            projectName={project.name}
            currentDiagram={currentDiagram}
            diagramsList={diagramsList}
            onSelectDiagram={handleSelectDiagram}
            onExitPreview={() => setIsPreviewMode(false)}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitView={handleFitView}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
          />
        ) : (
          <CanvasTopbar
            diagram={currentDiagram}
            diagramsList={diagramsList}
            onSelectDiagram={handleSelectDiagram}
            onCreateDiagram={handleCreateDiagram}
            onUpdateTitle={handleUpdateTitle}
            onAutoLayout={handleAutoLayout}
            onOpenAiModal={() => setIsAiModalOpen(true)}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
            onSave={handleSave}
            isSaving={isSaving}
            onBackToProjects={onBackToProjects}
            projectName={project.name}
            hasSelection={Boolean(selectedNodeId || selectedEdgeId)}
            onDeleteSelected={handleDeleteSelected}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={handleUndo}
            onRedo={handleRedo}
            isPreviewMode={isPreviewMode}
            onTogglePreviewMode={handleTogglePreviewMode}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
          />
        )}

        {/* Main Studio Area */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Stencil Palette (hidden in presentation / preview mode, or when collapsed) */}
          {!isPreviewMode && isLeftSidebarOpen && (
            <StencilSidebar isOpen={isLeftSidebarOpen} onToggle={handleToggleLeftSidebar} />
          )}

          {/* Center Vector Canvas */}
          <div className="flex-1 h-full relative" onDragOver={onDragOver} onDrop={onDrop}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={isPreviewMode ? undefined : onNodesChange}
              onEdgesChange={isPreviewMode ? undefined : onEdgesChange}
              onConnect={isPreviewMode ? undefined : onConnect}
              onNodeClick={isPreviewMode ? undefined : onNodeClick}
              onEdgeClick={isPreviewMode ? undefined : onEdgeClick}
              onPaneClick={onPaneClick}
              onSelectionChange={isPreviewMode ? undefined : onSelectionChange}
              onNodeContextMenu={isPreviewMode ? undefined : onNodeContextMenu}
              onEdgeContextMenu={isPreviewMode ? undefined : onEdgeContextMenu}
              onPaneContextMenu={onPaneContextMenu}
              onNodeDragStart={isPreviewMode ? undefined : onNodeDragStart}
              onNodeDragStop={isPreviewMode ? undefined : onNodeDragStop}
              nodesDraggable={!isPreviewMode}
              nodesConnectable={!isPreviewMode}
              elementsSelectable={!isPreviewMode}
              nodeTypes={nodeTypes as any}
              edgeTypes={edgeTypes as any}
              fitView
              minZoom={0.05}
              maxZoom={2.5}
              panOnDrag={isPanMode || isPreviewMode ? [0, 1, 2] : [1, 2]}
              selectionOnDrag={!isPanMode && !isPreviewMode}
              selectionMode={SelectionMode.Partial}
              selectionKeyCode={null}
              panActivationKeyCode="Space"
              deleteKeyCode={isPreviewMode ? [] : ['Backspace', 'Delete']}
              snapToGrid={canvasSettings.snapToGrid}
              snapGrid={[15, 15]}
              colorMode="dark"
              className="bg-[#090A0F]"
            >
              {canvasSettings.grid && (
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={16}
                  size={1}
                  color="#24293D"
                />
              )}
              {!isPreviewMode && (
                <Controls className="!bg-[#141724] !border-[#24293D] !rounded-xl !shadow-lg [&>button]:!border-[#24293D] [&>button]:!text-slate-300 hover:[&>button]:!bg-[#1E2337]" />
              )}
              {!isPreviewMode && (
                <MiniMap
                  nodeColor="#635BFF"
                  maskColor="rgba(9, 10, 15, 0.85)"
                  className="!bg-[#141724] !border-[#24293D] !rounded-xl !shadow-lg"
                />
              )}
            </ReactFlow>

            {/* Floating Canvas Quick Dock (hidden in preview mode) */}
            {!isPreviewMode && (
              <CanvasQuickDock
                isPanMode={isPanMode}
                onTogglePanMode={handleTogglePanMode}
                hasSelection={totalSelectedCount > 0}
                selectedCount={totalSelectedCount}
                selectedType={selectedNodeId ? 'node' : selectedEdgeId ? 'edge' : null}
                onDeleteSelected={handleDeleteSelected}
                onDuplicateSelected={() => handleDuplicateNode(selectedNodeId || undefined)}
                onAutoLayout={() => handleAutoLayout('LR')}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onFitView={handleFitView}
                onClearCanvas={handleClearCanvas}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={handleUndo}
                onRedo={handleRedo}
                isLeftSidebarOpen={isLeftSidebarOpen}
                onToggleLeftSidebar={handleToggleLeftSidebar}
                isRightSidebarOpen={isRightSidebarOpen}
                onToggleRightSidebar={handleToggleRightSidebar}
              />
            )}

            {/* Right Click Context Menu */}
            {contextMenu && (
              <CanvasContextMenu
                menu={contextMenu}
                onClose={() => setContextMenu(null)}
                onDeleteNode={handleDeleteNode}
                onDeleteEdge={handleDeleteEdge}
                onDetachNodeEdges={handleDetachNodeEdges}
                onDuplicateNode={handleDuplicateNode}
                onOpenProperties={() => {}}
                onAutoLayout={() => handleAutoLayout('LR')}
                onFitView={handleFitView}
                onAddStickyNote={handleAddStickyNoteAt}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onTogglePreviewMode={handleTogglePreviewMode}
                onToggleFullscreen={handleToggleFullscreen}
                isLeftSidebarOpen={isLeftSidebarOpen}
                onToggleLeftSidebar={handleToggleLeftSidebar}
                isRightSidebarOpen={isRightSidebarOpen}
                onToggleRightSidebar={handleToggleRightSidebar}
                allNodes={nodes as any}
                allEdges={edges as any}
              />
            )}
          </div>

          {/* Right Inspector & Eraser.io Markdown Sidecar (hidden in preview mode, or when collapsed) */}
          {!isPreviewMode && isRightSidebarOpen && (
            <CanvasInspector
              isOpen={isRightSidebarOpen}
              onToggle={handleToggleRightSidebar}
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              allNodes={nodes as any}
              allEdges={edges as any}
              onUpdateNodeData={handleUpdateNodeData}
              onUpdateEdgeData={handleUpdateEdgeData}
              onDeleteNode={handleDeleteNode}
              onDeleteEdge={handleDeleteEdge}
              onDetachEdge={handleDeleteEdge}
              onDetachNodeEdges={handleDetachNodeEdges}
              documentContent={documentContent}
              onUpdateDocument={setDocumentContent}
              onReviewArchitecture={handleReviewArchitecture}
              isReviewing={isReviewing}
              reviewResult={reviewResult}
              canvasSettings={canvasSettings}
              onUpdateSettings={setCanvasSettings}
            />
          )}
        </div>

        {/* Modals */}
        <AiArchitectModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          projectId={project.id}
          diagramId={currentDiagram.id}
          onApplyScaffold={handleApplyScaffold}
        />

        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          diagram={{
            ...currentDiagram,
            nodes: nodes as any,
            edges: edges as any,
            document: documentContent,
          }}
        />

        <RevisionHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          diagramId={currentDiagram.id}
          onRestore={() => handleSelectDiagram(currentDiagram.id)}
        />
      </div>
    </CanvasActionsContext.Provider>
  );
}

export function DiagramStudio(props: DiagramStudioProps) {
  return (
    <ReactFlowProvider>
      <DiagramCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
