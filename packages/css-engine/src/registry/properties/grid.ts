import { CSSPropertyDefinition } from '../../types/property';

export const gridTemplateColumns: CSSPropertyDefinition = {
  name: 'grid-template-columns',
  label: 'Template Columns',
  category: 'grid',
  description: 'Defines the line names and track sizing functions of the grid columns.',
  displayModes: ['grid', 'inline-grid'],
  valueType: ['track-list', 'keyword'],
  validKeywords: ['none', 'subgrid'],
  supportedFunctions: ['repeat', 'minmax', 'fit-content', 'calc', 'var'],
  defaultValue: 'none',
  inherited: false,
  animatable: true,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const gridTemplateRows: CSSPropertyDefinition = {
  name: 'grid-template-rows',
  label: 'Template Rows',
  category: 'grid',
  description: 'Defines the line names and track sizing functions of the grid rows.',
  displayModes: ['grid', 'inline-grid'],
  valueType: ['track-list', 'keyword'],
  validKeywords: ['none', 'subgrid'],
  supportedFunctions: ['repeat', 'minmax', 'fit-content', 'calc', 'var'],
  defaultValue: 'none',
  inherited: false,
  animatable: true,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const gridAutoFlow: CSSPropertyDefinition = {
  name: 'grid-auto-flow',
  label: 'Auto Flow',
  category: 'grid',
  description: 'Controls how the auto-placement algorithm works, specifying how items get flowed into the grid.',
  displayModes: ['grid', 'inline-grid'],
  valueType: ['keyword'],
  validKeywords: ['row', 'column', 'dense', 'row dense', 'column dense'],
  defaultValue: 'row',
  inherited: false,
  animatable: false,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const gridAutoColumns: CSSPropertyDefinition = {
  name: 'grid-auto-columns',
  label: 'Auto Columns',
  category: 'grid',
  description: 'Specifies the size of an implicitly-created grid column track or pattern of tracks.',
  displayModes: ['grid', 'inline-grid'],
  valueType: ['track-list', 'keyword'],
  validKeywords: ['auto', 'min-content', 'max-content'],
  supportedFunctions: ['minmax', 'fit-content'],
  defaultValue: 'auto',
  inherited: false,
  animatable: true,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const gridAutoRows: CSSPropertyDefinition = {
  name: 'grid-auto-rows',
  label: 'Auto Rows',
  category: 'grid',
  description: 'Specifies the size of an implicitly-created grid row track or pattern of tracks.',
  displayModes: ['grid', 'inline-grid'],
  valueType: ['track-list', 'keyword'],
  validKeywords: ['auto', 'min-content', 'max-content'],
  supportedFunctions: ['minmax', 'fit-content'],
  defaultValue: 'auto',
  inherited: false,
  animatable: true,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

// --- Grid Item Child Properties ---

export const gridColumn: CSSPropertyDefinition = {
  name: 'grid-column',
  label: 'Grid Column Span',
  category: 'grid',
  description: 'Specifies a grid item’s size and location within a grid column.',
  dependencies: [
    {
      target: 'parent',
      property: 'display',
      expectedValues: ['grid', 'inline-grid'],
    },
  ],
  valueType: ['keyword', 'string'],
  validKeywords: ['auto'],
  defaultValue: 'auto',
  inherited: false,
  animatable: false,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const gridRow: CSSPropertyDefinition = {
  name: 'grid-row',
  label: 'Grid Row Span',
  category: 'grid',
  description: 'Specifies a grid item’s size and location within a grid row.',
  dependencies: [
    {
      target: 'parent',
      property: 'display',
      expectedValues: ['grid', 'inline-grid'],
    },
  ],
  valueType: ['keyword', 'string'],
  validKeywords: ['auto'],
  defaultValue: 'auto',
  inherited: false,
  animatable: false,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const justifySelf: CSSPropertyDefinition = {
  name: 'justify-self',
  label: 'Justify Self',
  category: 'grid',
  description: 'Sets the way a box is justified inside its alignment container along the appropriate axis.',
  dependencies: [
    {
      target: 'parent',
      property: 'display',
      expectedValues: ['grid', 'inline-grid'],
    },
  ],
  valueType: ['keyword'],
  validKeywords: ['auto', 'normal', 'stretch', 'start', 'end', 'center', 'baseline'],
  defaultValue: 'auto',
  inherited: false,
  animatable: false,
  responsive: true,
  supportsVariables: true,
  supportsGlobalValues: true,
  browserSupport: { baseline: 'widely' },
};

export const gridProperties = [
  gridTemplateColumns,
  gridTemplateRows,
  gridAutoFlow,
  gridAutoColumns,
  gridAutoRows,
  gridColumn,
  gridRow,
  justifySelf,
];
