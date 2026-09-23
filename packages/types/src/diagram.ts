/**
 * System Architecture & UML Diagramming Canvas Types
 * Supports Draw.io + Eraser.io style vector canvas, stencil models, and AI scaffolding
 */

export type DiagramType =
  | 'SYSTEM_ARCHITECTURE'
  | 'UML_CLASS'
  | 'UML_SEQUENCE'
  | 'CLOUD_INFRASTRUCTURE'
  | 'DATABASE_ERD'
  | 'FLOWCHART'
  | 'NETWORK_TOPOLOGY'
  | 'WHITEBOARD';

export type CanvasNodeType =
  | 'cloud-service'
  | 'uml-class'
  | 'uml-sequence'
  | 'database-table'
  | 'system-group'
  | 'standard-shape'
  | 'sticky-note'
  | 'text-annotation';

export type CloudProvider = 'aws' | 'gcp' | 'azure' | 'k8s' | 'docker' | 'generic';

export type ComponentCategory =
  | 'compute'
  | 'storage'
  | 'database'
  | 'networking'
  | 'queue'
  | 'security'
  | 'ai'
  | 'uml'
  | 'shape'
  | 'container'
  | 'annotation';

export type StandardShapeKind =
  | 'rectangle'
  | 'rounded'
  | 'pill'
  | 'diamond'
  | 'cylinder'
  | 'cloud'
  | 'parallelogram'
  | 'circle';

export interface UmlAttribute {
  name: string;
  type: string;
  visibility: '+' | '-' | '#' | '~';
}

export interface UmlMethod {
  name: string;
  returnType: string;
  visibility: '+' | '-' | '#' | '~';
  params?: string;
}

export interface TableColumn {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  nullable?: boolean;
}

export interface CanvasNodeStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  color?: string;
  fontSize?: number;
  borderRadius?: number;
  opacity?: number;
}

export interface CanvasNodeData {
  label: string;
  subtitle?: string;
  icon?: string;
  category?: ComponentCategory;
  provider?: CloudProvider;
  status?: 'active' | 'warning' | 'deprecated' | 'planned';
  shapeKind?: StandardShapeKind;
  stereotype?: string;
  umlAttributes?: UmlAttribute[];
  umlMethods?: UmlMethod[];
  columns?: TableColumn[];
  description?: string;
  tags?: string[];
  style?: CanvasNodeStyle;
  groupId?: string;
  [key: string]: any;
}

export interface CanvasNode {
  id: string;
  type: CanvasNodeType;
  position: { x: number; y: number };
  data: CanvasNodeData;
  width?: number;
  height?: number;
  parentId?: string;
  extent?: 'parent' | undefined;
  draggable?: boolean;
  selectable?: boolean;
  selected?: boolean;
}

export type EdgeRoutingType = 'smoothstep' | 'orthogonal' | 'straight' | 'bezier';

export type MarkerType =
  | 'arrow'
  | 'arrowclosed'
  | 'diamond'
  | 'circle'
  | 'inheritance'
  | 'aggregation'
  | 'composition';

export interface CanvasEdgeData {
  label?: string;
  protocol?: string; // e.g. "HTTPS", "gRPC", "Kafka topic", "WSS", "SQL"
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  animated?: boolean;
  color?: string;
  strokeWidth?: number;
  bidirectional?: boolean;
  [key: string]: any;
}

export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  type?: EdgeRoutingType;
  label?: string;
  animated?: boolean;
  style?: Record<string, any>;
  data?: CanvasEdgeData;
  markerEnd?: string | { type: MarkerType; color?: string };
  markerStart?: string | { type: MarkerType; color?: string };
}

export interface CanvasViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface CanvasSettings {
  grid: boolean;
  snapToGrid: boolean;
  gridType?: 'dots' | 'lines' | 'cross';
  gridSize?: number;
  theme: 'dark' | 'light' | 'blueprint';
  layoutDirection?: 'TB' | 'LR';
}

export interface DiagramDto {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  type: DiagramType;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: CanvasViewport;
  settings: CanvasSettings;
  document?: string; // Markdown architecture specification sidecar
  thumbnail?: string;
  version: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateDiagramDto {
  name: string;
  description?: string;
  type?: DiagramType;
  nodes?: CanvasNode[];
  edges?: CanvasEdge[];
  viewport?: CanvasViewport;
  settings?: CanvasSettings;
  document?: string;
}

export interface UpdateDiagramDto {
  name?: string;
  description?: string;
  type?: DiagramType;
  nodes?: CanvasNode[];
  edges?: CanvasEdge[];
  viewport?: CanvasViewport;
  settings?: CanvasSettings;
  document?: string;
  thumbnail?: string;
}

export interface DiagramRevisionDto {
  id: string;
  diagramId: string;
  version: number;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  document?: string;
  snapshotUrl?: string;
  createdById?: string;
  createdAt: string | Date;
}

export interface AiScaffoldDiagramRequest {
  projectId: string;
  prompt: string;
  diagramType?: DiagramType;
  cloudProvider?: CloudProvider;
  diagramId?: string; // If updating an existing diagram
}

export interface AiScaffoldDiagramResponse {
  diagramId?: string;
  name: string;
  description: string;
  diagramType: DiagramType;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  document: string; // Generated markdown architecture documentation
  summary: string;
  layoutTiers: string[];
}

export interface AiIterateDiagramRequest {
  diagramId: string;
  instruction: string;
}

export interface AiArchitectureReviewResponse {
  score: number; // 0 - 100
  overview: string;
  strengths: string[];
  singlePointsOfFailure: string[];
  scalingBottlenecks: string[];
  securityRecommendations: string[];
  suggestedNodes: Array<{
    action: 'add' | 'modify' | 'remove';
    description: string;
  }>;
}

export interface ArchitectureTemplateDto {
  id: string;
  name: string;
  category: DiagramType;
  description: string;
  previewUrl?: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  document: string;
  tags: string[];
}
