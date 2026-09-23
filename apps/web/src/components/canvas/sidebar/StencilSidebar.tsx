'use client';

import React, { useState } from 'react';
import {
  Search,
  Cloud,
  Layers,
  Database,
  Workflow,
  Square,
  StickyNote,
  Type,
  Box,
  ChevronDown,
  ChevronRight,
  Server,
  Zap,
  Globe,
  Radio,
  Key,
  Shield,
  Laptop,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutGrid,
  List,
  HardDrive,
  Boxes,
  Table,
} from 'lucide-react';
import { CanvasNodeType, CanvasNodeData } from '@nirmaanify/types';

export interface StencilSidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

interface StencilItem {
  id: string;
  label: string;
  type: CanvasNodeType;
  icon: string;
  category: string;
  data: Partial<CanvasNodeData>;
}

const STENCILS: Record<string, { title: string; icon: any; items: StencilItem[] }> = {
  cloud: {
    title: 'Cloud & Services',
    icon: Cloud,
    items: [
      {
        id: 'st-client',
        label: 'Client Web/Mobile',
        type: 'cloud-service',
        icon: 'client',
        category: 'compute',
        data: { label: 'Client Device', subtitle: 'Web / iOS / Android', provider: 'generic', icon: 'client' },
      },
      {
        id: 'st-apigw',
        label: 'API Gateway',
        type: 'cloud-service',
        icon: 'api-gateway',
        category: 'networking',
        data: { label: 'API Gateway', subtitle: 'Envoy / Kong / AWS GW', provider: 'aws', icon: 'api-gateway' },
      },
      {
        id: 'st-lambda',
        label: 'Serverless Handler',
        type: 'cloud-service',
        icon: 'lambda',
        category: 'compute',
        data: { label: 'Lambda Worker', subtitle: 'AWS Lambda / Cloud Run', provider: 'aws', icon: 'lambda' },
      },
      {
        id: 'st-s3',
        label: 'Object Storage (S3)',
        type: 'cloud-service',
        icon: 's3',
        category: 'storage',
        data: { label: 'S3 Bucket', subtitle: 'Assets & Media Storage', provider: 'aws', icon: 's3' },
      },
      {
        id: 'st-postgres',
        label: 'PostgreSQL DB',
        type: 'cloud-service',
        icon: 'postgres',
        category: 'database',
        data: { label: 'PostgreSQL', subtitle: 'ACID Relational Storage', provider: 'generic', icon: 'postgres' },
      },
      {
        id: 'st-redis',
        label: 'Redis Cache',
        type: 'cloud-service',
        icon: 'redis',
        category: 'database',
        data: { label: 'Redis Cluster', subtitle: 'In-Memory Cache & Pub/Sub', provider: 'generic', icon: 'redis' },
      },
      {
        id: 'st-kafka',
        label: 'Kafka Event Bus',
        type: 'cloud-service',
        icon: 'kafka',
        category: 'queue',
        data: { label: 'Kafka Cluster', subtitle: 'Message Bus Topics', provider: 'generic', icon: 'kafka' },
      },
      {
        id: 'st-k8s',
        label: 'Kubernetes Pod',
        type: 'cloud-service',
        icon: 'k8s',
        category: 'compute',
        data: { label: 'K8s Deployment', subtitle: 'Microservice Pods', provider: 'k8s', icon: 'k8s' },
      },
    ],
  },
  uml: {
    title: 'UML & Data Modeling',
    icon: Layers,
    items: [
      {
        id: 'st-uml-class',
        label: 'UML Class',
        type: 'uml-class',
        icon: 'uml',
        category: 'uml',
        data: {
          label: 'ServiceClass',
          stereotype: '<<service>>',
          umlAttributes: [{ name: 'id', type: 'UUID', visibility: '+' }],
          umlMethods: [{ name: 'execute', returnType: 'void', visibility: '+', params: '' }],
        },
      },
      {
        id: 'st-uml-interface',
        label: 'UML Interface',
        type: 'uml-class',
        icon: 'uml',
        category: 'uml',
        data: {
          label: 'IRepository',
          stereotype: '<<interface>>',
          umlMethods: [{ name: 'findById', returnType: 'Promise<T>', visibility: '+', params: 'id: string' }],
        },
      },
      {
        id: 'st-uml-sequence',
        label: 'Sequence Lifeline',
        type: 'uml-sequence',
        icon: 'uml',
        category: 'uml',
        data: { label: 'AuthServer', stereotype: '<<participant>>' },
      },
      {
        id: 'st-erd-table',
        label: 'ERD Database Table',
        type: 'database-table',
        icon: 'database',
        category: 'database',
        data: {
          label: 'table_name',
          columns: [
            { name: 'id', type: 'UUID', isPrimary: true },
            { name: 'created_at', type: 'TIMESTAMP' },
          ],
        },
      },
    ],
  },
  shapes: {
    title: 'Flowchart & Shapes',
    icon: Square,
    items: [
      {
        id: 'st-rect',
        label: 'Process Block',
        type: 'standard-shape',
        icon: 'shape',
        category: 'shape',
        data: { label: 'Process', shapeKind: 'rectangle' },
      },
      {
        id: 'st-diamond',
        label: 'Decision Diamond',
        type: 'standard-shape',
        icon: 'shape',
        category: 'shape',
        data: { label: 'Is Valid?', shapeKind: 'diamond' },
      },
      {
        id: 'st-cylinder',
        label: 'Cylinder Store',
        type: 'standard-shape',
        icon: 'database',
        category: 'shape',
        data: { label: 'Storage', shapeKind: 'cylinder' },
      },
      {
        id: 'st-pill',
        label: 'Start / End Pill',
        type: 'standard-shape',
        icon: 'shape',
        category: 'shape',
        data: { label: 'Start / End', shapeKind: 'pill' },
      },
      {
        id: 'st-circle',
        label: 'Circle State',
        type: 'standard-shape',
        icon: 'shape',
        category: 'shape',
        data: { label: 'Node', shapeKind: 'circle' },
      },
    ],
  },
  containers: {
    title: 'Containers & Boundaries',
    icon: Box,
    items: [
      {
        id: 'st-vpc',
        label: 'VPC / Network Boundary',
        type: 'system-group',
        icon: 'container',
        category: 'container',
        data: { label: 'Cloud VPC (us-east-1)', subtitle: '10.0.0.0/16' },
      },
      {
        id: 'st-cluster',
        label: 'Cluster Boundary',
        type: 'system-group',
        icon: 'container',
        category: 'container',
        data: { label: 'Production K8s Cluster', subtitle: 'Namespace: default' },
      },
      {
        id: 'st-dmz',
        label: 'Public DMZ Zone',
        type: 'system-group',
        icon: 'container',
        category: 'container',
        data: { label: 'Public Subnet / DMZ', subtitle: 'Internet Facing' },
      },
    ],
  },
  notes: {
    title: 'Notes & Annotations',
    icon: StickyNote,
    items: [
      {
        id: 'st-sticky',
        label: 'Sticky Note',
        type: 'sticky-note',
        icon: 'note',
        category: 'annotation',
        data: { label: 'Architecture Note', description: 'Review note / Architecture decision record (ADR)' },
      },
      {
        id: 'st-text',
        label: 'Text Title',
        type: 'text-annotation',
        icon: 'text',
        category: 'annotation',
        data: { label: 'Tier Label', subtitle: 'Architecture Section' },
      },
    ],
  },
};

