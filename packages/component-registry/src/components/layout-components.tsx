import React from 'react';
import { z } from 'zod';
import { ComponentDefinition } from '../types';
import { Button } from '@nirmaanify/ui';
import { Menu, X } from 'lucide-react';
import { useViewport } from '../renderer/viewport-context';

// ==========================================
// 1. CONTAINER
// ==========================================
export const ContainerDefinition: ComponentDefinition<{
  maxWidth: string;
  padding: string;
  alignment: 'left' | 'center' | 'right';
  direction: 'column' | 'row';
  gap: string;
}> = {
  id: 'container',
  name: 'Container',
  category: 'layout',
  description: 'Flexible box container for grouping and aligning child components.',
  icon: 'BoxSelect',
  allowedChildren: true,
  defaultProps: {
    maxWidth: '1200px',
    padding: '24px',
    alignment: 'center',
    direction: 'column',
    gap: '16px',
  },
  propsSchema: z.object({
    maxWidth: z.string().default('1200px'),
    padding: z.string().default('24px'),
    alignment: z.enum(['left', 'center', 'right']).default('center'),
    direction: z.enum(['column', 'row']).default('column'),
    gap: z.string().default('16px'),
  }),
  inspectorControls: [
    {
      name: 'maxWidth',
      label: 'Max Width',
      type: 'text',
      group: 'layout',
      defaultValue: '1200px',
    },
    {
      name: 'padding',
      label: 'Padding',
      type: 'text',
      group: 'style',
      defaultValue: '24px',
    },
    {
      name: 'direction',
      label: 'Flex Direction',
      type: 'select',
      group: 'layout',
      options: [
        { label: 'Vertical (Column)', value: 'column' },
        { label: 'Horizontal (Row)', value: 'row' },
      ],
      defaultValue: 'column',
    },
    {
      name: 'gap',
      label: 'Children Gap',
      type: 'text',
      group: 'layout',
      defaultValue: '16px',
    },
  ],
  component: ({ maxWidth, padding, direction, gap, children, style }) => {
    const { isMobile } = useViewport();
    const shouldStack = isMobile && direction === 'row' && style?.stackOnMobile !== false;
    const effectiveDirection = shouldStack ? 'column' : direction;
    const effectivePadding = isMobile && style?.mobilePadding ? style.mobilePadding : padding;
    const effectiveGap = isMobile && style?.mobileGap ? style.mobileGap : gap;

    return (
      <div
        style={{
          maxWidth,
          padding: effectivePadding,
          display: 'flex',
          flexDirection: effectiveDirection,
          gap: effectiveGap,
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          minWidth: 0,
          ...style,
        }}
        className="transition-all min-w-0 max-w-full"
      >
        {children || (
          <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center text-xs text-slate-400">
            Empty Container — Drag or add components here
          </div>
        )}
      </div>
    );
  },
};

