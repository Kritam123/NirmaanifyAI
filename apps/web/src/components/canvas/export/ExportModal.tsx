'use client';

import React, { useState } from 'react';
import {
  Download,
  X,
  FileCode,
  Image as ImageIcon,
  Copy,
  Check,
  Code2,
} from 'lucide-react';
import { toPng, toSvg } from 'html-to-image';
import { DiagramDto } from '@nirmaanify/types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagram: DiagramDto;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  diagram,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExportPng = async () => {
    const canvasEl = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!canvasEl) return;

    setIsExporting(true);
    try {
      const dataUrl = await toPng(canvasEl, {
        backgroundColor: '#090A0F',
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `${diagram.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-architecture.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export PNG:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSvg = async () => {
    const canvasEl = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (!canvasEl) return;

    setIsExporting(true);
    try {
      const dataUrl = await toSvg(canvasEl, {
        backgroundColor: '#090A0F',
      });
      const link = document.createElement('a');
      link.download = `${diagram.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-architecture.svg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export SVG:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(
      {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        name: diagram.name,
        type: diagram.type,
        nodes: diagram.nodes,
        edges: diagram.edges,
        document: diagram.document,
      },
      null,
      2,
    );
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${diagram.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.nirmaan-arch.json`;
    link.href = url;
    link.click();
  };

  const generateDrawioXml = () => {
    let cells = '';
    diagram.nodes.forEach((n, idx) => {
      cells += `\n    <mxCell id="${n.id}" value="${n.data.label || 'Node'}" style="rounded=1;whiteSpace=wrap;html=1;" vertex="1" parent="1">\n      <mxGeometry x="${n.position.x}" y="${n.position.y}" width="160" height="70" as="geometry"/>\n    </mxCell>`;
    });
    diagram.edges.forEach((e) => {
      cells += `\n    <mxCell id="${e.id}" value="${e.data?.label || ''}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="${e.source}" target="${e.target}">\n      <mxGeometry relative="1" as="geometry"/>\n    </mxCell>`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="Nirmaanify AI" type="device">
  <diagram id="diag-1" name="${diagram.name}">
    <mxGraphModel dx="1000" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>${cells}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
  };

  const handleExportDrawio = () => {
    const xml = generateDrawioXml();
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${diagram.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.drawio`;
    link.href = url;
    link.click();
  };

  const generateMermaid = () => {
    let mm = 'graph LR\n';
    diagram.nodes.forEach((n) => {
      const cleanLabel = (n.data.label || 'Node').replace(/["\n]/g, ' ');
      mm += `  ${n.id.replace(/[^a-zA-Z0-9_]/g, '_')}["${cleanLabel}"]\n`;
    });
    diagram.edges.forEach((e) => {
      const s = e.source.replace(/[^a-zA-Z0-9_]/g, '_');
      const t = e.target.replace(/[^a-zA-Z0-9_]/g, '_');
      const label = e.data?.label ? `|${e.data.label}|` : '';
      mm += `  ${s} -->${label} ${t}\n`;
    });
    return mm;
  };

  const handleCopyMermaid = () => {
    const mm = generateMermaid();
    navigator.clipboard.writeText(mm);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0F111A] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-[#24293D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-[#635BFF]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Export Architecture Diagram
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Options */}
        <div className="p-5 space-y-3">
          {/* PNG */}
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportPng}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#24293D] hover:border-[#635BFF] hover:bg-slate-50 dark:hover:bg-[#141724] flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <ImageIcon className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  PNG Image (High-DPI 2x)
                </div>
                <div className="text-[10px] text-slate-400">Crisp raster image for presentations</div>
              </div>
            </div>
            <Download className="h-4 w-4 text-slate-400 group-hover:text-[#635BFF] transition-colors" />
          </button>

          {/* SVG */}
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportSvg}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#24293D] hover:border-[#635BFF] hover:bg-slate-50 dark:hover:bg-[#141724] flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <FileCode className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  SVG Vector Graphic
                </div>
                <div className="text-[10px] text-slate-400">Lossless resolution for web & docs</div>
              </div>
            </div>
            <Download className="h-4 w-4 text-slate-400 group-hover:text-[#635BFF] transition-colors" />
          </button>

          {/* Draw.io XML */}
          <button
            type="button"
            onClick={handleExportDrawio}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#24293D] hover:border-[#635BFF] hover:bg-slate-50 dark:hover:bg-[#141724] flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Code2 className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Draw.io XML (.drawio)
                </div>
                <div className="text-[10px] text-slate-400">Open in diagrams.net / Draw.io desktop</div>
              </div>
            </div>
            <Download className="h-4 w-4 text-slate-400 group-hover:text-[#635BFF] transition-colors" />
          </button>

          {/* JSON Blueprint */}
          <button
            type="button"
            onClick={handleExportJson}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#24293D] hover:border-[#635BFF] hover:bg-slate-50 dark:hover:bg-[#141724] flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                <FileCode className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  JSON Architecture Blueprint
                </div>
                <div className="text-[10px] text-slate-400">Portable AST with nodes & documentation</div>
              </div>
            </div>
            <Download className="h-4 w-4 text-slate-400 group-hover:text-[#635BFF] transition-colors" />
          </button>

          {/* Mermaid Copy */}
          <button
            type="button"
            onClick={handleCopyMermaid}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#24293D] hover:border-[#635BFF] hover:bg-slate-50 dark:hover:bg-[#141724] flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-fuchsia-500/10 text-fuchsia-500">
                <Copy className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Copy Mermaid.js Markdown
                </div>
                <div className="text-[10px] text-slate-400">Embed directly in GitHub README / Notion</div>
              </div>
            </div>
            {copied ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4 text-slate-400 group-hover:text-[#635BFF] transition-colors" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
