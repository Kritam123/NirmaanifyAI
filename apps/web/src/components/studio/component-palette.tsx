'use client';

import React, { useState } from 'react';
import {
  COMPONENT_CATEGORIES,
  getComponentsByCategory,
  getAllComponents,
} from '@nirmaanify/component-registry';
import { Search, Plus, Sparkles, Layout, Type, Square, Image, ShoppingBag, FormInput, BarChart3, GripVertical } from 'lucide-react';
import { Badge } from '@nirmaanify/ui';

interface ComponentPaletteProps {
  onAddComponent: (type: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  marketing: <Sparkles className="h-4 w-4" />,
  layout: <Layout className="h-4 w-4" />,
  typography: <Type className="h-4 w-4" />,
  basic: <Square className="h-4 w-4" />,
  media: <Image className="h-4 w-4" />,
  ecommerce: <ShoppingBag className="h-4 w-4" />,
  forms: <FormInput className="h-4 w-4" />,
  dashboard: <BarChart3 className="h-4 w-4" />,
};

export function ComponentPalette({ onAddComponent }: ComponentPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const components = activeCategory === 'all'
    ? getAllComponents()
    : getComponentsByCategory(activeCategory);

  const filteredComponents = components.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
  });

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('text/plain', type);
    e.dataTransfer.setData('application/nirmaanify-component', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-[#0A0D16] border-r border-slate-200 dark:border-[#24293D] w-72 shrink-0 select-none">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 dark:border-[#24293D] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Component Library
          </span>
          <Badge size="sm" variant="indigo">{getAllComponents().length} Components</Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] focus:outline-none focus:ring-1 focus:ring-[#635BFF] text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="p-2 border-b border-slate-200 dark:border-[#24293D] flex gap-1 overflow-x-auto text-[11px] scrollbar-none">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition-colors ${
            activeCategory === 'all'
              ? 'bg-[#635BFF] text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-[#161926]'
          }`}
        >
          All
        </button>
        {COMPONENT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md font-semibold whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? 'bg-[#635BFF] text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-[#161926]'
            }`}
          >
            {CATEGORY_ICONS[cat.id]}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Draggable Components List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        <div className="px-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1 mb-1">
          <GripVertical className="h-3 w-3 text-slate-400" />
          <span>Click to Insert or Drag to Canvas</span>
        </div>
        {filteredComponents.map((def) => (
          <div
            key={def.id}
            draggable
            onDragStart={(e) => handleDragStart(e, def.id)}
            onClick={() => onAddComponent(def.id)}
            className="p-2.5 rounded-xl bg-white dark:bg-[#161926] border border-slate-200/80 dark:border-[#24293D] hover:border-[#635BFF] dark:hover:border-[#635BFF] hover:shadow-md hover:shadow-[#635BFF]/5 cursor-grab active:cursor-grabbing transition-all flex items-start justify-between group"
          >
            <div className="space-y-1 pr-2">
              <div className="flex items-center gap-1.5">
                <GripVertical className="h-3.5 w-3.5 text-slate-400 opacity-40 group-hover:opacity-100 transition-opacity" />
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-[#635BFF] transition-colors">
                  {def.name}
                </span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 font-mono">
                  {def.category}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 line-clamp-1 leading-snug pl-5">
                {def.description}
              </p>
            </div>
            <button
              className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-[#635BFF] group-hover:text-white text-slate-400 transition-all shrink-0 mt-0.5"
              title="Add component to canvas"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
