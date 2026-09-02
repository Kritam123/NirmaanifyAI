import React from 'react';
import { z } from 'zod';
import { ComponentDefinition } from '../types';
import { Button, Badge, Separator } from '@nirmaanify/ui';

// ==========================================
// 1. HEADING
// ==========================================
export const HeadingDefinition: ComponentDefinition<{
  text: string;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  align: 'left' | 'center' | 'right';
  gradient: boolean;
}> = {
  id: 'heading',
  name: 'Heading',
  category: 'typography',
  description: 'Headline text element supporting H1 through H6 levels and gradient styles.',
  icon: 'Heading',
  allowedChildren: false,
  defaultProps: {
    text: 'Craft Beautiful Web Experiences',
    level: 'h1',
    align: 'left',
    gradient: false,
  },
  propsSchema: z.object({
    text: z.string().default('Craft Beautiful Web Experiences'),
    level: z.enum(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']).default('h1'),
    align: z.enum(['left', 'center', 'right']).default('left'),
    gradient: z.boolean().default(false),
  }),
  inspectorControls: [
    { name: 'text', label: 'Heading Text', type: 'text', group: 'content', defaultValue: 'Craft Beautiful Web Experiences' },
    {
      name: 'level',
      label: 'HTML Level',
      type: 'select',
      group: 'layout',
      options: [
        { label: 'H1 (Hero Heading)', value: 'h1' },
        { label: 'H2 (Section Heading)', value: 'h2' },
        { label: 'H3 (Subheading)', value: 'h3' },
        { label: 'H4 (Card Heading)', value: 'h4' },
      ],
      defaultValue: 'h1',
    },
    {
      name: 'align',
      label: 'Text Alignment',
      type: 'alignment',
      group: 'style',
      defaultValue: 'left',
    },
    { name: 'gradient', label: 'Brand Gradient Glow', type: 'switch', group: 'style', defaultValue: false },
  ],
  component: ({ text, level = 'h1', align = 'left', gradient, style }) => {
    const Tag = (level || 'h1') as React.ElementType;
    const sizeClasses = {
      h1: 'text-3xl sm:text-5xl font-black tracking-tight',
      h2: 'text-2xl sm:text-4xl font-extrabold tracking-tight',
      h3: 'text-xl sm:text-2xl font-bold',
      h4: 'text-lg sm:text-xl font-bold',
      h5: 'text-base font-semibold',
      h6: 'text-sm font-semibold',
    }[level];

    return (
      <Tag
        style={{
          textAlign: align,
          ...style,
        }}
        className={`${sizeClasses} ${
          gradient
            ? 'bg-gradient-to-r from-[#635BFF] via-[#8B5CF6] to-[#22D3EE] bg-clip-text text-transparent'
            : 'text-slate-900 dark:text-white'
        } transition-all`}
      >
        {text}
      </Tag>
    );
  },
};

// ==========================================
// 2. TEXT (PARAGRAPH)
// ==========================================
export const TextDefinition: ComponentDefinition<{
  content: string;
  size: 'sm' | 'base' | 'lg' | 'xl';
  align: 'left' | 'center' | 'right' | 'justify';
  color: 'default' | 'muted' | 'subtle';
}> = {
  id: 'text',
  name: 'Paragraph Text',
  category: 'typography',
  description: 'Regular body paragraph text with responsive typography and colors.',
  icon: 'Type',
  allowedChildren: false,
  defaultProps: {
    content: 'Empower your development team with unified design tokens, AI planning, and production-grade architectures.',
    size: 'base',
    align: 'left',
    color: 'muted',
  },
  propsSchema: z.object({
    content: z.string().default('Empower your development team...'),
    size: z.enum(['sm', 'base', 'lg', 'xl']).default('base'),
    align: z.enum(['left', 'center', 'right', 'justify']).default('left'),
    color: z.enum(['default', 'muted', 'subtle']).default('muted'),
  }),
  inspectorControls: [
    { name: 'content', label: 'Body Text', type: 'textarea', group: 'content', defaultValue: 'Empower your development team...' },
    {
      name: 'size',
      label: 'Font Size',
      type: 'select',
      group: 'style',
      options: [
        { label: 'Small (12px)', value: 'sm' },
        { label: 'Base (14px)', value: 'base' },
        { label: 'Large (16px)', value: 'lg' },
        { label: 'Extra Large (18px)', value: 'xl' },
      ],
      defaultValue: 'base',
    },
    { name: 'align', label: 'Alignment', type: 'alignment', group: 'style', defaultValue: 'left' },
  ],
  component: ({ content, size = 'base', align = 'left', color = 'muted', style }) => {
    const sizeClass = {
      sm: 'text-xs leading-relaxed',
      base: 'text-sm leading-relaxed',
      lg: 'text-base leading-relaxed',
      xl: 'text-lg leading-relaxed',
    }[size];

    const colorClass = {
      default: 'text-slate-900 dark:text-slate-100',
      muted: 'text-slate-600 dark:text-slate-400',
      subtle: 'text-slate-400 dark:text-slate-500',
    }[color];

    return (
      <p
        style={{
          textAlign: align,
          ...style,
        }}
        className={`${sizeClass} ${colorClass} transition-all`}
      >
        {content}
      </p>
    );
  },
};

// ==========================================
// 3. BUTTON
// ==========================================
export const ButtonDefinition: ComponentDefinition<{
  label: string;
  variant: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'subtle';
  size: 'sm' | 'md' | 'lg';
  fullWidth: boolean;
}> = {
  id: 'button',
  name: 'Button',
  category: 'basic',
  description: 'Interactive button component with diverse variants and sizes.',
  icon: 'SquareMousePointer',
  allowedChildren: false,
  defaultProps: {
    label: 'Click Action',
    variant: 'default',
    size: 'md',
    fullWidth: false,
  },
  propsSchema: z.object({
    label: z.string().default('Click Action'),
    variant: z.enum(['default', 'secondary', 'outline', 'ghost', 'destructive', 'subtle']).default('default'),
    size: z.enum(['sm', 'md', 'lg']).default('md'),
    fullWidth: z.boolean().default(false),
  }),
  inspectorControls: [
    { name: 'label', label: 'Button Label', type: 'text', group: 'content', defaultValue: 'Click Action' },
    {
      name: 'variant',
      label: 'Variant',
      type: 'select',
      group: 'style',
      options: [
        { label: 'Primary (Default)', value: 'default' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Outline', value: 'outline' },
        { label: 'Subtle', value: 'subtle' },
        { label: 'Destructive', value: 'destructive' },
        { label: 'Ghost', value: 'ghost' },
      ],
      defaultValue: 'default',
    },
    {
      name: 'size',
      label: 'Size',
      type: 'select',
      group: 'style',
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ],
      defaultValue: 'md',
    },
    { name: 'fullWidth', label: 'Full Width', type: 'switch', group: 'layout', defaultValue: false },
  ],
  component: ({ label, variant = 'default', size = 'md', fullWidth = false, style }) => {
    return (
      <Button
        variant={variant as any}
        size={size as any}
        className={fullWidth ? 'w-full' : ''}
        style={style}
      >
        {label}
      </Button>
    );
  },
};

// ==========================================
// 4. BADGE
// ==========================================
export const BadgeDefinition: ComponentDefinition<{
  text: string;
  variant: 'default' | 'secondary' | 'indigo' | 'cyan' | 'violet';
  size: 'sm' | 'md';
}> = {
  id: 'badge',
  name: 'Badge',
  category: 'basic',
  description: 'Compact status tag and pill indicator.',
  icon: 'Tag',
  allowedChildren: false,
  defaultProps: {
    text: 'New Feature',
    variant: 'indigo',
    size: 'md',
  },
  propsSchema: z.object({
    text: z.string().default('New Feature'),
    variant: z.enum(['default', 'secondary', 'indigo', 'cyan', 'violet']).default('indigo'),
    size: z.enum(['sm', 'md']).default('md'),
  }),
  inspectorControls: [
    { name: 'text', label: 'Badge Text', type: 'text', group: 'content', defaultValue: 'New Feature' },
    {
      name: 'variant',
      label: 'Color Variant',
      type: 'select',
      group: 'style',
      options: [
        { label: 'Brand Indigo', value: 'indigo' },
        { label: 'Electric Cyan', value: 'cyan' },
        { label: 'Deep Violet', value: 'violet' },
        { label: 'Secondary / Neutral', value: 'secondary' },
      ],
      defaultValue: 'indigo',
    },
  ],
  component: ({ text, variant = 'indigo', size = 'md', style }) => {
    return (
      <Badge variant={variant as any} size={size as any} style={style}>
        {text}
      </Badge>
    );
  },
};

// ==========================================
// 5. SEPARATOR
// ==========================================
export const SeparatorDefinition: ComponentDefinition<{
  orientation: 'horizontal' | 'vertical';
}> = {
  id: 'separator',
  name: 'Separator',
  category: 'basic',
  description: 'Visual dividing line separating sections and components.',
  icon: 'Minus',
  allowedChildren: false,
  defaultProps: {
    orientation: 'horizontal',
  },
  propsSchema: z.object({
    orientation: z.enum(['horizontal', 'vertical']).default('horizontal'),
  }),
  inspectorControls: [
    {
      name: 'orientation',
      label: 'Orientation',
      type: 'select',
      group: 'layout',
      options: [
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Vertical', value: 'vertical' },
      ],
      defaultValue: 'horizontal',
    },
  ],
  component: ({ orientation = 'horizontal', style }) => {
    return <Separator orientation={orientation} style={style} className="my-4" />;
  },
};
