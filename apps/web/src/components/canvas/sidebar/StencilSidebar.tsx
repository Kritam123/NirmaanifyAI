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
} from 'lucide-react';
import { CanvasNodeType, CanvasNodeData } from '@nirmaanify/types';

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

export const StencilSidebar: React.FC = () => {
  const [search, setSearch] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

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

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0F111A] flex flex-col h-full select-none shrink-0">
      {/* Search Header */}
      <div className="p-3 border-b border-slate-200 dark:border-[#24293D]">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stencils & shapes..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-[#24293D] bg-slate-50 dark:bg-[#141724] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
          />
        </div>
        <div className="mt-1.5 text-[10px] text-slate-400 text-center font-medium">
          Drag & drop onto canvas
        </div>
      </div>

      {/* Categories & Stencil Grid */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {Object.entries(STENCILS).map(([key, section]) => {
          const filteredItems = section.items.filter((item) =>
            item.label.toLowerCase().includes(search.toLowerCase()),
          );
          if (filteredItems.length === 0) return null;

          const isCollapsed = collapsedCategories[key];
          const IconComp = section.icon;

          return (
            <div key={key} className="space-y-1.5">
              <button
                type="button"
                onClick={() => toggleCategory(key)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <IconComp className="h-3.5 w-3.5 text-[#635BFF]" />
                  <span>{section.title}</span>
                </div>
                {isCollapsed ? (
                  <ChevronRight className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>

              {!isCollapsed && (
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, item)}
                      className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-[#24293D] bg-slate-50/70 dark:bg-[#141724]/70 hover:border-[#635BFF] hover:bg-white dark:hover:bg-[#1C2033] hover:shadow-sm cursor-grab active:cursor-grabbing transition-all text-center"
                    >
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate w-full">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
