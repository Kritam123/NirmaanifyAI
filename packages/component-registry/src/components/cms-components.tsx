import React from 'react';
import { z } from 'zod';
import { ComponentDefinition } from '../types';
import { Button, Badge, Card } from '@nirmaanify/ui';
import {
  Database,
  ArrowRight,
  Calendar,
  User,
  ShoppingBag,
  ExternalLink,
  Tag,
  Check,
  Star,
  Sparkles,
} from 'lucide-react';
import { useViewport } from '../renderer/viewport-context';

// Sample fallback items for the studio canvas live preview
const FALLBACK_POSTS = [
  {
    id: '1',
    title: 'Mastering Modern Web Development in 2026',
    slug: 'mastering-modern-web-development-2026',
    excerpt: 'Explore how AI-augmented workflows, server actions, and component registries redefine frontend architectures.',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    tags: 'Technology',
    author: 'Alexandra Chen',
    publishedAt: 'Sep 04, 2026',
  },
  {
    id: '2',
    title: 'Building Design Systems That Truly Scale',
    slug: 'design-systems-that-scale',
    excerpt: 'How multi-brand design tokens and atomic primitives create cohesion across enterprise platforms.',
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    tags: 'Design',
    author: 'Marcus Vance',
    publishedAt: 'Sep 02, 2026',
  },
  {
    id: '3',
    title: 'The Future of Headless Content Platforms',
    slug: 'the-future-of-headless-cms',
    excerpt: 'Connecting dynamic database models with visual drag-and-drop canvases in real-time.',
    coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
    tags: 'Productivity',
    author: 'Alexandra Chen',
    publishedAt: 'Aug 28, 2026',
  },
];

const FALLBACK_PRODUCTS = [
  {
    id: 'p1',
    name: 'Pro Wireless ANC Headphones',
    slug: 'pro-wireless-anc-headphones',
    description: 'Studio-grade acoustic audio with active noise cancellation and 40-hour ultra battery life.',
    price: '$299',
    compareAtPrice: '$349',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    category: 'Audio',
    isAvailable: true,
  },
  {
    id: 'p2',
    name: 'Ergonomic Mechanical Keyboard',
    slug: 'ergonomic-mechanical-keyboard',
    description: 'Custom hot-swappable switches with gasket mount engineering and aluminum CNC chassis.',
    price: '$189',
    compareAtPrice: '$219',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    category: 'Hardware',
    isAvailable: true,
  },
  {
    id: 'p3',
    name: 'Smart Desk LED Monitor Light Bar',
    slug: 'smart-desk-led-monitor-light',
    description: 'Asymmetric optical design with auto-dimming ambient sensor and touch controls.',
    price: '$79',
    compareAtPrice: '$99',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
    category: 'Workspace',
    isAvailable: true,
  },
];

