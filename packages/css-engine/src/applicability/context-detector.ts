import { DisplayMode, LayoutContextMode } from '../types/property';
import { ELEMENT_CLASSIFICATIONS } from '../types/element';

export interface StyleNodeContext {
  id: string;
  tagName: string;
  componentType: string;
  props?: Record<string, any>;
  style?: Record<string, any>;
}

export interface ComputedElementContext {
  element: {
    id: string;
    tagName: string;
    category: string;
    display: DisplayMode;
    position: string;
    isReplaced: boolean;
    supportsChildren: boolean;
  };
  parent?: {
    id: string;
    tagName: string;
    display: DisplayMode;
    layoutMode: LayoutContextMode;
  };
  layoutMode: LayoutContextMode;
}

export function detectElementContext(
  node: StyleNodeContext,
  parent?: StyleNodeContext
): ComputedElementContext {
  const meta = ELEMENT_CLASSIFICATIONS[node.tagName.toLowerCase()] || {
    tag: node.tagName,
    category: 'custom',
    defaultDisplay: 'block',
    isReplacedElement: false,
    supportsChildren: true,
    supportsInlineDimensions: true,
    inheritsTextStyles: true,
  };

  const rawDisplay = (node.style?.display || meta.defaultDisplay).toLowerCase() as DisplayMode;
  const rawPosition = (node.style?.position || 'static').toLowerCase();

  let parentContext: ComputedElementContext['parent'] | undefined = undefined;
  if (parent) {
    const parentMeta = ELEMENT_CLASSIFICATIONS[parent.tagName.toLowerCase()] || {
      tag: parent.tagName,
      category: 'container',
      defaultDisplay: 'block',
    };
    const parentDisplay = (parent.style?.display || parentMeta.defaultDisplay).toLowerCase() as DisplayMode;
    
    let parentLayout: LayoutContextMode = 'normal-flow';
    if (parentDisplay === 'flex' || parentDisplay === 'inline-flex') {
      parentLayout = 'flex-container';
    } else if (parentDisplay === 'grid' || parentDisplay === 'inline-grid') {
      parentLayout = 'grid-container';
    }

    parentContext = {
      id: parent.id,
      tagName: parent.tagName,
      display: parentDisplay,
      layoutMode: parentLayout,
    };
  }

  // Determine current element's layout mode
  let layoutMode: LayoutContextMode = 'normal-flow';
  if (rawPosition === 'absolute' || rawPosition === 'fixed') {
    layoutMode = 'positioned';
  } else if (parentContext?.layoutMode === 'flex-container') {
    layoutMode = 'flex-item';
  } else if (parentContext?.layoutMode === 'grid-container') {
    layoutMode = 'grid-item';
  } else if (rawDisplay === 'flex' || rawDisplay === 'inline-flex') {
    layoutMode = 'flex-container';
  } else if (rawDisplay === 'grid' || rawDisplay === 'inline-grid') {
    layoutMode = 'grid-container';
  }

  return {
    element: {
      id: node.id,
      tagName: node.tagName,
      category: meta.category,
      display: rawDisplay,
      position: rawPosition,
      isReplaced: meta.isReplacedElement,
      supportsChildren: meta.supportsChildren,
    },
    parent: parentContext,
    layoutMode,
  };
}
