import { ComponentNode } from '@nirmaanify/types';

/**
 * Deep clone a node and re-stamp every `parent` pointer so it matches the
 * current structural tree. Used after add/duplicate/move to guarantee the
 * parent field is never stale.
 */
export function rewireParentPointers(root: ComponentNode, parentId: string | null = null): ComponentNode {
  if (!root) return root;
  const cloned: ComponentNode = {
    ...root,
    parent: parentId,
  };
  if (Array.isArray(cloned.children) && cloned.children.length > 0) {
    cloned.children = cloned.children.map((c) => rewireParentPointers(c, cloned.id));
  }
  if (cloned.slots && typeof cloned.slots === 'object') {
    cloned.slots = Object.fromEntries(
      Object.entries(cloned.slots).map(([slotKey, slotChildren]) => {
        if (!Array.isArray(slotChildren)) return [slotKey, slotChildren];
        return [slotKey, slotChildren.map((c) => rewireParentPointers(c, cloned.id))];
      })
    );
  }
  return cloned;
}

/**
 * Recursively assign parent pointers to every node reachable from `root`.
 * Mutates the input tree in place; useful as a one-shot normalization pass
 * when a schema was hydrated from external storage without correct parents.
 */
export function normalizeParentPointers(root: ComponentNode, parentId: string | null = null): void {
  if (!root) return;
  root.parent = parentId;
  if (Array.isArray(root.children)) {
    root.children.forEach((c) => normalizeParentPointers(c, root.id));
  }
  if (root.slots && typeof root.slots === 'object') {
    Object.values(root.slots).forEach((arr) => {
      if (Array.isArray(arr)) arr.forEach((c) => normalizeParentPointers(c, root.id));
    });
  }
}