// ==========================================
// 1. CMS COLLECTION LIST / GRID
// ==========================================
export const CmsCollectionListDefinition: ComponentDefinition<{
  collectionSlug: string;
  collectionName: string;
  layout: 'grid' | 'list';
  columns: number;
  itemsLimit: number;
  showImages: boolean;
  showBadges: boolean;
  showDates: boolean;
  showAuthors: boolean;
  buttonText: string;
}> = {
  id: 'cms-collection-list',
  name: 'CMS Collection Grid',
  category: 'cms',
  description: 'Dynamically bound CMS collection query (Posts, Products, Categories, Authors, etc.)',
  icon: 'Database',
  allowedChildren: false,
  defaultProps: {
    collectionSlug: 'posts',
    collectionName: 'Latest Articles',
    layout: 'grid',
    columns: 3,
    itemsLimit: 6,
    showImages: true,
    showBadges: true,
    showDates: true,
    showAuthors: true,
    buttonText: 'Read Article',
  },
  propsSchema: z.object({
    collectionSlug: z.string().default('posts'),
    collectionName: z.string().default('Latest Articles'),
    layout: z.enum(['grid', 'list']).default('grid'),
    columns: z.number().default(3),
    itemsLimit: z.number().default(6),
    showImages: z.boolean().default(true),
    showBadges: z.boolean().default(true),
    showDates: z.boolean().default(true),
    showAuthors: z.boolean().default(true),
    buttonText: z.string().default('Read Article'),
  }),
  inspectorControls: [
    { name: 'collectionName', label: 'Section Heading', type: 'text', group: 'content', defaultValue: 'Latest Articles' },
    {
      name: 'collectionSlug',
      label: 'Target CMS Collection',
      type: 'select',
      group: 'content',
      options: [
        { label: 'Blog Posts (posts)', value: 'posts' },
        { label: 'Products (products)', value: 'products' },
        { label: 'Categories (categories)', value: 'categories' },
        { label: 'Authors (authors)', value: 'authors' },
      ],
      defaultValue: 'posts',
    },
    {
      name: 'layout',
      label: 'Layout View',
      type: 'select',
      group: 'layout',
      options: [
        { label: 'Card Grid', value: 'grid' },
        { label: 'Horizontal List', value: 'list' },
      ],
      defaultValue: 'grid',
    },
    { name: 'columns', label: 'Grid Columns (Desktop)', type: 'number', group: 'layout', defaultValue: 3 },
    { name: 'itemsLimit', label: 'Max Items Count', type: 'number', group: 'content', defaultValue: 6 },
    { name: 'buttonText', label: 'Card Action CTA Text', type: 'text', group: 'content', defaultValue: 'Read Article' },
    { name: 'showImages', label: 'Display Featured Images', type: 'switch', group: 'style', defaultValue: true },
    { name: 'showBadges', label: 'Display Category Badges', type: 'switch', group: 'style', defaultValue: true },
    { name: 'showDates', label: 'Display Publication Dates', type: 'switch', group: 'style', defaultValue: true },
    { name: 'showAuthors', label: 'Display Authors Attribution', type: 'switch', group: 'style', defaultValue: true },
  ],
  component: ({
    collectionSlug = 'posts',
    collectionName = 'Latest Articles',
    layout = 'grid',
    columns = 3,
    itemsLimit = 6,
    showImages = true,
    showBadges = true,
    showDates = true,
    showAuthors = true,
    buttonText = 'Read Article',
    style,
  }) => {
    const { isMobile, isTablet } = useViewport();
    const effectiveCols = isMobile ? 1 : isTablet ? 2 : Math.min(4, Math.max(1, columns));

    const isProductCollection = collectionSlug === 'products';
    const items = isProductCollection
      ? FALLBACK_PRODUCTS.slice(0, itemsLimit)
      : FALLBACK_POSTS.slice(0, itemsLimit);

    return (
      <div style={style} className="w-full py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#635BFF] dark:text-[#A5AEFD] uppercase tracking-wider">
              <Database className="h-3.5 w-3.5" />
              <span>CMS Dynamic Feed: {collectionSlug}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              {collectionName}
            </h2>
          </div>
          <Badge variant="secondary" size="sm" className="self-start sm:self-auto font-mono text-[11px]">
            {items.length} live entries
          </Badge>
        </div>

        {/* Content Cards Grid */}
        <div
          className={
            layout === 'list'
              ? 'flex flex-col gap-4'
              : `grid gap-6 ${
                  effectiveCols === 1
                    ? 'grid-cols-1'
                    : effectiveCols === 2
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : effectiveCols === 4
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                }`
          }
        >
          {items.map((item: any) => {
            if (isProductCollection) {
              return (
                <Card
                  key={item.id}
                  className="group overflow-hidden flex flex-col justify-between border border-slate-200 dark:border-[#24293D] hover:border-[#635BFF]/50 transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-[#635BFF]/5"
                >
                  {showImages && (
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {showBadges && (
                        <div className="absolute top-3 left-3">
                          <Badge variant="indigo" size="sm">
                            {item.category}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-[#635BFF] transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                          {item.price}
                        </span>
                        {item.compareAtPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            {item.compareAtPrice}
                          </span>
                        )}
                      </div>
                      <Button size="xs" variant="default" className="gap-1 shadow-sm">
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span>Buy</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            }

            // Standard Blog / Editorial Item Card
            return (
              <Card
                key={item.id}
                className="group overflow-hidden flex flex-col justify-between border border-slate-200 dark:border-[#24293D] hover:border-[#635BFF]/50 transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-[#635BFF]/5"
              >
                {showImages && (
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {showBadges && item.tags && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="indigo" size="sm">
                          {item.tags}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {showDates && item.publishedAt && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                        <Calendar className="h-3 w-3" />
                        <span>{item.publishedAt}</span>
                      </div>
                    )}
                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-[#635BFF] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
                    {showAuthors && item.author ? (
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-[#635BFF]/10 text-[#635BFF] dark:text-[#A5AEFD] flex items-center justify-center font-bold text-[10px]">
                          {item.author.charAt(0)}
                        </div>
                        <span className="text-slate-600 dark:text-slate-300 font-medium text-xs">
                          {item.author}
                        </span>
                      </div>
                    ) : (
                      <div />
                    )}
                    <div className="flex items-center gap-1 text-[#635BFF] dark:text-[#A5AEFD] font-semibold text-xs group-hover:translate-x-1 transition-transform">
                      <span>{buttonText}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  },
};

// ==========================================
// 2. CMS ITEM DETAIL / ARTICLE HERO & BODY
// ==========================================
export const CmsItemDetailDefinition: ComponentDefinition<{
  collectionSlug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
  publishedDate: string;
  category: string;
}> = {
  id: 'cms-item-detail',
  name: 'CMS Item Article Detail',
  category: 'cms',
  description: 'Detailed article or product page view bound to CMS entry attributes',
  icon: 'FileText',
  allowedChildren: false,
  defaultProps: {
    collectionSlug: 'posts',
    title: 'Mastering Modern Web Development in 2026',
    excerpt: 'Explore how AI-augmented workflows, server actions, and component registries redefine frontend architectures.',
    content: `## The Evolution of Full-Stack Architecture\n\nModern web engineering has shifted dramatically towards unified schema-driven development. With high-performance compilation and instantaneous visual feedback, developer velocity is higher than ever.\n\n### Key Architectural Pillars\n- **Strict Type Safety**: End-to-end typing from Prisma to UI components.\n- **Dynamic Headless CMS**: Empowering content authors without engineer bottlenecks.\n- **Responsive Drag-and-Drop**: Visual creation mapped cleanly to Next.js 15 TSX.`,
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    authorName: 'Alexandra Chen',
    authorRole: 'Lead Architect',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    publishedDate: 'September 4, 2026',
    category: 'Technology',
  },
  propsSchema: z.object({
    collectionSlug: z.string().default('posts'),
    title: z.string().default('Mastering Modern Web Development in 2026'),
    excerpt: z.string().default('Explore how AI-augmented workflows...'),
    content: z.string().default('## The Evolution of Full-Stack Architecture...'),
    coverImage: z.string().default('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80'),
    authorName: z.string().default('Alexandra Chen'),
    authorRole: z.string().default('Lead Architect'),
    authorAvatar: z.string().default('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'),
    publishedDate: z.string().default('September 4, 2026'),
    category: z.string().default('Technology'),
  }),
  inspectorControls: [
    { name: 'title', label: 'Article Headline', type: 'text', group: 'content', defaultValue: 'Mastering Modern Web Development in 2026' },
    { name: 'excerpt', label: 'Summary Excerpt', type: 'textarea', group: 'content', defaultValue: 'Explore how AI-augmented workflows...' },
    { name: 'content', label: 'Markdown Body', type: 'textarea', group: 'content', defaultValue: '## The Evolution of Full-Stack Architecture...' },
    { name: 'coverImage', label: 'Cover Image URL', type: 'text', group: 'content', defaultValue: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80' },
    { name: 'category', label: 'Category Pill', type: 'text', group: 'content', defaultValue: 'Technology' },
    { name: 'authorName', label: 'Author Name', type: 'text', group: 'content', defaultValue: 'Alexandra Chen' },
    { name: 'authorRole', label: 'Author Role', type: 'text', group: 'content', defaultValue: 'Lead Architect' },
    { name: 'authorAvatar', label: 'Author Avatar URL', type: 'text', group: 'content', defaultValue: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
    { name: 'publishedDate', label: 'Publication Date', type: 'text', group: 'content', defaultValue: 'September 4, 2026' },
  ],
  component: ({
    title,
    excerpt,
    content,
    coverImage,
    authorName,
    authorRole,
    authorAvatar,
    publishedDate,
    category,
    style,
  }) => {
    return (
      <article style={style} className="w-full max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
        {/* Header Metadata */}
        <div className="space-y-4 text-center">
          <Badge variant="indigo" size="md" className="mx-auto">
            {category}
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {excerpt}
          </p>

          <div className="pt-4 flex items-center justify-center gap-3">
            <img
              src={authorAvatar}
              alt={authorName}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-[#635BFF]/30"
            />
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{authorName}</p>
              <p className="text-xs text-slate-400">{authorRole} • {publishedDate}</p>
            </div>
          </div>
        </div>

        {/* Hero Cover Image */}
        {coverImage && (
          <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
            <img src={coverImage} alt={title} className="h-full w-full object-cover" />
          </div>
        )}

        {/* Body Content */}
        <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-4 text-base leading-relaxed">
          {content.split('\n\n').map((paragraph, idx) => {
            if (paragraph.startsWith('## ')) {
              return (
                <h2 key={idx} className="text-2xl font-bold text-slate-900 dark:text-white pt-4">
                  {paragraph.replace('## ', '')}
                </h2>
              );
            }
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={idx} className="text-xl font-bold text-slate-800 dark:text-slate-100 pt-2">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('- ')) {
              const listItems = paragraph.split('\n');
              return (
                <ul key={idx} className="list-disc pl-5 space-y-1">
                  {listItems.map((li, liIdx) => (
                    <li key={liIdx}>{li.replace(/^- \*\*(.*?)\*\*:?/, '$1:')}</li>
                  ))}
                </ul>
              );
            }
            return <p key={idx}>{paragraph}</p>;
          })}
        </div>
      </article>
    );
  },
};

// ==========================================
// 3. CMS RICH TEXT READER
// ==========================================
export const CmsRichTextDefinition: ComponentDefinition<{
  content: string;
  fieldKey: string;
}> = {
  id: 'cms-rich-text',
  name: 'CMS Rich Text Block',
  category: 'cms',
  description: 'Renders dynamic HTML/Markdown body text from CMS field',
  icon: 'BookOpen',
  allowedChildren: false,
  defaultProps: {
    content: '<p>Dynamic CMS content rendered cleanly with responsive typography.</p>',
    fieldKey: 'content',
  },
  propsSchema: z.object({
    content: z.string().default('<p>Dynamic CMS content...</p>'),
    fieldKey: z.string().default('content'),
  }),
  inspectorControls: [
    { name: 'fieldKey', label: 'CMS Field Key', type: 'text', group: 'content', defaultValue: 'content' },
    { name: 'content', label: 'HTML / Markdown Text', type: 'textarea', group: 'content', defaultValue: '<p>Dynamic CMS content...</p>' },
  ],
  component: ({ content, style }) => {
    return (
      <div
        style={style}
        className="w-full max-w-3xl py-4 text-slate-700 dark:text-slate-300 leading-relaxed space-y-3"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  },
};

// ==========================================
// 4. CMS AUTHOR BADGE / CARD
// ==========================================
export const CmsAuthorBadgeDefinition: ComponentDefinition<{
  name: string;
  role: string;
  avatar: string;
  bio: string;
}> = {
  id: 'cms-author-badge',
  name: 'CMS Author Card',
  category: 'cms',
  description: 'Presents author bio, avatar, and social handle bound to CMS Authors',
  icon: 'UserCheck',
  allowedChildren: false,
  defaultProps: {
    name: 'Alexandra Chen',
    role: 'Principal Systems Architect',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    bio: '12+ years designing distributed systems, cloud compilers, and high-velocity frontend architecture.',
  },
  propsSchema: z.object({
    name: z.string().default('Alexandra Chen'),
    role: z.string().default('Principal Systems Architect'),
    avatar: z.string().default('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80'),
    bio: z.string().default('12+ years designing distributed systems...'),
  }),
  inspectorControls: [
    { name: 'name', label: 'Author Full Name', type: 'text', group: 'content', defaultValue: 'Alexandra Chen' },
    { name: 'role', label: 'Role / Designation', type: 'text', group: 'content', defaultValue: 'Principal Systems Architect' },
    { name: 'avatar', label: 'Avatar Photo URL', type: 'text', group: 'content', defaultValue: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' },
    { name: 'bio', label: 'Short Biography', type: 'textarea', group: 'content', defaultValue: '12+ years designing distributed systems...' },
  ],
  component: ({ name, role, avatar, bio, style }) => {
    return (
      <Card style={style} className="p-6 max-w-xl flex items-start gap-4 border border-slate-200 dark:border-[#24293D] shadow-sm">
        <img
          src={avatar}
          alt={name}
          className="h-14 w-14 rounded-full object-cover ring-2 ring-[#635BFF]/30 shrink-0"
        />
        <div className="space-y-1">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">{name}</h4>
          <p className="text-xs text-[#635BFF] dark:text-[#A5AEFD] font-semibold">{role}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-1 leading-relaxed">{bio}</p>
        </div>
      </Card>
    );
  },
};
