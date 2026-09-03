export type StyleOrigin =
  | 'default'
  | 'token'
  | 'component'
  | 'class'
  | 'override'
  | 'inline';

export interface StyleValue {
  value: string;
  source: StyleOrigin;
  tokenRef?: string; // e.g. "--color-primary" or "--radius-md"
  important?: boolean;
}

export type BreakpointKey = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ContainerQueryRule {
  containerName?: string;
  condition: string; // e.g. "(min-width: 600px)"
  styles: Record<string, StyleValue>;
}

export interface ResponsiveStyleObject {
  base?: Record<string, StyleValue>;
  sm?: Record<string, StyleValue>;
  md?: Record<string, StyleValue>;
  lg?: Record<string, StyleValue>;
  xl?: Record<string, StyleValue>;
  '2xl'?: Record<string, StyleValue>;
  containerQueries?: ContainerQueryRule[];
}

export interface ElementStateStyles {
  normal: ResponsiveStyleObject;
  hover?: ResponsiveStyleObject;
  active?: ResponsiveStyleObject;
  focus?: ResponsiveStyleObject;
  focusVisible?: ResponsiveStyleObject;
  disabled?: ResponsiveStyleObject;
  checked?: ResponsiveStyleObject;
}

export interface ElementStyleAST {
  nodeId: string;
  states: ElementStateStyles;
  customClasses?: string[];
  scopedCustomCss?: string;
  version?: number;
}

export function createDefaultElementStyle(nodeId: string): ElementStyleAST {
  return {
    nodeId,
    states: {
      normal: {
        base: {},
      },
    },
    version: 1,
  };
}

export function getStyleForState(
  ast: ElementStyleAST,
  state: keyof ElementStateStyles = 'normal',
  breakpoint: BreakpointKey = 'base'
): Record<string, StyleValue> {
  const stateObj = ast.states[state] || ast.states.normal;
  const bpStyles = stateObj[breakpoint] || {};
  
  // If requesting a breakpoint other than base, inherit/merge from base
  if (breakpoint !== 'base') {
    return {
      ...(stateObj.base || {}),
      ...bpStyles,
    };
  }
  
  return bpStyles;
}

export function setStyleProperty(
  ast: ElementStyleAST,
  property: string,
  value: string,
  options?: {
    state?: keyof ElementStateStyles;
    breakpoint?: BreakpointKey;
    tokenRef?: string;
    source?: StyleOrigin;
  }
): ElementStyleAST {
  const state = options?.state || 'normal';
  const breakpoint = options?.breakpoint || 'base';
  const source = options?.source || (options?.tokenRef ? 'token' : 'override');

  const cloned = JSON.parse(JSON.stringify(ast)) as ElementStyleAST;
  if (!cloned.states[state]) {
    cloned.states[state] = { base: {} };
  }
  if (!cloned.states[state]![breakpoint]) {
    cloned.states[state]![breakpoint] = {};
  }

  cloned.states[state]![breakpoint]![property] = {
    value,
    source,
    tokenRef: options?.tokenRef,
  };

  return cloned;
}
