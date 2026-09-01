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
export declare function isPlatformContext(context: DesignContext): context is 'platform';
export declare function isProjectContext(context: DesignContext): context is 'project';
export interface PlatformThemeConfig {
    name: 'Nirmaanify Design System';
    version: '1.0.0';
    strictConsistency: true;
    primaryBrandColor: '#635BFF';
    secondaryBrandColor: '#3B82F6';
    accentBrandColor: '#8B5CF6';
    highlightBrandColor: '#22D3EE';
}
//# sourceMappingURL=design-context.d.ts.map