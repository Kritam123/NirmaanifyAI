import { CSSPropertyDefinition } from '../types/property';
import { layoutProperties } from './properties/layout';
import { flexboxProperties } from './properties/flexbox';
import { gridProperties } from './properties/grid';
import { boxModelProperties } from './properties/box-model';
import { typographyProperties } from './properties/typography';
import { colorProperties } from './properties/colors';

const ALL_PROPERTIES: CSSPropertyDefinition[] = [
  ...layoutProperties,
  ...flexboxProperties,
  ...gridProperties,
  ...boxModelProperties,
  ...typographyProperties,
  ...colorProperties,
];

const PROPERTY_MAP = new Map<string, CSSPropertyDefinition>();
for (const prop of ALL_PROPERTIES) {
  PROPERTY_MAP.set(prop.name.toLowerCase(), prop);
}

export function getAllPropertyDefinitions(): CSSPropertyDefinition[] {
  return ALL_PROPERTIES;
}

export function findPropertyDefinition(name: string): CSSPropertyDefinition | undefined {
  return PROPERTY_MAP.get(name.toLowerCase());
}

export function searchProperties(query: string): CSSPropertyDefinition[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return ALL_PROPERTIES;

  return ALL_PROPERTIES.filter(
    (p) =>
      p.name.toLowerCase().includes(clean) ||
      p.label.toLowerCase().includes(clean) ||
      p.category.toLowerCase().includes(clean) ||
      p.description.toLowerCase().includes(clean)
  );
}

export function getPropertiesByCategory(category: string): CSSPropertyDefinition[] {
  return ALL_PROPERTIES.filter((p) => p.category === category);
}

export * from './properties/layout';
export * from './properties/flexbox';
export * from './properties/grid';
export * from './properties/box-model';
export * from './properties/typography';
export * from './properties/colors';
