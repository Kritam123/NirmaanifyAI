import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { DynamicRenderer } from './dynamic-renderer';
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
