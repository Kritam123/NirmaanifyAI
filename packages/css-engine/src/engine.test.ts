import { describe, it, expect } from 'vitest';
import {
  detectElementContext,
  evaluatePropertyApplicability,
  filterApplicableProperties,
  findPropertyDefinition,
  searchProperties,
  createDefaultElementStyle,
  setStyleProperty,
  getStyleForState,
} from './index';

describe('CSS Engine Foundation', () => {
  it('detects flex container context when display is flex', () => {
    const context = detectElementContext({
      id: 'container-1',
      tagName: 'div',
      componentType: 'Container',
      style: { display: 'flex' },
    });

    expect(context.element.display).toBe('flex');
    expect(context.layoutMode).toBe('flex-container');
  });

  it('detects flex item context when parent is flex', () => {
    const parent = {
      id: 'parent-1',
      tagName: 'div',
      componentType: 'Container',
      style: { display: 'flex' },
    };

    const child = {
      id: 'child-1',
      tagName: 'div',
      componentType: 'Card',
      style: { display: 'block' },
    };

    const context = detectElementContext(child, parent);
    expect(context.layoutMode).toBe('flex-item');
    expect(context.parent?.layoutMode).toBe('flex-container');
  });

  it('evaluates flex-grow applicability based on parent context', () => {
    const flexGrowDef = findPropertyDefinition('flex-grow')!;
    expect(flexGrowDef).toBeDefined();

    // 1. Standalone element (not in flex container) -> should be inactive
    const standaloneContext = detectElementContext({
      id: 'elem-1',
      tagName: 'div',
      componentType: 'Box',
      style: { display: 'block' },
    });
    const standaloneRes = evaluatePropertyApplicability(flexGrowDef, standaloneContext);
    expect(standaloneRes.isApplicable).toBe(false);
    expect(standaloneRes.status).toBe('inactive');

    // 2. Child in flex container -> should be active
    const flexChildContext = detectElementContext(
      { id: 'elem-2', tagName: 'div', componentType: 'Box', style: { display: 'block' } },
      { id: 'parent-1', tagName: 'div', componentType: 'Container', style: { display: 'flex' } }
    );
    const flexRes = evaluatePropertyApplicability(flexGrowDef, flexChildContext);
    expect(flexRes.isApplicable).toBe(true);
    expect(flexRes.status).toBe('active');
  });

  it('searches properties accurately', () => {
    const gridResults = searchProperties('grid');
    expect(gridResults.length).toBeGreaterThan(0);
    expect(gridResults.some((p) => p.name === 'grid-template-columns')).toBe(true);

    const flexResults = searchProperties('flex-direction');
    expect(flexResults.length).toBe(1);
    expect(flexResults[0].name).toBe('flex-direction');
  });

  it('mutates and retrieves style AST properties', () => {
    let ast = createDefaultElementStyle('node-123');
    ast = setStyleProperty(ast, 'display', 'flex');
    ast = setStyleProperty(ast, 'gap', '16px', { tokenRef: '--space-4' });

    const computed = getStyleForState(ast, 'normal', 'base');
    expect(computed['display'].value).toBe('flex');
    expect(computed['display'].source).toBe('override');
    expect(computed['gap'].value).toBe('16px');
    expect(computed['gap'].tokenRef).toBe('--space-4');
    expect(computed['gap'].source).toBe('token');
  });
});
