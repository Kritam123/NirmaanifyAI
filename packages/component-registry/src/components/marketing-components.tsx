import React from 'react';
import { z } from 'zod';
import { ComponentDefinition } from '../types';
import { Button, Badge, Card } from '@nirmaanify/ui';
import { Sparkles, Check, Star, ArrowRight } from 'lucide-react';

// ==========================================
// 1. HERO BANNER
// ==========================================
export const HeroDefinition: ComponentDefinition<{
  badgeText: string;
  title: string;
  subtitle: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  align: 'center' | 'left';
}> = {
  id: 'hero',
  name: 'Hero Section',
  category: 'marketing',
  description: 'High-impact landing hero with badges, glowing headline, and call-to-action buttons.',
  icon: 'Sparkles',
  allowedChildren: false,
  defaultProps: {
    badgeText: 'Next Generation AI Platform',
    title: 'Imagine. Build. Launch.',
    subtitle: 'Transform ideas into production-ready fullstack applications with AI-driven architecture and unified design tokens.',
    primaryCtaText: 'Start Building Free',
    secondaryCtaText: 'Explore Templates',
    align: 'center',
  },
  propsSchema: z.object({
    badgeText: z.string().default('Next Generation AI Platform'),
    title: z.string().default('Imagine. Build. Launch.'),
    subtitle: z.string().default('Transform ideas into production-ready fullstack applications...'),
    primaryCtaText: z.string().default('Start Building Free'),
    secondaryCtaText: z.string().default('Explore Templates'),
    align: z.enum(['center', 'left']).default('center'),
  }),
  inspectorControls: [
    { name: 'badgeText', label: 'Badge Pill Text', type: 'text', group: 'content', defaultValue: 'Next Generation AI Platform' },
    { name: 'title', label: 'Main Headline', type: 'text', group: 'content', defaultValue: 'Imagine. Build. Launch.' },
    { name: 'subtitle', label: 'Subtitle Description', type: 'textarea', group: 'content', defaultValue: 'Transform ideas into production-ready fullstack applications...' },
    { name: 'primaryCtaText', label: 'Primary CTA Text', type: 'text', group: 'content', defaultValue: 'Start Building Free' },
    { name: 'secondaryCtaText', label: 'Secondary CTA Text', type: 'text', group: 'content', defaultValue: 'Explore Templates' },
    {
      name: 'align',
      label: 'Alignment',
      type: 'alignment',
      group: 'layout',
      defaultValue: 'center',
    },
  ],
  component: ({
    badgeText,
    title,
    subtitle,
    primaryCtaText,
    secondaryCtaText,
    align = 'center',
    style,
  }) => {
    return (
      <div
        style={style}
        className={`relative py-16 px-6 max-w-5xl mx-auto flex flex-col ${
          align === 'center' ? 'items-center text-center' : 'items-start text-left'
        } space-y-6 transition-all`}
      >
        {badgeText && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#635BFF]/10 border border-[#635BFF]/30 text-xs font-bold text-[#635BFF] dark:text-[#A5AEFD]">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>{badgeText}</span>
          </div>
        )}

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
          {title}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          {subtitle}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {primaryCtaText && (
            <Button size="lg" variant="default" rightIcon={<ArrowRight className="h-4 w-4" />}>
              {primaryCtaText}
            </Button>
          )}
          {secondaryCtaText && (
            <Button size="lg" variant="outline">
              {secondaryCtaText}
            </Button>
          )}
        </div>
      </div>
    );
  },
};

// ==========================================
// 2. FEATURE CARD
// ==========================================
export const FeatureCardDefinition: ComponentDefinition<{
  title: string;
  description: string;
  iconName: string;
  tag: string;
}> = {
  id: 'feature-card',
  name: 'Feature Card',
  category: 'marketing',
  description: 'Highlight card showing a feature with icon, title, and descriptive body.',
  icon: 'Layers',
  allowedChildren: false,
  defaultProps: {
    title: 'Autonomous Code Generation',
    description: 'Clean Next.js 15 & NestJS architectures generated directly from validated JSON schemas.',
    iconName: 'Zap',
    tag: 'Core Feature',
  },
  propsSchema: z.object({
    title: z.string().default('Autonomous Code Generation'),
    description: z.string().default('Clean Next.js 15 & NestJS architectures...'),
    iconName: z.string().default('Zap'),
    tag: z.string().default('Core Feature'),
  }),
  inspectorControls: [
    { name: 'tag', label: 'Tag / Category', type: 'text', group: 'content', defaultValue: 'Core Feature' },
    { name: 'title', label: 'Feature Title', type: 'text', group: 'content', defaultValue: 'Autonomous Code Generation' },
    { name: 'description', label: 'Feature Description', type: 'textarea', group: 'content', defaultValue: 'Clean Next.js 15 & NestJS architectures...' },
  ],
  component: ({ title, description, tag, style }) => {
    return (
      <Card hoverable style={style} className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#635BFF] to-[#22D3EE] p-0.5">
            <div className="h-full w-full bg-white dark:bg-[#0E121E] rounded-xl flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-[#635BFF]" />
            </div>
          </div>
          {tag && <Badge variant="indigo" size="sm">{tag}</Badge>}
        </div>
        <div>
          <h4 className="font-bold text-base text-slate-900 dark:text-white break-words [overflow-wrap:anywhere]">{title}</h4>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed break-words [overflow-wrap:anywhere]">{description}</p>
        </div>
      </Card>
    );
  },
};

