import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { DynamicRenderer } from './dynamic-renderer';
import { ViewportProvider } from './viewport-context';
import { ReactCodeGenerator } from '../engine/code-generator';
import { ComponentNode } from '@nirmaanify/types';

describe('DynamicRenderer — basic behaviour', () => {
  it('renders a registered component', () => {
    const node: ComponentNode = {
      id: 'h',
      type: 'heading',
      name: 'H',
      props: { text: 'Hello', level: 'h1', align: 'left', gradient: false },
      children: [],
    };
    const html = renderToStaticMarkup(
      React.createElement(DynamicRenderer, { node, mode: 'live' })
    );
    expect(html).toContain('Hello');
    expect(html).toContain('<h1');
  });

  it('renders a MissingComponentFallback for unknown types', () => {
    const node: ComponentNode = {
      id: 'x',
      type: 'definitely-not-registered',
      name: 'X',
      props: {},
      children: [],
    };
    const html = renderToStaticMarkup(
      React.createElement(DynamicRenderer, { node, mode: 'live' })
    );
    expect(html).toContain('Unregistered Component');
  });

  it('hides nodes flagged isHidden in live and builder mode', () => {
    const node: ComponentNode = {
      id: 'h',
      type: 'heading',
      name: 'H',
      props: { text: 'hidden-text', level: 'h1', align: 'left', gradient: false },
      isHidden: true,
      children: [],
    };
    const htmlLive = renderToStaticMarkup(
      React.createElement(DynamicRenderer, { node, mode: 'live' })
    );
    expect(htmlLive).not.toContain('hidden-text');

    const htmlBuilder = renderToStaticMarkup(
      React.createElement(DynamicRenderer, { node, mode: 'builder' })
    );
    expect(htmlBuilder).toBe('');
  });

  it('recursively renders child components', () => {
    const node: ComponentNode = {
      id: 'c',
      type: 'container',
      name: 'C',
      props: {},
      children: [
        {
          id: 'h',
          type: 'heading',
          name: 'H',
          props: { text: 'child-text', level: 'h2', align: 'left', gradient: false },
          children: [],
        },
      ],
    };
    const html = renderToStaticMarkup(
      React.createElement(DynamicRenderer, { node, mode: 'live' })
    );
    expect(html).toContain('child-text');
  });
});

describe('DynamicRenderer — slot rendering', () => {
  it('renders nodes placed in a named slot', () => {
    const card: ComponentNode = {
      id: 'card',
      type: 'card',
      name: 'C',
      props: { title: 'My card', description: 'desc', hoverable: false },
      slots: {
        body: [
          {
            id: 'in-slot',
            type: 'heading',
            name: 'S',
            props: { text: 'slot-content', level: 'h3', align: 'left', gradient: false },
            children: [],
          },
        ],
      },
      children: [],
    };
    const html = renderToStaticMarkup(
      React.createElement(DynamicRenderer, { node: card, mode: 'live' })
    );
    expect(html).toContain('My card');
    expect(html).toContain('slot-content');
  });
});

describe('DynamicRenderer — viewport device responsiveness', () => {
  it('hides node in live mode when hideOnMobile is true and viewport is mobile', () => {
    const node: ComponentNode = {
      id: 'btn1',
      type: 'button',
      name: 'Button',
      props: { label: 'Mobile-Hidden' },
      style: { hideOnMobile: true },
      children: [],
    };

    const htmlMobile = renderToStaticMarkup(
      <ViewportProvider viewport="mobile">
        <DynamicRenderer node={node} mode="live" />
      </ViewportProvider>
    );
    expect(htmlMobile).not.toContain('Mobile-Hidden');

    const htmlDesktop = renderToStaticMarkup(
      <ViewportProvider viewport="desktop">
        <DynamicRenderer node={node} mode="live" />
      </ViewportProvider>
    );
    expect(htmlDesktop).toContain('Mobile-Hidden');
  });

  it('keeps node accessible in builder mode with badge when hidden on active viewport', () => {
    const node: ComponentNode = {
      id: 'btn2',
      type: 'button',
      name: 'Button',
      props: { label: 'Tablet-Hidden' },
      style: { hideOnTablet: true },
      children: [],
    };

    const htmlBuilder = renderToStaticMarkup(
      <ViewportProvider viewport="tablet">
        <DynamicRenderer node={node} mode="builder" />
      </ViewportProvider>
    );
    expect(htmlBuilder).toContain('Tablet-Hidden');
    expect(htmlBuilder).toContain('Hidden on tablet');
  });
});

describe('ReactCodeGenerator — responsive class generation', () => {
  it('generates responsive multi-breakpoint grid classes', () => {
    const gridNode: ComponentNode = {
      id: 'g1',
      type: 'grid',
      name: 'Grid',
      props: { columns: 4, gap: '20px' },
      style: { mobileColumns: 1, tabletColumns: 2 },
      children: [],
    };

    const jsx = ReactCodeGenerator.generateNodeJsx(gridNode);
    expect(jsx).toContain('grid-cols-1 sm:grid-cols-2 md:grid-cols-4');
  });

  it('generates mobile stacking for flex row containers', () => {
    const containerNode: ComponentNode = {
      id: 'c1',
      type: 'container',
      name: 'Container',
      props: { direction: 'row', maxWidth: '1200px' },
      style: { stackOnMobile: true },
      children: [],
    };

    const jsx = ReactCodeGenerator.generateNodeJsx(containerNode);
    expect(jsx).toContain('flex-col md:flex-row');
  });

  it('generates device-specific visibility classes', () => {
    const hiddenOnMobile: ComponentNode = {
      id: 'h1',
      type: 'button',
      name: 'Button',
      props: { label: 'Desktop Only' },
      style: { hideOnMobile: true },
      children: [],
    };

    const jsx = ReactCodeGenerator.generateNodeJsx(hiddenOnMobile);
    expect(jsx).toContain('max-sm:hidden');

    const hiddenOnDesktop: ComponentNode = {
      id: 'h2',
      type: 'button',
      name: 'Button',
      props: { label: 'Mobile Only' },
      style: { hideOnDesktop: true },
      children: [],
    };

    const jsxDesktop = ReactCodeGenerator.generateNodeJsx(hiddenOnDesktop);
    expect(jsxDesktop).toContain('md:hidden');
  });

  it('generates responsive mobile alignment for headings and text', () => {
    const headingNode: ComponentNode = {
      id: 'h1',
      type: 'heading',
      name: 'Heading',
      props: { text: 'Title', align: 'left' },
      style: { mobileAlign: 'center' },
      children: [],
    };

    const jsx = ReactCodeGenerator.generateNodeJsx(headingNode);
    expect(jsx).toContain('text-center md:text-left');
  });

  it('generates full-width mobile button classes', () => {
    const btnNode: ComponentNode = {
      id: 'b1',
      type: 'button',
      name: 'Button',
      props: { label: 'CTA' },
      style: { mobileFullWidth: true },
      children: [],
    };

    const jsx = ReactCodeGenerator.generateNodeJsx(btnNode);
    expect(jsx).toContain('w-full md:w-auto');
  });
});

