'use client';

import React, { useState } from 'react';
import { ComponentNode, ComponentNodeStyle } from '@nirmaanify/types';
import { getComponentDefinition, InspectorControl } from '@nirmaanify/component-registry';
import {
  Sliders,
  Code2,
  Palette,
  Layout,
  Smartphone,
  MousePointerClick,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Check,
  Copy,
} from 'lucide-react';
import { Badge, Button, useToast } from '@nirmaanify/ui';

interface PropertyInspectorProps {
  selectedNode: ComponentNode | null;
  onUpdateProps: (nodeId: string, props: Record<string, any>) => void;
  onUpdateStyle: (nodeId: string, style: ComponentNodeStyle) => void;
  onUpdateName: (nodeId: string, name: string) => void;
}

export function PropertyInspector({
  selectedNode,
  onUpdateProps,
  onUpdateStyle,
  onUpdateName,
}: PropertyInspectorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'layout' | 'responsive' | 'interactions' | 'schema'>('content');
  const [copiedSchema, setCopiedSchema] = useState(false);

  if (!selectedNode) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-xs text-slate-400 bg-slate-50/50 dark:bg-[#0A0D16] border-l border-slate-200 dark:border-[#24293D] w-80 shrink-0 select-none">
        <Sliders className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
        <span className="font-semibold text-slate-600 dark:text-slate-300">No Component Selected</span>
        <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
          Click any component on the visual canvas or layers panel to inspect and customize properties.
        </p>
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
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-[#0A0D16] border-l border-slate-200 dark:border-[#24293D] w-80 shrink-0 select-none overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 dark:border-[#24293D] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {selectedNode.name || selectedNode.type}
            </span>
            <Badge size="sm" variant="indigo" className="font-mono text-[9px] shrink-0">
              {selectedNode.type}
            </Badge>
          </div>
        </div>

        {/* 5-Tab Navigation */}
        <div className="flex items-center gap-0.5 bg-white dark:bg-[#161926] p-0.5 rounded-lg border border-slate-200 dark:border-[#24293D] text-[10px] overflow-x-auto scrollbar-none">
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
              className={`flex-1 py-1 px-1.5 text-center font-semibold rounded transition-colors whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-[#635BFF] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
        {/* 1. CONTENT TAB */}
        {activeTab === 'content' && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Component Label
              </label>
              <input
                type="text"
                value={selectedNode.name || ''}
                onChange={(e) => onUpdateName(selectedNode.id, e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
              />
            </div>

            {controls.length === 0 ? (
              <div className="p-4 text-center text-slate-400">
                No specific content props for this node type.
              </div>
            ) : (
              controls.map((ctrl) => {
                const val =
                  selectedNode.props[ctrl.name] !== undefined
                    ? selectedNode.props[ctrl.name]
                    : ctrl.defaultValue;

                return (
                  <div key={ctrl.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        {ctrl.label}
                      </label>
                      {ctrl.type === 'slider' && (
                        <span className="text-[10px] font-mono text-[#635BFF]">{val}</span>
                      )}
                    </div>

                    {ctrl.type === 'text' && (
                      <input
                        type="text"
                        value={val || ''}
                        onChange={(e) => handlePropChange(ctrl.name, e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
                      />
                    )}

                    {ctrl.type === 'textarea' && (
                      <textarea
                        rows={3}
                        value={val || ''}
                        onChange={(e) => handlePropChange(ctrl.name, e.target.value)}
                        className="w-full p-2 rounded-lg text-xs bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#635BFF]"
                      />
                    )}

                    {ctrl.type === 'select' && ctrl.options && (
                      <select
                        value={val || ''}
                        onChange={(e) => handlePropChange(ctrl.name, e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] text-slate-900 dark:text-slate-100 focus:outline-none"
                      >
                        {ctrl.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {ctrl.type === 'switch' && (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          checked={Boolean(val)}
                          onChange={(e) => handlePropChange(ctrl.name, e.target.checked)}
                          className="h-4 w-4 text-[#635BFF] rounded focus:ring-[#635BFF]"
                        />
                        <span className="text-[11px] text-slate-400">
                          {val ? 'Active / Enabled' : 'Inactive'}
                        </span>
                      </div>
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
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={val || '#635BFF'}
                          onChange={(e) => handlePropChange(ctrl.name, e.target.value)}
                          className="h-7 w-8 rounded cursor-pointer border border-slate-200 dark:border-[#24293D] bg-transparent"
                        />
                        <input
                          type="text"
                          value={val || ''}
                          onChange={(e) => handlePropChange(ctrl.name, e.target.value)}
                          className="w-full px-2 py-1 rounded-lg text-xs font-mono bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]"
                        />
                      </div>
                    )}

                    {ctrl.type === 'alignment' && (
                      <div className="flex items-center bg-white dark:bg-[#161926] p-0.5 rounded-lg border border-slate-200 dark:border-[#24293D]">
                        {[
                          { val: 'left', icon: <AlignLeft className="h-3.5 w-3.5" /> },
                          { val: 'center', icon: <AlignCenter className="h-3.5 w-3.5" /> },
                          { val: 'right', icon: <AlignRight className="h-3.5 w-3.5" /> },
                          { val: 'justify', icon: <AlignJustify className="h-3.5 w-3.5" /> },
                        ].map((btn) => (
                          <button
                            key={btn.val}
                            onClick={() => handlePropChange(ctrl.name, btn.val)}
                            className={`flex-1 p-1.5 flex justify-center rounded transition-colors ${
                              val === btn.val ? 'bg-[#635BFF] text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {btn.icon}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 2. STYLE TAB */}
        {activeTab === 'style' && (
          <div className="space-y-3.5">
            {/* Color Palette Swatches */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Brand Accent Colors</label>
              <div className="flex items-center gap-2">
                {['#635BFF', '#22D3EE', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#0E121E', '#FFFFFF'].map((color) => (
                  <button
                    key={color}
                    onClick={() => handleStyleChange('backgroundColor', color)}
                    style={{ backgroundColor: color }}
                    className="h-6 w-6 rounded-full border border-slate-300 dark:border-slate-700 hover:scale-110 transition-transform"
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Background Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedNode.style?.backgroundColor || '#000000'}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="h-7 w-8 rounded cursor-pointer border border-slate-200 dark:border-[#24293D] bg-transparent"
                />
                <input
                  type="text"
                  placeholder="transparent or #161926"
                  value={selectedNode.style?.backgroundColor || ''}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedNode.style?.color || '#ffffff'}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="h-7 w-8 rounded cursor-pointer border border-slate-200 dark:border-[#24293D] bg-transparent"
                />
                <input
                  type="text"
                  placeholder="#ffffff"
                  value={selectedNode.style?.color || ''}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Border Radius</label>
              <select
                value={selectedNode.style?.borderRadius || '12px'}
                onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]"
              >
                <option value="0px">None (Square 0px)</option>
                <option value="6px">Small (6px)</option>
                <option value="12px">Medium (12px)</option>
                <option value="16px">Large (16px)</option>
                <option value="24px">Extra Large (24px)</option>
                <option value="9999px">Full Pill (9999px)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Elevation Shadow</label>
              <select
                value={selectedNode.style?.boxShadow || 'none'}
                onChange={(e) => handleStyleChange('boxShadow', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]"
              >
                <option value="none">No Shadow</option>
                <option value="0 1px 3px rgba(0,0,0,0.1)">Subtle Shadow (sm)</option>
                <option value="0 4px 6px -1px rgba(0,0,0,0.1)">Medium Shadow (md)</option>
                <option value="0 10px 15px -3px rgba(0,0,0,0.1)">Large Shadow (lg)</option>
                <option value="0 20px 25px -5px rgba(99,91,255,0.15)">Brand Indigo Glow</option>
              </select>
            </div>
          </div>
        )}

        {/* 3. LAYOUT TAB */}
        {activeTab === 'layout' && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Flex Direction</label>
              <div className="flex gap-2">
                {[
                  { label: 'Column (Vertical)', val: 'column' },
                  { label: 'Row (Horizontal)', val: 'row' },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => handleStyleChange('flexDirection', item.val)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border ${
                      selectedNode.style?.flexDirection === item.val
                        ? 'border-[#635BFF] bg-[#635BFF]/10 text-[#635BFF]'
                        : 'border-slate-200 dark:border-[#24293D] text-slate-500'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Gap Spacing</label>
              <input
                type="text"
                placeholder="16px"
                value={selectedNode.style?.gap || ''}
                onChange={(e) => handleStyleChange('gap', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]"
              />
            </div>

            {/* Visual Box Model: Padding & Margin */}
            <div className="p-3 rounded-xl bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Box Model Spacing</span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500">Padding</label>
                  <input
                    type="text"
                    placeholder="24px"
                    value={selectedNode.style?.padding || ''}
                    onChange={(e) => handleStyleChange('padding', e.target.value)}
                    className="w-full px-2 py-1 rounded text-xs bg-slate-50 dark:bg-[#0E121E] border border-slate-200 dark:border-[#24293D]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500">Margin</label>
                  <input
                    type="text"
                    placeholder="0 auto"
                    value={selectedNode.style?.margin || ''}
                    onChange={(e) => handleStyleChange('margin', e.target.value)}
                    className="w-full px-2 py-1 rounded text-xs bg-slate-50 dark:bg-[#0E121E] border border-slate-200 dark:border-[#24293D]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Max Width</label>
              <input
                type="text"
                placeholder="1200px or 100%"
                value={selectedNode.style?.maxWidth || ''}
                onChange={(e) => handleStyleChange('maxWidth', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]"
              />
            </div>
          </div>
        )}

        {/* 4. RESPONSIVE TAB */}
        {activeTab === 'responsive' && (
          <div className="space-y-3.5">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] space-y-1">
              <span className="font-bold text-xs">Device Breakpoint Rules</span>
              <p className="text-[11px] text-slate-400">
                Configure adaptive styling and visibility across screen sizes.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-semibold text-slate-500">Mobile Visibility (under 768px)</label>
              <select
                value={selectedNode.style?.mobileDisplay || 'block'}
                onChange={(e) => handleStyleChange('mobileDisplay', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]"
              >
                <option value="block">Visible on Mobile</option>
                <option value="none">Hidden on Mobile Screens</option>
              </select>
            </div>
          </div>
        )}

        {/* 5. INTERACTIONS TAB */}
        {activeTab === 'interactions' && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Click Action Trigger</label>
              <select
                value={selectedNode.props?.actionType || 'none'}
                onChange={(e) => handlePropChange('actionType', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]"
              >
                <option value="none">None (Static component)</option>
                <option value="navigate">Navigate to Page Route</option>
                <option value="external">Open External URL</option>
                <option value="modal">Open Modal / Drawer</option>
              </select>
            </div>

            {selectedNode.props?.actionType === 'navigate' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Target Route</label>
                <input
                  type="text"
                  placeholder="/pricing or /products"
                  value={selectedNode.props?.targetRoute || ''}
                  onChange={(e) => handlePropChange('targetRoute', e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]"
                />
              </div>
            )}
          </div>
        )}

        {/* 6. RAW JSON SCHEMA TAB */}
        {activeTab === 'schema' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Node AST JSON</span>
              <button
                onClick={handleCopyNodeJson}
                className="flex items-center gap-1 text-[10px] text-[#635BFF] hover:underline"
              >
                {copiedSchema ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedSchema ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[10px] overflow-x-auto max-h-[400px]">
              {JSON.stringify(selectedNode, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
