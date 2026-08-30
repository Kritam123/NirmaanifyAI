export const typographyTokens = {
  fontFamilies: {
    display: 'var(--font-display, "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
    ui: 'var(--font-ui, "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
    code: 'var(--font-code, "Geist Mono", "JetBrains Mono", monospace)',
  },
  fontSizes: {
    '2xs': ['0.6875rem', { lineHeight: '0.875rem' }],
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.875rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.375rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.75rem' }],
    '5xl': ['3rem', { lineHeight: '3.5rem' }],
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
} as const;
