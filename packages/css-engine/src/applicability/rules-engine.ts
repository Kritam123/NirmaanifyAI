import { CSSPropertyDefinition } from '../types/property';
import { ComputedElementContext } from './context-detector';

export interface ApplicabilityResult {
  isApplicable: boolean;
  status: 'active' | 'inactive' | 'conflicted';
  reason?: string;
}

export function evaluatePropertyApplicability(
  property: CSSPropertyDefinition,
  context: ComputedElementContext
): ApplicabilityResult {
  // 1. Tag restrictions
  if (property.applicableElements && property.applicableElements.length > 0) {
    if (!property.applicableElements.includes(context.element.tagName.toLowerCase())) {
      return {
        isApplicable: false,
        status: 'inactive',
        reason: `Property "${property.name}" only applies to: <${property.applicableElements.join('>, <')}>`,
      };
    }
  }

  if (property.disallowedElements && property.disallowedElements.length > 0) {
    if (property.disallowedElements.includes(context.element.tagName.toLowerCase())) {
      return {
        isApplicable: false,
        status: 'inactive',
        reason: `Property "${property.name}" is not supported on <${context.element.tagName}>`,
      };
    }
  }

  // 2. Self Display Mode restrictions (e.g. flex container, grid container properties)
  if (property.displayModes && property.displayModes.length > 0) {
    if (!property.displayModes.includes(context.element.display)) {
      return {
        isApplicable: false,
        status: 'inactive',
        reason: `Requires element display to be: ${property.displayModes.join(' or ')} (currently "${context.element.display}")`,
      };
    }
  }

  // 3. Parent Dependency (Flex items e.g. flex-grow, Grid items e.g. grid-column)
  if (property.dependencies && property.dependencies.length > 0) {
    for (const dep of property.dependencies) {
      if (dep.target === 'parent') {
        if (!context.parent) {
          return {
            isApplicable: false,
            status: 'inactive',
            reason: `Property "${property.name}" requires a parent container`,
          };
        }
        if (!dep.expectedValues.includes(context.parent.display)) {
          return {
            isApplicable: false,
            status: 'inactive',
            reason: `Requires parent display to be: ${dep.expectedValues.join(' or ')} (parent is "${context.parent.display}")`,
          };
        }
      }
    }
  }

  // 4. Layout context checks
  if (property.layoutContext && property.layoutContext.length > 0) {
    if (!property.layoutContext.includes(context.layoutMode)) {
      return {
        isApplicable: false,
        status: 'inactive',
        reason: `Requires layout context: ${property.layoutContext.join(' or ')} (currently in "${context.layoutMode}")`,
      };
    }
  }

  // 5. Conflict checks (e.g. absolute positioning removes element from normal flex/grid flow)
  if (context.element.position === 'absolute' && context.parent) {
    if (property.category === 'flexbox' && property.dependencies?.some((d) => d.target === 'parent')) {
      return {
        isApplicable: true,
        status: 'conflicted',
        reason: 'Element is positioned absolutely. Flex item properties may have no visual effect.',
      };
    }
    if (property.category === 'grid' && property.dependencies?.some((d) => d.target === 'parent')) {
      return {
        isApplicable: true,
        status: 'conflicted',
        reason: 'Element is positioned absolutely. Grid item placement properties may behave unexpectedly.',
      };
    }
  }

  return {
    isApplicable: true,
    status: 'active',
  };
}

export function filterApplicableProperties(
  properties: CSSPropertyDefinition[],
  context: ComputedElementContext
): {
  active: CSSPropertyDefinition[];
  conflicted: Array<{ property: CSSPropertyDefinition; reason: string }>;
  inactive: Array<{ property: CSSPropertyDefinition; reason: string }>;
} {
  const active: CSSPropertyDefinition[] = [];
  const conflicted: Array<{ property: CSSPropertyDefinition; reason: string }> = [];
  const inactive: Array<{ property: CSSPropertyDefinition; reason: string }> = [];

  for (const prop of properties) {
    const res = evaluatePropertyApplicability(prop, context);
    if (res.status === 'active') {
      active.push(prop);
    } else if (res.status === 'conflicted') {
      conflicted.push({ property: prop, reason: res.reason || 'Potential property conflict' });
    } else {
      inactive.push({ property: prop, reason: res.reason || 'Not applicable in current context' });
    }
  }

  return { active, conflicted, inactive };
}
