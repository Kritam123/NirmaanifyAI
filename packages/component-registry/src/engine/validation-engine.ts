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

    // 2. Check duplicate IDs across all pages
    const seenNodeIds = new Set<string>();
    const seenPagePaths = new Set<string>();

    project.pages?.forEach((page, pageIdx) => {
      // Check page route path duplicates
      if (seenPagePaths.has(page.path)) {
        errors.push({
          path: `pages[${pageIdx}].path`,
          message: `Duplicate page route path: "${page.path}"`,
          code: 'DUPLICATE_ID',
        });
      } else {
        seenPagePaths.add(page.path);
      }

      // Traverse component tree
      this.traverseNodes(page.rootNode, (node, path) => {
        if (seenNodeIds.has(node.id)) {
          errors.push({
            path: `pages[${pageIdx}].${path}.id`,
            message: `Duplicate component node ID: "${node.id}"`,
            code: 'DUPLICATE_ID',
          });
        } else {
          seenNodeIds.add(node.id);
        }

        // Check if component is in registry
        const def = getComponentDefinition(node.type);
        if (!def) {
          warnings.push({
            path: `pages[${pageIdx}].${path}.type`,
            message: `Component type "${node.type}" is not in the registered components library`,
          });
        }
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

  private static traverseNodes(
    root: ComponentNode,
    callback: (node: ComponentNode, path: string) => void,
    currentPath: string = 'rootNode'
  ) {
    if (!root) return;
    callback(root, currentPath);

    if (root.children && Array.isArray(root.children)) {
      root.children.forEach((child, idx) => {
        this.traverseNodes(child, callback, `${currentPath}.children[${idx}]`);
      });
    }
  }
}
