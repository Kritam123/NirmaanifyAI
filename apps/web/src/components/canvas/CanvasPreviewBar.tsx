'use client';

import React from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Maximize,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { DiagramDto } from '@nirmaanify/types';

interface CanvasPreviewBarProps {
  projectName: string;
  currentDiagram: DiagramDto;
  diagramsList: DiagramDto[];
  onSelectDiagram: (id: string) => void;
  onExitPreview: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const CanvasPreviewBar: React.FC<CanvasPreviewBarProps> = ({
  projectName,
  currentDiagram,
  diagramsList,
  onSelectDiagram,
  onExitPreview,
  onZoomIn,
  onZoomOut,
  onFitView,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const currentIndex = diagramsList.findIndex((d) => d.id === currentDiagram.id);
  const hasMultipleDiagrams = diagramsList.length > 1;

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectDiagram(diagramsList[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < diagramsList.length - 1) {
      onSelectDiagram(diagramsList[currentIndex + 1].id);
    }
  };

  return (
    <div className="absolute top-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[#10121C]/95 backdrop-blur-md border border-[#2E354F] shadow-2xl select-none text-xs whitespace-nowrap animate-in fade-in slide-in-from-top-3 duration-200 max-w-[calc(100vw-32px)]">
      {/* Status Badge & Title */}
      <div className="flex items-center gap-2.5 min-w-0 shrink">
        <span className="h-8 flex items-center gap-1.5 px-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider shrink-0 whitespace-nowrap">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Preview Mode
        </span>

        <div className="flex items-center gap-2 min-w-0">
          <span
            className="font-medium text-slate-400 hidden sm:inline truncate max-w-[180px] lg:max-w-[280px]"
            title={projectName}
          >
            {projectName}
          </span>
          <span className="text-[#2E354F] hidden sm:inline select-none">/</span>
          <span
            className="font-bold text-slate-100 truncate max-w-[220px] lg:max-w-[340px]"
            title={currentDiagram.name}
          >
            {currentDiagram.name}
          </span>
        </div>
      </div>

      <div className="h-4.5 w-px bg-[#2E354F] shrink-0" />

      {/* Slide / Diagram Switcher (when multiple diagrams exist) */}
      {hasMultipleDiagrams && (
        <>
          <div className="h-8 flex items-center gap-1 bg-[#141724] px-1.5 rounded-xl border border-[#24293D] shrink-0 whitespace-nowrap">
            <button
              type="button"
              disabled={currentIndex <= 0}
              onClick={handlePrev}
              className="h-6 w-6 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-[#1E2337] disabled:opacity-25 disabled:pointer-events-none transition-colors"
              title="Previous Diagram (Left Arrow)"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-300 px-1.5 font-medium whitespace-nowrap leading-none select-none">
              {currentIndex + 1} / {diagramsList.length}
            </span>
            <button
              type="button"
              disabled={currentIndex >= diagramsList.length - 1}
              onClick={handleNext}
              className="h-6 w-6 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-[#1E2337] disabled:opacity-25 disabled:pointer-events-none transition-colors"
              title="Next Diagram (Right Arrow)"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="h-4.5 w-px bg-[#2E354F] shrink-0" />
        </>
      )}

      {/* Zoom Controls */}
      <div className="h-8 flex items-center gap-0.5 bg-[#141724] p-0.5 rounded-xl border border-[#24293D] shrink-0">
        <button
          type="button"
          onClick={onZoomOut}
          className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-[#1E2337] transition-colors"
          title="Zoom Out (-)"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          onClick={onFitView}
          className="h-7 px-2 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-[#1E2337] transition-colors"
          title="Fit View to Screen"
        >
          <Maximize className="h-3.5 w-3.5 text-emerald-400" />
        </button>

        <button
          type="button"
          onClick={onZoomIn}
          className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-[#1E2337] transition-colors"
          title="Zoom In (+)"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Fullscreen Toggle */}
      <button
        type="button"
        onClick={onToggleFullscreen}
        className={`h-8 w-8 flex items-center justify-center rounded-xl border transition-colors shrink-0 ${
          isFullscreen
            ? 'bg-[#635BFF] text-white border-[#635BFF]'
            : 'bg-[#141724] text-slate-300 hover:text-white border-[#24293D] hover:bg-[#1E2337]'
        }`}
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (F11)'}
      >
        {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
      </button>

      <div className="h-4.5 w-px bg-[#2E354F] shrink-0" />

      {/* Exit Preview Button */}
      <button
        type="button"
        onClick={onExitPreview}
        className="h-8 flex items-center gap-1.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-[#2E354F] font-semibold transition-colors shrink-0"
        title="Exit Preview Mode (Esc)"
      >
        <X className="h-3.5 w-3.5 text-slate-400" />
        <span>Exit Preview</span>
        <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#10121C] text-slate-400 border border-[#24293D] ml-0.5 leading-none">
          Esc
        </kbd>
      </button>
    </div>
  );
};
