import { CSSPropertyDefinition } from '../../types/property';

export const color: CSSPropertyDefinition = {
  name: 'color',
  label: 'Text Color',
  category: 'colors',
  description: 'Sets the foreground color value of an element’s text and text decorations.',
  valueType: ['color', 'keyword'],
  validKeywords: ['currentcolor', 'transparent'],
  supportedFunctions: ['var', 'rgb', 'rgba', 'hsl', 'hsla', 'oklch'],
  defaultValue: 'currentcolor',
  inherited: true,
  animatable: true,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const backgroundColor: CSSPropertyDefinition = {
  name: 'background-color',
  label: 'Background Color',
  category: 'colors',
  description: 'Sets the background color of an element.',
  valueType: ['color', 'keyword'],
  validKeywords: ['transparent'],
  supportedFunctions: ['var', 'rgb', 'rgba', 'hsl', 'hsla', 'oklch'],
  defaultValue: 'transparent',
  inherited: false,
  animatable: true,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const borderColor: CSSPropertyDefinition = {
  name: 'border-color',
  label: 'Border Color',
  category: 'borders',
  description: 'Sets the color of an element’s border.',
  valueType: ['color', 'keyword'],
  validKeywords: ['currentcolor', 'transparent'],
  supportedFunctions: ['var', 'rgb', 'rgba', 'hsl', 'hsla', 'oklch'],
  defaultValue: 'currentcolor',
  inherited: false,
  animatable: true,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const opacity: CSSPropertyDefinition = {
  name: 'opacity',
  label: 'Opacity',
  category: 'effects',
  description: 'Sets the opacity of an element.',
  valueType: ['number', 'percentage'],
  supportedFunctions: ['var', 'calc'],
  defaultValue: '1',
  inherited: false,
  animatable: true,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const colorProperties = [
  color,
  backgroundColor,
  borderColor,
  opacity,
];