const getStencilIcon = (item: StencilItem) => {
  switch (item.icon) {
    case 'client': return Laptop;
    case 'api-gateway': return Radio;
    case 'lambda': return Zap;
    case 's3': return HardDrive;
    case 'postgres': return Database;
    case 'redis': return Server;
    case 'kafka': return Workflow;
    case 'k8s': return Boxes;
    case 'uml': return Layers;
    case 'database': return Table;
    case 'shape':
      if (item.data.shapeKind === 'diamond') return Shield;
      if (item.data.shapeKind === 'cylinder') return Database;
      return Square;
    case 'container': return Box;
    case 'note': return StickyNote;
    case 'text': return Type;
    default: return Cloud;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'compute': return 'text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/25';
    case 'storage': return 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25';
    case 'database': return 'text-sky-500 dark:text-sky-400 bg-sky-500/10 border-sky-500/25';
    case 'networking': return 'text-violet-500 dark:text-violet-400 bg-violet-500/10 border-violet-500/25';
    case 'queue': return 'text-orange-500 dark:text-orange-400 bg-orange-500/10 border-orange-500/25';
    case 'uml': return 'text-fuchsia-500 dark:text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/25';
    case 'shape': return 'text-teal-500 dark:text-teal-400 bg-teal-500/10 border-teal-500/25';
    case 'container': return 'text-indigo-500 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/25';
    case 'annotation': return 'text-yellow-500 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/25';
    default: return 'text-[#635BFF] bg-[#635BFF]/10 border-[#635BFF]/25';
  }
};

