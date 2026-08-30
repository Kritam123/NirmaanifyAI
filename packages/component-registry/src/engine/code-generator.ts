import { ComponentNode, PageSchema, ProjectSchema } from '@nirmaanify/types';

export class ReactCodeGenerator {
  static generatePageComponent(page: PageSchema): string {
    const componentImports = new Set<string>();
    const iconImports = new Set<string>();

    const collectImports = (node: ComponentNode) => {
      if (['button', 'badge', 'card', 'separator', 'input', 'textarea', 'select'].includes(node.type)) {
        const capitalized = node.type.charAt(0).toUpperCase() + node.type.slice(1);
        componentImports.add(capitalized);
        if (node.type === 'card') {
          componentImports.add('CardHeader');
          componentImports.add('CardTitle');
          componentImports.add('CardDescription');
          componentImports.add('CardContent');
        }
      }
      if (node.type === 'hero' || node.type === 'feature-card') {
        iconImports.add('Sparkles');
        iconImports.add('ArrowRight');
      }
      if (node.type === 'pricing-card') {
        iconImports.add('Check');
      }
      if (node.type === 'product-card') {
        iconImports.add('ShoppingBag');
        iconImports.add('Star');
      }
      if (node.type === 'metric-card') {
        iconImports.add('TrendingUp');
        iconImports.add('TrendingDown');
      }

      node.children?.forEach(collectImports);
    };

    collectImports(page.rootNode);

    const jsxBody = this.generateNodeJsx(page.rootNode, 2);

    const uiImportsStr =
      componentImports.size > 0
        ? `import { ${Array.from(componentImports).join(', ')} } from '@nirmaanify/ui';\n`
        : '';
    const iconImportsStr =
      iconImports.size > 0
        ? `import { ${Array.from(iconImports).join(', ')} } from 'lucide-react';\n`
        : '';

    return `'use client';

import React from 'react';
${uiImportsStr}${iconImportsStr}
export default function ${this.toPascalCase(page.name || 'Page')}() {
  return (
${jsxBody}
  );
}
`;
  }

  static generateNodeJsx(node: ComponentNode, indentLevel: number = 2): string {
    const indent = '  '.repeat(indentLevel);
    const childIndent = '  '.repeat(indentLevel + 1);

    const childrenJsx = node.children && node.children.length > 0
      ? '\n' + node.children.map((c) => this.generateNodeJsx(c, indentLevel + 1)).join('\n') + '\n' + indent
      : '';

    switch (node.type) {
      case 'container': {
        const maxW = node.props.maxWidth || '1200px';
        const p = node.props.padding || '24px';
        const dir = node.props.direction === 'row' ? 'flex-row' : 'flex-col';
        const gap = node.props.gap || '16px';
        return `${indent}<div className="w-full flex ${dir} mx-auto transition-all" style={{ maxWidth: '${maxW}', padding: '${p}', gap: '${gap}' }}>${childrenJsx}</div>`;
      }

      case 'grid': {
        const cols = node.props.columns || 3;
        const gap = node.props.gap || '24px';
        return `${indent}<div className="w-full grid grid-cols-1 md:grid-cols-${cols} transition-all" style={{ gap: '${gap}' }}>${childrenJsx}</div>`;
      }

      case 'section': {
        const bg = node.props.backgroundColor || 'transparent';
        const py = node.props.paddingY || '64px';
        const px = node.props.paddingX || '24px';
        return `${indent}<section className="w-full transition-all" style={{ backgroundColor: '${bg}', paddingTop: '${py}', paddingBottom: '${py}', paddingLeft: '${px}', paddingRight: '${px}' }}>${childrenJsx}</section>`;
      }

      case 'heading': {
        const Tag = node.props.level || 'h1';
        const align = node.props.align || 'left';
        const gradient = node.props.gradient
          ? 'bg-gradient-to-r from-[#635BFF] via-[#8B5CF6] to-[#22D3EE] bg-clip-text text-transparent'
          : 'text-slate-900 dark:text-white';
        const text = node.props.text || 'Heading';
        return `${indent}<${Tag} className="text-3xl sm:text-5xl font-black tracking-tight ${gradient}" style={{ textAlign: '${align}' }}>${text}</${Tag}>`;
      }

      case 'text': {
        const content = node.props.content || 'Text content';
        const align = node.props.align || 'left';
        return `${indent}<p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed" style={{ textAlign: '${align}' }}>${content}</p>`;
      }

      case 'button': {
        const label = node.props.label || 'Click Action';
        const variant = node.props.variant || 'default';
        const size = node.props.size || 'md';
        const fullW = node.props.fullWidth ? ' className="w-full"' : '';
        return `${indent}<Button variant="${variant}" size="${size}"${fullW}>${label}</Button>`;
      }

      case 'badge': {
        const text = node.props.text || 'Badge';
        const variant = node.props.variant || 'indigo';
        return `${indent}<Badge variant="${variant}">${text}</Badge>`;
      }

      case 'separator': {
        return `${indent}<Separator className="my-4" />`;
      }

      case 'hero': {
        const title = node.props.title || 'Imagine. Build. Launch.';
        const subtitle = node.props.subtitle || 'Create fullstack apps.';
        const pCta = node.props.primaryCtaText || 'Get Started';
        const sCta = node.props.secondaryCtaText || 'Learn More';
        const badge = node.props.badgeText || 'AI Platform';
        return `${indent}<div className="py-16 px-6 max-w-5xl mx-auto flex flex-col items-center text-center space-y-6">
${childIndent}<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#635BFF]/10 text-xs font-bold text-[#635BFF]">
${childIndent}  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
${childIndent}  <span>${badge}</span>
${childIndent}</div>
${childIndent}<h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white">${title}</h1>
${childIndent}<p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">${subtitle}</p>
${childIndent}<div className="flex items-center gap-3 pt-2">
${childIndent}  <Button size="lg" variant="default" rightIcon={<ArrowRight className="h-4 w-4" />}>${pCta}</Button>
${childIndent}  <Button size="lg" variant="outline">${sCta}</Button>
${childIndent}</div>
${indent}</div>`;
      }

      case 'navbar': {
        const brand = node.props.brandName || 'Nirmaanify';
        const cta = node.props.ctaText || 'Get Started';
        return `${indent}<header className="w-full py-4 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
${childIndent}<span className="font-bold text-sm tracking-tight">${brand}</span>
${childIndent}<Button size="sm" variant="default">${cta}</Button>
${indent}</header>`;
      }

      case 'footer': {
        const brand = node.props.brandName || 'Nirmaanify';
        const copy = node.props.copyrightText || '© 2026 Nirmaanify AI.';
        return `${indent}<footer className="w-full border-t border-slate-200 dark:border-slate-800 py-8 px-6 text-xs text-slate-400 flex items-center justify-between">
${childIndent}<span>${brand}</span>
${childIndent}<span>${copy}</span>
${indent}</footer>`;
      }

      case 'metric-card': {
        const label = node.props.label || 'Metric';
        const val = node.props.value || '$0';
        const chg = node.props.change || '+0%';
        return `${indent}<Card className="p-5 space-y-2">
${childIndent}<div className="flex items-center justify-between text-xs text-slate-400">
${childIndent}  <span>${label}</span>
${childIndent}  <span className="font-bold text-emerald-500">${chg}</span>
${childIndent}</div>
${childIndent}<h3 className="text-2xl font-black">${val}</h3>
${indent}</Card>`;
      }

      default: {
        return `${indent}<div className="p-4 border rounded-xl" data-type="${node.type}">${childrenJsx}</div>`;
      }
    }
  }

  private static toPascalCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');
  }
}
