import React from 'react';
import { z } from 'zod';
import { ComponentDefinition } from '../types';
import { Card } from '@nirmaanify/ui';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

// ==========================================
// 1. METRIC CARD
// ==========================================
export const MetricCardDefinition: ComponentDefinition<{
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  subtext: string;
}> = {
  id: 'metric-card',
  name: 'Metric Card',
  category: 'dashboard',
  description: 'Executive KPI metric summary card with positive/negative trend percentage.',
  icon: 'BarChart3',
  allowedChildren: false,
  defaultProps: {
    label: 'Monthly Recurring Revenue',
    value: '$48,250',
    change: '+14.2%',
    isPositive: true,
    subtext: 'vs. last month ($42,200)',
  },
  propsSchema: z.object({
    label: z.string().default('Monthly Recurring Revenue'),
    value: z.string().default('$48,250'),
    change: z.string().default('+14.2%'),
    isPositive: z.boolean().default(true),
    subtext: z.string().default('vs. last month'),
  }),
  inspectorControls: [
    { name: 'label', label: 'Metric Label', type: 'text', group: 'content', defaultValue: 'Monthly Recurring Revenue' },
    { name: 'value', label: 'Metric Value', type: 'text', group: 'content', defaultValue: '$48,250' },
    { name: 'change', label: 'Trend Change (e.g. +14%)', type: 'text', group: 'content', defaultValue: '+14.2%' },
    { name: 'isPositive', label: 'Is Positive Growth', type: 'switch', group: 'style', defaultValue: true },
    { name: 'subtext', label: 'Subtext Comparison', type: 'text', group: 'content', defaultValue: 'vs. last month' },
  ],
  component: ({ label, value, change, isPositive = true, subtext, style }) => {
    return (
      <Card hoverable style={style} className="p-5 space-y-2 w-full">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</span>
          <div
            className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{change}</span>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h3>
          {subtext && <p className="text-[11px] text-slate-400 mt-1">{subtext}</p>}
        </div>
      </Card>
    );
  },
};