export const StencilSidebar: React.FC<StencilSidebarProps> = ({
  isOpen = true,
  onToggle,
}) => {
  const [search, setSearch] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'icons' | 'labels'>('icons');

  const toggleCategory = (catKey: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [catKey]: !prev[catKey] }));
  };

  const onDragStart = (event: React.DragEvent, item: StencilItem) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      type: item.type,
      data: item.data,
    }));
    event.dataTransfer.effectAllowed = 'move';
  };

  // High-Visibility Rail Mode when Collapsed
  if (!isOpen) {
    return (
      <aside className="w-16 border-r border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0F111A] flex flex-col items-center py-3 select-none shrink-0 z-10 transition-all">
        {/* Expand Toggle */}
        <button
          type="button"
          onClick={onToggle}
          className="w-10 h-10 flex flex-col items-center justify-center rounded-xl bg-slate-100 dark:bg-[#141724] border border-slate-300 dark:border-[#2E354F] text-[#635BFF] hover:bg-[#635BFF]/15 hover:border-[#635BFF] shadow-sm transition-all mb-3 group"
          title="Expand Stencils Palette (Ctrl+[)"
        >
          <PanelLeftOpen className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </button>

        {/* Quick Category Icons with Visible Labels */}
        <div className="flex-1 flex flex-col items-center gap-1.5 w-full px-1 overflow-y-auto">
          {Object.entries(STENCILS).map(([key, section]) => {
            const IconComp = section.icon;
            const primaryItem = section.items[0];
            return (
              <button
                key={key}
                type="button"
                draggable
                onDragStart={(e) => onDragStart(e, primaryItem)}
                onClick={() => {
                  onToggle?.();
                  setCollapsedCategories((prev) => ({ ...prev, [key]: false }));
                }}
                className="w-full flex flex-col items-center py-2 px-1 rounded-xl text-slate-500 dark:text-slate-300 hover:text-white hover:bg-slate-100 dark:hover:bg-[#1C2033] border border-transparent hover:border-[#635BFF]/40 transition-all group cursor-grab active:cursor-grabbing"
                title={`${section.title} — Click to expand or drag directly onto canvas`}
              >
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#141724] text-[#635BFF] group-hover:scale-105 transition-transform">
                  <IconComp className="h-4 w-4" />
                </div>
                <span className="text-[9px] font-semibold tracking-tight text-slate-500 dark:text-slate-400 group-hover:text-slate-200 mt-1 truncate max-w-[54px]">
                  {section.title.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-72 border-r border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0F111A] flex flex-col h-full select-none shrink-0 z-10 transition-all">
      {/* Search & Collapse Header */}
      <div className="p-3 border-b border-slate-200 dark:border-[#24293D] space-y-2.5 bg-slate-50/50 dark:bg-[#141724]/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">
            Stencils & Shapes
          </span>

          <div className="flex items-center gap-1.5">
            {/* View Mode Toggle: Icons vs Names */}
            <div className="flex items-center gap-0.5 bg-slate-200/80 dark:bg-[#1A1E2E] p-0.5 rounded-lg border border-slate-300 dark:border-[#2E354F]">
              <button
                type="button"
                onClick={() => setViewMode('icons')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${
                  viewMode === 'icons'
                    ? 'bg-white dark:bg-[#635BFF] text-[#635BFF] dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Switch to Icon-based Grid"
              >
                <LayoutGrid className="h-3 w-3" />
                <span className="hidden sm:inline">Icons</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('labels')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${
                  viewMode === 'labels'
                    ? 'bg-white dark:bg-[#635BFF] text-[#635BFF] dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Switch to Name & Details List"
              >
                <List className="h-3 w-3" />
                <span className="hidden sm:inline">Names</span>
              </button>
            </div>

            {onToggle && (
              <button
                type="button"
                onClick={onToggle}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#1E2337] transition-colors"
                title="Collapse Sidebar (Ctrl+[)"
              >
                <PanelLeftClose className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stencils, AWS, UML, shapes..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#141724] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
          />
        </div>
        <div className="text-[10px] text-slate-400 text-center font-medium">
          Drag & drop onto canvas • {viewMode === 'icons' ? 'Icon View' : 'Name & Spec View'}
        </div>
      </div>

      {/* Categories & Stencil Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {Object.entries(STENCILS).map(([key, section]) => {
          const filteredItems = section.items.filter(
            (item) =>
              item.label.toLowerCase().includes(search.toLowerCase()) ||
              (item.data.subtitle && item.data.subtitle.toLowerCase().includes(search.toLowerCase())) ||
              (item.data.provider && item.data.provider.toLowerCase().includes(search.toLowerCase())),
          );
          if (filteredItems.length === 0) return null;

          const isCollapsed = collapsedCategories[key];
          const IconComp = section.icon;

          return (
            <div key={key} className="space-y-2">
              <button
                type="button"
                onClick={() => toggleCategory(key)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <IconComp className="h-3.5 w-3.5 text-[#635BFF]" />
                  <span>{section.title}</span>
                  <span className="text-[10px] font-mono text-slate-400">({filteredItems.length})</span>
                </div>
                {isCollapsed ? (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                )}
              </button>

              {!isCollapsed && (
                <>
                  {viewMode === 'icons' ? (
                    /* Mode 1: Icon-Centric Grid (Visual Shapes & Stencils) */
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      {filteredItems.map((item) => {
                        const StencilIcon = getStencilIcon(item);
                        const colorStyle = getCategoryColor(item.category);
                        return (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => onDragStart(e, item)}
                            className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-200 dark:border-[#24293D] bg-slate-50/80 dark:bg-[#141724]/80 hover:border-[#635BFF] hover:bg-white dark:hover:bg-[#1C2033] hover:shadow-md cursor-grab active:cursor-grabbing transition-all text-center group"
                            title={`${item.label} — ${item.data.subtitle || ''} (Drag onto canvas)`}
                          >
                            <div className={`p-2 rounded-lg border mb-1.5 ${colorStyle} group-hover:scale-110 transition-transform`}>
                              <StencilIcon className="h-5 w-5" />
                            </div>
                            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 line-clamp-1 w-full">
                              {item.label}
                            </span>
                            {item.data.subtitle && (
                              <span className="text-[9px] text-slate-400 line-clamp-1 w-full mt-0.5">
                                {item.data.subtitle}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Mode 2: Name & Spec-Centric List (Detailed Technical Stencils) */
                    <div className="flex flex-col gap-1.5 pt-0.5">
                      {filteredItems.map((item) => {
                        const StencilIcon = getStencilIcon(item);
                        const colorStyle = getCategoryColor(item.category);
                        const providerBadge = item.data.provider || item.category;
                        return (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => onDragStart(e, item)}
                            className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-200 dark:border-[#24293D] bg-slate-50/80 dark:bg-[#141724]/80 hover:border-[#635BFF] hover:bg-white dark:hover:bg-[#1C2033] hover:shadow-sm cursor-grab active:cursor-grabbing transition-all group"
                            title={`Drag ${item.label} onto canvas`}
                          >
                            <div className={`p-1.5 rounded-lg border shrink-0 ${colorStyle} group-hover:scale-105 transition-transform`}>
                              <StencilIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                                {item.label}
                              </div>
                              {item.data.subtitle && (
                                <div className="text-[10px] text-slate-400 truncate">
                                  {item.data.subtitle}
                                </div>
                              )}
                            </div>
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#1F2438] text-slate-600 dark:text-slate-300 shrink-0 font-bold">
                              {providerBadge}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
