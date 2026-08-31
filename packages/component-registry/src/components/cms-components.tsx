import React from 'react';
import { z } from 'zod';
import { ComponentDefinition } from '../types';
import { Card, Badge, Button } from '@nirmaanify/ui';
import { Calendar, User, ArrowRight, ShoppingBag, Star, Layers, Sparkles } from 'lucide-react';

// ==========================================
// 1. COLLECTION LIST (DYNAMIC REPEATER)
// ==========================================

export const CollectionListDefinition: ComponentDefinition<{
  collectionSlug: string;
  columns: number;
  limit: number;
  cardVariant: 'card' | 'minimal' | 'horizontal';
  showBadge: boolean;
  showDate: boolean;
  showAuthor: boolean;
  showExcerpt: boolean;
}> = {
  id: 'collection-list',
  name: 'CMS Collection Repeater',
  category: 'ecommerce', // or cms category
  description: 'Dynamic repeating grid/list that fetches and renders CMS collection records.',
  icon: 'Layers',
  allowedChildren: false,
  defaultProps: {
    collectionSlug: 'posts',
    columns: 3,
    limit: 3,
    cardVariant: 'card',
    showBadge: true,
    showDate: true,
    showAuthor: true,
    showExcerpt: true,
  },
  propsSchema: z.object({
    collectionSlug: z.string().default('posts'),
    columns: z.number().default(3),
    limit: z.number().default(3),
    cardVariant: z.enum(['card', 'minimal', 'horizontal']).default('card'),
    showBadge: z.boolean().default(true),
    showDate: z.boolean().default(true),
    showAuthor: z.boolean().default(true),
    showExcerpt: z.boolean().default(true),
  }),
  inspectorControls: [
    {
      name: 'collectionSlug',
      label: 'Target CMS Collection',
      type: 'select',
      group: 'content',
      options: [
        { label: 'Blog Posts (posts)', value: 'posts' },
        { label: 'Products Catalog (products)', value: 'products' },
        { label: 'Categories (categories)', value: 'categories' },
        { label: 'Authors / Team (authors)', value: 'authors' },
      ],
      defaultValue: 'posts',
    },
    {
      name: 'columns',
      label: 'Grid Columns',
      type: 'select',
      group: 'layout',
      options: [
        { label: '1 Column (List)', value: '1' },
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
      defaultValue: 3,
    },
    { name: 'limit', label: 'Maximum Records to Display', type: 'slider', min: 1, max: 12, group: 'content', defaultValue: 3 },
    {
      name: 'cardVariant',
      label: 'Card Presentation Style',
      type: 'select',
      group: 'style',
      options: [
        { label: 'Standard Card Box', value: 'card' },
        { label: 'Minimalist Clean', value: 'minimal' },
        { label: 'Horizontal Split', value: 'horizontal' },
      ],
      defaultValue: 'card',
    },
    { name: 'showBadge', label: 'Show Category Badge', type: 'switch', group: 'content', defaultValue: true },
    { name: 'showDate', label: 'Show Publish Date', type: 'switch', group: 'content', defaultValue: true },
    { name: 'showAuthor', label: 'Show Author Details', type: 'switch', group: 'content', defaultValue: true },
    { name: 'showExcerpt', label: 'Show Excerpt Summary', type: 'switch', group: 'content', defaultValue: true },
  ],
  component: ({
    collectionSlug = 'posts',
    columns = 3,
    limit = 3,
    cardVariant = 'card',
    showBadge = true,
    showDate = true,
    showAuthor = true,
    showExcerpt = true,
    style,
  }) => {
    // Sample preview items rendered in visual editor
    const mockPosts = [
      {
        id: '1',
        title: 'Building Autonomous Cloud Architectures with AI',
        excerpt: 'How declarative JSON schemas and unified design systems enable 10x faster product velocity.',
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        category: 'Architecture',
        author: 'Alex Vance',
        date: 'Aug 28, 2026',
      },
      {
        id: '2',
        title: 'Mastering Design Token Pipelines Across React & Tailwind',
        excerpt: 'Explore how unified design tokens synchronize typography, spacing, and brand colors.',
        coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
        category: 'Design Systems',
        author: 'Marcus Vance',
        date: 'Aug 24, 2026',
      },
      {
        id: '3',
        title: 'Zero-Latency State Synchronization in Next.js 15',
        excerpt: 'Deep-dive into optimistic mutations and server component cache invalidation.',
        coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
        category: 'Engineering',
        author: 'Sarah Chen',
        date: 'Aug 20, 2026',
      },
    ];

    const mockProducts = [
      {
        id: 'p1',
        title: 'Merino Wool Oversized Blazer',
        price: '$189.00',
        originalPrice: '$240.00',
        imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80',
        category: 'Outerwear',
        badge: 'Bestseller',
      },
      {
        id: 'p2',
        title: 'Structured Mulberry Silk Shirt',
        price: '$145.00',
        originalPrice: '',
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
        category: 'Tops',
        badge: 'New',
      },
      {
        id: 'p3',
        title: 'Handcrafted Minimalist Tote',
        price: '$260.00',
        originalPrice: '$310.00',
        imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80',
        category: 'Accessories',
        badge: 'Limited',
      },
    ];

    const isProducts = collectionSlug === 'products';
    const items = (isProducts ? mockProducts : mockPosts).slice(0, Number(limit) || 3);

    const colsClass = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    }[Number(columns) || 3] || 'grid-cols-1 md:grid-cols-3';

    return (
      <div style={style} className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#635BFF]">
              Live CMS Dynamic Feed
            </span>
            <Badge size="sm" variant="indigo">{collectionSlug}</Badge>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {items.length} records bound
          </span>
        </div>

        <div className={`grid ${colsClass} gap-6`}>
          {isProducts
            ? items.map((prod: any) => (
                <Card key={prod.id} hoverable className="overflow-hidden group">
                  <div className="relative aspect-[4/5] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={prod.imageUrl}
                      alt={prod.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {showBadge && prod.badge && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="indigo" size="sm">{prod.badge}</Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">{prod.category}</span>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{prod.title}</h4>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-black text-sm text-slate-900 dark:text-white">{prod.price}</span>
                      <Button size="sm" variant="subtle" leftIcon={<ShoppingBag className="h-3.5 w-3.5" />}>
                        Add
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            : items.map((post: any) => (
                <Card key={post.id} hoverable className="overflow-hidden flex flex-col justify-between group">
                  <div>
                    <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {showBadge && (
                        <div className="absolute top-3 left-3">
                          <Badge variant="indigo" size="sm">{post.category}</Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-5 space-y-2">
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        {showDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{post.date}</span>
                          </div>
                        )}
                        {showAuthor && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{post.author}</span>
                          </div>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#635BFF] transition-colors leading-snug">
                        {post.title}
                      </h4>
                      {showExcerpt && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="px-5 pb-5 pt-0">
                    <button className="inline-flex items-center gap-1 text-xs font-bold text-[#635BFF] dark:text-[#A5AEFD] group-hover:translate-x-1 transition-transform">
                      <span>Read Article</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </Card>
              ))}
        </div>
      </div>
    );
  },
};

// ==========================================
// 2. COLLECTION DETAIL (SINGLE ITEM HERO)
// ==========================================

export const CollectionDetailDefinition: ComponentDefinition<{
  collectionSlug: string;
  showCoverImage: boolean;
  showMeta: boolean;
}> = {
  id: 'collection-detail',
  name: 'CMS Single Record Detail',
  category: 'ecommerce',
  description: 'Detailed single item layout binding to dynamic route params (e.g. /blog/[slug]).',
  icon: 'FileText',
  allowedChildren: false,
  defaultProps: {
    collectionSlug: 'posts',
    showCoverImage: true,
    showMeta: true,
  },
  propsSchema: z.object({
    collectionSlug: z.string().default('posts'),
    showCoverImage: z.boolean().default(true),
    showMeta: z.boolean().default(true),
  }),
  inspectorControls: [
    {
      name: 'collectionSlug',
      label: 'Target Collection',
      type: 'select',
      group: 'content',
      options: [
        { label: 'Blog Posts (posts)', value: 'posts' },
        { label: 'Products Catalog (products)', value: 'products' },
      ],
      defaultValue: 'posts',
    },
    { name: 'showCoverImage', label: 'Display Cover Banner', type: 'switch', group: 'content', defaultValue: true },
    { name: 'showMeta', label: 'Display Author & Date Metadata', type: 'switch', group: 'content', defaultValue: true },
  ],
  component: ({
    collectionSlug = 'posts',
    showCoverImage = true,
    showMeta = true,
    style,
  }) => {
    return (
      <div style={style} className="max-w-4xl mx-auto py-10 px-4 space-y-6">
        <div className="space-y-3">
          <Badge variant="indigo" size="md">Architecture & AI</Badge>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Building Autonomous Cloud Architectures with AI
          </h1>
          {showMeta && (
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-b border-slate-200 dark:border-slate-800 pb-4">
              <span className="font-semibold text-slate-900 dark:text-slate-200">By Alex Vance</span>
              <span>•</span>
              <span>Published on Aug 28, 2026</span>
              <span>•</span>
              <span>5 min read</span>
            </div>
          )}
        </div>

        {showCoverImage && (
          <div className="aspect-[21/9] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80"
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 space-y-4 leading-relaxed">
          <p>
            Modern engineering teams are transitioning from static component libraries to fullstack declarative generators. By decoupling visual schema definitions from platform targets, Nirmaanify enables instant deployment to Next.js 15, NestJS, and AWS.
          </p>
          <p>
            With integrated CMS collections, content editors can manage publications in real-time without redeploying code, while visual studio builders bind directly to dynamic data sources.
          </p>
        </div>
      </div>
    );
  },
};
