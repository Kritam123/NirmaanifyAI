import { describe, it, expect } from 'vitest';
import { ComponentNode } from '@nirmaanify/types';
import {
  findNode,
  findParentAndIndex,
  isDescendant,
  moveNodeToTarget,
  jumpNode,
  getAllLayoutContainers,
} from './tree-utils';

function n(id: string, type: string = 'container', children: ComponentNode[] = []): ComponentNode {
  return { id, type, name: id, props: {}, children, parent: null };
}

describe('tree-utils', () => {
  const sampleTree = (): ComponentNode =>
    n('root', 'container', [
      n('sec-1', 'section', [
        n('heading-1', 'heading'),
        n('text-1', 'text'),
      ]),
      n('sec-2', 'section', [
        n('btn-1', 'button'),
      ]),
    ]);

  describe('findNode', () => {
    it('finds node at various depths', () => {
      const tree = sampleTree();
      expect(findNode(tree, 'root')?.id).toBe('root');
      expect(findNode(tree, 'sec-1')?.id).toBe('sec-1');
      expect(findNode(tree, 'heading-1')?.id).toBe('heading-1');
      expect(findNode(tree, 'nonexistent')).toBeNull();
    });
  });

  describe('findParentAndIndex', () => {
    it('finds parent and correct child index', () => {
      const tree = sampleTree();
      const res = findParentAndIndex(tree, 'heading-1');
      expect(res).not.toBeNull();
      expect(res?.parent.id).toBe('sec-1');
      expect(res?.index).toBe(0);

      const res2 = findParentAndIndex(tree, 'text-1');
      expect(res2?.index).toBe(1);
    });

    it('returns null for root or missing node', () => {
      const tree = sampleTree();
      expect(findParentAndIndex(tree, 'root')).toBeNull();
      expect(findParentAndIndex(tree, 'missing')).toBeNull();
    });
  });

  describe('isDescendant', () => {
    it('detects direct and nested descendants', () => {
      const tree = sampleTree();
      expect(isDescendant(tree, 'root', 'heading-1')).toBe(true);
      expect(isDescendant(tree, 'sec-1', 'heading-1')).toBe(true);
      expect(isDescendant(tree, 'sec-2', 'heading-1')).toBe(false);
      expect(isDescendant(tree, 'heading-1', 'root')).toBe(false);
    });
  });

  describe('moveNodeToTarget', () => {
    it('moves a node inside another section', () => {
      const tree = sampleTree();
      const updated = moveNodeToTarget(tree, 'heading-1', 'sec-2', 'inside');

      expect(updated).not.toBeNull();
      const sec1 = findNode(updated!, 'sec-1');
      const sec2 = findNode(updated!, 'sec-2');

      expect(sec1?.children?.length).toBe(1);
      expect(sec1?.children?.[0].id).toBe('text-1');

      expect(sec2?.children?.length).toBe(2);
      expect(sec2?.children?.[1].id).toBe('heading-1');
      expect(sec2?.children?.[1].parent).toBe('sec-2');
    });

    it('moves a node before another component', () => {
      const tree = sampleTree();
      const updated = moveNodeToTarget(tree, 'heading-1', 'btn-1', 'before');

      expect(updated).not.toBeNull();
      const sec2 = findNode(updated!, 'sec-2');
      expect(sec2?.children?.[0].id).toBe('heading-1');
      expect(sec2?.children?.[1].id).toBe('btn-1');
    });

    it('moves a node after another component', () => {
      const tree = sampleTree();
      const updated = moveNodeToTarget(tree, 'btn-1', 'heading-1', 'after');

      expect(updated).not.toBeNull();
      const sec1 = findNode(updated!, 'sec-1');
      expect(sec1?.children?.[0].id).toBe('heading-1');
      expect(sec1?.children?.[1].id).toBe('btn-1');
      expect(sec1?.children?.[2].id).toBe('text-1');
    });

    it('rejects moving parent into its own child', () => {
      const tree = sampleTree();
      const updated = moveNodeToTarget(tree, 'sec-1', 'heading-1', 'inside');
      expect(updated).toBeNull();
    });
  });

  describe('jumpNode', () => {
    it('swaps siblings when moving down within the same container', () => {
      const tree = sampleTree();
      const updated = jumpNode(tree, 'heading-1', 'down');

      expect(updated).not.toBeNull();
      const sec1 = findNode(updated!, 'sec-1');
      expect(sec1?.children?.[0].id).toBe('text-1');
      expect(sec1?.children?.[1].id).toBe('heading-1');
    });

    it('jumps OUT of container when moving up from index 0', () => {
      const tree = sampleTree();
      // heading-1 is at index 0 of sec-1
      const updated = jumpNode(tree, 'heading-1', 'up');

      expect(updated).not.toBeNull();
      // heading-1 should now be placed immediately before sec-1 in root!
      expect(updated!.children?.[0].id).toBe('heading-1');
      expect(updated!.children?.[1].id).toBe('sec-1');
      expect(updated!.children?.[0].parent).toBe('root');
    });

    it('jumps OUT of container when moving down from the last index', () => {
      const tree = sampleTree();
      // btn-1 is at index 0 of sec-2 (also last index because length is 1)
      const updated = jumpNode(tree, 'btn-1', 'down');

      expect(updated).not.toBeNull();
      // btn-1 should now be placed after sec-2 in root!
      expect(updated!.children?.[updated!.children.length - 1].id).toBe('btn-1');
      expect(updated!.children?.[updated!.children.length - 1].parent).toBe('root');
    });

    it('rejects jumping a locked node', () => {
      const tree = sampleTree();
      const h1 = findNode(tree, 'heading-1')!;
      h1.isLocked = true;

      const updated = jumpNode(tree, 'heading-1', 'down');
      expect(updated).toBeNull();
    });

    it('rejects jumping a node inside a locked parent', () => {
      const tree = sampleTree();
      const sec1 = findNode(tree, 'sec-1')!;
      sec1.isLocked = true;

      const updated = jumpNode(tree, 'heading-1', 'down');
      expect(updated).toBeNull();
    });

    it('rejects moving a locked node or into a locked container', () => {
      const tree = sampleTree();
      const sec2 = findNode(tree, 'sec-2')!;
      sec2.isLocked = true;

      // Cannot move into locked sec-2
      expect(moveNodeToTarget(tree, 'heading-1', 'sec-2', 'inside')).toBeNull();

      // Cannot move locked node
      const h1 = findNode(tree, 'heading-1')!;
      h1.isLocked = true;
      expect(moveNodeToTarget(tree, 'heading-1', 'sec-1', 'after')).toBeNull();
    });
  });

  describe('getAllLayoutContainers', () => {
    it('lists all layout containers with hierarchy depth', () => {
      const tree = sampleTree();
      const containers = getAllLayoutContainers(tree);
      expect(containers.length).toBe(3); // root, sec-1, sec-2
      expect(containers.map((c) => c.id)).toEqual(['root', 'sec-1', 'sec-2']);
    });
  });
});
