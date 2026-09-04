import { ComponentNode, PageSchema, ProjectSchema } from '@nirmaanify/types';

export class ReactCodeGenerator {
  static generatePageComponent(page: PageSchema): string {
    const componentImports = new Set<string>();
    const iconImports = new Set<string>();

    const collectImports = (node: ComponentNode) => {
      if (node.isHidden) return;
      switch (node.type) {
        case 'button':
        case 'badge':
        case 'separator':
        case 'input':
        case 'textarea':
        case 'card':
          componentImports.add(node.type.charAt(0).toUpperCase() + node.type.slice(1));
          if (node.type === 'card') {
            componentImports.add('CardHeader');
            componentImports.add('CardTitle');
            componentImports.add('CardDescription');
            componentImports.add('CardContent');
          }
          break;
        case 'hero':
          iconImports.add('Sparkles');
          iconImports.add('ArrowRight');
          break;
        case 'feature-card':
          componentImports.add('Card');
          iconImports.add('Layers');
          iconImports.add('Sparkles');
          break;
        case 'pricing-card':
          componentImports.add('Card');
          iconImports.add('Check');
          break;
        case 'product-card':
          componentImports.add('Card');
          iconImports.add('ShoppingBag');
          iconImports.add('Star');
          break;
        case 'metric-card':
          componentImports.add('Card');
          iconImports.add('TrendingUp');
          iconImports.add('TrendingDown');
          break;
        case 'testimonial-card':
          componentImports.add('Card');
          iconImports.add('Star');
          break;
        case 'image':
          break;
      }
      node.children?.forEach(collectImports);
    };

    collectImports(page.rootNode);

    const jsxBody = this.generateNodeJsx(page.rootNode, 2);

    const uiImportsStr =
      componentImports.size > 0
        ? `import { ${Array.from(componentImports).sort().join(', ')} } from '@nirmaanify/ui';\n`
        : '';
    const iconImportsStr =
      iconImports.size > 0
        ? `import { ${Array.from(iconImports).sort().join(', ')} } from 'lucide-react';\n`
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
    if (node.isHidden) return '';
    const indent = '  '.repeat(indentLevel);
    const childIndent = '  '.repeat(indentLevel + 1);

    const visibleChildren = (node.children || []).filter((c) => !c.isHidden);
    const childrenJsx = visibleChildren.length > 0
      ? '\n' + visibleChildren.map((c) => this.generateNodeJsx(c, indentLevel + 1)).filter(Boolean).join('\n') + '\n' + indent
      : '';

    const visClass = this.getVisibilityClasses(node);

    switch (node.type) {
      case 'container': {
        const maxW = node.style?.maxWidth || node.props.maxWidth || '1200px';
        const p = node.style?.padding || node.props.padding || '24px';
        const stackOnMobile = node.style?.stackOnMobile !== false;
        const dir = (node.style?.flexDirection || node.props.direction) === 'row'
          ? (stackOnMobile ? 'flex-col md:flex-row' : 'flex-row')
          : 'flex-col';
        const gap = node.style?.gap || node.props.gap || '16px';

        const styleEntries: string[] = [];
        if (node.style?.width) styleEntries.push(`width: '${node.style.width}'`);
        if (node.style?.minWidth) styleEntries.push(`minWidth: '${node.style.minWidth}'`);
        styleEntries.push(`maxWidth: '${maxW}'`);
        if (node.style?.height) styleEntries.push(`height: '${node.style.height}'`);
        if (node.style?.minHeight) styleEntries.push(`minHeight: '${node.style.minHeight}'`);
        if (node.style?.maxHeight) styleEntries.push(`maxHeight: '${node.style.maxHeight}'`);
        if (node.style?.overflow) styleEntries.push(`overflow: '${node.style.overflow}'`);
        styleEntries.push(`padding: '${p}'`);
        styleEntries.push(`gap: '${gap}'`);

        return `${indent}<div className="w-full flex ${dir} mx-auto transition-all${visClass}" style={{ ${styleEntries.join(', ')} }}>${childrenJsx}</div>`;
      }

      case 'grid': {
        const cols = node.props.columns || 3;
        const mobileCols = node.style?.mobileColumns ?? 1;
        const tabletCols = node.style?.tabletColumns ?? Math.min(cols, 2);
        const gap = node.props.gap || '24px';
        return `${indent}<div className="w-full grid grid-cols-${mobileCols} sm:grid-cols-${tabletCols} md:grid-cols-${cols} transition-all${visClass}" style={{ gap: '${gap}' }}>${childrenJsx}</div>`;
      }

      case 'section': {
        const bg = node.props.backgroundColor || 'transparent';
        const py = node.props.paddingY || '64px';
        const px = node.props.paddingX || '24px';
        return `${indent}<section className="w-full transition-all${visClass}" style={{ backgroundColor: '${bg}', paddingTop: '${py}', paddingBottom: '${py}', paddingLeft: '${px}', paddingRight: '${px}' }}>${childrenJsx}</section>`;
      }

      case 'heading': {
        const Tag = node.props.level || 'h1';
        const align = node.props.align || 'left';
        const gradient = node.props.gradient
          ? 'bg-gradient-to-r from-[#635BFF] via-[#8B5CF6] to-[#22D3EE] bg-clip-text text-transparent'
          : 'text-slate-900 dark:text-white';
        const text = node.props.text || 'Heading';
        const alignClass = node.style?.mobileAlign
          ? `text-${node.style.mobileAlign} md:text-${align}`
          : `text-${align}`;
        return `${indent}<${Tag} className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight ${alignClass} ${gradient}${visClass}">${text}</${Tag}>`;
      }

      case 'text': {
        const content = node.props.content || 'Text content';
        const align = node.props.align || 'left';
        const alignClass = node.style?.mobileAlign
          ? `text-${node.style.mobileAlign} md:text-${align}`
          : `text-${align}`;
        return `${indent}<p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed ${alignClass}${visClass}">${content}</p>`;
      }

      case 'button': {
        const label = node.props.label || 'Click Action';
        const variant = node.props.variant || 'default';
        const size = node.props.size || 'md';
        const widthClass = node.props.fullWidth
          ? 'w-full'
          : (node.style?.mobileFullWidth ? 'w-full md:w-auto' : '');
        const btnClass = [widthClass, visClass.trim()].filter(Boolean).join(' ');
        const classAttr = btnClass ? ` className="${btnClass}"` : '';
        return `${indent}<Button variant="${variant}" size="${size}"${classAttr}>${label}</Button>`;
      }

      case 'badge': {
        const text = node.props.text || 'Badge';
        const variant = node.props.variant || 'indigo';
        const badgeClass = visClass.trim() ? ` className="${visClass.trim()}"` : '';
        return `${indent}<Badge variant="${variant}"${badgeClass}>${text}</Badge>`;
      }

      case 'separator': {
        return `${indent}<Separator className="my-4${visClass}" />`;
      }

      case 'image': {
        const src = node.props.src || '';
        const alt = node.props.alt || 'Image';
        const radius = node.props.borderRadius || '16px';
        const ratio = node.props.aspectRatio || '16/9';
        return `${indent}<img src="${src}" alt="${alt}" className="w-full block bg-slate-100 dark:bg-slate-800 transition-all${visClass}" style={{ aspectRatio: '${ratio}', borderRadius: '${radius}', objectFit: 'cover' }} />`;
      }

      case 'card': {
        const title = node.props.title || 'Card Title';
        const description = node.props.description || '';
        const hoverable = node.props.hoverable !== false;
        return `${indent}<Card hoverable={${hoverable}} className="w-full p-6 space-y-3${visClass}">
${childIndent}<CardHeader>
${childIndent}  <CardTitle className="text-base">${title}</CardTitle>
${childIndent}  ${description ? `<CardDescription>${description}</CardDescription>` : ''}
${childIndent}</CardHeader>
${childIndent}<CardContent className="space-y-3">${childrenJsx}</CardContent>
${indent}</Card>`;
      }

      case 'feature-card': {
        const title = node.props.title || 'Feature Title';
        const desc = node.props.description || '';
        const tag = node.props.tag || '';
        return `${indent}<Card hoverable className="p-6 space-y-4${visClass}">
${childIndent}<div className="flex items-center justify-between">
${childIndent}  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#635BFF] to-[#22D3EE] p-0.5">
${childIndent}    <div className="h-full w-full bg-white dark:bg-[#0E121E] rounded-xl flex items-center justify-center">
${childIndent}      <Sparkles className="h-5 w-5 text-[#635BFF]" />
${childIndent}    </div>
${childIndent}  </div>
${childIndent}  ${tag ? `<Badge variant="indigo" size="sm">${tag}</Badge>` : ''}
${childIndent}</div>
${childIndent}<div>
${childIndent}  <h4 className="font-bold text-base text-slate-900 dark:text-white">${title}</h4>
${childIndent}  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">${desc}</p>
${childIndent}</div>
${indent}</Card>`;
      }

      case 'pricing-card': {
        const tier = node.props.tierName || 'Pro';
        const price = node.props.price || '$29';
        const period = node.props.period || '/month';
        const desc = node.props.description || '';
        const features = (node.props.features || '').split(',').map((f: string) => f.trim()).filter(Boolean);
        const btnText = node.props.buttonText || 'Upgrade';
        const popular = !!node.props.isPopular;
        const featureLines = features.map((f: string) =>
          `${childIndent}  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">\n${childIndent}    <Check className="h-4 w-4 text-emerald-500 shrink-0" />\n${childIndent}    <span>${f}</span>\n${childIndent}  </div>`
        ).join('\n');
        return `${indent}<Card hoverable className="p-6 flex flex-col justify-between relative transition-all${visClass}${popular ? ' border-2 border-[#635BFF] shadow-xl shadow-[#635BFF]/10' : ''}">
${popular ? `${childIndent}<div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#635BFF] text-white text-[11px] font-bold tracking-wide uppercase">Most Popular</div>\n` : ''}${childIndent}<div className="space-y-4">
${childIndent}  <div>
${childIndent}    <h4 className="font-bold text-lg text-slate-900 dark:text-white">${tier}</h4>
${childIndent}    <p className="text-xs text-slate-500 mt-1">${desc}</p>
${childIndent}  </div>
${childIndent}  <div className="flex items-baseline gap-1">
${childIndent}    <span className="text-4xl font-black text-slate-900 dark:text-white">${price}</span>
${childIndent}    <span className="text-xs text-slate-400 font-semibold">${period}</span>
${childIndent}  </div>
${childIndent}  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
${featureLines}
${childIndent}  </div>
${childIndent}</div>
${childIndent}<div className="pt-6">
${childIndent}  <Button variant="${popular ? 'default' : 'outline'}" className="w-full">${btnText}</Button>
${childIndent}</div>
${indent}</Card>`;
      }

      case 'product-card': {
        const title = node.props.title || 'Product';
        const price = node.props.price || '$0';
        const origPrice = node.props.originalPrice || '';
        const category = node.props.category || '';
        const imageUrl = node.props.imageUrl || '';
        const rating = node.props.rating || '4.9';
        const badge = node.props.badgeText || '';
        return `${indent}<Card hoverable className="overflow-hidden flex flex-col justify-between group${visClass}">
${childIndent}<div className="relative aspect-[4/5] bg-slate-100 dark:bg-slate-800 overflow-hidden">
${childIndent}  <img src="${imageUrl}" alt="${title}" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
${badge ? `${childIndent}  <div className="absolute top-3 left-3"><Badge variant="indigo" size="sm">${badge}</Badge></div>\n` : ''}${childIndent}</div>
${childIndent}<div className="p-4 space-y-2.5">
${childIndent}  <div className="flex items-center justify-between text-[11px] text-slate-400">
${childIndent}    <span>${category}</span>
${childIndent}    <div className="flex items-center gap-1 text-amber-400">
${childIndent}      <Star className="h-3.5 w-3.5 fill-amber-400" />
${childIndent}      <span className="font-semibold text-slate-700 dark:text-slate-200">${rating}</span>
${childIndent}    </div>
${childIndent}  </div>
${childIndent}  <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">${title}</h4>
${childIndent}  <div className="flex items-center justify-between pt-1">
${childIndent}    <div className="flex items-baseline gap-1.5">
${childIndent}      <span className="font-black text-sm text-slate-900 dark:text-white">${price}</span>
${origPrice ? `${childIndent}      <span className="text-xs text-slate-400 line-through">${origPrice}</span>\n` : ''}${childIndent}    </div>
${childIndent}    <Button size="sm" variant="subtle" leftIcon={<ShoppingBag className="h-3.5 w-3.5" />}>Add</Button>
${childIndent}  </div>
${childIndent}</div>
${indent}</Card>`;
      }

      case 'metric-card': {
        const label = node.props.label || 'Metric';
        const val = node.props.value || '$0';
        const chg = node.props.change || '+0%';
        const positive = node.props.isPositive !== false;
        const subtext = node.props.subtext || '';
        return `${indent}<Card hoverable className="p-5 space-y-2 w-full${visClass}">
${childIndent}<div className="flex items-center justify-between">
${childIndent}  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">${label}</span>
${childIndent}  <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${positive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}">
${childIndent}    ${positive ? '<TrendingUp' : '<TrendingDown'} className="h-3 w-3" />
${childIndent}    <span>${chg}</span>
${childIndent}  </div>
${childIndent}</div>
${childIndent}<div>
${childIndent}  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">${val}</h3>
${subtext ? `${childIndent}  <p className="text-[11px] text-slate-400 mt-1">${subtext}</p>\n` : ''}${childIndent}</div>
${indent}</Card>`;
      }

      case 'testimonial-card': {
        const quote = node.props.quote || '';
        const author = node.props.authorName || 'Anonymous';
        const role = node.props.authorRole || '';
        const stars = Math.max(1, Math.min(5, Number(node.props.stars) || 5));
        const starIcons = Array.from({ length: stars }, () => `${childIndent}<Star className="h-4 w-4 fill-amber-400" />`).join('\n');
        return `${indent}<Card hoverable className="p-6 space-y-4${visClass}">
${childIndent}<div className="flex items-center gap-1 text-amber-400">
${starIcons}
${childIndent}</div>
${childIndent}<p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">&ldquo;${quote}&rdquo;</p>
${childIndent}<div className="pt-2 flex items-center gap-3">
${childIndent}  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#635BFF] to-[#22D3EE] flex items-center justify-center font-bold text-xs text-white">${author.charAt(0)}</div>
${childIndent}  <div>
${childIndent}    <h5 className="font-bold text-xs text-slate-900 dark:text-white">${author}</h5>
${childIndent}    <p className="text-[11px] text-slate-400">${role}</p>
${childIndent}  </div>
${childIndent}</div>
${indent}</Card>`;
      }

      case 'hero': {
        const title = node.props.title || 'Imagine. Build. Launch.';
        const subtitle = node.props.subtitle || 'Create fullstack apps.';
        const pCta = node.props.primaryCtaText || 'Get Started';
        const sCta = node.props.secondaryCtaText || 'Learn More';
        const badge = node.props.badgeText || 'AI Platform';
        return `${indent}<div className="py-12 sm:py-16 px-4 sm:px-6 max-w-5xl mx-auto flex flex-col items-center text-center space-y-6${visClass}">
${childIndent}<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#635BFF]/10 text-xs font-bold text-[#635BFF]">
${childIndent}  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
${childIndent}  <span>${badge}</span>
${childIndent}</div>
${childIndent}<h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white">${title}</h1>
${childIndent}<p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl">${subtitle}</p>
${childIndent}<div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto justify-center">
${childIndent}  <Button size="lg" variant="default" className="w-full sm:w-auto" rightIcon={<ArrowRight className="h-4 w-4" />}>${pCta}</Button>
${childIndent}  <Button size="lg" variant="outline" className="w-full sm:w-auto">${sCta}</Button>
${childIndent}</div>
${indent}</div>`;
      }

      case 'navbar': {
        const brand = node.props.brandName || 'Nirmaanify';
        const links = (node.props.links || 'Features, Pricing').split(',').map((s: string) => s.trim()).filter(Boolean);
        const cta = node.props.ctaText || 'Get Started';
        const linkItems = links.map((l: string) => `${childIndent}  <span className="hover:text-[#635BFF] cursor-pointer transition-colors">${l}</span>`).join('\n');
        return `${indent}<header className="w-full py-4 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between${visClass}">
${childIndent}<span className="font-bold text-sm tracking-tight">${brand}</span>
${childIndent}<nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-300">
${linkItems}
${childIndent}</nav>
${childIndent}<Button size="sm" variant="default">${cta}</Button>
${indent}</header>`;
      }

      case 'footer': {
        const brand = node.props.brandName || 'Nirmaanify AI';
        const copy = node.props.copyrightText || '© 2026 Nirmaanify AI.';
        return `${indent}<footer className="w-full border-t border-slate-200 dark:border-slate-800 py-8 px-6 text-xs text-slate-400 flex items-center justify-between${visClass}">
${childIndent}<span>${brand}</span>
${childIndent}<span>${copy}</span>
${indent}</footer>`;
      }

      case 'form': {
        const title = node.props.title || 'Contact Form';
        const submitText = node.props.submitButtonText || 'Submit';
        return `${indent}<form onSubmit={(e) => e.preventDefault()} className="p-6 rounded-2xl bg-white dark:bg-[#161926] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-w-md w-full${visClass}">
${childIndent}<h4 className="font-bold text-base text-slate-900 dark:text-white">${title}</h4>
${childIndent}<div className="space-y-3">${childrenJsx}</div>
${childIndent}<Button variant="default" className="w-full mt-2">${submitText}</Button>
${indent}</form>`;
      }

      case 'input': {
        const label = node.props.label || 'Field';
        const placeholder = node.props.placeholder || '';
        const helper = node.props.helperText || '';
        return `${indent}<Input label="${label}" placeholder="${placeholder}"${helper ? ` helperText="${helper}"` : ''} />`;
      }

      case 'textarea': {
        const label = node.props.label || 'Message';
        const placeholder = node.props.placeholder || '';
        const rows = node.props.rows || 3;
        return `${indent}<Textarea label="${label}" placeholder="${placeholder}" rows={${rows}} />`;
      }

      default: {
        return `${indent}<div className="p-4 border rounded-xl${visClass}" data-type="${node.type}">${childrenJsx}</div>`;
      }
    }
  }

  private static getVisibilityClasses(node: ComponentNode): string {
    const s = node.style;
    if (!s) return '';
    const classes: string[] = [];
    if (s.hideOnMobile && s.hideOnTablet) {
      classes.push('max-md:hidden');
    } else if (s.hideOnTablet && s.hideOnDesktop) {
      classes.push('sm:hidden');
    } else if (s.hideOnMobile && s.hideOnDesktop) {
      classes.push('max-sm:hidden', 'md:hidden');
    } else if (s.hideOnMobile) {
      classes.push('max-sm:hidden');
    } else if (s.hideOnTablet) {
      classes.push('sm:max-md:hidden');
    } else if (s.hideOnDesktop) {
      classes.push('md:hidden');
    }
    return classes.length > 0 ? ` ${classes.join(' ')}` : '';
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