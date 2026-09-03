import { CSSPropertyDefinition } from '../../types/property';

export const fontFamily: CSSPropertyDefinition = {
  name: 'font-family',
  label: 'Font Family',
  category: 'typography',
  description: 'Specifies a prioritized list of one or more font family names and/or generic family names.',
  valueType: ['string', 'keyword'],
  validKeywords: ['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui'],
  defaultValue: 'sans-serif',
  inherited: true,
  animatable: false,
  responsive: false,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const fontSize: CSSPropertyDefinition = {
  name: 'font-size',
  label: 'Font Size',
  category: 'typography',
  description: 'Sets the size of the font.',
  valueType: ['length', 'percentage', 'keyword'],
  validKeywords: ['xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large'],
  supportedFunctions: ['clamp', 'calc', 'var'],
  defaultValue: '16px',
  inherited: true,
  animatable: true,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const fontWeight: CSSPropertyDefinition = {
  name: 'font-weight',
  label: 'Font Weight',
  category: 'typography',
  description: 'Sets the weight (or boldness) of the font.',
  valueType: ['keyword', 'integer'],
  validKeywords: ['normal', 'bold', 'lighter', 'bolder', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
  defaultValue: '400',
  inherited: true,
  animatable: true,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const lineHeight: CSSPropertyDefinition = {
  name: 'line-height',
  label: 'Line Height',
  category: 'typography',
  description: 'Sets the height of a line box.',
  valueType: ['number', 'length', 'percentage', 'keyword'],
  validKeywords: ['normal'],
  supportedFunctions: ['calc', 'var'],
  defaultValue: 'normal',
  inherited: true,
  animatable: true,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const letterSpacing: CSSPropertyDefinition = {
  name: 'letter-spacing',
  label: 'Letter Spacing',
  category: 'typography',
  description: 'Sets the horizontal spacing behavior between text characters.',
  valueType: ['length', 'keyword'],
  validKeywords: ['normal'],
  supportedFunctions: ['calc', 'var'],
  defaultValue: 'normal',
  inherited: true,
  animatable: true,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const textAlign: CSSPropertyDefinition = {
  name: 'text-align',
  label: 'Text Align',
  category: 'typography',
  description: 'Sets the horizontal alignment of the inline-level content inside a block element.',
  valueType: ['keyword'],
  validKeywords: ['left', 'right', 'center', 'justify', 'start', 'end'],
  defaultValue: 'start',
  inherited: true,
  animatable: false,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const textTransform: CSSPropertyDefinition = {
  name: 'text-transform',
  label: 'Text Transform',
  category: 'typography',
  description: 'Specifies how to capitalize an element’s text.',
  valueType: ['keyword'],
  validKeywords: ['none', 'capitalize', 'uppercase', 'lowercase'],
  defaultValue: 'none',
  inherited: true,
  animatable: false,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const typographyProperties = [
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textAlign,
  textTransform,
];
