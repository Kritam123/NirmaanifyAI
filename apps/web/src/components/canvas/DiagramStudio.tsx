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
import { AiArchitectModal } from './ai/AiArchitectModal';
import { ExportModal } from './export/ExportModal';
import { RevisionHistoryModal } from './history/RevisionHistoryModal';

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

  const [documentContent, setDocumentContent] = useState<string>(
    currentDiagram.document || '',
  );
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>(
    currentDiagram.settings || { grid: true, snapToGrid: true, theme: 'dark' },
  );

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<any>(null);

  // Sync canvas when switching diagram tabs
  const handleSelectDiagram = useCallback(
    (diagramId: string) => {
      const selected = diagramsList.find((d) => d.id === diagramId);
      if (selected) {
        setCurrentDiagram(selected);
        setNodes(selected.nodes as any);
        setEdges(selected.edges as any);
        setDocumentContent(selected.document || '');
        setCanvasSettings(selected.settings || { grid: true, snapToGrid: true, theme: 'dark' });
      }
    },
    [diagramsList, setNodes, setEdges],
  );

  // Connect handler
  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        ...connection,
        id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: 'smoothstep',
        data: { label: '', protocol: 'HTTPS', lineStyle: 'solid' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges],
  );

  // Selection handlers
  const onSelectionChange = useCallback(({ nodes: selNodes, edges: selEdges }: any) => {
    setSelectedNodeId(selNodes.length > 0 ? selNodes[0].id : null);
    setSelectedEdgeId(selEdges.length > 0 ? selEdges[0].id : null);
  }, []);

  const selectedNode = useMemo(
    () => (nodes.find((n) => n.id === selectedNodeId) as CanvasNode) || null,
    [nodes, selectedNodeId],
  );

  const selectedEdge = useMemo(
    () => (edges.find((e) => e.id === selectedEdgeId) as CanvasEdge) || null,
    [edges, selectedEdgeId],
  );

  // Node & Edge Data updates from Inspector
  const handleUpdateNodeData = useCallback(
    (nodeId: string, newData: any) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n)),
      );
    },
    [setNodes],
  );

  const handleUpdateEdgeData = useCallback(
    (edgeId: string, newData: any) => {
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
    [setEdges],
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

        setNodes((nds) => nds.concat(newNode));
      } catch (err) {
        console.error('Failed to parse dropped stencil:', err);
      }
    },
    [reactFlowInstance, setNodes],
  );

  // Auto-Layout via Dagre
  const handleAutoLayout = useCallback(
    (direction: 'LR' | 'TB' = 'LR') => {
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
    [setNodes, setEdges, handleUpdateTitle, reactFlowInstance, toast],
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
    <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-950 font-sans">
      {/* Top Navbar */}
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
      />

      {/* Main Studio Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Stencil Palette */}
        <StencilSidebar />

        {/* Center Vector Canvas */}
        <div className="flex-1 h-full relative" onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes as any}
            edgeTypes={edgeTypes as any}
            fitView
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
            <Controls className="!bg-[#141724] !border-[#24293D] !rounded-xl !shadow-lg [&>button]:!border-[#24293D] [&>button]:!text-slate-300 hover:[&>button]:!bg-[#1E2337]" />
            <MiniMap
              nodeColor="#635BFF"
              maskColor="rgba(9, 10, 15, 0.8)"
              className="!bg-[#141724] !border-[#24293D] !rounded-xl !shadow-lg"
            />
          </ReactFlow>
        </div>

        {/* Right Inspector & Eraser.io Markdown Sidecar */}
        <CanvasInspector
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          onUpdateNodeData={handleUpdateNodeData}
          onUpdateEdgeData={handleUpdateEdgeData}
          documentContent={documentContent}
          onUpdateDocument={setDocumentContent}
          onReviewArchitecture={handleReviewArchitecture}
          isReviewing={isReviewing}
          reviewResult={reviewResult}
          canvasSettings={canvasSettings}
          onUpdateSettings={setCanvasSettings}
        />
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
  );
}

export function DiagramStudio(props: DiagramStudioProps) {
  return (
    <ReactFlowProvider>
      <DiagramCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
