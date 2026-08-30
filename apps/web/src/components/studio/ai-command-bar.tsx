'use client';

import React, { useState } from 'react';
import { ComponentNode } from '@nirmaanify/types';
import { createComponentNode } from '@nirmaanify/component-registry';
import { Sparkles, Zap, Plus, Layers, Check, ArrowRight } from 'lucide-react';
import { Button, useToast } from '@nirmaanify/ui';

interface AiCommandBarProps {
  onInsertGeneratedNodes: (nodes: ComponentNode[]) => void;
  selectedNodeId: string | null;
}

export function AiCommandBar({
  onInsertGeneratedNodes,
  selectedNodeId,
}: AiCommandBarProps) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExecuteAiCommand = async (commandPrompt?: string) => {
    const text = (commandPrompt || prompt).trim();
    if (!text) return;

    setIsGenerating(true);
    toast({
      title: 'AI Architecting Component',
      description: `Analyzing: "${text.slice(0, 45)}..."`,
      type: 'info',
    });

    setTimeout(() => {
      const p = text.toLowerCase();
      const generatedNodes: ComponentNode[] = [];

      if (p.includes('pricing') || p.includes('tier') || p.includes('plan')) {
        const pricingGrid: ComponentNode = {
          id: `node-sec-pricing-${Date.now()}`,
          type: 'section',
          name: 'AI Generated Pricing Section',
          props: { paddingY: '48px', paddingX: '24px', backgroundColor: 'transparent' },
          children: [
            {
              id: `node-h-pricing-${Date.now()}`,
              type: 'heading',
              name: 'Pricing Headline',
              props: { text: 'Flexible & Transparent Pricing', level: 'h2', align: 'center', gradient: true },
            },
            {
              id: `node-grid-pricing-${Date.now()}`,
              type: 'grid',
              name: '3-Tier Pricing Grid',
              props: { columns: 3, gap: '24px' },
              children: [
                {
                  id: `node-p-starter-${Date.now()}`,
                  type: 'pricing-card',
                  name: 'Starter Plan',
                  props: { tierName: 'Starter', price: '$0', period: '/mo', description: 'For hobbyists and explorers.', features: '3 Projects, Static Export, Community Discord', buttonText: 'Start Free', isPopular: false },
                },
                {
                  id: `node-p-pro-${Date.now()}`,
                  type: 'pricing-card',
                  name: 'Pro Plan',
                  props: { tierName: 'Pro Creator', price: '$29', period: '/mo', description: 'For growing startup teams.', features: 'Unlimited Projects, NestJS Code Export, 10GB Storage, 24/7 Support', buttonText: 'Upgrade to Pro', isPopular: true },
                },
                {
                  id: `node-p-ent-${Date.now()}`,
                  type: 'pricing-card',
                  name: 'Enterprise Plan',
                  props: { tierName: 'Enterprise', price: '$99', period: '/mo', description: 'Dedicated cloud architecture.', features: 'Custom Domains, SSO Auth, BullMQ Workers, Custom SLA', buttonText: 'Contact Sales', isPopular: false },
                },
              ],
            },
          ],
        };
        generatedNodes.push(pricingGrid);
      } else if (p.includes('product') || p.includes('store') || p.includes('ecommerce') || p.includes('shop')) {
        const productGrid: ComponentNode = {
          id: `node-sec-products-${Date.now()}`,
          type: 'section',
          name: 'AI Generated Storefront Grid',
          props: { paddingY: '48px', paddingX: '24px', backgroundColor: 'transparent' },
          children: [
            {
              id: `node-h-prod-${Date.now()}`,
              type: 'heading',
              name: 'Products Heading',
              props: { text: 'Curated Collection', level: 'h2', align: 'left' },
            },
            {
              id: `node-grid-prod-${Date.now()}`,
              type: 'grid',
              name: 'Products 3-Col Grid',
              props: { columns: 3, gap: '24px' },
              children: [
                {
                  id: `node-prod-1-${Date.now()}`,
                  type: 'product-card',
                  name: 'Product: Wool Blazer',
                  props: { title: 'Merino Wool Oversized Blazer', price: '$189.00', originalPrice: '$240.00', category: 'Outerwear', imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80', badgeText: 'Bestseller' },
                },
                {
                  id: `node-prod-2-${Date.now()}`,
                  type: 'product-card',
                  name: 'Product: Silk Shirt',
                  props: { title: 'Structured Mulberry Silk Shirt', price: '$145.00', originalPrice: '', category: 'Tops', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80', badgeText: 'New' },
                },
                {
                  id: `node-prod-3-${Date.now()}`,
                  type: 'product-card',
                  name: 'Product: Leather Bag',
                  props: { title: 'Handcrafted Minimalist Tote', price: '$260.00', originalPrice: '$310.00', category: 'Accessories', imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80', badgeText: 'Limited' },
                },
              ],
            },
          ],
        };
        generatedNodes.push(productGrid);
      } else if (p.includes('metric') || p.includes('kpi') || p.includes('dashboard') || p.includes('analytics')) {
        const metricGrid: ComponentNode = {
          id: `node-sec-metrics-${Date.now()}`,
          type: 'section',
          name: 'AI Generated Analytics Hub',
          props: { paddingY: '32px', paddingX: '24px', backgroundColor: 'transparent' },
          children: [
            {
              id: `node-grid-metrics-${Date.now()}`,
              type: 'grid',
              name: 'Metrics 3-Col Row',
              props: { columns: 3, gap: '20px' },
              children: [
                {
                  id: `node-m1-${Date.now()}`,
                  type: 'metric-card',
                  name: 'KPI: MRR',
                  props: { label: 'Monthly Recurring Revenue', value: '$58,400', change: '+16.2%', isPositive: true },
                },
                {
                  id: `node-m2-${Date.now()}`,
                  type: 'metric-card',
                  name: 'KPI: Active Users',
                  props: { label: 'Active Subscribers', value: '8,420', change: '+21.4%', isPositive: true },
                },
                {
                  id: `node-m3-${Date.now()}`,
                  type: 'metric-card',
                  name: 'KPI: Conversion',
                  props: { label: 'Trial Conversion Rate', value: '4.8%', change: '+0.8%', isPositive: true },
                },
              ],
            },
          ],
        };
        generatedNodes.push(metricGrid);
      } else if (p.includes('contact') || p.includes('form') || p.includes('inquiry')) {
        const formContainer: ComponentNode = {
          id: `node-sec-form-${Date.now()}`,
          type: 'section',
          name: 'AI Generated Contact Form Section',
          props: { paddingY: '48px', paddingX: '24px', backgroundColor: 'transparent' },
          children: [
            {
              id: `node-form-1-${Date.now()}`,
              type: 'form',
              name: 'Inquiry Form',
              props: { title: 'Get in Touch with Our Team', submitButtonText: 'Send Message' },
              children: [
                {
                  id: `node-inp-name-${Date.now()}`,
                  type: 'input',
                  name: 'Name Field',
                  props: { label: 'Full Name', placeholder: 'Alex Developer', type: 'text' },
                },
                {
                  id: `node-inp-email-${Date.now()}`,
                  type: 'input',
                  name: 'Email Field',
                  props: { label: 'Work Email', placeholder: 'alex@company.com', type: 'email' },
                },
                {
                  id: `node-txt-msg-${Date.now()}`,
                  type: 'textarea',
                  name: 'Message Field',
                  props: { label: 'Project Scope / Message', placeholder: 'Describe your vision...', rows: 3 },
                },
              ],
            },
          ],
        };
        generatedNodes.push(formContainer);
      } else {
        // General Hero / Banner
        const heroNode: ComponentNode = {
          id: `node-ai-hero-${Date.now()}`,
          type: 'hero',
          name: 'AI Generated Hero Banner',
          props: {
            badgeText: 'Autonomous Architecture Engine',
            title: text.split(' ').slice(0, 5).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            subtitle: text,
            primaryCtaText: 'Get Started Now',
            secondaryCtaText: 'Learn More',
            align: 'center',
          },
        };
        generatedNodes.push(heroNode);
      }

      onInsertGeneratedNodes(generatedNodes);
      setIsGenerating(false);
      setPrompt('');

      toast({
        title: 'Component Generated & Placed! ✨',
        description: `Synthesized architecture tree inserted into canvas.`,
        type: 'success',
      });
    }, 700);
  };

  return (
    <div className="p-2 border-b border-slate-200 dark:border-[#24293D] bg-gradient-to-r from-[#635BFF]/10 via-[#8B5CF6]/10 to-transparent shrink-0">
      <div className="flex items-center gap-2 max-w-4xl mx-auto">
        <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-[#635BFF] dark:text-[#A5AEFD] shrink-0">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>AI Studio Command</span>
        </div>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleExecuteAiCommand()}
          placeholder='Ask AI: e.g. "Add a 3-tier pricing section", "Add 3-column product catalog", "Add a contact form"...'
          className="flex-1 bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
        />

        <Button
          size="sm"
          variant="default"
          isLoading={isGenerating}
          onClick={() => handleExecuteAiCommand()}
          leftIcon={<Zap className="h-3.5 w-3.5" />}
          className="shrink-0"
        >
          Generate
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-4xl mx-auto mt-1.5 pl-2 overflow-x-auto text-[10px] text-slate-400 scrollbar-none">
        <span className="font-semibold text-slate-500">Quick Prompts:</span>
        {[
          { label: '💎 3-Tier Pricing', prompt: 'Add a 3-tier pricing section with features and CTA' },
          { label: '🛍️ Store Catalog Grid', prompt: 'Add an e-commerce product grid with 3 items' },
          { label: '📊 KPI Analytics Row', prompt: 'Add a 3-metric KPI analytics row' },
          { label: '✉️ Contact Form', prompt: 'Add a contact inquiry form with name, email and message' },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => {
              setPrompt(item.prompt);
              handleExecuteAiCommand(item.prompt);
            }}
            className="px-2 py-0.5 rounded-md bg-white/70 dark:bg-[#161926]/70 hover:bg-[#635BFF]/15 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#24293D] transition-colors whitespace-nowrap"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
