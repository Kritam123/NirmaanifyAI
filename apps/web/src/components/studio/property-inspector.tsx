'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ComponentNode, ComponentNodeStyle } from '@nirmaanify/types';
import { getComponentDefinition, InspectorControl, parseCustomCssToStyle } from '@nirmaanify/component-registry';
import * as LucideIcons from 'lucide-react';
import {
  Sliders,
  Code2,
  Palette,
  Layout,
  Smartphone,
  MousePointerClick,
  Layers,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Check,
  Copy,
  Image as ImageIcon,
  Hash,
  X,
  Sparkles,
  Type,
  Square,
  PanelRightClose,
  Lock,
  Maximize2,
  Monitor,
  Tablet,
  ChevronLeft,
  ChevronRight,
  Wand2,
  Zap,
  Play,
  Move,
  Eye,
  RotateCw,
  RefreshCw,
  Terminal,
  CheckCircle2,
  FileCode,
  Disc,
  ArrowUpRight,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { Badge, Button, useToast } from '@nirmaanify/ui';

interface PropertyInspectorProps {
  selectedNode: ComponentNode | null;
  onUpdateProps: (nodeId: string, props: Record<string, any>) => void;
  onUpdateStyle: (nodeId: string, style: ComponentNodeStyle) => void;
  onUpdateName: (nodeId: string, name: string) => void;
  onResetNode?: (nodeId: string, options?: { stylesOnly?: boolean; propsOnly?: boolean }) => void;
  onCollapse?: () => void;
  viewport?: 'desktop' | 'tablet' | 'mobile';
  onChangeViewport?: (v: 'desktop' | 'tablet' | 'mobile') => void;
}

export function PropertyInspector({
  selectedNode,
  onUpdateProps,
  onUpdateStyle,
  onUpdateName,
  onResetNode,
  onCollapse,
  viewport = 'desktop',
  onChangeViewport,
}: PropertyInspectorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'layout' | 'responsive' | 'interactions' | 'css' | 'schema'>('content');
  const [copiedSchema, setCopiedSchema] = useState(false);

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkTabsScroll = useCallback(() => {
    const el = tabsContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  }, []);

  useEffect(() => {
    checkTabsScroll();
    const el = tabsContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkTabsScroll, { passive: true });
    window.addEventListener('resize', checkTabsScroll);
    return () => {
      el.removeEventListener('scroll', checkTabsScroll);
      window.removeEventListener('resize', checkTabsScroll);
    };
  }, [checkTabsScroll]);

  // When activeTab changes, auto-scroll that tab into view
  useEffect(() => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const tabEl = el.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement | null;
    if (tabEl) {
      tabEl.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    }
    checkTabsScroll();
  }, [activeTab, checkTabsScroll]);

  const handleTabsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0 && tabsContainerRef.current) {
      e.currentTarget.scrollLeft += e.deltaY;
      checkTabsScroll();
    }
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    const el = tabsContainerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -90 : 90, behavior: 'smooth' });
    setTimeout(checkTabsScroll, 200);
  };

  if (!selectedNode) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#0F111A] border-l border-slate-200 dark:border-[#24293D] w-[330px] shrink-0 select-none">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200 dark:border-[#24293D]">
          <div className="flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Inspector
            </span>
          </div>
          {onCollapse && (
            <button
              onClick={onCollapse}
              title="Collapse inspector (Ctrl+])"
              aria-label="Collapse inspector"
              className="h-6 w-6 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141724] transition-colors"
            >
              <PanelRightClose className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#635BFF]/10 to-[#8B5CF6]/10 border border-[#635BFF]/20 flex items-center justify-center mb-3">
            <MousePointerClick className="h-5 w-5 text-[#635BFF]" />
          </div>
          <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">
            No selection
          </p>
          <p className="text-[10.5px] text-slate-400 mt-1.5 max-w-[220px] leading-relaxed">
            Click any component on the canvas or in the layers panel to inspect its properties here.
          </p>
        </div>
      </div>
    );
  }

  const def = getComponentDefinition(selectedNode.type);
  const controls: InspectorControl[] = def?.inspectorControls || [];

  const handlePropChange = (propName: string, value: any) => {
    onUpdateProps(selectedNode.id, {
      ...selectedNode.props,
      [propName]: value,
    });
  };

  const handleStyleChange = (styleKey: string, value: any) => {
    onUpdateStyle(selectedNode.id, {
      ...(selectedNode.style || {}),
      [styleKey]: value,
    });
  };

  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsConfirmingReset(false);
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, [selectedNode?.id]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleResetClick = (options?: { stylesOnly?: boolean; propsOnly?: boolean }) => {
    if (!selectedNode) return;
    if (selectedNode.isLocked) {
      toast({
        title: 'Component Locked',
        description: 'Unlock this container in the Layers panel to make changes or reset.',
        type: 'warning',
      });
      return;
    }

    if (!isConfirmingReset && !options) {
      setIsConfirmingReset(true);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setIsConfirmingReset(false);
      }, 3500);
      return;
    }

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    setIsConfirmingReset(false);

    if (onResetNode) {
      onResetNode(selectedNode.id, options);
    } else {
      const def = getComponentDefinition(selectedNode.type);
      const defaultProps = def?.defaultProps ? { ...def.defaultProps } : {};
      if (options?.stylesOnly) {
        onUpdateStyle(selectedNode.id, {});
      } else if (options?.propsOnly) {
        onUpdateProps(selectedNode.id, defaultProps);
      } else {
        onUpdateStyle(selectedNode.id, {});
        onUpdateProps(selectedNode.id, defaultProps);
      }
      toast({
        title: 'Changes Reset',
        description: `Reset all changes for ${selectedNode.name || selectedNode.type} to defaults. (Ctrl+Z to Undo)`,
        type: 'success',
      });
    }
  };

  const handleCopyNodeJson = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedNode, null, 2));
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
    toast({ title: 'Copied', description: 'Node JSON schema copied to clipboard', type: 'info' });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0F111A] border-l border-slate-200 dark:border-[#24293D] w-[330px] shrink-0 select-none overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-slate-200 dark:border-[#24293D] space-y-2 bg-white dark:bg-[#0F111A]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="h-6 w-6 shrink-0 rounded-md bg-gradient-to-br from-[#635BFF] to-[#8B5CF6] flex items-center justify-center shadow-sm shadow-[#635BFF]/20">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="text-[12px] font-semibold text-slate-900 dark:text-white truncate">
              {selectedNode.name || selectedNode.type}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {/* Reset Button */}
            <button
              onClick={() => handleResetClick()}
              disabled={selectedNode.isLocked}
              title={
                selectedNode.isLocked
                  ? 'Component is locked'
                  : isConfirmingReset
                    ? 'Click again to confirm reset (Ctrl+Z to Undo)'
                    : `Reset all changes for ${selectedNode.name || selectedNode.type}`
              }
              aria-label="Reset container changes"
              className={`h-6 px-2 inline-flex items-center gap-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer ${
                selectedNode.isLocked
                  ? 'opacity-30 cursor-not-allowed text-slate-400 border border-slate-200 dark:border-[#24293D]'
                  : isConfirmingReset
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-xs animate-pulse'
                    : 'text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 border border-slate-200 dark:border-[#24293D]'
              }`}
            >
              <RotateCcw className={`h-2.5 w-2.5 ${isConfirmingReset ? 'animate-spin' : ''}`} />
              <span>{isConfirmingReset ? 'Confirm?' : 'Reset'}</span>
            </button>

            <Badge size="sm" variant="secondary" className="font-mono text-[9px]">
              {selectedNode.type}
            </Badge>
            {onCollapse && (
              <button
                onClick={onCollapse}
                title="Collapse inspector (Ctrl+])"
                aria-label="Collapse inspector"
                className="h-6 w-6 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#141724] transition-colors"
              >
                <PanelRightClose className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 6-Tab Navigation - sleek scrollable row with directional arrows only */}
        <div className="relative group/tabs">
          {/* Left scroll chevron button */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollTabs('left')}
              title="Scroll left"
              aria-label="Scroll tabs left"
              className="absolute left-0 top-0 bottom-0 z-10 w-6 flex items-center justify-center rounded-l-lg bg-gradient-to-r from-white via-white/95 to-transparent dark:from-[#0F111A] dark:via-[#0F111A]/95 dark:to-transparent text-slate-500 hover:text-[#635BFF] transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 shrink-0" />
            </button>
          )}

          {/* Right scroll chevron button */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollTabs('right')}
              title="Scroll right"
              aria-label="Scroll tabs right"
              className="absolute right-0 top-0 bottom-0 z-10 w-6 flex items-center justify-center rounded-r-lg bg-gradient-to-l from-white via-white/95 to-transparent dark:from-[#0F111A] dark:via-[#0F111A]/95 dark:to-transparent text-slate-500 hover:text-[#635BFF] transition-all cursor-pointer"
            >
              <ChevronRight className="h-4 w-4 shrink-0" />
            </button>
          )}

          <div
            ref={tabsContainerRef}
            onWheel={handleTabsWheel}
            className="overflow-x-auto scrollbar-none scroll-smooth"
          >
            <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-[#141724] p-0.5 rounded-lg border border-slate-200 dark:border-[#24293D] min-w-max">
              {[
                { id: 'content' as const, label: 'Content' },
                { id: 'style' as const, label: 'Style' },
                { id: 'layout' as const, label: 'Layout' },
                { id: 'responsive' as const, label: 'Responsive' },
                { id: 'interactions' as const, label: 'Action' },
                { id: 'css' as const, label: 'CSS' },
                { id: 'schema' as const, label: 'JSON' },
              ].map((t) => (
                <button
                  key={t.id}
                  data-tab={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`h-6 px-2 text-center font-semibold rounded transition-all duration-150 text-[10.5px] whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTab === t.id
                      ? 'bg-gradient-to-br from-[#635BFF] to-[#8B5CF6] text-white shadow-sm shadow-[#635BFF]/30'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Locked Notice Banner */}
      {selectedNode.isLocked && (
        <div className="mx-3 mt-2.5 px-2.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 flex items-center gap-2 text-[11px] shrink-0">
          <Lock className="h-4 w-4 shrink-0 text-amber-500" />
          <span className="leading-tight font-medium">
            This component is locked. Unlock it in the Layers panel to make changes.
          </span>
        </div>
      )}

      {/* Tab Contents */}
      <div
        className={`flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs ${
          selectedNode.isLocked ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        {/* 1. CONTENT TAB */}
        {activeTab === 'content' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-[#24293D]/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Component Properties
              </span>
              <button
                type="button"
                onClick={() => handleResetClick({ propsOnly: true })}
                disabled={selectedNode.isLocked}
                title="Reset properties to component defaults"
                className="text-[10px] text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 font-medium transition-colors cursor-pointer"
              >
                <RotateCcw className="h-2.5 w-2.5" />
                <span>Reset Props</span>
              </button>
            </div>
            <Field label="Label">
              <input
                type="text"
                value={selectedNode.name || ''}
                onChange={(e) => onUpdateName(selectedNode.id, e.target.value)}
                placeholder="Component label..."
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all"
              />
            </Field>

            {controls.length === 0 ? (
              <div className="px-3 py-6 text-center border border-dashed border-slate-200 dark:border-[#24293D] rounded-lg">
                <p className="text-[11px] text-slate-400">
                  No specific content props for this node type.
                </p>
              </div>
            ) : (
              controls.map((ctrl) => {
                const val =
                  selectedNode.props[ctrl.name] !== undefined
                    ? selectedNode.props[ctrl.name]
                    : ctrl.defaultValue;

                return (
                  <Field
                    key={ctrl.name}
                    label={ctrl.label}
                    valueLabel={
                      ctrl.type === 'slider' || ctrl.type === 'number' ? String(val) : undefined
                    }
                  >
                    {ctrl.type === 'text' && (
                      <input
                        type="text"
                        value={val || ''}
                        onChange={(e) => handlePropChange(ctrl.name, e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg text-[12px] bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all"
                      />
                    )}

                    {ctrl.type === 'textarea' && (
                      <AutoResizeTextarea
                        value={val || ''}
                        onChange={(newVal) => handlePropChange(ctrl.name, newVal)}
                      />
                    )}

                    {ctrl.type === 'number' && (
                      <div className="space-y-1.5">
                        <input
                          type="number"
                          value={val ?? 0}
                          min={ctrl.min}
                          max={ctrl.max}
                          step={ctrl.step ?? 1}
                          onChange={(e) => handlePropChange(ctrl.name, Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-md text-[11.5px] font-mono bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all"
                        />
                        {ctrl.min !== undefined && ctrl.max !== undefined && (
                          <input
                            type="range"
                            min={ctrl.min}
                            max={ctrl.max}
                            step={ctrl.step ?? 1}
                            value={val ?? ctrl.min}
                            onChange={(e) => handlePropChange(ctrl.name, Number(e.target.value))}
                            className="w-full accent-[#635BFF]"
                          />
                        )}
                      </div>
                    )}

                    {ctrl.type === 'select' && ctrl.options && (
                      <select
                        value={val || ''}
                        onChange={(e) => handlePropChange(ctrl.name, e.target.value)}
                        className="w-full px-2 py-1.5 rounded-md text-[11.5px] bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all"
                      >
                        {ctrl.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {ctrl.type === 'switch' && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={Boolean(val)}
                          onClick={() => handlePropChange(ctrl.name, !Boolean(val))}
                          className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                            Boolean(val)
                              ? 'bg-gradient-to-r from-[#635BFF] to-[#8B5CF6]'
                              : 'bg-slate-300 dark:bg-[#3B4366]'
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform shadow-sm ${
                              Boolean(val) ? 'translate-x-3.5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                        <span className="text-[10.5px] text-slate-500">
                          {Boolean(val) ? 'Enabled' : 'Disabled'}
                        </span>
                      </label>
                    )}

                    {ctrl.type === 'slider' && (
                      <input
                        type="range"
                        min={ctrl.min ?? 0}
                        max={ctrl.max ?? 100}
                        step={ctrl.step ?? 1}
                        value={val ?? ctrl.min ?? 0}
                        onChange={(e) => handlePropChange(ctrl.name, Number(e.target.value))}
                        className="w-full accent-[#635BFF]"
                      />
                    )}

                    {ctrl.type === 'color' && (
                      <div className="flex items-center gap-1.5">
                        <div className="relative h-7 w-8 shrink-0 rounded-md overflow-hidden border border-slate-200 dark:border-[#24293D]">
                          <input
                            type="color"
                            value={isHexColor(val) ? val : '#635BFF'}
                            onChange={(e) => handlePropChange(ctrl.name, e.target.value)}
                            className="absolute inset-0 h-full w-full cursor-pointer bg-transparent"
                          />
                        </div>
                        <input
                          type="text"
                          value={val || ''}
                          onChange={(e) => handlePropChange(ctrl.name, e.target.value)}
                          className="flex-1 px-2 py-1.5 rounded-md text-[11.5px] font-mono bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D]"
                        />
                      </div>
                    )}

                    {ctrl.type === 'alignment' && (
                      <div className="flex items-center bg-white dark:bg-[#141724] p-0.5 rounded-md border border-slate-200 dark:border-[#24293D]">
                        {[
                          { val: 'left', icon: <AlignLeft className="h-3 w-3" /> },
                          { val: 'center', icon: <AlignCenter className="h-3 w-3" /> },
                          { val: 'right', icon: <AlignRight className="h-3 w-3" /> },
                          { val: 'justify', icon: <AlignJustify className="h-3 w-3" /> },
                        ].map((btn) => (
                          <button
                            key={btn.val}
                            onClick={() => handlePropChange(ctrl.name, btn.val)}
                            className={`flex-1 h-6 inline-flex items-center justify-center rounded transition-colors ${
                              val === btn.val
                                ? 'bg-gradient-to-br from-[#635BFF] to-[#8B5CF6] text-white shadow-sm shadow-[#635BFF]/30'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {btn.icon}
                          </button>
                        ))}
                      </div>
                    )}

                    {ctrl.type === 'icon' && (
                      <IconPicker
                        value={val}
                        options={ctrl.options?.map((o) => String(o.value))}
                        onChange={(v) => handlePropChange(ctrl.name, v)}
                      />
                    )}

                    {ctrl.type === 'image-url' && (
                      <div className="space-y-1.5">
                        {val && (
                          <div className="relative w-full h-20 rounded-md overflow-hidden border border-slate-200 dark:border-[#24293D] bg-slate-100 dark:bg-[#141724]">
                            <img
                              src={val}
                              alt="preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <ImageIcon className="h-3 w-3 text-slate-400 shrink-0" />
                          <input
                            type="url"
                            value={val || ''}
                            placeholder="https://images.unsplash.com/..."
                            onChange={(e) => handlePropChange(ctrl.name, e.target.value)}
                            className="flex-1 px-2 py-1 rounded-md text-[11px] font-mono bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {ctrl.type === 'spacing' && (
                      <SpacingControl
                        value={val || { top: '0px', right: '0px', bottom: '0px', left: '0px' }}
                        onChange={(v) => handlePropChange(ctrl.name, v)}
                      />
                    )}
                  </Field>
                );
              })
            )}
          </div>
        )}

        {/* 2. STYLE TAB */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-[#24293D]/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Visual Styles &amp; Effects
              </span>
              <button
                type="button"
                onClick={() => handleResetClick({ stylesOnly: true })}
                disabled={selectedNode.isLocked}
                title="Reset background, gradients, effects & animations back to default"
                className="text-[10px] text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 font-medium transition-colors cursor-pointer"
              >
                <RotateCcw className="h-2.5 w-2.5" />
                <span>Reset Styles</span>
              </button>
            </div>
            {/* Background Style Mode: Solid, Linear Gradient, Radial Gradient */}
            <Field label="Background Mode">
              <div className="grid grid-cols-3 gap-1 bg-slate-50 dark:bg-[#141724] p-0.5 rounded-lg border border-slate-200 dark:border-[#24293D]">
                {[
                  { id: 'solid', label: 'Solid Color' },
                  { id: 'linear', label: 'Linear Gradient' },
                  { id: 'radial', label: 'Circular Radial' },
                ].map((bgMode) => {
                  const currentMode = selectedNode.style?.gradientType && selectedNode.style.gradientType !== 'none'
                    ? selectedNode.style.gradientType
                    : 'solid';
                  const isActive = currentMode === bgMode.id;
                  return (
                    <button
                      key={bgMode.id}
                      type="button"
                      onClick={() => {
                        if (bgMode.id === 'solid') {
                          handleStyleChange('gradientType', 'none');
                        } else if (bgMode.id === 'linear') {
                          handleStyleChange('gradientType', 'linear');
                          if (!selectedNode.style?.gradientFrom) handleStyleChange('gradientFrom', '#635BFF');
                          if (!selectedNode.style?.gradientTo) handleStyleChange('gradientTo', '#8B5CF6');
                          if (!selectedNode.style?.gradientAngle) handleStyleChange('gradientAngle', '135deg');
                        } else {
                          handleStyleChange('gradientType', 'radial');
                          if (!selectedNode.style?.gradientFrom) handleStyleChange('gradientFrom', '#635BFF');
                          if (!selectedNode.style?.gradientTo) handleStyleChange('gradientTo', '#0F111A');
                          if (!selectedNode.style?.gradientAngle) handleStyleChange('gradientAngle', 'circle at center');
                        }
                      }}
                      className={`h-6 text-[10px] font-semibold rounded transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-[#635BFF] to-[#8B5CF6] text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {bgMode.label}
                    </button>
                  );
                })}
              </div>
            </Field>

            {/* 2A. SOLID COLOR CONTROLS */}
            {(!selectedNode.style?.gradientType || selectedNode.style.gradientType === 'none') && (
              <div className="space-y-3 p-2.5 rounded-xl bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-[#24293D]">
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mb-1.5">Brand Accents</label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { c: '#635BFF', name: 'Indigo' },
                      { c: '#22D3EE', name: 'Cyan' },
                      { c: '#8B5CF6', name: 'Violet' },
                      { c: '#10B981', name: 'Emerald' },
                      { c: '#F59E0B', name: 'Amber' },
                      { c: '#EF4444', name: 'Rose' },
                      { c: '#0F172A', name: 'Slate' },
                      { c: '#FFFFFF', name: 'White' },
                    ].map(({ c, name }) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleStyleChange('backgroundColor', c)}
                        style={{ backgroundColor: c }}
                        className="h-6 w-6 rounded-full border border-slate-300/60 dark:border-slate-700 hover:scale-110 hover:ring-2 hover:ring-[#635BFF]/40 hover:ring-offset-1 dark:hover:ring-offset-[#0F111A] transition-all cursor-pointer"
                        title={name}
                        aria-label={`Set background to ${name}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="relative h-7 w-8 shrink-0 rounded-md overflow-hidden border border-slate-200 dark:border-[#24293D]">
                    <input
                      type="color"
                      value={selectedNode.style?.backgroundColor || '#000000'}
                      onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer bg-transparent"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="transparent or #161926"
                    value={selectedNode.style?.backgroundColor || ''}
                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                    className="flex-1 px-2 py-1.5 rounded-md text-[11.5px] font-mono bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            )}

            {/* 2B. LINEAR GRADIENT CONTROLS */}
            {selectedNode.style?.gradientType === 'linear' && (
              <div className="space-y-3 p-2.5 rounded-xl bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-[#24293D]">
                {/* Live Linear Gradient Strip Preview */}
                <div
                  className="h-9 w-full rounded-lg border border-slate-300 dark:border-slate-700 shadow-inner flex items-center justify-center text-[10px] font-bold text-white tracking-wide"
                  style={{
                    backgroundImage: `linear-gradient(${selectedNode.style?.gradientAngle || '135deg'}, ${selectedNode.style?.gradientFrom || '#635BFF'}${selectedNode.style?.gradientVia ? `, ${selectedNode.style.gradientVia}` : ''}, ${selectedNode.style?.gradientTo || '#8B5CF6'})`,
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  }}
                >
                  Linear Gradient Preview
                </div>

                {/* Linear Presets */}
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">Preset Themes</label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { name: 'Indigo Flow', from: '#635BFF', to: '#8B5CF6', angle: '135deg' },
                      { name: 'Sunset Glow', from: '#F59E0B', to: '#EF4444', angle: '135deg' },
                      { name: 'Neon Cyan', from: '#22D3EE', to: '#635BFF', angle: 'to right' },
                      { name: 'Emerald Mist', from: '#10B981', to: '#0F172A', angle: '135deg' },
                      { name: 'Cyber Pink', from: '#EC4899', to: '#8B5CF6', angle: '45deg' },
                      { name: 'Dark Slate', from: '#1E293B', to: '#0F172A', angle: 'to bottom' },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          handleStyleChange('gradientFrom', preset.from);
                          handleStyleChange('gradientTo', preset.to);
                          handleStyleChange('gradientAngle', preset.angle);
                        }}
                        className="h-6 px-1 text-[9.5px] font-medium rounded border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0F111A] text-slate-600 dark:text-slate-300 hover:border-[#635BFF] truncate transition-all cursor-pointer"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Angle / Direction */}
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">Gradient Angle / Direction</label>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={selectedNode.style?.gradientAngle || '135deg'}
                      onChange={(e) => handleStyleChange('gradientAngle', e.target.value)}
                      className="flex-1 px-2 py-1 rounded text-[11px] bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <option value="to right">To Right (Horizontal)</option>
                      <option value="to bottom">To Bottom (Vertical)</option>
                      <option value="135deg">135deg Diagonal (Default)</option>
                      <option value="45deg">45deg Diagonal</option>
                      <option value="to bottom right">To Bottom Right</option>
                      <option value="to top">To Top</option>
                    </select>
                    <input
                      type="text"
                      placeholder="135deg"
                      value={selectedNode.style?.gradientAngle || ''}
                      onChange={(e) => handleStyleChange('gradientAngle', e.target.value)}
                      className="w-20 px-2 py-1 rounded text-[11px] font-mono bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-800 dark:text-slate-200 text-center"
                    />
                  </div>
                </div>

                {/* Color Stops: From, Via, To */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">From Color</label>
                    <div className="flex items-center gap-1">
                      <div className="relative h-6 w-6 shrink-0 rounded overflow-hidden border border-slate-200 dark:border-[#24293D]">
                        <input
                          type="color"
                          value={selectedNode.style?.gradientFrom || '#635BFF'}
                          onChange={(e) => handleStyleChange('gradientFrom', e.target.value)}
                          className="absolute inset-0 h-full w-full cursor-pointer bg-transparent"
                        />
                      </div>
                      <input
                        type="text"
                        value={selectedNode.style?.gradientFrom || ''}
                        onChange={(e) => handleStyleChange('gradientFrom', e.target.value)}
                        placeholder="#635BFF"
                        className="w-full px-1.5 py-1 rounded text-[10.5px] font-mono bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">To Color</label>
                    <div className="flex items-center gap-1">
                      <div className="relative h-6 w-6 shrink-0 rounded overflow-hidden border border-slate-200 dark:border-[#24293D]">
                        <input
                          type="color"
                          value={selectedNode.style?.gradientTo || '#8B5CF6'}
                          onChange={(e) => handleStyleChange('gradientTo', e.target.value)}
                          className="absolute inset-0 h-full w-full cursor-pointer bg-transparent"
                        />
                      </div>
                      <input
                        type="text"
                        value={selectedNode.style?.gradientTo || ''}
                        onChange={(e) => handleStyleChange('gradientTo', e.target.value)}
                        placeholder="#8B5CF6"
                        className="w-full px-1.5 py-1 rounded text-[10.5px] font-mono bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2C. CIRCULAR / RADIAL GRADIENT CONTROLS */}
            {selectedNode.style?.gradientType === 'radial' && (
              <div className="space-y-3 p-2.5 rounded-xl bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-[#24293D]">
                {/* Live Radial Gradient Strip Preview */}
                <div
                  className="h-12 w-full rounded-lg border border-slate-300 dark:border-slate-700 shadow-inner flex items-center justify-center text-[10px] font-bold text-white tracking-wide"
                  style={{
                    backgroundImage: `radial-gradient(${selectedNode.style?.gradientAngle || 'circle at center'}, ${selectedNode.style?.gradientFrom || '#635BFF'}${selectedNode.style?.gradientVia ? `, ${selectedNode.style.gradientVia}` : ''}, ${selectedNode.style?.gradientTo || '#0F111A'})`,
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  }}
                >
                  Circular Radial Preview
                </div>

                {/* Radial Presets */}
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">Circular Presets</label>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { name: 'Center Glow', from: '#635BFF', to: 'transparent', shape: 'circle at center' },
                      { name: 'Top Light', from: '#8B5CF6', to: '#0F111A', shape: 'circle at top' },
                      { name: 'Orbital Cyan', from: '#22D3EE', to: '#0E121E', shape: 'ellipse at center' },
                      { name: 'Warm Core', from: '#F59E0B', to: '#0F172A', shape: 'circle at center' },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          handleStyleChange('gradientFrom', preset.from);
                          handleStyleChange('gradientTo', preset.to);
                          handleStyleChange('gradientAngle', preset.shape);
                        }}
                        className="h-6 px-1.5 text-[10px] font-medium rounded border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0F111A] text-slate-600 dark:text-slate-300 hover:border-[#635BFF] truncate transition-all cursor-pointer"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Radial Shape & Position */}
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">Shape & Origin</label>
                  <select
                    value={selectedNode.style?.gradientAngle || 'circle at center'}
                    onChange={(e) => handleStyleChange('gradientAngle', e.target.value)}
                    className="w-full px-2 py-1 rounded text-[11px] bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="circle at center">Circle at Center</option>
                    <option value="circle at top">Circle at Top</option>
                    <option value="circle at bottom">Circle at Bottom</option>
                    <option value="ellipse at center">Ellipse at Center</option>
                    <option value="circle at 50% 0%">Top Center Glow (Spotlight)</option>
                  </select>
                </div>

                {/* Color Stops */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">Center Color</label>
                    <div className="flex items-center gap-1">
                      <div className="relative h-6 w-6 shrink-0 rounded overflow-hidden border border-slate-200 dark:border-[#24293D]">
                        <input
                          type="color"
                          value={selectedNode.style?.gradientFrom || '#635BFF'}
                          onChange={(e) => handleStyleChange('gradientFrom', e.target.value)}
                          className="absolute inset-0 h-full w-full cursor-pointer bg-transparent"
                        />
                      </div>
                      <input
                        type="text"
                        value={selectedNode.style?.gradientFrom || ''}
                        onChange={(e) => handleStyleChange('gradientFrom', e.target.value)}
                        placeholder="#635BFF"
                        className="w-full px-1.5 py-1 rounded text-[10.5px] font-mono bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">Outer Color</label>
                    <div className="flex items-center gap-1">
                      <div className="relative h-6 w-6 shrink-0 rounded overflow-hidden border border-slate-200 dark:border-[#24293D]">
                        <input
                          type="color"
                          value={selectedNode.style?.gradientTo || '#0F111A'}
                          onChange={(e) => handleStyleChange('gradientTo', e.target.value)}
                          className="absolute inset-0 h-full w-full cursor-pointer bg-transparent"
                        />
                      </div>
                      <input
                        type="text"
                        value={selectedNode.style?.gradientTo || ''}
                        onChange={(e) => handleStyleChange('gradientTo', e.target.value)}
                        placeholder="#0F111A"
                        className="w-full px-1.5 py-1 rounded text-[10.5px] font-mono bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Typography & Text Color */}
            <Field label="Text Color">
              <div className="flex items-center gap-1.5">
                <div className="relative h-7 w-8 shrink-0 rounded-md overflow-hidden border border-slate-200 dark:border-[#24293D]">
                  <input
                    type="color"
                    value={selectedNode.style?.color || '#ffffff'}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer bg-transparent"
                  />
                </div>
                <input
                  type="text"
                  placeholder="#ffffff or currentColor"
                  value={selectedNode.style?.color || ''}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="flex-1 px-2 py-1.5 rounded-md text-[11.5px] font-mono bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] text-slate-800 dark:text-slate-200"
                />
              </div>
            </Field>

            {/* Borders & Shadows */}
            <Field label="Border Radius">
              <select
                value={selectedNode.style?.borderRadius || '12px'}
                onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                className="w-full px-2 py-1.5 rounded-md text-[11.5px] bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all cursor-pointer"
              >
                <option value="0px">None (Square 0px)</option>
                <option value="6px">Small (6px)</option>
                <option value="12px">Medium (12px)</option>
                <option value="16px">Large (16px)</option>
                <option value="24px">Extra Large (24px)</option>
                <option value="9999px">Full Pill (9999px)</option>
              </select>
            </Field>

            <Field label="Elevation Shadow">
              <select
                value={selectedNode.style?.boxShadow || 'none'}
                onChange={(e) => handleStyleChange('boxShadow', e.target.value)}
                className="w-full px-2 py-1.5 rounded-md text-[11.5px] bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all cursor-pointer"
              >
                <option value="none">No Shadow</option>
                <option value="0 1px 3px rgba(0,0,0,0.1)">Subtle (sm)</option>
                <option value="0 4px 6px -1px rgba(0,0,0,0.1)">Medium (md)</option>
                <option value="0 10px 15px -3px rgba(0,0,0,0.1)">Large (lg)</option>
                <option value="0 0 24px -2px rgba(99,91,255,0.35)">Indigo Glow</option>
                <option value="0 0 24px -2px rgba(139,92,246,0.35)">Violet Glow</option>
                <option value="0 0 24px -2px rgba(34,211,238,0.35)">Cyan Glow</option>
              </select>
            </Field>

            {/* Animations & Transitions */}
            <Field label="CSS Transitions">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] space-y-2">
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { label: 'None', val: '' },
                    { label: '150ms Fast', val: '150ms' },
                    { label: '300ms Mid', val: '300ms' },
                    { label: '500ms Slow', val: '500ms' },
                  ].map((dur) => (
                    <button
                      key={dur.label}
                      type="button"
                      onClick={() => handleStyleChange('transitionDuration', dur.val)}
                      className={`h-6 text-[9.5px] font-semibold rounded border transition-all cursor-pointer ${
                        (selectedNode.style?.transitionDuration || '') === dur.val
                          ? 'border-[#635BFF] bg-[#635BFF]/10 text-[#635BFF] dark:text-[#A5AEFD]'
                          : 'bg-white dark:bg-[#0F111A] border-slate-200 dark:border-[#24293D] text-slate-500 hover:text-[#635BFF]'
                      }`}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">Property</label>
                    <select
                      value={selectedNode.style?.transitionProperty || 'all'}
                      onChange={(e) => handleStyleChange('transitionProperty', e.target.value)}
                      className="w-full px-2 py-1 rounded text-[10.5px] bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <option value="all">All Properties</option>
                      <option value="transform, opacity">Transform & Opacity</option>
                      <option value="background-color, color, border-color">Colors Only</option>
                      <option value="box-shadow">Shadow Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">Timing Function</label>
                    <select
                      value={selectedNode.style?.transitionTimingFunction || 'ease'}
                      onChange={(e) => handleStyleChange('transitionTimingFunction', e.target.value)}
                      className="w-full px-2 py-1 rounded text-[10.5px] bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <option value="ease">Ease (Default)</option>
                      <option value="linear">Linear</option>
                      <option value="ease-in">Ease-In</option>
                      <option value="ease-out">Ease-Out</option>
                      <option value="ease-in-out">Ease-In-Out</option>
                    </select>
                  </div>
                </div>
              </div>
            </Field>

            <Field label="Keyframe Animations">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] space-y-2">
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { label: 'None', val: 'none' },
                    { label: 'Pulse', val: 'pulse' },
                    { label: 'Bounce', val: 'bounce' },
                    { label: 'Spin', val: 'spin' },
                    { label: 'Ping', val: 'ping' },
                    { label: 'Float', val: 'float' },
                    { label: 'Glow', val: 'glow' },
                  ].map((anim) => {
                    const isActive = (selectedNode.style?.animationType || 'none') === anim.val;
                    return (
                      <button
                        key={anim.val}
                        type="button"
                        onClick={() => handleStyleChange('animationType', anim.val === 'none' ? undefined : anim.val)}
                        className={`h-6 text-[10px] font-semibold rounded border transition-all cursor-pointer ${
                          isActive
                            ? 'border-[#635BFF] bg-[#635BFF]/10 text-[#635BFF] dark:text-[#A5AEFD]'
                            : 'bg-white dark:bg-[#0F111A] border-slate-200 dark:border-[#24293D] text-slate-500 hover:text-[#635BFF]'
                        }`}
                      >
                        {anim.label}
                      </button>
                    );
                  })}
                </div>

                {selectedNode.style?.animationType && selectedNode.style.animationType !== 'none' && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">Duration:</span>
                    <div className="flex items-center gap-1">
                      {['1s', '2s', '3s', '4s'].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => handleStyleChange('animationDuration', d)}
                          className={`px-2 py-0.5 rounded text-[9.5px] font-mono border cursor-pointer ${
                            (selectedNode.style?.animationDuration || '2s') === d
                              ? 'border-[#635BFF] bg-[#635BFF]/10 text-[#635BFF]'
                              : 'bg-white dark:bg-[#0F111A] border-slate-200 dark:border-[#24293D] text-slate-500'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Field>

            {/* Transforms, Filters & Cursor */}
            <Field label="Transforms & Visual Effects">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">Scale</label>
                    <select
                      value={String(selectedNode.style?.scale || '1')}
                      onChange={(e) => handleStyleChange('scale', e.target.value === '1' ? undefined : e.target.value)}
                      className="w-full px-2 py-1 rounded text-[10.5px] bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <option value="1">1.0 (Normal)</option>
                      <option value="1.05">1.05 (Zoom +5%)</option>
                      <option value="1.1">1.10 (Zoom +10%)</option>
                      <option value="0.95">0.95 (Slightly Smaller)</option>
                      <option value="0.9">0.90 (Compact)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">Rotate</label>
                    <select
                      value={selectedNode.style?.rotate || '0deg'}
                      onChange={(e) => handleStyleChange('rotate', e.target.value === '0deg' ? undefined : e.target.value)}
                      className="w-full px-2 py-1 rounded text-[10.5px] bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <option value="0deg">0deg (Default)</option>
                      <option value="2deg">+2deg (Subtle Tilt)</option>
                      <option value="-2deg">-2deg (Subtle Tilt)</option>
                      <option value="45deg">45deg</option>
                      <option value="90deg">90deg</option>
                      <option value="180deg">180deg (Flipped)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">Backdrop Blur (Glass)</label>
                    <select
                      value={selectedNode.style?.backdropFilter || 'none'}
                      onChange={(e) => handleStyleChange('backdropFilter', e.target.value === 'none' ? undefined : e.target.value)}
                      className="w-full px-2 py-1 rounded text-[10.5px] bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <option value="none">None</option>
                      <option value="blur(4px)">Subtle (4px)</option>
                      <option value="blur(8px)">Medium (8px)</option>
                      <option value="blur(12px)">Glass Card (12px)</option>
                      <option value="blur(20px)">Heavy Frost (20px)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">Cursor</label>
                    <select
                      value={selectedNode.style?.cursor || 'default'}
                      onChange={(e) => handleStyleChange('cursor', e.target.value === 'default' ? undefined : e.target.value)}
                      className="w-full px-2 py-1 rounded text-[10.5px] bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <option value="default">Default</option>
                      <option value="pointer">Pointer (Hand)</option>
                      <option value="grab">Grab</option>
                      <option value="text">Text Select</option>
                      <option value="not-allowed">Not Allowed</option>
                    </select>
                  </div>
                </div>
              </div>
            </Field>
          </div>
        )}

        {/* 3. LAYOUT TAB */}
        {activeTab === 'layout' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-[#24293D]/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Layout &amp; Dimensions
              </span>
              <button
                type="button"
                onClick={() => {
                  if (selectedNode.isLocked) return;
                  const rest = { ...(selectedNode.style || {}) };
                  delete rest.width;
                  delete rest.minWidth;
                  delete rest.maxWidth;
                  delete rest.height;
                  delete rest.minHeight;
                  delete rest.maxHeight;
                  delete rest.padding;
                  delete rest.margin;
                  delete rest.gap;
                  delete rest.flexDirection;
                  delete rest.position;
                  delete rest.top;
                  delete rest.right;
                  delete rest.bottom;
                  delete rest.left;
                  delete rest.zIndex;
                  delete rest.overflow;
                  delete rest.overflowX;
                  delete rest.overflowY;
                  delete rest.alignItems;
                  delete rest.justifyContent;
                  onUpdateStyle(selectedNode.id, rest);
                  toast({
                    title: 'Layout Reset',
                    description: `Reset layout dimensions and positioning for ${selectedNode.name || selectedNode.type}. (Ctrl+Z to Undo)`,
                    type: 'success',
                  });
                }}
                disabled={selectedNode.isLocked}
                title="Reset layout sizing, box model & positioning"
                className="text-[10px] text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 font-medium transition-colors cursor-pointer"
              >
                <RotateCcw className="h-2.5 w-2.5" />
                <span>Reset Layout</span>
              </button>
            </div>
            <Field label="Flex Direction">
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'Column', sub: 'Vertical', val: 'column' },
                  { label: 'Row', sub: 'Horizontal', val: 'row' },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => handleStyleChange('flexDirection', item.val)}
                    className={`py-1.5 px-2 rounded-md text-[11.5px] border transition-all ${
                      selectedNode.style?.flexDirection === item.val
                        ? 'border-[#635BFF] bg-gradient-to-br from-[#635BFF]/10 to-[#8B5CF6]/10 text-[#635BFF]'
                        : 'border-slate-200 dark:border-[#24293D] text-slate-500 hover:border-[#635BFF]/40'
                    }`}
                  >
                    <div className="font-semibold leading-tight">{item.label}</div>
                    <div className="text-[9px] opacity-70 leading-tight mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Gap Spacing">
              <input
                type="text"
                placeholder="16px"
                value={selectedNode.style?.gap || ''}
                onChange={(e) => handleStyleChange('gap', e.target.value)}
                className="w-full px-2 py-1.5 rounded-md text-[11.5px] font-mono bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all"
              />
            </Field>

            {/* Alignment & Distribution */}
            <Field label="Cross-Axis Alignment">
              <div className="grid grid-cols-4 gap-1 bg-white dark:bg-[#141724] p-0.5 rounded-lg border border-slate-200 dark:border-[#24293D]">
                {[
                  { label: 'Start', val: 'flex-start' },
                  { label: 'Center', val: 'center' },
                  { label: 'End', val: 'flex-end' },
                  { label: 'Stretch', val: 'stretch' },
                ].map((item) => {
                  const isActive = (selectedNode.style?.alignItems || 'stretch') === item.val;
                  return (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => handleStyleChange('alignItems', item.val)}
                      className={`h-6 text-[10px] font-semibold rounded transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-[#635BFF] to-[#8B5CF6] text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Main-Axis Justification">
              <div className="grid grid-cols-3 gap-1 bg-white dark:bg-[#141724] p-0.5 rounded-lg border border-slate-200 dark:border-[#24293D]">
                {[
                  { label: 'Start', val: 'flex-start' },
                  { label: 'Center', val: 'center' },
                  { label: 'End', val: 'flex-end' },
                  { label: 'Between', val: 'space-between' },
                  { label: 'Around', val: 'space-around' },
                  { label: 'Evenly', val: 'space-evenly' },
                ].map((item) => {
                  const isActive = (selectedNode.style?.justifyContent || 'flex-start') === item.val;
                  return (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => handleStyleChange('justifyContent', item.val)}
                      className={`h-6 text-[10px] font-semibold rounded transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-[#635BFF] to-[#8B5CF6] text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Box Model">
              <div className="p-2.5 rounded-md bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] space-y-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Padding</label>
                    <input
                      type="text"
                      placeholder="24px"
                      value={selectedNode.style?.padding || ''}
                      onChange={(e) => handleStyleChange('padding', e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 rounded text-[11px] font-mono bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D]"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Margin</label>
                    <input
                      type="text"
                      placeholder="0 auto"
                      value={selectedNode.style?.margin || ''}
                      onChange={(e) => handleStyleChange('margin', e.target.value)}
                      className="w-full mt-0.5 px-2 py-1 rounded text-[11px] font-mono bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D]"
                    />
                  </div>
                </div>
              </div>
            </Field>

            {/* Width Sizing */}
            <Field label="Width Dimensions">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] space-y-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Width</label>
                    <div className="flex items-center gap-1">
                      {['auto', '100%'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleStyleChange('width', preset)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all cursor-pointer ${
                            selectedNode.style?.width === preset
                              ? 'border-[#635BFF] bg-[#635BFF]/10 text-[#635BFF] dark:text-[#A5AEFD]'
                              : 'bg-white dark:bg-[#0F111A] border-slate-200 dark:border-[#24293D] text-slate-500 hover:text-[#635BFF]'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 100%, 640px, auto"
                    value={selectedNode.style?.width || ''}
                    onChange={(e) => handleStyleChange('width', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg text-[11.5px] font-mono bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">Min Width</label>
                    <input
                      type="text"
                      placeholder="e.g. 0, 320px"
                      value={selectedNode.style?.minWidth || ''}
                      onChange={(e) => handleStyleChange('minWidth', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">Max Width</label>
                    <input
                      type="text"
                      placeholder="e.g. 1200px, 100%"
                      value={selectedNode.style?.maxWidth ?? selectedNode.props?.maxWidth ?? ''}
                      onChange={(e) => {
                        handleStyleChange('maxWidth', e.target.value);
                        if (selectedNode.props?.maxWidth !== undefined) {
                          handlePropChange('maxWidth', e.target.value);
                        }
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all"
                    />
                  </div>
                </div>
              </div>
            </Field>

            {/* Height Sizing */}
            <Field label="Height Dimensions">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] space-y-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Height</label>
                    <div className="flex items-center gap-1">
                      {['auto', '100%', '100vh'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleStyleChange('height', preset)}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono border transition-all cursor-pointer ${
                            selectedNode.style?.height === preset
                              ? 'border-[#635BFF] bg-[#635BFF]/10 text-[#635BFF] dark:text-[#A5AEFD]'
                              : 'bg-white dark:bg-[#0F111A] border-slate-200 dark:border-[#24293D] text-slate-500 hover:text-[#635BFF]'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. auto, 400px, 100%"
                    value={selectedNode.style?.height || ''}
                    onChange={(e) => handleStyleChange('height', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg text-[11.5px] font-mono bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">Min Height</label>
                    <input
                      type="text"
                      placeholder="e.g. 200px, 100vh"
                      value={selectedNode.style?.minHeight || ''}
                      onChange={(e) => handleStyleChange('minHeight', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">Max Height</label>
                    <input
                      type="text"
                      placeholder="e.g. 600px, 100vh"
                      value={selectedNode.style?.maxHeight || ''}
                      onChange={(e) => handleStyleChange('maxHeight', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all"
                    />
                  </div>
                </div>
              </div>
            </Field>

            {/* Positioning & Inset Coordinates */}
            <Field label="Position Mode">
              <div className="grid grid-cols-5 gap-1 bg-white dark:bg-[#141724] p-0.5 rounded-lg border border-slate-200 dark:border-[#24293D]">
                {[
                  { label: 'Static', val: 'static' },
                  { label: 'Relative', val: 'relative' },
                  { label: 'Absolute', val: 'absolute' },
                  { label: 'Fixed', val: 'fixed' },
                  { label: 'Sticky', val: 'sticky' },
                ].map((item) => {
                  const isActive = (selectedNode.style?.position || 'static') === item.val;
                  return (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => handleStyleChange('position', item.val === 'static' ? undefined : item.val)}
                      className={`h-6 text-[10px] font-semibold rounded transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-[#635BFF] to-[#8B5CF6] text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </Field>

            {selectedNode.style?.position && selectedNode.style.position !== 'static' && (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Coordinate Insets</label>
                  <div className="flex items-center gap-1">
                    {[
                      { label: 'Cover (0)', vals: { top: '0px', right: '0px', bottom: '0px', left: '0px' } },
                      { label: 'Top-Left', vals: { top: '0px', left: '0px', right: '', bottom: '' } },
                      { label: 'Top-Right', vals: { top: '0px', right: '0px', left: '', bottom: '' } },
                      { label: 'Bottom-Right', vals: { bottom: '0px', right: '0px', top: '', left: '' } },
                    ].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          onUpdateStyle(selectedNode.id, {
                            ...(selectedNode.style || {}),
                            ...p.vals,
                          });
                        }}
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0F111A] text-slate-500 hover:text-[#635BFF] cursor-pointer"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Top</label>
                    <input
                      type="text"
                      placeholder="0px"
                      value={selectedNode.style?.top || ''}
                      onChange={(e) => handleStyleChange('top', e.target.value)}
                      className="w-full px-2 py-1 rounded text-[11px] font-mono bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Right</label>
                    <input
                      type="text"
                      placeholder="0px"
                      value={selectedNode.style?.right || ''}
                      onChange={(e) => handleStyleChange('right', e.target.value)}
                      className="w-full px-2 py-1 rounded text-[11px] font-mono bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Bottom</label>
                    <input
                      type="text"
                      placeholder="0px"
                      value={selectedNode.style?.bottom || ''}
                      onChange={(e) => handleStyleChange('bottom', e.target.value)}
                      className="w-full px-2 py-1 rounded text-[11px] font-mono bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Left</label>
                    <input
                      type="text"
                      placeholder="0px"
                      value={selectedNode.style?.left || ''}
                      onChange={(e) => handleStyleChange('left', e.target.value)}
                      className="w-full px-2 py-1 rounded text-[11px] font-mono bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                {/* Z-Index */}
                <div className="pt-2 border-t border-slate-200 dark:border-[#24293D]">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Z-Index (Layer Stacking)</label>
                    <div className="flex items-center gap-1">
                      {['auto', '0', '10', '20', '50'].map((z) => (
                        <button
                          key={z}
                          type="button"
                          onClick={() => handleStyleChange('zIndex', z === 'auto' ? undefined : parseInt(z, 10))}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono border cursor-pointer ${
                            String(selectedNode.style?.zIndex ?? '') === (z === 'auto' ? '' : z)
                              ? 'border-[#635BFF] bg-[#635BFF]/10 text-[#635BFF]'
                              : 'bg-white dark:bg-[#0F111A] border-slate-200 dark:border-[#24293D] text-slate-500'
                          }`}
                        >
                          {z}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="number"
                    placeholder="Auto or integer e.g. 10, 50"
                    value={selectedNode.style?.zIndex ?? ''}
                    onChange={(e) => handleStyleChange('zIndex', e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                    className="w-full px-2 py-1 rounded text-[11px] font-mono bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            )}

            {/* Overflow Handling */}
            <Field label="Overflow Handling">
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-1 bg-white dark:bg-[#141724] p-0.5 rounded-lg border border-slate-200 dark:border-[#24293D]">
                  {[
                    { label: 'Visible', val: 'visible' },
                    { label: 'Hidden', val: 'hidden' },
                    { label: 'Auto', val: 'auto' },
                    { label: 'Scroll', val: 'scroll' },
                  ].map((item) => {
                    const isActive = (selectedNode.style?.overflow || 'visible') === item.val;
                    return (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => handleStyleChange('overflow', item.val)}
                        className={`h-6 text-[10px] font-semibold rounded transition-all cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-[#635BFF] to-[#8B5CF6] text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[9.5px] text-slate-400 font-semibold block mb-0.5">Overflow X</label>
                    <select
                      value={selectedNode.style?.overflowX || 'visible'}
                      onChange={(e) => handleStyleChange('overflowX', e.target.value === 'visible' ? undefined : e.target.value)}
                      className="w-full px-2 py-1 rounded text-[10.5px] bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <option value="visible">Visible</option>
                      <option value="hidden">Hidden</option>
                      <option value="auto">Auto</option>
                      <option value="scroll">Scroll</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9.5px] text-slate-400 font-semibold block mb-0.5">Overflow Y</label>
                    <select
                      value={selectedNode.style?.overflowY || 'visible'}
                      onChange={(e) => handleStyleChange('overflowY', e.target.value === 'visible' ? undefined : e.target.value)}
                      className="w-full px-2 py-1 rounded text-[10.5px] bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <option value="visible">Visible</option>
                      <option value="hidden">Hidden</option>
                      <option value="auto">Auto</option>
                      <option value="scroll">Scroll</option>
                    </select>
                  </div>
                </div>
              </div>
            </Field>
          </div>
        )}

        {/* 4. RESPONSIVE TAB */}
        {activeTab === 'responsive' && (
          <div className="space-y-4">
            {/* Active Preview Viewport Switcher */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Preview Device</span>
                <span className="font-mono text-[10px] text-[#635BFF] dark:text-[#A5AEFD] capitalize font-bold">
                  {viewport || 'desktop'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1 bg-white dark:bg-[#0F111A] p-0.5 rounded-lg border border-slate-200 dark:border-[#24293D]">
                {[
                  { id: 'desktop' as const, label: 'Desktop', icon: <Monitor className="h-3 w-3" /> },
                  { id: 'tablet' as const, label: 'Tablet', icon: <Tablet className="h-3 w-3" /> },
                  { id: 'mobile' as const, label: 'Mobile', icon: <Smartphone className="h-3 w-3" /> },
                ].map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => onChangeViewport?.(d.id)}
                    className={`h-6.5 flex items-center justify-center gap-1 text-[10.5px] font-semibold rounded-md transition-all cursor-pointer ${
                      (viewport || 'desktop') === d.id
                        ? 'bg-gradient-to-r from-[#635BFF] to-[#8B5CF6] text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {d.icon}
                    <span>{d.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Device Visibility Matrix */}
            <Field label="Device Visibility">
              <div className="space-y-1.5 pt-0.5">
                {[
                  { key: 'hideOnDesktop', label: 'Desktop (≥1024px)', icon: <Monitor className="h-3 w-3" /> },
                  { key: 'hideOnTablet', label: 'Tablet (768px-1023px)', icon: <Tablet className="h-3 w-3" /> },
                  { key: 'hideOnMobile', label: 'Mobile (<768px)', icon: <Smartphone className="h-3 w-3" /> },
                ].map((dev) => {
                  const isHidden = Boolean(selectedNode.style?.[dev.key]);
                  return (
                    <div
                      key={dev.key}
                      className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D]"
                    >
                      <div className="flex items-center gap-2 text-[11px] font-medium text-slate-700 dark:text-slate-200">
                        <span className="text-slate-400">{dev.icon}</span>
                        <span>{dev.label}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleStyleChange(dev.key, !isHidden)}
                        className={`h-5 px-2 rounded-md text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          isHidden
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {isHidden ? 'Hidden' : 'Visible'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </Field>

            {/* Layout Specific: Container Stacking & Spacing */}
            {selectedNode.type === 'container' && (
              <>
                <Field label="Mobile Layout Direction">
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { label: 'Stack as Column', sub: 'Recommended for mobile', val: true },
                      { label: 'Keep as Row', sub: 'Preserve horizontal row', val: false },
                    ].map((opt) => {
                      const isActive = selectedNode.style?.stackOnMobile !== false ? opt.val === true : opt.val === false;
                      return (
                        <button
                          key={String(opt.val)}
                          type="button"
                          onClick={() => handleStyleChange('stackOnMobile', opt.val)}
                          className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                            isActive
                              ? 'border-[#635BFF] bg-[#635BFF]/10 text-[#635BFF] dark:text-[#A5AEFD]'
                              : 'border-slate-200 dark:border-[#24293D] text-slate-500 hover:border-[#635BFF]/40'
                          }`}
                        >
                          <div className="text-[11px] font-bold">{opt.label}</div>
                          <div className="text-[9px] opacity-70 mt-0.5">{opt.sub}</div>
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="Mobile Padding">
                  <select
                    value={selectedNode.style?.mobilePadding || ''}
                    onChange={(e) => handleStyleChange('mobilePadding', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg text-[11.5px] bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 transition-all cursor-pointer"
                  >
                    <option value="">Inherit Desktop Padding</option>
                    <option value="12px">Compact (12px)</option>
                    <option value="16px">Standard Mobile (16px)</option>
                    <option value="20px">Comfortable (20px)</option>
                  </select>
                </Field>
              </>
            )}

            {/* Layout Specific: Grid Responsive Columns */}
            {selectedNode.type === 'grid' && (
              <>
                <Field label="Mobile Columns (<768px)">
                  <div className="grid grid-cols-2 gap-1.5">
                    {[1, 2].map((cols) => {
                      const isActive = (selectedNode.style?.mobileColumns ?? 1) === cols;
                      return (
                        <button
                          key={cols}
                          type="button"
                          onClick={() => handleStyleChange('mobileColumns', cols)}
                          className={`py-1.5 px-2 rounded-lg text-center text-[11px] font-semibold border transition-all cursor-pointer ${
                            isActive
                              ? 'border-[#635BFF] bg-[#635BFF]/10 text-[#635BFF] dark:text-[#A5AEFD]'
                              : 'border-slate-200 dark:border-[#24293D] text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {cols} Column{cols > 1 ? 's' : ''} {cols === 1 ? '(Default)' : ''}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="Tablet Columns (768px-1023px)">
                  <div className="grid grid-cols-3 gap-1.5">
                    {[1, 2, 3].map((cols) => {
                      const currentTabletCols = selectedNode.style?.tabletColumns ?? Math.min(selectedNode.props?.columns || 3, 2);
                      const isActive = currentTabletCols === cols;
                      return (
                        <button
                          key={cols}
                          type="button"
                          onClick={() => handleStyleChange('tabletColumns', cols)}
                          className={`py-1.5 px-2 rounded-lg text-center text-[11px] font-semibold border transition-all cursor-pointer ${
                            isActive
                              ? 'border-[#635BFF] bg-[#635BFF]/10 text-[#635BFF] dark:text-[#A5AEFD]'
                              : 'border-slate-200 dark:border-[#24293D] text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {cols} Col{cols > 1 ? 's' : ''}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="Mobile Grid Gap">
                  <select
                    value={selectedNode.style?.mobileGap || ''}
                    onChange={(e) => handleStyleChange('mobileGap', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg text-[11.5px] bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 transition-all cursor-pointer"
                  >
                    <option value="">Inherit Desktop Gap</option>
                    <option value="12px">Compact (12px)</option>
                    <option value="16px">Standard (16px)</option>
                    <option value="20px">Spacious (20px)</option>
                  </select>
                </Field>
              </>
            )}

            {/* Typography Specific: Mobile Text Alignment */}
            {['heading', 'text', 'hero'].includes(selectedNode.type) && (
              <Field label="Mobile Text Alignment">
                <div className="grid grid-cols-4 gap-1 bg-white dark:bg-[#141724] p-0.5 rounded-lg border border-slate-200 dark:border-[#24293D]">
                  {[
                    { label: 'Inherit', val: '' },
                    { label: 'Left', val: 'left' },
                    { label: 'Center', val: 'center' },
                    { label: 'Right', val: 'right' },
                  ].map((btn) => {
                    const isActive = (selectedNode.style?.mobileAlign || '') === btn.val;
                    return (
                      <button
                        key={btn.val}
                        type="button"
                        onClick={() => handleStyleChange('mobileAlign', btn.val || undefined)}
                        className={`h-6 text-[10.5px] font-semibold rounded transition-all cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-[#635BFF] to-[#8B5CF6] text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        {btn.label}
                      </button>
                    );
                  })}
                </div>
              </Field>
            )}

            {/* Element Width Specific: Stretch to 100% on Mobile */}
            {['button', 'card', 'product-card', 'feature-card', 'pricing-card'].includes(selectedNode.type) && (
              <Field label="Mobile Full Width">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D]">
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    Stretch to 100% width on mobile
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={Boolean(selectedNode.style?.mobileFullWidth)}
                    onClick={() => handleStyleChange('mobileFullWidth', !Boolean(selectedNode.style?.mobileFullWidth))}
                    className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors cursor-pointer ${
                      Boolean(selectedNode.style?.mobileFullWidth)
                        ? 'bg-gradient-to-r from-[#635BFF] to-[#8B5CF6]'
                        : 'bg-slate-300 dark:bg-[#3B4366]'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform shadow-sm ${
                        Boolean(selectedNode.style?.mobileFullWidth) ? 'translate-x-3.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </Field>
            )}
          </div>
        )}

        {/* 5. INTERACTIONS TAB */}
        {activeTab === 'interactions' && (
          <div className="space-y-3.5">
            <Field label="Click Action Trigger">
              <select
                value={selectedNode.props?.actionType || 'none'}
                onChange={(e) => handlePropChange('actionType', e.target.value)}
                className="w-full px-2 py-1.5 rounded-md text-[11.5px] bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all"
              >
                <option value="none">None (Static)</option>
                <option value="navigate">Navigate to Page Route</option>
                <option value="external">Open External URL</option>
                <option value="modal">Open Modal / Drawer</option>
              </select>
            </Field>

            {selectedNode.props?.actionType === 'navigate' && (
              <Field label="Target Route">
                <input
                  type="text"
                  placeholder="/pricing or /products"
                  value={selectedNode.props?.targetRoute || ''}
                  onChange={(e) => handlePropChange('targetRoute', e.target.value)}
                  className="w-full px-2 py-1.5 rounded-md text-[11.5px] font-mono bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all"
                />
              </Field>
            )}
          </div>
        )}

        {/* 6. CUSTOM CSS WRITER TAB */}
        {activeTab === 'css' && (
          <div className="space-y-4">
            {/* Header & Overview */}
            <div className="p-3 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-[#635BFF]/20 text-[#635BFF] flex items-center justify-center">
                    <Terminal className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[12px] font-bold text-white tracking-wide">Developer CSS Writer</span>
                </div>
                <div className="flex items-center gap-1">
                  {selectedNode.style?.customCss && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedNode.style?.customCss || '');
                        toast({ title: 'Copied', description: 'CSS copied to clipboard', type: 'info' });
                      }}
                      title="Copy CSS declarations"
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {selectedNode.style?.customCss && (
                    <button
                      type="button"
                      onClick={() => handleStyleChange('customCss', '')}
                      title="Clear Custom CSS"
                      className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[10.5px] text-slate-400 leading-relaxed">
                Write standard CSS property declarations. Changes apply live to this element in the canvas and are compiled into exported React code.
              </p>
            </div>

            {/* One-Click Quick Snippets */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[10.5px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-[#635BFF]" />
                  Instant CSS Snippets
                </span>
                <span className="text-[9.5px] text-slate-400">Click to append</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  {
                    name: 'Glassmorphism',
                    icon: '✨',
                    css: 'background: rgba(255, 255, 255, 0.08);\nbackdrop-filter: blur(16px);\n-webkit-backdrop-filter: blur(16px);\nborder: 1px solid rgba(255, 255, 255, 0.15);\nbox-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);',
                  },
                  {
                    name: 'Neon Glow',
                    icon: '⚡',
                    css: 'box-shadow: 0 0 15px rgba(99, 102, 241, 0.6), inset 0 0 15px rgba(99, 102, 241, 0.3);\nborder: 1px solid rgba(129, 140, 248, 0.8);',
                  },
                  {
                    name: '3D Card Tilt',
                    icon: '📐',
                    css: 'transform: perspective(1000px) rotateX(4deg) rotateY(-4deg);\ntransition: transform 0.3s ease;',
                  },
                  {
                    name: 'Frosted Dark',
                    icon: '❄️',
                    css: 'backdrop-filter: blur(12px) saturate(160%);\nbackground: rgba(15, 23, 42, 0.7);\nborder: 1px solid rgba(255, 255, 255, 0.12);\nbox-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);',
                  },
                  {
                    name: 'Pill Shimmer',
                    icon: '🌟',
                    css: 'box-shadow: 0 0 20px -3px rgba(99, 91, 255, 0.45);\nborder: 1px solid rgba(165, 174, 253, 0.4);',
                  },
                  {
                    name: 'Subtle Vignette',
                    icon: '🌑',
                    css: 'box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.45);\nborder: 1px solid rgba(255, 255, 255, 0.06);',
                  },
                ].map((snip) => (
                  <button
                    key={snip.name}
                    type="button"
                    onClick={() => {
                      const current = selectedNode.style?.customCss?.trim() || '';
                      const next = current ? `${current}\n${snip.css}` : snip.css;
                      handleStyleChange('customCss', next);
                      toast({ title: 'Snippet Added', description: `${snip.name} applied`, type: 'info' });
                    }}
                    className="p-2 rounded-lg border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#141724] hover:border-[#635BFF]/50 text-left transition-all group/snip cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs">{snip.icon}</span>
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 group-hover/snip:text-[#635BFF]">
                        {snip.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live CSS Textarea */}
            <Field
              label="Raw CSS Editor"
              valueLabel={
                selectedNode.style?.customCss
                  ? `${selectedNode.style.customCss.split('\n').filter(Boolean).length} lines`
                  : undefined
              }
            >
              <div className="relative rounded-xl overflow-hidden border border-slate-800 focus-within:border-[#635BFF] focus-within:ring-2 focus-within:ring-[#635BFF]/30 transition-all bg-[#0B0D14]">
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#141724] border-b border-slate-800/80 text-[10px] text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>custom-styles.css</span>
                  </div>
                  <span>UTF-8</span>
                </div>
                <textarea
                  value={selectedNode.style?.customCss || ''}
                  onChange={(e) => handleStyleChange('customCss', e.target.value)}
                  placeholder={`/* Type custom CSS declarations */\nfilter: drop-shadow(0 10px 8px rgb(0 0 0 / 0.08));\ntransform: scale(1.02);\nbackdrop-filter: blur(12px);\ncursor: pointer;`}
                  rows={7}
                  spellCheck={false}
                  className="w-full p-3 font-mono text-[11.5px] leading-relaxed text-emerald-400 dark:text-emerald-300 bg-[#0B0D14] placeholder:text-slate-600 focus:outline-none resize-y min-h-[160px] max-h-[360px]"
                />
              </div>
            </Field>

            {/* Live Parsed Rules Inspector */}
            {(() => {
              const parsedRules = parseCustomCssToStyle(selectedNode.style?.customCss);
              const ruleKeys = Object.keys(parsedRules);

              return (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className={`h-3.5 w-3.5 ${ruleKeys.length > 0 ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                        Active Parsed Rules ({ruleKeys.length})
                      </span>
                    </div>
                    {ruleKeys.length > 0 && (
                      <span className="text-[9.5px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        Live on Canvas
                      </span>
                    )}
                  </div>

                  {ruleKeys.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">
                      No custom CSS declarations active. Add CSS declarations above to apply them.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1 max-h-[140px] overflow-y-auto pt-0.5">
                      {ruleKeys.map((key) => (
                        <div
                          key={key}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] text-[10px] font-mono flex items-center gap-1 shadow-xs"
                        >
                          <span className="text-[#635BFF] dark:text-[#A5AEFD] font-semibold">{key}:</span>
                          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[120px]" title={String((parsedRules as any)[key])}>
                            {String((parsedRules as any)[key])}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* 7. RAW JSON SCHEMA TAB */}
        {activeTab === 'schema' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Node AST JSON</span>
              <button
                onClick={handleCopyNodeJson}
                className="inline-flex items-center gap-1 text-[10px] text-[#635BFF] hover:text-[#4D3FF5] hover:underline font-semibold"
              >
                {copiedSchema ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedSchema ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-2.5 rounded-md bg-slate-950 dark:bg-[#06080F] text-emerald-400 font-mono text-[10px] overflow-x-auto max-h-[400px] border border-slate-200 dark:border-[#24293D]">
              {JSON.stringify(selectedNode, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// HELPERS
// ==========================================

function isHexColor(value: any): boolean {
  return typeof value === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value);
}

function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [isExpandedModal, setIsExpandedModal] = useState(false);

  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const nextHeight = Math.min(Math.max(el.scrollHeight, 72), 260);
    el.style.height = `${nextHeight}px`;
  }, [value]);

  return (
    <div className="relative group/textarea">
      <textarea
        ref={textareaRef}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-2.5 py-2 text-[12px] leading-relaxed rounded-lg bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all resize-y min-h-[72px] max-h-[300px] overflow-y-auto"
      />
      <div className="flex items-center justify-between mt-1 px-0.5 text-[10px] text-slate-400">
        <span>{value ? value.length : 0} chars</span>
        <button
          type="button"
          onClick={() => setIsExpandedModal(true)}
          title="Open expanded editor"
          className="text-[#635BFF] dark:text-[#A5AEFD] hover:underline font-medium flex items-center gap-1 cursor-pointer"
        >
          <Maximize2 className="h-2.5 w-2.5" />
          <span>Expand</span>
        </button>
      </div>

      {/* Expanded multi-line editor modal */}
      {isExpandedModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-[#24293D] rounded-2xl shadow-2xl w-full max-w-lg p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#24293D] pb-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-[#635BFF]/10 text-[#635BFF] dark:text-[#A5AEFD] flex items-center justify-center">
                  <Type className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Full Content Editor
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsExpandedModal(false)}
                className="h-6 w-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1C2030] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              rows={8}
              placeholder="Type your multi-line description or content here..."
              className="w-full p-3 text-[13px] leading-relaxed rounded-xl bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all resize-y min-h-[160px]"
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400 font-mono">
                {value ? value.length : 0} characters
              </span>
              <button
                type="button"
                onClick={() => setIsExpandedModal(false)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#635BFF] to-[#8B5CF6] text-white text-xs font-semibold shadow-md shadow-[#635BFF]/25 hover:shadow-lg transition-all cursor-pointer"
              >
                Save &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  valueLabel,
  children,
}: {
  label: string;
  valueLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-0.5">
        <label className="text-[10.5px] font-semibold text-slate-600 dark:text-slate-300">
          {label}
        </label>
        {valueLabel && (
          <span className="text-[10px] font-mono text-[#635BFF] dark:text-[#A5AEFD] font-bold tabular-nums">{valueLabel}</span>
        )}
      </div>
      {children}
    </div>
  );
}

interface SpacingValue {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

function SpacingControl({
  value,
  onChange,
}: {
  value: SpacingValue;
  onChange: (v: SpacingValue) => void;
}) {
  const fields: { key: keyof SpacingValue; label: string }[] = [
    { key: 'top', label: 'Top' },
    { key: 'right', label: 'Right' },
    { key: 'bottom', label: 'Bottom' },
    { key: 'left', label: 'Left' },
  ];

  const update = (key: keyof SpacingValue, v: string) => onChange({ ...value, [key]: v });
  const applyAll = (v: string) => onChange({ top: v, right: v, bottom: v, left: v });

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Hash className="h-3 w-3 text-slate-400" />
        <input
          type="text"
          placeholder="All sides"
          onChange={(e) => applyAll(e.target.value)}
          className="flex-1 px-2 py-1 rounded-md text-[11px] font-mono bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D]"
        />
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {fields.map((f) => (
          <div key={f.key} className="flex items-center gap-1">
            <span className="text-[9px] font-bold uppercase text-slate-400 w-9 tabular-nums">{f.label}</span>
            <input
              type="text"
              placeholder="0px"
              value={value[f.key] || ''}
              onChange={(e) => update(f.key, e.target.value)}
              className="flex-1 px-2 py-1 rounded-md text-[11px] font-mono bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const ICON_NAMES = [
  'Box', 'BoxSelect', 'Layout', 'LayoutGrid', 'LayoutTemplate', 'Navigation',
  'PanelBottom', 'Heading', 'Type', 'Text', 'Square', 'SquareMousePointer',
  'Tag', 'Minus', 'Image', 'CreditCard', 'Sparkles', 'BadgeCheck', 'CircleDot',
  'ShoppingBag', 'ShoppingCart', 'FormInput', 'TextCursorInput', 'BarChart3',
  'TrendingUp', 'TrendingDown', 'Star', 'Check', 'CheckCircle2', 'X', 'XCircle',
  'Eye', 'EyeOff', 'Lock', 'Unlock', 'Copy', 'Trash2', 'Plus', 'ChevronDown',
  'ChevronRight', 'ArrowRight', 'ArrowUpRight', 'Mail', 'MessageCircle',
  'Github', 'Twitter', 'Linkedin', 'Globe', 'Palette', 'Zap', 'Code2', 'Layers',
  'Monitor', 'Tablet', 'Smartphone',
];

function IconPicker({
  value,
  options,
  onChange,
}: {
  value?: string;
  options?: string[];
  onChange: (v: string) => void;
}) {
  const [query, setQuery] = useState('');
  const allowed = options && options.length > 0 ? options : ICON_NAMES;
  const filtered = allowed.filter((n) =>
    !query ? true : n.toLowerCase().includes(query.toLowerCase())
  );

  const SelectedIcon = (LucideIcons as any)[value as string] as React.ComponentType<{ className?: string }> | undefined;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D]">
        <span className="text-slate-400">
          {SelectedIcon ? <SelectedIcon className="h-3.5 w-3.5" /> : <Palette className="h-3.5 w-3.5" />}
        </span>
        <input
          type="text"
          placeholder="Search icons..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-[11px] focus:outline-none text-slate-900 dark:text-slate-100"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="text-slate-400 hover:text-rose-400"
            title="Clear icon"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-6 gap-1 max-h-32 overflow-y-auto p-1 rounded-md bg-slate-50 dark:bg-[#06080F] border border-slate-200 dark:border-[#24293D]">
        {filtered.map((name) => {
          const Icon = (LucideIcons as any)[name] as React.ComponentType<{ className?: string }> | undefined;
          if (!Icon) return null;
          const active = value === name;
          return (
            <button
              key={name}
              onClick={() => onChange(name)}
              title={name}
              className={`p-1 rounded transition-colors ${
                active
                  ? 'bg-gradient-to-br from-[#635BFF] to-[#8B5CF6] text-white'
                  : 'text-slate-500 hover:bg-white hover:text-[#635BFF] dark:hover:bg-[#141724]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}