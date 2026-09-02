import { describe, it, expect } from 'vitest';
import { ComponentNode } from '@nirmaanify/types';
import { rewireParentPointers, normalizeParentPointers } from './parent-utils';

function node(id: string, parent: string | null = null, children: ComponentNode[] = []): ComponentNode {
  return { id, type: 'container', name: id, props: {}, children, parent };
}

describe('rewireParentPointers', () => {
  it('returns a structurally identical tree with corrected parents', () => {
    const tree = node('r', null, [
      node('a', 'wrong', [node('aa', 'wrong-a')]),
      node('b', 'wrong', [node('bb', 'wrong-b')]),
    ]);

    const rewired = rewireParentPointers(tree);

    expect(rewired.parent).toBeNull();
    expect(rewired.children![0].parent).toBe('r');
    expect(rewired.children![1].parent).toBe('r');
    expect(rewired.children![0].children![0].parent).toBe('a');
    expect(rewired.children![1].children![0].parent).toBe('b');
  });

  it('handles slots the same way as children', () => {
    const tree: ComponentNode = {
      id: 'card',
      type: 'card',
      name: 'card',
      props: {},
      parent: null,
      children: [],
      slots: {
        body: [node('body-1', 'wrong')],
      },
    };
    const rewired = rewireParentPointers(tree);
    expect(rewired.slots!.body[0].parent).toBe('card');
  });

  it('does not mutate the input tree', () => {
    const tree = node('r', null, [node('a', 'wrong')]);
    rewireParentPointers(tree);
    expect(tree.children![0].parent).toBe('wrong');
  });
});

describe('normalizeParentPointers', () => {
  it('mutates the input tree in place', () => {
    const tree = node('r', null, [node('a', 'wrong')]);
    normalizeParentPointers(tree);
    expect(tree.children![0].parent).toBe('r');
  });
});
