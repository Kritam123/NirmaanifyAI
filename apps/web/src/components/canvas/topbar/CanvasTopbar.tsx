'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Download,
  Save,
  History,
  MousePointer,
  Hand,
  Plus,
  ArrowLeft,
  Check,
  Share2,
} from 'lucide-react';
import { DiagramDto } from '@nirmaanify/types';

interface CanvasTopbarProps {
  diagram: DiagramDto;
  diagramsList: DiagramDto[];
  onSelectDiagram: (id: string) => void;
  onCreateDiagram: () => void;
  onUpdateTitle: (title: string) => void;
  onAutoLayout: (direction: 'LR' | 'TB') => void;
  onOpenAiModal: () => void;
  onOpenExportModal: () => void;
  onOpenHistoryModal: () => void;
  onSave: () => void;
  isSaving?: boolean;
  onBackToProjects: () => void;
  projectName: string;
}

export const CanvasTopbar: React.FC<CanvasTopbarProps> = ({
  diagram,
  diagramsList,
  onSelectDiagram,
  onCreateDiagram,
  onUpdateTitle,
  onAutoLayout,
  onOpenAiModal,
  onOpenExportModal,
  onOpenHistoryModal,
  onSave,
  isSaving = false,
  onBackToProjects,
  projectName,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(diagram.name);

  React.useEffect(() => {
    setTitleDraft(diagram.name);
  }, [diagram.name]);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleDraft.trim() && titleDraft !== diagram.name) {
      onUpdateTitle(titleDraft.trim());
    }
  };

  return (
    <header className="h-14 border-b border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0F111A] flex items-center justify-between px-3 shrink-0 select-none z-20">
      {/* Left: Back button + Project Name & Diagram Title + Tab Switcher */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onBackToProjects}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-[#24293D] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141724] transition-colors"
          title="Back to Projects"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Project Breadcrumb & Inline Title */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-medium text-slate-400 hidden sm:inline truncate max-w-[120px]">
            {projectName}
          </span>
          <span className="text-slate-300 dark:text-[#2E354F] hidden sm:inline">/</span>

          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              className="text-xs font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-[#1A1E2E] px-2 py-1 rounded border border-[#635BFF] focus:outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="text-xs font-bold text-slate-900 dark:text-slate-100 hover:text-[#635BFF] dark:hover:text-[#635BFF] truncate transition-colors text-left"
              title="Click to rename diagram"
            >
              {diagram.name}
            </button>
          )}
        </div>

        {/* Diagram Tabs */}
        <div className="hidden lg:flex items-center gap-1 ml-4 pl-3 border-l border-slate-200 dark:border-[#24293D]">
          {diagramsList.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => onSelectDiagram(d.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors truncate max-w-[140px] ${
                d.id === diagram.id
                  ? 'bg-slate-100 dark:bg-[#1A1E2E] text-[#635BFF] font-semibold border border-slate-200 dark:border-[#2E354F]'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              {d.name}
            </button>
          ))}
          <button
            type="button"
            onClick={onCreateDiagram}
            className="p-1 rounded text-slate-400 hover:text-[#635BFF] hover:bg-slate-100 dark:hover:bg-[#141724]"
            title="Create New Diagram"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Auto-Layout */}
        <button
          type="button"
          onClick={() => onAutoLayout('LR')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#24293D] hover:bg-slate-50 dark:hover:bg-[#141724] text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
          title="Auto-organize nodes with Dagre layout"
        >
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span className="hidden sm:inline">Auto-Layout</span>
        </button>

        {/* AI Architect */}
        <button
          type="button"
          onClick={onOpenAiModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-fuchsia-600 to-[#635BFF] hover:from-fuchsia-500 hover:to-[#5249e0] text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Architect</span>
        </button>

        {/* Save */}
        <button
          type="button"
          disabled={isSaving}
          onClick={onSave}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#24293D] hover:bg-slate-50 dark:hover:bg-[#141724] text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors disabled:opacity-50"
          title="Save diagram snapshot"
        >
          {isSaving ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Save className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save'}</span>
        </button>

        {/* History */}
        <button
          type="button"
          onClick={onOpenHistoryModal}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-[#24293D] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#141724]"
          title="Revision History"
        >
          <History className="h-4 w-4" />
        </button>

        {/* Export */}
        <button
          type="button"
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#24293D] hover:bg-slate-50 dark:hover:bg-[#141724] text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
          title="Export to PNG, SVG, Draw.io XML, JSON"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Export</span>
        </button>
      </div>
    </header>
  );
};
