import React from 'react';
import { z } from 'zod';
import { ComponentNode, ComponentNodeStyle } from '@nirmaanify/types';

export type ComponentCategory =
  | 'layout'
  | 'basic'
  | 'typography'
  | 'media'
  | 'marketing'
  | 'ecommerce'
  | 'forms'
  | 'dashboard';

export type InspectorControlType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'color'
  | 'slider'
  | 'switch'
  | 'number'
  | 'alignment'
  | 'icon'
  | 'spacing'
  | 'image-url';

export interface InspectorControlOption {
  label: string;
  value: any;
}

export interface InspectorControl {
  name: string;
  label: string;
  type: InspectorControlType;
  options?: InspectorControlOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  defaultValue?: any;
  group?: 'content' | 'style' | 'layout' | 'advanced';
  description?: string;
}

export interface ComponentRenderProps {
  id: string;
  node: ComponentNode;
  mode?: 'preview' | 'builder' | 'live';
  selectedNodeId?: string | null;
  hoveredNodeId?: string | null;
  onSelectNode?: (id: string, e?: React.MouseEvent) => void;
  onHoverNode?: (id: string | null) => void;
  children?: React.ReactNode;
  [key: string]: any;
}

export interface ComponentDefinition<TProps = Record<string, any>> {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  icon: string;
  component: React.ComponentType<ComponentRenderProps & TProps>;
  propsSchema: z.ZodType<TProps, any, any>;
  defaultProps: TProps;
  defaultStyle?: ComponentNodeStyle;
  allowedChildren?: string[] | boolean; // true: any child, false: no children, array: only specific component IDs
  inspectorControls: InspectorControl[];
  requiredPackages?: string[];
  createDefaultNode?: (id: string, parentId?: string | null) => ComponentNode;
}
