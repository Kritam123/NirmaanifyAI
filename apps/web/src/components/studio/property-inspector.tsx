'use client';

import React, { useState } from 'react';
import { ComponentNode, ComponentNodeStyle } from '@nirmaanify/types';
import { getComponentDefinition, InspectorControl } from '@nirmaanify/component-registry';
import { Sliders, Code2, Palette, Layers, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { Input, Textarea, Select, Badge, Card } from '@nirmaanify/ui';

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
  const [activeTab, setActiveTab] = useState<'props' | 'style' | 'schema'>('props');

  if (!selectedNode) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-xs text-slate-400 bg-slate-50/50 dark:bg-[#0A0D16] border-l border-slate-200 dark:border-[#24293D] w-80 shrink-0">
        <Sliders className="h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
        <span className="font-semibold text-slate-600 dark:text-slate-300">No Component Selected</span>
        <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
          Click any component on the visual canvas or layers panel to edit properties.
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

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-[#0A0D16] border-l border-slate-200 dark:border-[#24293D] w-80 shrink-0 select-none overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 dark:border-[#24293D] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
              {selectedNode.name || selectedNode.type}
            </span>
            <Badge size="sm" variant="indigo">{selectedNode.type}</Badge>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#161926] p-0.5 rounded-lg border border-slate-200 dark:border-[#24293D] text-[11px]">
          <button
            onClick={() => setActiveTab('props')}
            className={`flex-1 py-1 text-center font-semibold rounded-md transition-colors ${
              activeTab === 'props' ? 'bg-[#635BFF] text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Props
          </button>
          <button
            onClick={() => setActiveTab('style')}
            className={`flex-1 py-1 text-center font-semibold rounded-md transition-colors ${
              activeTab === 'style' ? 'bg-[#635BFF] text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Styles
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex-1 py-1 text-center font-semibold rounded-md transition-colors ${
              activeTab === 'schema' ? 'bg-[#635BFF] text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Schema
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
        {/* 1. PROPS TAB */}
        {activeTab === 'props' && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Node Label Name
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
                No configurable props for this component.
              </div>
            ) : (
              controls.map((ctrl) => {
                const val = selectedNode.props[ctrl.name] !== undefined
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
                          {val ? 'Enabled' : 'Disabled'}
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
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Padding</label>
              <input
                type="text"
                placeholder="e.g. 16px or 1rem"
                value={selectedNode.style?.padding || ''}
                onChange={(e) => handleStyleChange('padding', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Margin</label>
              <input
                type="text"
                placeholder="e.g. 0 auto or 24px"
                value={selectedNode.style?.margin || ''}
                onChange={(e) => handleStyleChange('margin', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Background Color</label>
              <input
                type="text"
                placeholder="e.g. #0E121E or transparent"
                value={selectedNode.style?.backgroundColor || ''}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Border Radius</label>
              <input
                type="text"
                placeholder="e.g. 12px or 9999px"
                value={selectedNode.style?.borderRadius || ''}
                onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]"
              />
            </div>
          </div>
        )}

        {/* 3. SCHEMA TAB */}
        {activeTab === 'schema' && (
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400">Node JSON Representation</span>
            <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[10px] overflow-x-auto max-h-[400px]">
              {JSON.stringify(selectedNode, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
