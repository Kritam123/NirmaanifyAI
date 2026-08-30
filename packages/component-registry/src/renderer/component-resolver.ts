import { getComponentDefinition } from '../registry';
import { ComponentDefinition } from '../types';

export function resolveComponent(type: string): ComponentDefinition<any> | null {
  return getComponentDefinition(type) || null;
}
