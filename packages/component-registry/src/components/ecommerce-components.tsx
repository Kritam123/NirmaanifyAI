import React from 'react';
import { z } from 'zod';
import { ComponentDefinition } from '../types';
import { Card, Button, Badge } from '@nirmaanify/ui';
import { ShoppingBag, Star } from 'lucide-react';

// ==========================================
// 1. PRODUCT CARD
// ==========================================
export const ProductCardDefinition: ComponentDefinition<{
  title: string;
  price: string;
  originalPrice: string;
  category: string;
  imageUrl: string;
  rating: number;
  badgeText: string;
}> = {
  id: 'product-card',
  name: 'Product Card',
  category: 'ecommerce',
  description: 'E-commerce product item with thumbnail, pricing, rating, and add to bag trigger.',
  icon: 'ShoppingBag',
  allowedChildren: false,
  defaultProps: {
    title: 'Merino Wool Oversized Blazer',
    price: '$189.00',
    originalPrice: '$240.00',
    category: 'Outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    badgeText: 'Bestseller',
  },
  propsSchema: z.object({
    title: z.string().default('Merino Wool Oversized Blazer'),
    price: z.string().default('$189.00'),
    originalPrice: z.string().default('$240.00'),
    category: z.string().default('Outerwear'),
    imageUrl: z.string().default('https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80'),
    rating: z.number().default(4.9),
    badgeText: z.string().default('Bestseller'),
  }),
  inspectorControls: [
    { name: 'title', label: 'Product Name', type: 'text', group: 'content', defaultValue: 'Merino Wool Oversized Blazer' },
    { name: 'price', label: 'Sale Price', type: 'text', group: 'content', defaultValue: '$189.00' },
    { name: 'originalPrice', label: 'Original Price', type: 'text', group: 'content', defaultValue: '$240.00' },
    { name: 'category', label: 'Category Tag', type: 'text', group: 'content', defaultValue: 'Outerwear' },
    { name: 'badgeText', label: 'Badge (e.g. Sale, New)', type: 'text', group: 'content', defaultValue: 'Bestseller' },
    { name: 'imageUrl', label: 'Image URL', type: 'image-url', group: 'content', defaultValue: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80' },
  ],
  component: ({ title, price, originalPrice, category, imageUrl, rating = 4.9, badgeText, style }) => {
    return (
      <Card hoverable style={style} className="overflow-hidden flex flex-col justify-between group">
        <div className="relative aspect-[4/5] bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {badgeText && (
            <div className="absolute top-3 left-3">
              <Badge variant="indigo" size="sm">{badgeText}</Badge>
            </div>
          )}
        </div>
        <div className="p-4 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{category}</span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-200">{rating}</span>
            </div>
          </div>
          <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{title}</h4>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-sm text-slate-900 dark:text-white">{price}</span>
              {originalPrice && (
                <span className="text-xs text-slate-400 line-through">{originalPrice}</span>
              )}
            </div>
            <Button size="sm" variant="subtle" leftIcon={<ShoppingBag className="h-3.5 w-3.5" />}>
              Add
            </Button>
          </div>
        </div>
      </Card>
    );
  },
};
