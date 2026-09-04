import { ComponentNode } from '@nirmaanify/types';
import { rewireParentPointers } from './parent-utils';
import { COMPONENT_REGISTRY } from '../registry';

/**
 * Check if a component type is allowed to have children.
 */
export function canAcceptChildren(type: string): boolean {
  if (!type) return false;
  const def = COMPONENT_REGISTRY[type];
  if (def && typeof def.allowedChildren === 'boolean') {
    return def.allowedChildren;
  }
  const layoutTypes = ['container', 'grid', 'section', 'form'];
  return layoutTypes.includes(type);
}

/**
 * Find a node anywhere in the tree by its ID.
 */
export function findNode(root: ComponentNode, id: string | null): ComponentNode | null {
  if (!id || !root) return null;
  if (root.id === id) return root;

  if (Array.isArray(root.children)) {
    for (const child of root.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }

  if (root.slots && typeof root.slots === 'object') {
    for (const arr of Object.values(root.slots)) {
      if (Array.isArray(arr)) {
        for (const child of arr) {
          const found = findNode(child, id);
          if (found) return found;
        }
      }
    }
  }

  return null;
}

/**
 * Find a node's parent and its index in the parent's children or slots.
 */
export function findParentAndIndex(
  root: ComponentNode,
  targetId: string
): { parent: ComponentNode; index: number; slotKey?: string } | null {
  if (!root || !targetId || root.id === targetId) return null;

  if (Array.isArray(root.children)) {
    const idx = root.children.findIndex((c) => c.id === targetId);
    if (idx !== -1) {
      return { parent: root, index: idx };
    }
    for (const child of root.children) {
      const res = findParentAndIndex(child, targetId);
      if (res) return res;
    }
  }

  if (root.slots && typeof root.slots === 'object') {
    for (const [slotKey, arr] of Object.entries(root.slots)) {
      if (Array.isArray(arr)) {
        const idx = arr.findIndex((c) => c.id === targetId);
        if (idx !== -1) {
          return { parent: root, index: idx, slotKey };
        }
        for (const child of arr) {
          const res = findParentAndIndex(child, targetId);
          if (res) return res;
        }
      }
    }
  }

  return null;
}

/**
 * Find a node's parent node anywhere in the tree.
 */
export function findParentNode(root: ComponentNode, targetId: string): ComponentNode | null {
  return findParentAndIndex(root, targetId)?.parent || null;
}

/**
 * Check if targetId is a descendant of ancestorId.
 */
export function isDescendant(root: ComponentNode, ancestorId: string, targetId: string): boolean {
  if (!root || !ancestorId || !targetId) return false;
  if (ancestorId === targetId) return true;

  const ancestor = findNode(root, ancestorId);
  if (!ancestor) return false;

  return findNode(ancestor, targetId) !== null;
}

/**
 * Extract a node from the tree and return a tuple of [clonedTreeWithoutNode, extractedNode].
 */
function extractNode(
  root: ComponentNode,
  nodeId: string
): { tree: ComponentNode; extracted: ComponentNode | null } {
  let extracted: ComponentNode | null = null;

  function remove(curr: ComponentNode): ComponentNode {
    let newChildren = curr.children;
    if (Array.isArray(curr.children)) {
      const foundIdx = curr.children.findIndex((c) => c.id === nodeId);
      if (foundIdx !== -1) {
        extracted = JSON.parse(JSON.stringify(curr.children[foundIdx]));
        newChildren = curr.children.filter((c) => c.id !== nodeId);
      } else {
        newChildren = curr.children.map(remove);
      }
    }

    let newSlots = curr.slots;
    if (curr.slots && typeof curr.slots === 'object') {
      newSlots = {};
      for (const [key, arr] of Object.entries(curr.slots)) {
        if (Array.isArray(arr)) {
          const foundIdx = arr.findIndex((c) => c.id === nodeId);
          if (foundIdx !== -1) {
            extracted = JSON.parse(JSON.stringify(arr[foundIdx]));
            newSlots[key] = arr.filter((c) => c.id !== nodeId);
          } else {
            newSlots[key] = arr.map(remove);
          }
        }
      }
    }

    return {
      ...curr,
      children: newChildren,
      slots: newSlots,
    };
  }

  const newTree = remove(root);
  return { tree: newTree, extracted };
}

/**
 * Move or reparent a node to a target position relative to targetId.
 * Position can be 'before', 'after', or 'inside'.
 */
export function moveNodeToTarget(
  root: ComponentNode,
  sourceId: string,
  targetId: string,
  position: 'before' | 'after' | 'inside'
): ComponentNode | null {
  if (!root || !sourceId || !targetId) return null;
  if (sourceId === root.id) return null; // cannot move root
  if (sourceId === targetId) return null;

  // Prevent moving a node into itself or into one of its descendants
  if (isDescendant(root, sourceId, targetId)) {
    return null;
  }

  const sourceNode = findNode(root, sourceId);
  if (!sourceNode || sourceNode.isLocked) return null; // Cannot move locked node

  const targetNode = findNode(root, targetId);
  if (!targetNode) return null;

  // Cannot drop inside a locked container
  if (position === 'inside' && targetNode.isLocked) {
    return null;
  }

  // Cannot remove from a locked parent container
  const sourceParentInfo = findParentAndIndex(root, sourceId);
  if (sourceParentInfo?.parent.isLocked) {
    return null;
  }

  // Cannot insert before/after into a locked parent container
  if (position === 'before' || position === 'after') {
    const targetParentInfo = findParentAndIndex(root, targetId);
    if (targetParentInfo?.parent.isLocked) {
      return null;
    }
  }

  // Clone and extract the source node
  const clonedRoot: ComponentNode = JSON.parse(JSON.stringify(root));
  const { tree: treeWithoutSource, extracted: extractedSource } = extractNode(clonedRoot, sourceId);

  if (!extractedSource) return null;

  // Helper to insert source node into the tree
  function insert(curr: ComponentNode): ComponentNode {
    if (position === 'inside') {
      if (curr.id === targetId) {
        return {
          ...curr,
          children: [...(curr.children || []), extractedSource!],
        };
      }
      return {
        ...curr,
        children: Array.isArray(curr.children) ? curr.children.map(insert) : curr.children,
      };
    }

    // position is 'before' or 'after'
    let updatedChildren = curr.children;
    if (Array.isArray(curr.children)) {
      const idx = curr.children.findIndex((c) => c.id === targetId);
      if (idx !== -1) {
        const copy = [...curr.children];
        const insertIdx = position === 'before' ? idx : idx + 1;
        copy.splice(insertIdx, 0, extractedSource!);
        updatedChildren = copy;
      } else {
        updatedChildren = curr.children.map(insert);
      }
    }

    return {
      ...curr,
      children: updatedChildren,
    };
  }

  const finalTree = insert(treeWithoutSource);
  return rewireParentPointers(finalTree, null);
}

/**
 * Intelligent move/jump node up or down in the tree.
 * Supports cross-layout section jumping:
 * - When moving up from the top of a container, jumps OUT of the container.
 * - When moving down from the bottom of a container, jumps OUT of the container.
 * - When next to another container, steps INTO that container.
 * Respects node.isLocked (locked nodes or locked parents cannot move or be modified).
 */
export function jumpNode(
  root: ComponentNode,
  nodeId: string,
  direction: 'up' | 'down'
): ComponentNode | null {
  if (!root || !nodeId || nodeId === root.id) return null;

  const targetNode = findNode(root, nodeId);
  if (!targetNode || targetNode.isLocked) return null; // Cannot move locked node

  const clonedRoot: ComponentNode = JSON.parse(JSON.stringify(root));
  const parentInfo = findParentAndIndex(clonedRoot, nodeId);
  if (!parentInfo || parentInfo.parent.isLocked) return null; // Cannot move in locked parent

  const { parent, index } = parentInfo;
  const siblings = parent.children || [];

  if (direction === 'up') {
    if (index > 0) {
      const prevSibling = siblings[index - 1];
      if (prevSibling.isLocked) return null; // Cannot swap with or enter locked sibling

      // If previous sibling is a layout container that can accept children, step into it!
      if (canAcceptChildren(prevSibling.type) && Array.isArray(prevSibling.children)) {
        return moveNodeToTarget(root, nodeId, prevSibling.id, 'inside');
      }

      // Normal swap with previous sibling
      const newSiblings = [...siblings];
      newSiblings[index - 1] = siblings[index];
      newSiblings[index] = prevSibling;

      function updateSiblings(curr: ComponentNode): ComponentNode {
        if (curr.id === parent.id) {
          return { ...curr, children: newSiblings };
        }
        if (curr.children) {
          return { ...curr, children: curr.children.map(updateSiblings) };
        }
        return curr;
      }

      const updated = updateSiblings(clonedRoot);
      return rewireParentPointers(updated, null);
    }

    // index === 0: At top of current container! Jump OUT to parent layout!
    if (parent.id !== root.id) {
      const grandParentInfo = findParentAndIndex(clonedRoot, parent.id);
      if (grandParentInfo && !grandParentInfo.parent.isLocked) {
        // Place immediately before the parent container in the grandparent
        return moveNodeToTarget(root, nodeId, parent.id, 'before');
      }
    }

    return null; // Cannot move higher than root top
  } else {
    // direction === 'down'
    if (index < siblings.length - 1) {
      const nextSibling = siblings[index + 1];
      if (nextSibling.isLocked) return null; // Cannot swap with or enter locked sibling

      // If next sibling is a layout container that can accept children, step into it at the beginning!
      if (canAcceptChildren(nextSibling.type) && Array.isArray(nextSibling.children)) {
        if (nextSibling.children.length > 0) {
          return moveNodeToTarget(root, nodeId, nextSibling.children[0].id, 'before');
        }
        return moveNodeToTarget(root, nodeId, nextSibling.id, 'inside');
      }

      // Normal swap with next sibling
      const newSiblings = [...siblings];
      newSiblings[index] = nextSibling;
      newSiblings[index + 1] = siblings[index];

      function updateSiblings(curr: ComponentNode): ComponentNode {
        if (curr.id === parent.id) {
          return { ...curr, children: newSiblings };
        }
        if (curr.children) {
          return { ...curr, children: curr.children.map(updateSiblings) };
        }
        return curr;
      }

      const updated = updateSiblings(clonedRoot);
      return rewireParentPointers(updated, null);
    }

    // index === siblings.length - 1: At bottom of current container! Jump OUT to parent layout!
    if (parent.id !== root.id) {
      const grandParentInfo = findParentAndIndex(clonedRoot, parent.id);
      if (grandParentInfo && !grandParentInfo.parent.isLocked) {
        // Place immediately after the parent container in the grandparent
        return moveNodeToTarget(root, nodeId, parent.id, 'after');
      }
    }

    return null; // Cannot move lower than root bottom
  }
}

/**
 * Returns a flattened list of all layout containers (nodes that can accept children) in the tree.
 * Useful for "Jump to Section..." dropdowns.
 */
export function getAllLayoutContainers(
  root: ComponentNode,
  depth: number = 0
): { id: string; name: string; type: string; depth: number; isLocked?: boolean }[] {
  if (!root) return [];
  const list: { id: string; name: string; type: string; depth: number; isLocked?: boolean }[] = [];

  if (canAcceptChildren(root.type) || root.id.startsWith('root')) {
    list.push({
      id: root.id,
      name: root.name || root.type,
      type: root.type,
      depth,
      isLocked: Boolean(root.isLocked),
    });
  }

  if (Array.isArray(root.children)) {
    for (const child of root.children) {
      list.push(...getAllLayoutContainers(child, depth + 1));
    }
  }

  return list;
}