// ==========================================
// 3. PRICING CARD
// ==========================================
export const PricingCardDefinition: ComponentDefinition<{
  tierName: string;
  price: string;
  period: string;
  description: string;
  features: string;
  buttonText: string;
  isPopular: boolean;
}> = {
  id: 'pricing-card',
  name: 'Pricing Card',
  category: 'marketing',
  description: 'Tiered subscription pricing box with feature checklist and CTA.',
  icon: 'DollarSign',
  allowedChildren: false,
  defaultProps: {
    tierName: 'Pro Developer',
    price: '$29',
    period: '/month',
    description: 'For growing teams requiring unlimited AI generations & cloud hosting.',
    features: 'Unlimited AI Projects, Fullstack NestJS Code Export, 10GB S3 Storage, Priority Support',
    buttonText: 'Upgrade to Pro',
    isPopular: true,
  },
  propsSchema: z.object({
    tierName: z.string().default('Pro Developer'),
    price: z.string().default('$29'),
    period: z.string().default('/month'),
    description: z.string().default('For growing teams...'),
    features: z.string().default('Unlimited AI Projects, Fullstack Code Export'),
    buttonText: z.string().default('Upgrade to Pro'),
    isPopular: z.boolean().default(true),
  }),
  inspectorControls: [
    { name: 'tierName', label: 'Plan Name', type: 'text', group: 'content', defaultValue: 'Pro Developer' },
    { name: 'price', label: 'Price (e.g. $29)', type: 'text', group: 'content', defaultValue: '$29' },
    { name: 'period', label: 'Billing Period', type: 'text', group: 'content', defaultValue: '/month' },
    { name: 'description', label: 'Plan Description', type: 'text', group: 'content', defaultValue: 'For growing teams...' },
    { name: 'features', label: 'Features List (comma separated)', type: 'textarea', group: 'content', defaultValue: 'Unlimited AI Projects, Fullstack Code Export' },
    { name: 'buttonText', label: 'Button Label', type: 'text', group: 'content', defaultValue: 'Upgrade to Pro' },
    { name: 'isPopular', label: 'Highlight as Popular', type: 'switch', group: 'style', defaultValue: true },
  ],
  component: ({ tierName, price, period, description, features, buttonText, isPopular, style }) => {
    const featureList = (features || '').split(',').map((f) => f.trim()).filter(Boolean);
    return (
      <Card
        hoverable
        style={style}
        className={`p-6 flex flex-col justify-between relative transition-all ${
          isPopular ? 'border-2 border-[#635BFF] shadow-xl shadow-[#635BFF]/10' : ''
        }`}
      >
        {isPopular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#635BFF] text-white text-[11px] font-bold tracking-wide uppercase">
            Most Popular
          </div>
        )}
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white break-words [overflow-wrap:anywhere]">{tierName}</h4>
            <p className="text-xs text-slate-500 mt-1 break-words [overflow-wrap:anywhere]">{description}</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-slate-900 dark:text-white">{price}</span>
            <span className="text-xs text-slate-400 font-semibold">{period}</span>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
            {featureList.map((f) => (
              <div key={f} className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="break-words [overflow-wrap:anywhere]">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-6">
          <Button variant={isPopular ? 'default' : 'outline'} className="w-full">
            {buttonText}
          </Button>
        </div>
      </Card>
    );
  },
};

// ==========================================
// 4. TESTIMONIAL CARD
// ==========================================
export const TestimonialCardDefinition: ComponentDefinition<{
  quote: string;
  authorName: string;
  authorRole: string;
  stars: number;
}> = {
  id: 'testimonial-card',
  name: 'Testimonial Card',
  category: 'marketing',
  description: 'Customer review and social proof card with star rating and author details.',
  icon: 'MessageSquare',
  allowedChildren: false,
  defaultProps: {
    quote: 'Nirmaanify cut our MVP development cycle from 8 weeks down to 3 days. The architecture is pristine.',
    authorName: 'Marcus Vance',
    authorRole: 'CTO at CloudVanguard',
    stars: 5,
  },
  propsSchema: z.object({
    quote: z.string().default('Nirmaanify cut our MVP development cycle...'),
    authorName: z.string().default('Marcus Vance'),
    authorRole: z.string().default('CTO at CloudVanguard'),
    stars: z.number().min(1).max(5).default(5),
  }),
  inspectorControls: [
    { name: 'quote', label: 'Quote Text', type: 'textarea', group: 'content', defaultValue: 'Nirmaanify cut our MVP development cycle...' },
    { name: 'authorName', label: 'Author Name', type: 'text', group: 'content', defaultValue: 'Marcus Vance' },
    { name: 'authorRole', label: 'Author Role / Company', type: 'text', group: 'content', defaultValue: 'CTO at CloudVanguard' },
    { name: 'stars', label: 'Rating (1-5)', type: 'slider', min: 1, max: 5, group: 'content', defaultValue: 5 },
  ],
  component: ({ quote, authorName, authorRole, stars = 5, style }) => {
    return (
      <Card hoverable style={style} className="p-6 space-y-4">
        <div className="flex items-center gap-1 text-amber-400">
          {Array.from({ length: stars }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-amber-400" />
          ))}
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed break-words [overflow-wrap:anywhere]">
          &ldquo;{quote}&rdquo;
        </p>
        <div className="pt-2 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#635BFF] to-[#22D3EE] flex items-center justify-center font-bold text-xs text-white">
            {authorName.charAt(0)}
          </div>
          <div>
            <h5 className="font-bold text-xs text-slate-900 dark:text-white">{authorName}</h5>
            <p className="text-[11px] text-slate-400">{authorRole}</p>
          </div>
        </div>
      </Card>
    );
  },
};
