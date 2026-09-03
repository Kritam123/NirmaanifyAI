export type CSSLengthUnit =
  | 'px'
  | 'rem'
  | 'em'
  | '%'
  | 'vw'
  | 'vh'
  | 'dvw'
  | 'dvh'
  | 'svw'
  | 'svh'
  | 'lvw'
  | 'lvh'
  | 'ch'
  | 'ex'
  | 'vmin'
  | 'vmax'
  | 'fr'
  | 'pt';

export type CSSTimeUnit = 's' | 'ms';

export type CSSAngleUnit = 'deg' | 'rad' | 'grad' | 'turn';

export type CSSGlobalKeyword =
  | 'initial'
  | 'inherit'
  | 'unset'
  | 'revert'
  | 'revert-layer';

export const CSS_GLOBAL_KEYWORDS: CSSGlobalKeyword[] = [
  'initial',
  'inherit',
  'unset',
  'revert',
  'revert-layer',
];

export interface FluidClampValue {
  type: 'clamp';
  min: string;   // e.g. "1rem"
  ideal: string; // e.g. "2.5vw"
  max: string;   // e.g. "2.5rem"
}

export interface CalcExpression {
  type: 'calc';
  expression: string; // e.g. "100% - 24px"
}

export interface CSSVariableRef {
  type: 'var';
  variableName: string; // e.g. "--color-primary"
  fallback?: string;
}

export interface GridTrackMinMax {
  type: 'minmax';
  min: string; // e.g. "0"
  max: string; // e.g. "1fr"
}

export interface GridTrackRepeat {
  type: 'repeat';
  count: number | 'auto-fill' | 'auto-fit';
  track: string | GridTrackMinMax;
}

export function formatClamp(clamp: FluidClampValue): string {
  return `clamp(${clamp.min}, ${clamp.ideal}, ${clamp.max})`;
}

export function formatVar(ref: CSSVariableRef): string {
  return ref.fallback ? `var(${ref.variableName}, ${ref.fallback})` : `var(${ref.variableName})`;
}

export function formatRepeat(repeat: GridTrackRepeat): string {
  const trackStr = typeof repeat.track === 'string'
    ? repeat.track
    : `minmax(${repeat.track.min}, ${repeat.track.max})`;
  return `repeat(${repeat.count}, ${trackStr})`;
}
