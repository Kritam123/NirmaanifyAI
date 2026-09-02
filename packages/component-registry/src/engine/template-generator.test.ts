import { describe, it, expect } from 'vitest';
import { ProjectSchema } from '@nirmaanify/types';
import { createDefaultProjectSchema } from './template-generator';
import { ProjectValidator } from './validation-engine';

describe('createDefaultProjectSchema', () => {
  const types: Array<Parameters<typeof createDefaultProjectSchema>[1]> = [
    'SAAS', 'ECOMMERCE', 'DASHBOARD', 'BLOG', 'PORTFOLIO', 'WEBSITE',
  ];

  types.forEach((type) => {
    it(`produces a valid schema for type=${type}`, () => {
      const schema = createDefaultProjectSchema('Test App', type);
      const result = ProjectValidator.validate(schema);
      expect(result.isValid).toBe(true);
      expect(schema.pages.length).toBeGreaterThan(0);
    });
  });

  it('uses the provided name + slug slugification', () => {
    const schema: ProjectSchema = createDefaultProjectSchema('My Cool App!', 'SAAS');
    expect(schema.settings.name).toBe('My Cool App!');
    expect(schema.settings.slug).toBe('my-cool-app');
  });

  it('falls back to a SAAS template for unknown types', () => {
    const schema = createDefaultProjectSchema('App', 'UNKNOWN_TYPE');
    expect(schema.pages.some((p) => p.path === '/pricing')).toBe(true);
  });
});
