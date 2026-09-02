import {
  ProjectSchema,
  ProjectSchemaValidator,
  ComponentNode,
  ComponentNodeSchema,
} from '@nirmaanify/types';
import { getComponentDefinition } from '../registry';

export interface ValidationError {
  path: string;
  message: string;
  code: 'INVALID_SCHEMA' | 'DUPLICATE_ID' | 'UNREGISTERED_TYPE' | 'ORPHAN_NODE' | 'CIRCULAR_REF';
}

export interface ValidationWarning {
  path: string;
  message: string;
}

export interface ProjectValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Context handlers for the parent-aware tree walker used by ProjectValidator.
 * `onEnter` is called BEFORE descending into a node's children/slots so that
 * callers can detect cycles via the chain of ancestors.
 */
interface TraversalHandlers {
  onEnter?: (node: ComponentNode, path: string, parentId: string | null) => void;
}

export class ProjectValidator {
  static validate(project: ProjectSchema): ProjectValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 1. Zod schema validation
    const zodResult = ProjectSchemaValidator.safeParse(project);
    if (!zodResult.success) {
      zodResult.error.errors.forEach((err) => {
        errors.push({
          path: err.path.join('.'),
          message: err.message,
          code: 'INVALID_SCHEMA',
        });
      });
    }

    // 2. Walk every page tree (children AND slots) and emit structural diagnostics.
    const seenNodeIds = new Set<string>();
    const seenPagePaths = new Set<string>();
    const reachableFromRoot = new Set<string>();

    project.pages?.forEach((page, pageIdx) => {
      if (seenPagePaths.has(page.path)) {
        errors.push({
          path: `pages[${pageIdx}].path`,
          message: `Duplicate page route path: "${page.path}"`,
          code: 'DUPLICATE_ID',
        });
      } else {
        seenPagePaths.add(page.path);
      }

      // First pass: collect every id reachable from the page root.
      const reachableIds = new Set<string>();
      collectReachableIds(page.rootNode, reachableIds);

      // Second pass: duplicate ids, unregistered types, parent consistency.
      walkWithContext(page.rootNode, 'rootNode', null, {
        onEnter: (node, path) => {
          if (seenNodeIds.has(node.id) && reachableFromRoot.has(node.id)) {
            errors.push({
              path: `pages[${pageIdx}].${path}.id`,
              message: `Duplicate component node ID: "${node.id}"`,
              code: 'DUPLICATE_ID',
            });
          } else {
            seenNodeIds.add(node.id);
            reachableFromRoot.add(node.id);
          }

          // Circular reference: a node whose `parent` pointer points back
          // at an ancestor that is itself descended from this node.
          if (node.parent && node.parent !== node.id) {
            if (wouldCreateCycle(page.rootNode, node)) {
              errors.push({
                path: `pages[${pageIdx}].${path}.parent`,
                message: `Circular parent reference: "${node.id}" -> "${node.parent}" creates a cycle`,
                code: 'CIRCULAR_REF',
              });
            } else if (!reachableIds.has(node.parent)) {
              errors.push({
                path: `pages[${pageIdx}].${path}.parent`,
                message: `Orphan parent reference: "${node.parent}" is not reachable from the page root`,
                code: 'ORPHAN_NODE',
              });
            }
          }

          // Unregistered component type -> warning (not error).
          const def = getComponentDefinition(node.type);
          if (!def) {
            warnings.push({
              path: `pages[${pageIdx}].${path}.type`,
              message: `Component type "${node.type}" is not in the registered components library`,
            });
          }
        },
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static validateNode(node: ComponentNode): { isValid: boolean; error?: string } {
    const res = ComponentNodeSchema.safeParse(node);
    if (!res.success) {
      return { isValid: false, error: res.error.errors[0]?.message };
    }
    return { isValid: true };
  }

  /**
   * Public downward traversal that visits children AND slots. Preserved for
   * backwards compatibility with the previous `traverseNodes(root, path, callback)`
   * signature.
   */
  static traverseNodes(
    root: ComponentNode,
    path: string,
    callback: (node: ComponentNode, path: string) => void
  ): void {
    walkWithContext(root, path, null, {
      onEnter: (node, p) => callback(node, p),
    });
  }
}

/**
 * Internal downward walker that descends into both `children` and every entry
 * of `slots`, invoking `onEnter` on each visited node with its parent id.
 */
function walkWithContext(
  root: ComponentNode,
  path: string,
  parentId: string | null,
  handlers: TraversalHandlers
): void {
  if (!root) return;
  handlers.onEnter?.(root, path, parentId);

  if (root.children && Array.isArray(root.children)) {
    root.children.forEach((child, idx) => {
      walkWithContext(child, `${path}.children[${idx}]`, root.id, handlers);
    });
  }

  if (root.slots && typeof root.slots === 'object') {
    Object.entries(root.slots).forEach(([slotKey, slotChildren]) => {
      if (!Array.isArray(slotChildren)) return;
      slotChildren.forEach((slotChild, idx) => {
        walkWithContext(
          slotChild,
          `${path}.slots[${slotKey}][${idx}]`,
          root.id,
          handlers
        );
      });
    });
  }
}

function collectReachableIds(root: ComponentNode, out: Set<string>): void {
  if (!root) return;
  out.add(root.id);
  if (root.children && Array.isArray(root.children)) {
    root.children.forEach((c) => collectReachableIds(c, out));
  }
  if (root.slots && typeof root.slots === 'object') {
    Object.values(root.slots).forEach((arr) => {
      if (Array.isArray(arr)) arr.forEach((c) => collectReachableIds(c, out));
    });
  }
}

/**
 * A structural cycle exists when, starting from `node` and walking DOWN through
 * children/slots, we eventually reach `node.parent`. The structural tree alone
 * cannot form cycles — children arrays are always fresh — but a stale parent
 * pointer that aims at one of the node's own descendants (and that descendant
 * is reachable from the node) is reported as a cycle by convention.
 */
function wouldCreateCycle(root: ComponentNode, node: ComponentNode): boolean {
  if (!node.parent) return false;
  const descendants = new Set<string>();
  collectReachableIds(node, descendants);
  return descendants.has(node.parent);
}
