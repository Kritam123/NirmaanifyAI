export type CSSCategory =
  | 'layout'
  | 'flexbox'
  | 'grid'
  | 'box-model'
  | 'typography'
  | 'colors'
  | 'backgrounds'
  | 'borders'
  | 'effects'
  | 'transforms'
  | 'transitions'
  | 'animations'
  | 'scroll'
  | 'interactions'
  | 'advanced';

export type DisplayMode =
  | 'block'
  | 'inline'
  | 'inline-block'
  | 'flex'
  | 'inline-flex'
  | 'grid'
  | 'inline-grid'
  | 'table'
  | 'inline-table'
  | 'contents'
  | 'list-item'
  | 'none';

export type LayoutContextMode =
  | 'normal-flow'
  | 'flex-container'
  | 'flex-item'
  | 'grid-container'
  | 'grid-item'
  | 'positioned'
  | 'table-cell';

export type CSSValueType =
  | 'length'
  | 'percentage'
  | 'color'
  | 'keyword'
  | 'gradient'
  | 'image'
  | 'track-list'
  | 'shadow'
  | 'filter'
  | 'transform'
  | 'timing-function'
  | 'integer'
  | 'number'
  | 'string';

export interface PropertyDependency {
  target: 'parent' | 'self' | 'ancestor';
  property: string;
  expectedValues: string[];
}

export interface PropertyConflict {
  conflictingProperty: string;
  reason: string;
  severity: 'warning' | 'incompatible';
}

export interface BrowserSupport {
  baseline: 'widely' | 'newly' | 'limited';
  minChrome?: number;
  minFirefox?: number;
  minSafari?: number;
  notes?: string;
}

export interface CSSPropertyDefinition {
  name: string;
  label: string;
  category: CSSCategory;
  description: string;

  // Applicability criteria
  applicableElements?: string[]; // e.g. ['img', 'video']
  disallowedElements?: string[];
  displayModes?: DisplayMode[];  // applies when element's display is one of these
  layoutContext?: LayoutContextMode[]; // applies when element or parent is in layout mode
  dependencies?: PropertyDependency[];
  conflicts?: PropertyConflict[];

  // Value typing & intelligence
  valueType: CSSValueType[];
  validKeywords?: string[];
  supportedFunctions?: string[]; // calc, min, max, clamp, var, env, repeat, minmax
  defaultValue?: string;

  // Platform capabilities
  inherited: boolean;
  animatable: boolean;
  responsive: boolean;
  supportsVariables: boolean;
  supportsGlobalValues: boolean; // initial, inherit, unset, revert, revert-layer
  browserSupport?: BrowserSupport;

  // Related & shorthand relationships
  relatedProperties?: string[];
  shorthandGroup?: string;
}
