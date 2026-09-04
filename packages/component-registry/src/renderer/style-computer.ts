import React from 'react';
import { ComponentNodeStyle } from '@nirmaanify/types';

/**
 * Parses raw CSS string (e.g. "filter: blur(4px); transform: rotate(5deg);")
 * into a React.CSSProperties object with camelCased keys.
 */
export function parseCustomCssToStyle(customCss?: string): React.CSSProperties {
  if (!customCss || !customCss.trim()) return {};
  const styleObj: Record<string, string> = {};

  // Strip CSS block comments
  const cleanCss = customCss.replace(/\/\*[\s\S]*?\*\//g, '');
  const declarations = cleanCss.split(';');

  for (const decl of declarations) {
    const trimmed = decl.trim();
    if (!trimmed) continue;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const prop = trimmed.slice(0, colonIdx).trim();
    const val = trimmed.slice(colonIdx + 1).trim();
    if (!prop || !val) continue;

    // Convert CSS kebab-case to React camelCase
    // Special handling for vendor prefixes like -webkit-
    let camelProp = prop.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    if (prop.startsWith('-ms-')) {
      camelProp = 'ms' + camelProp.charAt(0).toUpperCase() + camelProp.slice(1);
    }

    styleObj[camelProp] = val;
    if (camelProp.startsWith('Webkit')) {
      styleObj['webkit' + camelProp.slice(6)] = val;
    }
  }

  return styleObj as React.CSSProperties;
}

/**
 * Computes the full merged React.CSSProperties from a ComponentNodeStyle,
 * including linear/radial gradients, animations, transitions, positions,
 * transforms, filters, and custom CSS declarations.
 */
export function computeNodeStyle(style?: ComponentNodeStyle): React.CSSProperties {
  if (!style) return {};

  const cssProps: React.CSSProperties = {};

  // 1. Box Model & Dimensions
  if (style.padding) cssProps.padding = style.padding;
  if (style.margin) cssProps.margin = style.margin;
  if (style.width) cssProps.width = style.width;
  if (style.minWidth) cssProps.minWidth = style.minWidth;
  if (style.maxWidth) cssProps.maxWidth = style.maxWidth;
  if (style.height) cssProps.height = style.height;
  if (style.minHeight) cssProps.minHeight = style.minHeight;
  if (style.maxHeight) cssProps.maxHeight = style.maxHeight;

  // 2. Backgrounds & Gradients
  if (style.backgroundColor) cssProps.backgroundColor = style.backgroundColor;
  if (style.gradientType && style.gradientType !== 'none') {
    const from = style.gradientFrom || '#635BFF';
    const via = style.gradientVia ? `, ${style.gradientVia}` : '';
    const to = style.gradientTo || '#8B5CF6';

    if (style.gradientType === 'linear') {
      const angle = style.gradientAngle || '135deg';
      cssProps.backgroundImage = `linear-gradient(${angle}, ${from}${via}, ${to})`;
    } else if (style.gradientType === 'radial') {
      const shape = style.gradientAngle || 'circle at center';
      cssProps.backgroundImage = `radial-gradient(${shape}, ${from}${via}, ${to})`;
    }
  } else if (style.backgroundImage) {
    cssProps.backgroundImage = style.backgroundImage;
  }

  // 3. Typography & Colors
  if (style.color) cssProps.color = style.color;
  if (style.fontSize) cssProps.fontSize = style.fontSize;
  if (style.fontWeight) cssProps.fontWeight = style.fontWeight;
  if (style.textAlign) cssProps.textAlign = style.textAlign;

  // 4. Borders & Shadows
  if (style.borderRadius) cssProps.borderRadius = style.borderRadius;
  if (style.borderWidth) cssProps.borderWidth = style.borderWidth;
  if (style.borderColor) cssProps.borderColor = style.borderColor;
  if (style.borderWidth && !style.borderColor) cssProps.borderColor = 'currentColor';
  if (style.borderWidth && !cssProps.borderStyle) cssProps.borderStyle = 'solid';
  if (style.boxShadow) cssProps.boxShadow = style.boxShadow;

  // 5. Flexbox & Grid
  if (style.display) cssProps.display = style.display;
  if (style.flexDirection) cssProps.flexDirection = style.flexDirection;
  if (style.alignItems) cssProps.alignItems = style.alignItems;
  if (style.justifyContent) cssProps.justifyContent = style.justifyContent;
  if (style.gap) cssProps.gap = style.gap;
  if (style.gridTemplateColumns) cssProps.gridTemplateColumns = style.gridTemplateColumns;

  // 6. Positioning
  if (style.position) cssProps.position = style.position;
  if (style.top !== undefined && style.top !== '') cssProps.top = style.top;
  if (style.right !== undefined && style.right !== '') cssProps.right = style.right;
  if (style.bottom !== undefined && style.bottom !== '') cssProps.bottom = style.bottom;
  if (style.left !== undefined && style.left !== '') cssProps.left = style.left;
  if (style.zIndex !== undefined && style.zIndex !== '') {
    cssProps.zIndex = typeof style.zIndex === 'number' ? style.zIndex : parseInt(String(style.zIndex), 10) || 0;
  }

  // 7. Overflow & Opacity
  if (style.overflow) cssProps.overflow = style.overflow;
  if (style.overflowX) cssProps.overflowX = style.overflowX;
  if (style.overflowY) cssProps.overflowY = style.overflowY;
  if (style.opacity !== undefined) cssProps.opacity = style.opacity;

  // 8. Transitions & Animations
  if (style.transition) {
    cssProps.transition = style.transition;
  } else if (style.transitionDuration) {
    const prop = style.transitionProperty || 'all';
    const timing = style.transitionTimingFunction || 'ease';
    cssProps.transition = `${prop} ${style.transitionDuration} ${timing}`;
  }

  if (style.animation) {
    cssProps.animation = style.animation;
  } else if (style.animationType && style.animationType !== 'none') {
    const dur = style.animationDuration || (style.animationType === 'spin' ? '1s' : style.animationType === 'bounce' ? '1s' : '2s');
    switch (style.animationType) {
      case 'pulse':
        cssProps.animation = `pulse ${dur} cubic-bezier(0.4, 0, 0.6, 1) infinite`;
        break;
      case 'bounce':
        cssProps.animation = `bounce ${dur} infinite`;
        break;
      case 'spin':
        cssProps.animation = `spin ${dur} linear infinite`;
        break;
      case 'ping':
        cssProps.animation = `ping ${dur} cubic-bezier(0, 0, 0.2, 1) infinite`;
        break;
      case 'float':
        cssProps.animation = `bounce ${dur} ease-in-out infinite`;
        break;
      case 'glow':
        cssProps.animation = `pulse ${dur} ease-in-out infinite`;
        break;
    }
  }

  // 9. Transforms, Filters, and Cursor
  const transformParts: string[] = [];
  if (style.transform) {
    transformParts.push(style.transform);
  } else {
    if (style.scale) transformParts.push(`scale(${style.scale})`);
    if (style.rotate) transformParts.push(`rotate(${style.rotate})`);
  }
  if (transformParts.length > 0) {
    cssProps.transform = transformParts.join(' ');
  }

  if (style.filter) cssProps.filter = style.filter;
  if (style.backdropFilter) {
    cssProps.backdropFilter = style.backdropFilter;
    (cssProps as any).WebkitBackdropFilter = style.backdropFilter;
  }
  if (style.cursor) cssProps.cursor = style.cursor;

  // 10. Merge Developer Custom CSS declarations (highest precedence)
  if (style.customCss) {
    const customParsed = parseCustomCssToStyle(style.customCss);
    Object.assign(cssProps, customParsed);
  }

  return cssProps;
}