// ==========================================
// 2. GRID
// ==========================================
export const GridDefinition: ComponentDefinition<{
  columns: number;
  gap: string;
}> = {
  id: 'grid',
  name: 'Grid',
  category: 'layout',
  description: 'Multi-column responsive grid layout.',
  icon: 'Grid',
  allowedChildren: true,
  defaultProps: {
    columns: 3,
    gap: '24px',
  },
  propsSchema: z.object({
    columns: z.number().min(1).max(12).default(3),
    gap: z.string().default('24px'),
  }),
  inspectorControls: [
    {
      name: 'columns',
      label: 'Columns Count (Desktop)',
      type: 'slider',
      min: 1,
      max: 6,
      step: 1,
      group: 'layout',
      defaultValue: 3,
    },
    {
      name: 'gap',
      label: 'Grid Gap',
      type: 'text',
      group: 'layout',
      defaultValue: '24px',
    },
  ],
  component: ({ columns, gap, children, style }) => {
    const { isMobile, isTablet } = useViewport();

    let effectiveCols = columns;
    if (isMobile) {
      effectiveCols = style?.mobileColumns !== undefined ? Number(style.mobileColumns) : 1;
    } else if (isTablet) {
      effectiveCols = style?.tabletColumns !== undefined ? Number(style.tabletColumns) : Math.min(columns, 2);
    }

    const effectiveGap = isMobile && style?.mobileGap ? style.mobileGap : gap;

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${effectiveCols}, minmax(0, 1fr))`,
          gap: effectiveGap,
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
          ...style,
        }}
        className="w-full transition-all min-w-0 max-w-full"
      >
        {children || (
          <div className="col-span-full p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center text-xs text-slate-400">
            Empty Grid ({effectiveCols} Column{effectiveCols > 1 ? 's' : ''}) — Add child components
          </div>
        )}
      </div>
    );
  },
};

// ==========================================
// 3. SECTION
// ==========================================
export const SectionDefinition: ComponentDefinition<{
  backgroundColor: string;
  paddingY: string;
  paddingX: string;
  fullWidth: boolean;
}> = {
  id: 'section',
  name: 'Section',
  category: 'layout',
  description: 'Full-width block section with background styling.',
  icon: 'LayoutTemplate',
  allowedChildren: true,
  defaultProps: {
    backgroundColor: 'transparent',
    paddingY: '64px',
    paddingX: '24px',
    fullWidth: true,
  },
  propsSchema: z.object({
    backgroundColor: z.string().default('transparent'),
    paddingY: z.string().default('64px'),
    paddingX: z.string().default('24px'),
    fullWidth: z.boolean().default(true),
  }),
  inspectorControls: [
    {
      name: 'backgroundColor',
      label: 'Background Color',
      type: 'color',
      group: 'style',
      defaultValue: 'transparent',
    },
    {
      name: 'paddingY',
      label: 'Vertical Padding',
      type: 'text',
      group: 'style',
      defaultValue: '64px',
    },
    {
      name: 'paddingX',
      label: 'Horizontal Padding',
      type: 'text',
      group: 'style',
      defaultValue: '24px',
    },
  ],
  component: ({ backgroundColor, paddingY, paddingX, children, style }) => {
    const { isMobile, isTablet } = useViewport();
    let effectivePy = paddingY;
    let effectivePx = paddingX;
    if (isMobile) {
      effectivePy = style?.mobilePaddingY || '32px';
      effectivePx = style?.mobilePaddingX || '16px';
    } else if (isTablet) {
      effectivePy = '48px';
      effectivePx = '20px';
    }

    return (
      <section
        style={{
          backgroundColor,
          paddingTop: effectivePy,
          paddingBottom: effectivePy,
          paddingLeft: effectivePx,
          paddingRight: effectivePx,
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
          ...style,
        }}
        className="w-full transition-all min-w-0 max-w-full"
      >
        {children}
      </section>
    );
  },
};

// ==========================================
// 4. NAVBAR
// ==========================================
export const NavbarDefinition: ComponentDefinition<{
  brandName: string;
  links: string;
  ctaText: string;
  isSticky: boolean;
}> = {
  id: 'navbar',
  name: 'Navigation Bar',
  category: 'layout',
  description: 'Site header with brand logo, navigation links, and action button.',
  icon: 'Navigation',
  allowedChildren: false,
  defaultProps: {
    brandName: 'Nirmaanify',
    links: 'Features, Pricing, Docs, Blog',
    ctaText: 'Get Started',
    isSticky: true,
  },
  propsSchema: z.object({
    brandName: z.string().default('Nirmaanify'),
    links: z.string().default('Features, Pricing, Docs, Blog'),
    ctaText: z.string().default('Get Started'),
    isSticky: z.boolean().default(true),
  }),
  inspectorControls: [
    { name: 'brandName', label: 'Brand Name', type: 'text', group: 'content', defaultValue: 'Nirmaanify' },
    { name: 'links', label: 'Nav Links (comma separated)', type: 'text', group: 'content', defaultValue: 'Features, Pricing, Docs, Blog' },
    { name: 'ctaText', label: 'CTA Button Text', type: 'text', group: 'content', defaultValue: 'Get Started' },
    { name: 'isSticky', label: 'Sticky Header', type: 'switch', group: 'layout', defaultValue: true },
  ],
  component: ({ brandName, links, ctaText, isSticky, style }) => {
    const navItems = (links || '').split(',').map((s) => s.trim()).filter(Boolean);
    const { isMobile, isTablet } = useViewport();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    return (
      <header
        style={style}
        className={`w-full py-3.5 px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#0E121E]/95 backdrop-blur-md flex flex-col transition-all ${
          isSticky ? 'sticky top-0 z-40' : ''
        }`}
      >
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#635BFF] to-[#22D3EE] flex items-center justify-center text-white font-black text-sm shadow-sm shadow-[#635BFF]/30">
              {brandName.charAt(0)}
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">{brandName}</span>
          </div>

          {/* Desktop Navigation Links & CTA */}
          {!isMobile && !isTablet && (
            <>
              <nav className="flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-300">
                {navItems.map((item) => (
                  <span key={item} className="hover:text-[#635BFF] cursor-pointer transition-colors">
                    {item}
                  </span>
                ))}
              </nav>

              <div className="flex items-center gap-3">
                <Button size="sm" variant="default">
                  {ctaText}
                </Button>
              </div>
            </>
          )}

          {/* Mobile / Tablet Hamburger Toggle */}
          {(isMobile || isTablet) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen((v) => !v);
              }}
              title="Toggle mobile navigation menu"
              aria-label="Toggle mobile navigation menu"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-[#24293D] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#141724] transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          )}
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {(isMobile || isTablet) && mobileMenuOpen && (
          <div className="w-full pt-3 pb-2 border-t border-slate-100 dark:border-[#24293D] mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <nav className="flex flex-col space-y-1 text-xs font-semibold text-slate-700 dark:text-slate-200">
              {navItems.map((item) => (
                <span
                  key={item}
                  className="px-2 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#141724] cursor-pointer transition-colors"
                >
                  {item}
                </span>
              ))}
            </nav>
            <div className="pt-2 border-t border-slate-100 dark:border-[#24293D]/60">
              <Button size="sm" variant="default" className="w-full">
                {ctaText}
              </Button>
            </div>
          </div>
        )}
      </header>
    );
  },
};

// ==========================================
// 5. FOOTER
// ==========================================
export const FooterDefinition: ComponentDefinition<{
  brandName: string;
  copyrightText: string;
  columnsCount: number;
}> = {
  id: 'footer',
  name: 'Footer',
  category: 'layout',
  description: 'Page footer with columns, copyright notice, and social links.',
  icon: 'PanelBottom',
  allowedChildren: false,
  defaultProps: {
    brandName: 'Nirmaanify AI',
    copyrightText: '© 2026 Nirmaanify. All rights reserved.',
    columnsCount: 3,
  },
  propsSchema: z.object({
    brandName: z.string().default('Nirmaanify AI'),
    copyrightText: z.string().default('© 2026 Nirmaanify. All rights reserved.'),
    columnsCount: z.number().default(3),
  }),
  inspectorControls: [
    { name: 'brandName', label: 'Brand Name', type: 'text', group: 'content', defaultValue: 'Nirmaanify AI' },
    { name: 'copyrightText', label: 'Copyright Text', type: 'text', group: 'content', defaultValue: '© 2026 Nirmaanify. All rights reserved.' },
  ],
  component: ({ brandName, copyrightText, style }) => {
    return (
      <footer
        style={style}
        className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0A0D16] py-12 px-6"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <h4 className="font-bold text-sm">{brandName}</h4>
            <p className="text-slate-400 leading-relaxed">
              Imagine. Build. Launch with full-stack AI automation.
            </p>
          </div>
          <div className="space-y-2">
            <h5 className="font-semibold text-slate-800 dark:text-slate-200">Product</h5>
            <p className="text-slate-400 hover:text-slate-200 cursor-pointer">Features</p>
            <p className="text-slate-400 hover:text-slate-200 cursor-pointer">Integrations</p>
            <p className="text-slate-400 hover:text-slate-200 cursor-pointer">Pricing</p>
          </div>
          <div className="space-y-2">
            <h5 className="font-semibold text-slate-800 dark:text-slate-200">Resources</h5>
            <p className="text-slate-400 hover:text-slate-200 cursor-pointer">Documentation</p>
            <p className="text-slate-400 hover:text-slate-200 cursor-pointer">API Reference</p>
            <p className="text-slate-400 hover:text-slate-200 cursor-pointer">Guides</p>
          </div>
          <div className="space-y-2">
            <h5 className="font-semibold text-slate-800 dark:text-slate-200">Company</h5>
            <p className="text-slate-400 hover:text-slate-200 cursor-pointer">About Us</p>
            <p className="text-slate-400 hover:text-slate-200 cursor-pointer">Careers</p>
            <p className="text-slate-400 hover:text-slate-200 cursor-pointer">Privacy Policy</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
          <span>{copyrightText}</span>
          <span>Powered by Nirmaanify Engine</span>
        </div>
      </footer>
    );
  },
};
