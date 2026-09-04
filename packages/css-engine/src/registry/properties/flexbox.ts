import { CSSPropertyDefinition } from '../../types/property';

export const flexDirection: CSSPropertyDefinition = {
  name: 'flex-direction',
  label: 'Direction',
  category: 'flexbox',
  description: 'Sets how flex items are placed in the flex container.',
  displayModes: ['flex', 'inline-flex'],
  valueType: ['keyword'],
  validKeywords: ['row', 'row-reverse', 'column', 'column-reverse'],
  defaultValue: 'row',
  inherited: false,
  animatable: false,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const flexWrap: CSSPropertyDefinition = {
  name: 'flex-wrap',
  label: 'Wrap',
  category: 'flexbox',
  description: 'Sets whether flex items are forced onto one line or can wrap onto multiple lines.',
  displayModes: ['flex', 'inline-flex'],
  valueType: ['keyword'],
  validKeywords: ['nowrap', 'wrap', 'wrap-reverse'],
  defaultValue: 'nowrap',
  inherited: false,
  animatable: false,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const justifyContent: CSSPropertyDefinition = {
  name: 'justify-content',
  label: 'Justify Content',
  category: 'flexbox',
  description: 'Defines how the browser distributes space between and around content items along the main-axis.',
  displayModes: ['flex', 'inline-flex', 'grid', 'inline-grid'],
  valueType: ['keyword'],
  validKeywords: [
    'flex-start',
    'flex-end',
    'center',
    'space-between',
    'space-around',
    'space-evenly',
    'stretch',
    'start',
    'end',
  ],
  defaultValue: 'flex-start',
  inherited: false,
  animatable: false,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const alignItems: CSSPropertyDefinition = {
  name: 'align-items',
  label: 'Align Items',
  category: 'flexbox',
  description: 'Sets the align-self value on all direct children as a group.',
  displayModes: ['flex', 'inline-flex', 'grid', 'inline-grid'],
  valueType: ['keyword'],
  validKeywords: ['stretch', 'flex-start', 'flex-end', 'center', 'baseline', 'start', 'end'],
  defaultValue: 'stretch',
  inherited: false,
  animatable: false,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const gap: CSSPropertyDefinition = {
  name: 'gap',
  label: 'Gap',
  category: 'flexbox',
  description: 'Sets the gaps (gutters) between rows and columns.',
  displayModes: ['flex', 'inline-flex', 'grid', 'inline-grid'],
  valueType: ['length', 'percentage'],
  supportedFunctions: ['calc', 'var', 'clamp'],
  defaultValue: '0px',
  inherited: false,
  animatable: true,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const rowGap: CSSPropertyDefinition = {
  name: 'row-gap',
  label: 'Row Gap',
  category: 'flexbox',
  description: 'Sets the size of the gap (gutter) between an element’s rows.',
  displayModes: ['flex', 'inline-flex', 'grid', 'inline-grid'],
  valueType: ['length', 'percentage'],
  supportedFunctions: ['calc', 'var', 'clamp'],
  defaultValue: '0px',
  inherited: false,
  animatable: true,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const columnGap: CSSPropertyDefinition = {
  name: 'column-gap',
  label: 'Column Gap',
  category: 'flexbox',
  description: 'Sets the size of the gap (gutter) between an element’s columns.',
  displayModes: ['flex', 'inline-flex', 'grid', 'inline-grid'],
  valueType: ['length', 'percentage'],
  supportedFunctions: ['calc', 'var', 'clamp'],
  defaultValue: '0px',
  inherited: false,
  animatable: true,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

// --- Flex Child / Item Properties ---

export const flexGrow: CSSPropertyDefinition = {
  name: 'flex-grow',
  label: 'Flex Grow',
  category: 'flexbox',
  description: 'Sets the flex grow factor of a flex item main size.',
  dependencies: [
    {
      target: 'parent',
      property: 'display',
      expectedValues: ['flex', 'inline-flex'],
    },
  ],
  valueType: ['number'],
  defaultValue: '0',
  inherited: false,
  animatable: true,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const flexShrink: CSSPropertyDefinition = {
  name: 'flex-shrink',
  label: 'Flex Shrink',
  category: 'flexbox',
  description: 'Sets the flex shrink factor of a flex item.',
  dependencies: [
    {
      target: 'parent',
      property: 'display',
      expectedValues: ['flex', 'inline-flex'],
    },
  ],
  valueType: ['number'],
  defaultValue: '1',
  inherited: false,
  animatable: true,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const flexBasis: CSSPropertyDefinition = {
  name: 'flex-basis',
  label: 'Flex Basis',
  category: 'flexbox',
  description: 'Sets the initial main size of a flex item.',
  dependencies: [
    {
      target: 'parent',
      property: 'display',
      expectedValues: ['flex', 'inline-flex'],
    },
  ],
  valueType: ['length', 'percentage', 'keyword'],
  validKeywords: ['auto', 'content', 'max-content', 'min-content', 'fit-content'],
  defaultValue: 'auto',
  inherited: false,
  animatable: true,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const alignSelf: CSSPropertyDefinition = {
  name: 'align-self',
  label: 'Align Self',
  category: 'flexbox',
  description: 'Overrides a grid or flex item’s align-items value.',
  dependencies: [
    {
      target: 'parent',
      property: 'display',
      expectedValues: ['flex', 'inline-flex', 'grid', 'inline-grid'],
    },
  ],
  valueType: ['keyword'],
  validKeywords: ['auto', 'flex-start', 'flex-end', 'center', 'baseline', 'stretch', 'start', 'end'],
  defaultValue: 'auto',
  inherited: false,
  animatable: false,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const order: CSSPropertyDefinition = {
  name: 'order',
  label: 'Order',
  category: 'flexbox',
  description: 'Sets the order to lay out an item in a flex or grid container.',
  dependencies: [
    {
      target: 'parent',
      property: 'display',
      expectedValues: ['flex', 'inline-flex', 'grid', 'inline-grid'],
    },
  ],
  valueType: ['integer'],
  defaultValue: '0',
  inherited: false,
  animatable: true,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const flexboxProperties = [
  flexDirection,
  flexWrap,
  justifyContent,
  alignItems,
  gap,
  rowGap,
  columnGap,
  flexGrow,
  flexShrink,
  flexBasis,
  alignSelf,
  order,
];
