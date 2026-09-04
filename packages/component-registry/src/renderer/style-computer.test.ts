import { describe, it, expect } from 'vitest';
import { computeNodeStyle, parseCustomCssToStyle } from './style-computer';
import { ComponentNodeStyle } from '@nirmaanify/types';

describe('parseCustomCssToStyle', () => {
  it('parses basic kebab-case CSS to camelCase React CSSProperties', () => {
    const raw = `
      filter: blur(4px);
      transform: rotate(5deg);
      cursor: pointer;
    `;
    const parsed = parseCustomCssToStyle(raw);
    expect(parsed).toEqual({
      filter: 'blur(4px)',
      transform: 'rotate(5deg)',
      cursor: 'pointer',
    });
  });

  it('strips block comments cleanly', () => {
    const raw = `
      /* Header glow effect */
      box-shadow: 0 0 20px #635BFF;
      /* background-color: red; */
      opacity: 0.9;
    `;
    const parsed = parseCustomCssToStyle(raw);
    expect(parsed).toEqual({
      boxShadow: '0 0 20px #635BFF',
      opacity: '0.9',
    });
    expect((parsed as any).backgroundColor).toBeUndefined();
  });

  it('handles vendor prefixes like -webkit-', () => {
    const raw = '-webkit-backdrop-filter: blur(12px);';
    const parsed = parseCustomCssToStyle(raw);
    expect((parsed as any).webkitBackdropFilter).toBe('blur(12px)');
  });

  it('returns empty object for empty or whitespace strings', () => {
    expect(parseCustomCssToStyle('')).toEqual({});
    expect(parseCustomCssToStyle('   ')).toEqual({});
    expect(parseCustomCssToStyle(undefined)).toEqual({});
  });
});

describe('computeNodeStyle', () => {
  it('computes linear gradients', () => {
    const style: ComponentNodeStyle = {
      gradientType: 'linear',
      gradientAngle: '90deg',
      gradientFrom: '#635BFF',
      gradientVia: '#8B5CF6',
      gradientTo: '#22D3EE',
    };
    const computed = computeNodeStyle(style);
    expect(computed.backgroundImage).toBe('linear-gradient(90deg, #635BFF, #8B5CF6, #22D3EE)');
  });

  it('computes circular radial gradients', () => {
    const style: ComponentNodeStyle = {
      gradientType: 'radial',
      gradientAngle: 'circle at center',
      gradientFrom: '#635BFF',
      gradientTo: '#0F111A',
    };
    const computed = computeNodeStyle(style);
    expect(computed.backgroundImage).toBe('radial-gradient(circle at center, #635BFF, #0F111A)');
  });

  it('computes CSS transitions', () => {
    const style: ComponentNodeStyle = {
      transitionDuration: '300ms',
      transitionProperty: 'transform, opacity',
      transitionTimingFunction: 'ease-out',
    };
    const computed = computeNodeStyle(style);
    expect(computed.transition).toBe('transform, opacity 300ms ease-out');
  });

  it('computes keyframe animations', () => {
    const style: ComponentNodeStyle = {
      animationType: 'pulse',
      animationDuration: '2s',
    };
    const computed = computeNodeStyle(style);
    expect(computed.animation).toBe('pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite');
  });

  it('computes positioning coordinates and zIndex', () => {
    const style: ComponentNodeStyle = {
      position: 'absolute',
      top: '10px',
      right: '20px',
      zIndex: 50,
    };
    const computed = computeNodeStyle(style);
    expect(computed.position).toBe('absolute');
    expect(computed.top).toBe('10px');
    expect(computed.right).toBe('20px');
    expect(computed.zIndex).toBe(50);
  });

  it('computes overflow and granular axes', () => {
    const style: ComponentNodeStyle = {
      overflow: 'hidden',
      overflowX: 'auto',
      overflowY: 'scroll',
    };
    const computed = computeNodeStyle(style);
    expect(computed.overflow).toBe('hidden');
    expect(computed.overflowX).toBe('auto');
    expect(computed.overflowY).toBe('scroll');
  });

  it('computes transforms and backdrop filters', () => {
    const style: ComponentNodeStyle = {
      scale: '1.05',
      rotate: '5deg',
      backdropFilter: 'blur(16px)',
      cursor: 'pointer',
    };
    const computed = computeNodeStyle(style);
    expect(computed.transform).toBe('scale(1.05) rotate(5deg)');
    expect(computed.backdropFilter).toBe('blur(16px)');
    expect(computed.cursor).toBe('pointer');
  });

  it('allows customCss to override computed styles with highest precedence', () => {
    const style: ComponentNodeStyle = {
      backgroundColor: '#000000',
      customCss: 'background-color: #635BFF; filter: contrast(120%);',
    };
    const computed = computeNodeStyle(style);
    expect(computed.backgroundColor).toBe('#635BFF');
    expect(computed.filter).toBe('contrast(120%)');
  });
});
