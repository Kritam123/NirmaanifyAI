import { ComponentNode, ComponentNodeStyle, PageSchema } from '@nirmaanify/types';

interface ParsedJsxTag {
  tagName: string;
  props: Record<string, any>;
  childrenText: string;
  isSelfClosing: boolean;
}

export class CodeToAstParser {
  /**
   * Parse a TSX / JSX page code string into a PageSchema
   */
  static parsePage(tsxCode: string, pageName: string = 'GeneratedPage', pagePath: string = '/'): PageSchema {
    const rootNode = this.parseTsxToComponentTree(tsxCode);

    return {
      id: `page-${Date.now().toString(36)}`,
      name: pageName,
      path: pagePath,
      title: pageName,
      description: 'Synchronized from source code',
      layout: 'default',
      rootNode,
    };
  }

  /**
   * Parse TSX code into a ComponentNode tree
   */
  static parseTsxToComponentTree(tsxCode: string): ComponentNode {
    // 1. Extract return (...) body from the component function
    const jsxSnippet = this.extractReturnJsx(tsxCode);

    // 2. Parse JSX elements into ComponentNode
    const nodes = this.parseElements(jsxSnippet);

    if (nodes.length === 1 && nodes[0].type === 'container') {
      return nodes[0];
    }

    // Default root container wrapper
    return {
      id: `root-${Date.now().toString(36)}`,
      type: 'container',
      name: 'Page Root',
      props: { tag: 'main' },
      style: {
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      },
      children: nodes.length > 0 ? nodes : [this.createDefaultPlaceholderNode()],
    };
  }

  private static extractReturnJsx(code: string): string {
    // Look for return (\n ... \n );
    const returnMatch = code.match(/return\s*\(\s*([\s\S]*?)\s*\);?\s*(\}|export)/);
    if (returnMatch && returnMatch[1]) {
      return returnMatch[1].trim();
    }

    // Look for direct return <...>;
    const directReturnMatch = code.match(/return\s+(<[\s\S]*?>);?/);
    if (directReturnMatch && directReturnMatch[1]) {
      return directReturnMatch[1].trim();
    }

