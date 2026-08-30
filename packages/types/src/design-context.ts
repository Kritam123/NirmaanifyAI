/**
 * CRITICAL ARCHITECTURAL ENUM & TYPE:
 * Differentiates the Nirmaanify Platform UI from the User-generated Project UI.
 */
export type DesignContext = 'platform' | 'project';

export interface DesignContextState {
  context: DesignContext;
  isPlatform: boolean;
  isProject: boolean;
  theme: 'light' | 'dark' | 'system';
}

export function isPlatformContext(context: DesignContext): context is 'platform' {
  return context === 'platform';
}

export function isProjectContext(context: DesignContext): context is 'project' {
  return context === 'project';
}

export interface PlatformThemeConfig {
  name: 'Nirmaanify Design System';
  version: '1.0.0';
  strictConsistency: true;
  primaryBrandColor: '#635BFF'; // Nirmaan Indigo
  secondaryBrandColor: '#3B82F6'; // Build Blue
  accentBrandColor: '#8B5CF6'; // AI Violet
  highlightBrandColor: '#22D3EE'; // Launch Cyan
}
