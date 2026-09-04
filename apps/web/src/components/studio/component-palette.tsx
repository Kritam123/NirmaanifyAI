'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  COMPONENT_CATEGORIES,
  getComponentsByCategory,
  getAllComponents,
} from '@nirmaanify/component-registry';
import * as LucideIcons from 'lucide-react';
import {
  Search,
  Plus,
  Sparkles,
  Layout,
  Type,
  Square,
  Image as ImageIcon,
  ShoppingBag,
  FormInput,
  BarChart3,
  X,
} from 'lucide-react';
import { Badge } from '@nirmaanify/ui';

interface ComponentPaletteProps {
  onAddComponent: (type: string) => void;
  onCollapse?: () => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  marketing: <Sparkles className="h-3 w-3" />,
  layout: <Layout className="h-3 w-3" />,
  typography: <Type className="h-3 w-3" />,
  basic: <Square className="h-3 w-3" />,
  media: <ImageIcon className="h-3 w-3" />,
  ecommerce: <ShoppingBag className="h-3 w-3" />,
  forms: <FormInput className="h-3 w-3" />,
  dashboard: <BarChart3 className="h-3 w-3" />,
};

export function ComponentPalette({ onAddComponent }: ComponentPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [popoverQuery, setPopoverQuery] = useState('');
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const components = activeCategory === 'all'
    ? getAllComponents()
    : getComponentsByCategory(activeCategory);

  const filteredComponents = components.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  });

  // Close popover on outside click
  useEffect(() => {
    if (!addOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !addButtonRef.current?.contains(target) &&
        !popoverRef.current?.contains(target)
      ) {
        setAddOpen(false);
      }
    };
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAddOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', escHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', escHandler);
    };
  }, [addOpen]);

  const allComponents = getAllComponents();
  const popoverComponents = allComponents.filter((c) => {
    if (!popoverQuery.trim()) return true;
    const q = popoverQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  });

  // Group by category for the popover
  const popoverGrouped = COMPONENT_CATEGORIES.reduce<Record<string, typeof allComponents>>(
    (acc, cat) => {
      const list = popoverComponents.filter((c) => c.category === cat.id);
      if (list.length > 0) acc[cat.id] = list;
      return acc;
    },
    {}
  );

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('text/plain', type);
    e.dataTransfer.setData('application/nirmaanify-component', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0F111A] border-r border-slate-200 dark:border-[#24293D] w-[268px] shrink-0 select-none">
      {/* Brand-gradient header */}
      <div className="relative px-3 py-3 border-b border-slate-200 dark:border-[#24293D] overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07] dark:opacity-[0.10] pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, #635BFF 0%, #8B5CF6 50%, #22D3EE 100%)',
          }}
        />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="h-5 w-5 rounded-md bg-gradient-to-br from-[#635BFF] to-[#8B5CF6] flex items-center justify-center shadow-sm shadow-[#635BFF]/30">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Components
            </span>
            <span className="text-[10px] font-mono text-slate-400 tabular-nums ml-1">
              {filteredComponents.length}/{getAllComponents().length}
            </span>
          </div>

          {/* Add Component button + popover */}
          <div className="relative">
            <button
              ref={addButtonRef}
              onClick={() => {
                setAddOpen((v) => !v);
                setPopoverQuery('');
              }}
              title="Quick-add a component"
              aria-label="Add component"
              aria-expanded={addOpen}
              aria-haspopup="dialog"
              className={`inline-flex items-center gap-1 h-6 px-2 rounded-md text-[10.5px] font-bold transition-all duration-150 ${
                addOpen
                  ? 'bg-gradient-to-br from-[#635BFF] to-[#8B5CF6] text-white shadow-md shadow-[#635BFF]/30'
                  : 'bg-gradient-to-br from-[#635BFF] to-[#8B5CF6] text-white shadow-sm shadow-[#635BFF]/25 hover:shadow-md hover:shadow-[#635BFF]/40'
              }`}
            >
              <Plus className="h-3 w-3" />
              <span>Add</span>
            </button>

            {addOpen && (
              <div
                ref={popoverRef}
                role="dialog"
                aria-label="Quick-add component"
                className="absolute top-full right-0 mt-1.5 w-72 bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] rounded-xl shadow-2xl shadow-slate-300/50 dark:shadow-[#635BFF]/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
              >
                {/* Popover header with search */}
                <div className="p-2 border-b border-slate-200 dark:border-[#24293D]">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search components…"
                      value={popoverQuery}
                      onChange={(e) => setPopoverQuery(e.target.value)}
                      className="w-full pl-7 pr-7 py-1.5 text-[11.5px] rounded-md bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400"
                    />
                    {popoverQuery && (
                      <button
                        onClick={() => setPopoverQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        aria-label="Clear search"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Popover list grouped by category */}
                <div className="max-h-72 overflow-y-auto py-1">
                  {popoverComponents.length === 0 && (
                    <div className="px-3 py-6 text-center text-[11px] text-slate-400">
                      No components match.
                    </div>
                  )}
                  {Object.entries(popoverGrouped).map(([catId, list]) => (
                    <div key={catId} className="py-0.5">
                      <div className="px-2.5 pt-2 pb-1 text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                        {COMPONENT_CATEGORIES.find((c) => c.id === catId)?.label || catId}
                      </div>
                      {list.map((def) => {
                        const Icon = (LucideIcons as any)[def.icon] as React.ComponentType<{ className?: string }> | undefined;
                        return (
                          <button
                            key={def.id}
                            onClick={() => {
                              onAddComponent(def.id);
                              setAddOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11.5px] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#141724] hover:text-[#635BFF] transition-colors text-left"
                          >
                            <span className="h-5 w-5 shrink-0 rounded-md bg-slate-100 dark:bg-[#141724] flex items-center justify-center text-slate-500">
                              {Icon ? <Icon className="h-3 w-3" /> : <Square className="h-3 w-3" />}
                            </span>
                            <span className="font-semibold truncate flex-1">{def.name}</span>
                            <Plus className="h-3 w-3 text-slate-300 dark:text-slate-600" />
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-2.5 py-2.5 border-b border-slate-200 dark:border-[#24293D]">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search 21 components…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2 py-1.5 text-[12px] rounded-lg bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-2.5 pt-2 pb-1.5 border-b border-slate-200 dark:border-[#24293D]">
        <div className="flex gap-1 overflow-x-auto scrollbar-none -mx-0.5 px-0.5">
          <button
            onClick={() => setActiveCategory('all')}
            className={`shrink-0 h-6 px-2 rounded-md text-[10.5px] font-semibold transition-all duration-150 ${
              activeCategory === 'all'
                ? 'bg-gradient-to-br from-[#635BFF] to-[#8B5CF6] text-white shadow-sm shadow-[#635BFF]/30'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-[#141724] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All
          </button>
          {COMPONENT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 inline-flex items-center gap-1 h-6 px-2 rounded-md text-[10.5px] font-semibold transition-all duration-150 ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-br from-[#635BFF] to-[#8B5CF6] text-white shadow-sm shadow-[#635BFF]/30'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-[#141724] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {CATEGORY_ICONS[cat.id]}
              <span>{cat.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Draggable Components List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        <div className="flex items-center justify-between px-1 mb-1.5">
          <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider">
            {activeCategory === 'all' ? 'All components' : COMPONENT_CATEGORIES.find(c => c.id === activeCategory)?.label}
          </span>
          <span className="text-[9px] text-slate-400 font-mono tabular-nums">
            click or drag
          </span>
        </div>
        {filteredComponents.map((def) => {
          const Icon = (LucideIcons as any)[def.icon] as React.ComponentType<{ className?: string }> | undefined;
          return (
            <div
              key={def.id}
              draggable
              onDragStart={(e) => handleDragStart(e, def.id)}
              onClick={() => onAddComponent(def.id)}
              className="group flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] hover:border-[#635BFF] dark:hover:border-[#635BFF] hover:shadow-sm hover:shadow-[#635BFF]/10 cursor-grab active:cursor-grabbing transition-all"
            >
              <div className="h-7 w-7 shrink-0 rounded-md bg-slate-50 dark:bg-[#0F111A] border border-slate-200/80 dark:border-[#24293D] group-hover:bg-gradient-to-br group-hover:from-[#635BFF]/10 group-hover:to-[#8B5CF6]/10 group-hover:border-[#635BFF]/30 flex items-center justify-center text-slate-500 group-hover:text-[#635BFF] transition-all">
                {Icon ? <Icon className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11.5px] font-semibold text-slate-800 dark:text-slate-100 group-hover:text-[#635BFF] transition-colors truncate">
                    {def.name}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                  {def.description}
                </p>
              </div>
              <button
                className="shrink-0 h-6 w-6 inline-flex items-center justify-center rounded-md bg-slate-100 dark:bg-[#0F111A] group-hover:bg-gradient-to-br group-hover:from-[#635BFF] group-hover:to-[#8B5CF6] group-hover:text-white text-slate-400 group-hover:shadow-sm group-hover:shadow-[#635BFF]/30 transition-all"
                title="Add to canvas"
                aria-label={`Add ${def.name} to canvas`}
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          );
        })}
        {filteredComponents.length === 0 && (
          <div className="px-3 py-8 text-center">
            <div className="h-9 w-9 mx-auto rounded-lg bg-slate-100 dark:bg-[#141724] flex items-center justify-center mb-2">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
              No matches
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Try a different keyword
            </p>
          </div>
        )}
      </div>
    </div>
  );
}