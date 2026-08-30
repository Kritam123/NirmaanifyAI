import React from 'react';
import { z } from 'zod';
import { ComponentDefinition } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@nirmaanify/ui';
import * as LucideIcons from 'lucide-react';

// ==========================================
// 1. IMAGE
// ==========================================
export const ImageDefinition: ComponentDefinition<{
  src: string;
  alt: string;
  borderRadius: string;
  aspectRatio: string;
  objectFit: 'cover' | 'contain' | 'fill';
}> = {
  id: 'image',
  name: 'Image',
  category: 'media',
  description: 'Responsive media image with custom aspect ratio and rounding.',
  icon: 'Image',
  allowedChildren: false,
  defaultProps: {
    src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    alt: 'Abstract Architecture',
    borderRadius: '16px',
    aspectRatio: '16/9',
    objectFit: 'cover',
  },
  propsSchema: z.object({
    src: z.string().default('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'),
    alt: z.string().default('Image preview'),
    borderRadius: z.string().default('16px'),
    aspectRatio: z.string().default('16/9'),
    objectFit: z.enum(['cover', 'contain', 'fill']).default('cover'),
  }),
  inspectorControls: [
    { name: 'src', label: 'Image URL', type: 'image-url', group: 'content', defaultValue: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80' },
    { name: 'alt', label: 'Alt Text', type: 'text', group: 'content', defaultValue: 'Image preview' },
    {
      name: 'aspectRatio',
      label: 'Aspect Ratio',
      type: 'select',
      group: 'layout',
      options: [
        { label: '16:9 (Widescreen)', value: '16/9' },
        { label: '4:3 (Standard)', value: '4/3' },
        { label: '1:1 (Square)', value: '1/1' },
        { label: '21:9 (Ultrawide)', value: '21/9' },
      ],
      defaultValue: '16/9',
    },
    { name: 'borderRadius', label: 'Border Radius', type: 'text', group: 'style', defaultValue: '16px' },
  ],
  component: ({ src, alt, borderRadius, aspectRatio, objectFit, style }) => {
    return (
      <div
        style={{
          borderRadius,
          aspectRatio,
          overflow: 'hidden',
          width: '100%',
          ...style,
        }}
        className="relative bg-slate-100 dark:bg-slate-800"
      >
        <img
          src={src}
          alt={alt}
          style={{ objectFit }}
          className="w-full h-full block"
        />
      </div>
    );
  },
};

// ==========================================
// 2. CARD
// ==========================================
export const CardDefinition: ComponentDefinition<{
  title: string;
  description: string;
  hoverable: boolean;
}> = {
  id: 'card',
  name: 'Card Container',
  category: 'media',
  description: 'Structured card box with header, title, description, and slot for children.',
  icon: 'CreditCard',
  allowedChildren: true,
  defaultProps: {
    title: 'Card Title',
    description: 'Provide meaningful context and metadata for this component group.',
    hoverable: true,
  },
  propsSchema: z.object({
    title: z.string().default('Card Title'),
    description: z.string().default('Provide meaningful context...'),
    hoverable: z.boolean().default(true),
  }),
  inspectorControls: [
    { name: 'title', label: 'Card Title', type: 'text', group: 'content', defaultValue: 'Card Title' },
    { name: 'description', label: 'Card Description', type: 'textarea', group: 'content', defaultValue: 'Provide meaningful context...' },
    { name: 'hoverable', label: 'Hover Elevation', type: 'switch', group: 'style', defaultValue: true },
  ],
  component: ({ title, description, hoverable = true, children, style }) => {
    return (
      <Card hoverable={hoverable} style={style} className="w-full">
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle className="text-base">{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent className="space-y-3">{children}</CardContent>
      </Card>
    );
  },
};
