import { CSSPropertyDefinition } from '../../types/property';

export const display: CSSPropertyDefinition = {
  name: 'display',
  label: 'Display',
  category: 'layout',
  description: 'Specifies the display behavior (the type of rendering box) of an element.',
  valueType: ['keyword'],
  validKeywords: [
    'block',
    'inline',
    'inline-block',
    'flex',
    'inline-flex',
    'grid',
    'inline-grid',
    'contents',
    'list-item',
    'none',
  ],
  defaultValue: 'block',
  inherited: false,
  animatable: false,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const boxSizing: CSSPropertyDefinition = {
  name: 'box-sizing',
  label: 'Box Sizing',
  category: 'layout',
  description: 'Sets how the total width and height of an element is calculated.',
  valueType: ['keyword'],
  validKeywords: ['border-box', 'content-box'],
  defaultValue: 'border-box',
  inherited: false,
  animatable: false,
  responsive: false,
  supportsVariables: false,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const overflow: CSSPropertyDefinition = {
  name: 'overflow',
  label: 'Overflow',
  category: 'layout',
  description: 'Sets what to do when content overflows its container.',
  valueType: ['keyword'],
  validKeywords: ['visible', 'hidden', 'clip', 'scroll', 'auto'],
  defaultValue: 'visible',
  inherited: false,
  animatable: false,
  responsive: true,
  supportsVariables: false,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const overflowX: CSSPropertyDefinition = {
  name: 'overflow-x',
  label: 'Overflow X',
  category: 'layout',
  description: 'Sets what to do when content overflows its container horizontally.',
  valueType: ['keyword'],
  validKeywords: ['visible', 'hidden', 'clip', 'scroll', 'auto'],
  defaultValue: 'visible',
  inherited: false,
  animatable: false,
  responsive: true,
  supportsVariables: false,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const overflowY: CSSPropertyDefinition = {
  name: 'overflow-y',
  label: 'Overflow Y',
  category: 'layout',
  description: 'Sets what to do when content overflows its container vertically.',
  valueType: ['keyword'],
  validKeywords: ['visible', 'hidden', 'clip', 'scroll', 'auto'],
  defaultValue: 'visible',
  inherited: false,
  animatable: false,
  responsive: true,
  supportsVariables: false,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const visibility: CSSPropertyDefinition = {
  name: 'visibility',
  label: 'Visibility',
  category: 'layout',
  description: 'Shows or hides an element without changing the layout of a document.',
  valueType: ['keyword'],
  validKeywords: ['visible', 'hidden', 'collapse'],
  defaultValue: 'visible',
  inherited: true,
  animatable: true,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const layoutProperties = [
  display,
  boxSizing,
  overflow,
  overflowX,
  overflowY,
  visibility,
];
