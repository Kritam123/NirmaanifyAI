'use client';

import React, { useState } from 'react';
import { ComponentNode, ComponentNodeStyle } from '@nirmaanify/types';
import { getComponentDefinition, InspectorControl } from '@nirmaanify/component-registry';
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
} from 'lucide-react';
import { Badge, Button, useToast } from '@nirmaanify/ui';

interface PropertyInspectorProps {
  selectedNode: ComponentNode | null;
  onUpdateProps: (nodeId: string, props: Record<string, any>) => void;
  onUpdateStyle: (nodeId: string, style: ComponentNodeStyle) => void;
  onUpdateName: (nodeId: string, name: string) => void;
  onCollapse?: () => void;
}

export function PropertyInspector({
  selectedNode,
  onUpdateProps,
  onUpdateStyle,
  onUpdateName,
  onCollapse,
}: PropertyInspectorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'layout' | 'responsive' | 'interactions' | 'schema'>('content');
  const [copiedSchema, setCopiedSchema] = useState(false);

  if (!selectedNode) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#0F111A] border-l border-slate-200 dark:border-[#24293D] w-[320px] shrink-0 select-none">
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

  const handleCopyNodeJson = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedNode, null, 2));
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
    toast({ title: 'Copied', description: 'Node JSON schema copied to clipboard', type: 'info' });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0F111A] border-l border-slate-200 dark:border-[#24293D] w-[320px] shrink-0 select-none overflow-hidden">
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

        {/* 6-Tab Navigation - proper scrollable row */}
        <div className="-mx-3 px-3 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-0.5 bg-slate-50 dark:bg-[#141724] p-0.5 rounded-lg border border-slate-200 dark:border-[#24293D] min-w-max">
            {[
              { id: 'content' as const, label: 'Content' },
              { id: 'style' as const, label: 'Style' },
              { id: 'layout' as const, label: 'Layout' },
              { id: 'responsive' as const, label: 'Responsive' },
              { id: 'interactions' as const, label: 'Action' },
              { id: 'schema' as const, label: 'JSON' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`h-6 px-2 text-center font-semibold rounded transition-all duration-150 text-[10.5px] whitespace-nowrap ${
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
          <div className="space-y-3.5">
            <Field label="Brand Accent">
              <div className="flex items-center gap-1.5">
                {[
                  { c: '#635BFF', name: 'Indigo' },
                  { c: '#22D3EE', name: 'Cyan' },
                  { c: '#8B5CF6', name: 'Violet' },
                  { c: '#10B981', name: 'Emerald' },
                  { c: '#F59E0B', name: 'Amber' },
                  { c: '#EF4444', name: 'Rose' },
                  { c: '#0F172A', name: 'Slate' },
                  { c: '#F8FAFC', name: 'White' },
                ].map(({ c, name }) => (
                  <button
                    key={c}
                    onClick={() => handleStyleChange('backgroundColor', c)}
                    style={{ backgroundColor: c }}
                    className="h-6 w-6 rounded-full border border-slate-300/60 dark:border-slate-700 hover:scale-110 hover:ring-2 hover:ring-[#635BFF]/40 hover:ring-offset-1 dark:hover:ring-offset-[#0F111A] transition-all"
                    title={name}
                    aria-label={`Set background to ${name}`}
                  />
                ))}
              </div>
            </Field>

            <Field label="Background Color">
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
                  className="flex-1 px-2 py-1.5 rounded-md text-[11.5px] font-mono bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D]"
                />
              </div>
            </Field>

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
                  placeholder="#ffffff"
                  value={selectedNode.style?.color || ''}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="flex-1 px-2 py-1.5 rounded-md text-[11.5px] font-mono bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D]"
                />
              </div>
            </Field>

            <Field label="Border Radius">
              <select
                value={selectedNode.style?.borderRadius || '12px'}
                onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                className="w-full px-2 py-1.5 rounded-md text-[11.5px] bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all"
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
                className="w-full px-2 py-1.5 rounded-md text-[11.5px] bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all"
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
          </div>
        )}

        {/* 3. LAYOUT TAB */}
        {activeTab === 'layout' && (
          <div className="space-y-3.5">
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

            <Field label="Max Width">
              <input
                type="text"
                placeholder="1200px or 100%"
                value={selectedNode.style?.maxWidth || ''}
                onChange={(e) => handleStyleChange('maxWidth', e.target.value)}
                className="w-full px-2 py-1.5 rounded-md text-[11.5px] font-mono bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all"
              />
            </Field>
          </div>
        )}

        {/* 4. RESPONSIVE TAB */}
        {activeTab === 'responsive' && (
          <div className="space-y-3.5">
            <div className="p-2.5 rounded-md bg-gradient-to-br from-[#635BFF]/8 to-[#8B5CF6]/8 border border-[#635BFF]/20 space-y-1">
              <span className="font-semibold text-[11.5px] text-slate-800 dark:text-slate-200">
                Device Breakpoint Rules
              </span>
              <p className="text-[10.5px] text-slate-500 leading-relaxed">
                Configure adaptive styling and visibility across screen sizes.
              </p>
            </div>

            <Field label="Mobile Visibility (under 768px)">
              <select
                value={selectedNode.style?.mobileDisplay || 'block'}
                onChange={(e) => handleStyleChange('mobileDisplay', e.target.value)}
                className="w-full px-2 py-1.5 rounded-md text-[11.5px] bg-white dark:bg-[#141724] border border-slate-200 dark:border-[#24293D] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#635BFF]/30 focus:border-[#635BFF] transition-all"
              >
                <option value="block">Visible on Mobile</option>
                <option value="none">Hidden on Mobile Screens</option>
              </select>
            </Field>
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

        {/* 6. RAW JSON SCHEMA TAB */}
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