    return code.trim();
  }

  private static parseElements(jsx: string): ComponentNode[] {
    const trimmed = jsx.trim();
    if (!trimmed) return [];

    // Strip outer React fragment <>...</> or <React.Fragment>...</React.Fragment> if present
    if (trimmed.startsWith('<>') && trimmed.endsWith('</>')) {
      return this.parseElements(trimmed.slice(2, -3).trim());
    }

    const nodes: ComponentNode[] = [];
    let remaining = trimmed;

    while (remaining.length > 0) {
      remaining = remaining.trim();
      if (!remaining) break;

      if (!remaining.startsWith('<')) {
        // Plain text node
        const nextTagIdx = remaining.indexOf('<');
        const textContent = nextTagIdx === -1 ? remaining : remaining.slice(0, nextTagIdx);
        if (textContent.trim()) {
          nodes.push(this.createTextFallbackNode(textContent.trim()));
        }
        remaining = nextTagIdx === -1 ? '' : remaining.slice(nextTagIdx);
        continue;
      }

      // Check comments e.g. {/* ... */}
      if (remaining.startsWith('{/*')) {
        const endComment = remaining.indexOf('*/}');
        if (endComment !== -1) {
          remaining = remaining.slice(endComment + 3);
          continue;
        }
      }

      const match = this.parseNextTag(remaining);
      if (!match) {
        // Unparseable fragment, convert rest into a custom-code fallback
        if (remaining.trim()) {
          nodes.push({
            id: `custom-${Math.random().toString(36).substring(2, 9)}`,
            type: 'container',
            name: 'Custom Element',
            props: { rawCode: remaining.trim() },
            style: { padding: '12px' },
            children: [],
          });
        }
        break;
      }

      const { tag, consumedLength } = match;
      remaining = remaining.slice(consumedLength);

      const componentNode = this.convertParsedTagToNode(tag);
      nodes.push(componentNode);
    }

    return nodes;
  }

  private static parseNextTag(input: string): { tag: ParsedJsxTag; consumedLength: number } | null {
    // Matches: <TagName props... /> or <TagName props...>children</TagName>
    const openTagRegex = /^<([a-zA-Z0-9_.-]+)([\s\S]*?)(\/?>)/;
    const match = input.match(openTagRegex);
    if (!match) return null;

    const [fullOpen, tagName, rawAttrs, closeBracket] = match;
    const isSelfClosing = closeBracket === '/>';
    const props = this.parseAttributes(rawAttrs);

    if (isSelfClosing) {
      return {
        tag: {
          tagName,
          props,
          childrenText: '',
          isSelfClosing: true,
        },
        consumedLength: fullOpen.length,
      };
    }

    // Find matching closing tag with balanced nesting
    const openTagStr = `<${tagName}`;
    const closeTagStr = `</${tagName}>`;
    let depth = 1;
    let searchIdx = fullOpen.length;

    while (depth > 0 && searchIdx < input.length) {
      const nextOpen = input.indexOf(openTagStr, searchIdx);
      const nextClose = input.indexOf(closeTagStr, searchIdx);

      if (nextClose === -1) {
        // Malformed, consume rest
        return {
          tag: {
            tagName,
            props,
            childrenText: input.slice(fullOpen.length),
            isSelfClosing: false,
          },
          consumedLength: input.length,
        };
      }

      if (nextOpen !== -1 && nextOpen < nextClose) {
        // Check if nextOpen is a self-closing tag or distinct tag
        const subMatch = input.slice(nextOpen).match(/^<[a-zA-Z0-9_.-]+[\s\S]*?\/?>/);
        if (subMatch && !subMatch[0].endsWith('/>')) {
          depth++;
        }
        searchIdx = nextOpen + (subMatch ? subMatch[0].length : openTagStr.length);
      } else {
        depth--;
        if (depth === 0) {
          const childrenText = input.slice(fullOpen.length, nextClose);
          return {
            tag: {
              tagName,
              props,
              childrenText,
              isSelfClosing: false,
            },
            consumedLength: nextClose + closeTagStr.length,
          };
        }
        searchIdx = nextClose + closeTagStr.length;
      }
    }

    return null;
  }

  private static parseAttributes(rawAttrs: string): Record<string, any> {
    const props: Record<string, any> = {};
    if (!rawAttrs) return props;

    // Matches: key="val", key='val', key={val}, or boolean key
    const attrRegex = /([a-zA-Z0-9_.-]+)(?:=(?:"([^"]*)"|'([^']*)'|\{([^}]*)\}))?/g;
    let m: RegExpExecArray | null;

    while ((m = attrRegex.exec(rawAttrs)) !== null) {
      const key = m[1];
      const stringVal = m[2] ?? m[3];
      const jsVal = m[4];

      if (stringVal !== undefined) {
        props[key] = stringVal;
      } else if (jsVal !== undefined) {
        const trimmed = jsVal.trim();
        if (trimmed === 'true') props[key] = true;
        else if (trimmed === 'false') props[key] = false;
        else if (!isNaN(Number(trimmed))) props[key] = Number(trimmed);
        else props[key] = trimmed;
      } else {
        props[key] = true; // Boolean prop
      }
    }

    return props;
  }

  private static convertParsedTagToNode(tag: ParsedJsxTag): ComponentNode {
    const id = `node-${Math.random().toString(36).substring(2, 9)}`;
    const lower = tag.tagName.toLowerCase();
    const style: ComponentNodeStyle = this.parseStyleFromClassName(tag.props.className);

    // 1. Buttons
    if (lower === 'button') {
      const text = tag.props.text || tag.props.label || tag.childrenText.trim() || 'Click Me';
      return {
        id,
        type: 'button',
        name: 'Button',
        props: {
          text,
          label: text,
          variant: tag.props.variant || 'default',
          size: tag.props.size || 'default',
          disabled: !!tag.props.disabled,
        },
        style,
        children: [],
      };
    }

    // 2. Badges
    if (lower === 'badge') {
      const text = tag.props.text || tag.props.label || tag.childrenText.trim() || 'New';
      return {
        id,
        type: 'badge',
        name: 'Badge',
        props: {
          text,
          label: text,
          variant: tag.props.variant || 'default',
        },
        style,
        children: [],
      };
    }

    // 3. Headings
    if (
      lower === 'heading' ||
      lower === 'h1' ||
      lower === 'h2' ||
      lower === 'h3' ||
      lower === 'h4' ||
      lower === 'h5' ||
      lower === 'h6' ||
      /^[1-6]$/.test(lower)
    ) {
      const text = tag.props.text || tag.props.title || tag.childrenText.trim() || 'Heading';
      let level = 'h2';
      if (/^h[1-6]$/.test(lower)) {
        level = lower;
      } else if (/^[1-6]$/.test(lower)) {
        level = `h${lower}`;
      } else if (tag.props.level) {
        const raw = String(tag.props.level).toLowerCase().trim();
        if (/^h[1-6]$/.test(raw)) {
          level = raw;
        } else {
          const num = raw.replace(/\D/g, '');
          level = num ? `h${Math.min(Math.max(1, parseInt(num, 10)), 6)}` : 'h2';
        }
      } else {
        level = 'h2';
      }

      return {
        id,
        type: 'heading',
        name: `Heading ${level.toUpperCase()}`,
        props: { text, level },
        style,
        children: [],
      };
    }

    // 4. Text / Paragraphs
    if (lower === 'text' || lower === 'p' || lower === 'span') {
      const text = tag.props.content || tag.props.text || tag.childrenText.trim() || '';
      return {
        id,
        type: 'text',
        name: 'Text Block',
        props: { text, content: text, tag: lower === 'span' ? 'span' : 'p' },
        style,
        children: [],
      };
    }

    // 5. Inputs & Textareas
    if (lower === 'input') {
      return {
        id,
        type: 'input',
        name: 'Input Field',
        props: {
          placeholder: tag.props.placeholder || 'Enter value...',
          type: tag.props.type || 'text',
          disabled: !!tag.props.disabled,
        },
        style,
        children: [],
      };
    }

    if (lower === 'textarea') {
      return {
        id,
        type: 'textarea',
        name: 'Text Area',
        props: {
          placeholder: tag.props.placeholder || 'Enter description...',
          rows: Number(tag.props.rows) || 4,
        },
        style,
        children: [],
      };
    }

    // 6. Cards
    if (lower === 'card' || lower === 'featurecard' || lower === 'feature-card') {
      const children = tag.childrenText ? this.parseElements(tag.childrenText) : [];
      return {
        id,
        type: lower.includes('feature') ? 'feature-card' : 'card',
        name: lower.includes('feature') ? 'Feature Card' : 'Card Container',
        props: {
          title: tag.props.title || 'Card Title',
          description: tag.props.description || 'Card description here',
        },
        style,
        children,
      };
    }

    // 7. Sections & Grids
    if (lower === 'section') {
      const children = tag.childrenText ? this.parseElements(tag.childrenText) : [];
      return {
        id,
        type: 'section',
        name: 'Section',
        props: {},
        style: {
          padding: '48px 24px',
          ...style,
        },
        children,
      };
    }

    if (lower === 'grid') {
      const children = tag.childrenText ? this.parseElements(tag.childrenText) : [];
      return {
        id,
        type: 'grid',
        name: 'Grid Layout',
        props: {
          columns: Number(tag.props.columns) || 3,
        },
        style: {
          display: 'grid',
          gap: '16px',
          ...style,
        },
        children,
      };
    }

    // 8. Marketing blocks (Hero, PricingCard, TestimonialCard, ProductCard)
    if (lower === 'hero') {
      return {
        id,
        type: 'hero',
        name: 'Hero Banner',
        props: {
          headline: tag.props.headline || tag.props.title || 'Transform Your Business with AI',
          subheadline: tag.props.subheadline || tag.props.description || 'Supercharge your engineering workflow with real-time autonomous generation.',
          ctaText: tag.props.ctaText || 'Get Started Free',
        },
        style,
        children: [],
      };
    }

    if (lower === 'pricingcard' || lower === 'pricing-card') {
      return {
        id,
        type: 'pricing-card',
        name: 'Pricing Tier Card',
        props: {
          title: tag.props.title || 'Pro Plan',
          price: tag.props.price || '$29',
          period: tag.props.period || '/month',
          isPopular: !!tag.props.isPopular,
          features: tag.props.features ? String(tag.props.features).split(',') : ['Unlimited Projects', 'Cloud Sandboxes', 'Priority Support'],
        },
        style,
        children: [],
      };
    }

    // 9. Generic Container / Div fallback
    const parsedChildren = tag.childrenText ? this.parseElements(tag.childrenText) : [];
    return {
      id,
      type: 'container',
      name: tag.tagName,
      props: { ...tag.props },
      style,
      children: parsedChildren,
    };
  }

  private static parseStyleFromClassName(className?: string): ComponentNodeStyle {
    const style: ComponentNodeStyle = {};
    if (!className) return style;

    const classes = className.split(/\s+/);
    for (const cls of classes) {
      if (cls === 'flex') style.display = 'flex';
      else if (cls === 'grid') style.display = 'grid';
      else if (cls === 'flex-col') style.flexDirection = 'column';
      else if (cls === 'flex-row') style.flexDirection = 'row';
      else if (cls === 'items-center') style.alignItems = 'center';
      else if (cls === 'justify-center') style.justifyContent = 'center';
      else if (cls === 'justify-between') style.justifyContent = 'space-between';
      else if (cls.startsWith('p-')) style.padding = `${parseInt(cls.replace('p-', '')) * 4}px`;
      else if (cls.startsWith('gap-')) style.gap = `${parseInt(cls.replace('gap-', '')) * 4}px`;
      else if (cls.startsWith('rounded-')) style.borderRadius = cls === 'rounded-full' ? '9999px' : '12px';
      else if (cls.startsWith('bg-')) style.backgroundColor = cls;
      else if (cls.startsWith('text-')) style.color = cls;
    }

    return style;
  }

  private static createTextFallbackNode(text: string): ComponentNode {
    return {
      id: `text-${Math.random().toString(36).substring(2, 9)}`,
      type: 'text',
      name: 'Text',
      props: { text },
      children: [],
    };
  }

  private static createDefaultPlaceholderNode(): ComponentNode {
    return {
      id: `placeholder-${Math.random().toString(36).substring(2, 9)}`,
      type: 'heading',
      name: 'Heading',
      props: { text: 'Welcome to your application', level: 'h1' },
      children: [],
    };
  }
}
